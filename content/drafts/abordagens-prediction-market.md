---
social-post: |-
  🤔 We shipped three different market backends for American Spend before settling on one. Not because the code was wrong — the assumptions were.

  In my latest article I walk through the real trade-offs between Parimutuel, LMSR, and CLOB, and what building on top of the model you choose actually looks like — the constraints, the edge cases, and the decisions nobody documents.

  If you're designing a prediction market or any on-chain order book, this one's for you. 👇 Read the article below.

  hashtag#PredictionMarkets hashtag#DeFi hashtag#Solidity hashtag#SmartContracts hashtag#CLOB hashtag#Web3 hashtag#Blockchain hashtag#SoftwareEngineering
---
# Designing a Prediction Market: CLOB vs LMSR vs Parimutuel, Position Caps, and the Trade-offs Nobody Tells You About

We shipped three different market backends before settling on one. Each time, the problem wasn't the code — it was a fundamental assumption about how price discovery should work that turned out to be wrong for our use case.

From my experience building American Spend at 33Labs, the first architectural decision you face in a prediction market is so foundational that getting it wrong reshapes every contract you'll write afterward: **which market model do you use**?

---

### The Three Models You'll Actually Consider

There are three serious candidates when you sit down to design a prediction market. Each is a completely different theory of how price discovery should work.

**Parimutuel** is the oldest. All bets go into a shared pool. When the event resolves, winners split the total pot proportionally to their stake. Horse racing and lottery systems work this way. The odds aren't fixed — they keep shifting as money flows in. You can't get a "locked-in" price. What you get instead is radical simplicity: no counterparty risk, no liquidity problem, no matching. The contract math fits in a single `redeem()` call.

**LMSR** — the Logarithmic Market Scoring Rule — is the economist's favorite. A formula (`cost(q) = b * log(sum(e^(q_i/b)))`) automatically quotes prices at every state, absorbing any order size. You never need a counterparty. The market maker is the formula itself. Key trade-off: the protocol takes infinite theoretical risk, bounded in practice by a parameter `b` that controls how much the price moves per unit of volume. Tuning `b` is non-trivial, and subsidizing liquidity through the formula costs real money — someone has to fund that.

**CLOB** — Central Limit Order Book — is what American Spend uses. Limit orders sit in a price-time priority queue. A taker sweeps the book. No formula, no pool — just matching. This is how every serious financial exchange works. Price discovery is as good as it gets. Key trade-off: it's brutally complex to implement on-chain, and it needs liquidity to function. An empty book is useless — and a new market starts with an empty book.

---

### Why We Chose the CLOB

The parimutuel model was tempting. The accounting is straightforward — pools per outcome, symmetric mint/burn — and you can express the core invariant as a single equation that fuzz tests can mechanically verify:

```solidity
// sum(pools[i]) must always equal totalPool
// mintCompleteSet: pools[i] += amount; totalPool += amount (for each i)
// burnCompleteSet: symmetric debit
function _assertPoolInvariant() internal view {
    uint256 sum = 0;
    for (uint8 i = 0; i < numOutcomes; i++) {
        sum += pools[i];
    }
    require(sum == totalPool, "pool invariant broken");
}
```

We actually shipped parimutuel first. Implied odds fall out of the pools naturally — `impliedOdds = (pool[outcome] * BPS) / totalPool` — and the math is clean. But the user experience was not. In a parimutuel market, you can't know your payout until resolution. You're betting into a moving target. That's fine for horse racing, where everyone bets and then the race happens. It's a bad fit for markets that stay open for weeks with active trading. We knew after a few weeks of testing.

LMSR was our second consideration. It solves the liquidity problem elegantly — the formula is always there to trade against. But the subsidy model troubled us. Someone has to fund the market maker, and the loss exposure scales with volume. For a protocol that wants to run many markets in parallel, capping that exposure gets complicated fast. And on-chain, the exponential arithmetic in the LMSR formula is expensive enough that gas costs on L1 would be punishing.

The CLOB won because of price fidelity. In a liquid CLOB, prices reflect what the market actually believes. A limit at 4800 bps for YES means the placer genuinely thinks the probability is around 48%. That information precision matters for a prediction market to be useful — it's the whole point of the exercise.

But **the CLOB only works if there's liquidity**. A new market starts with nothing. We solved this with a seeded liquidity mechanism — the protocol itself seeds initial asks at launch — and a two-phase model where Phase 1 runs a simpler buying mechanism before the book opens. More on this below.

---

### The CLOB Implementation Is Not Simple

When we started building the CLOB, we implemented four different backends before committing to one: `CLOBReference` (linear scan over a tick array), `CLOBBitmap` (bitmap of active price levels), `CLOBLinkedList` (sorted doubly-linked list), and `CLOBRBTree` (Solady's red-black tree as a price-level index).

The performance differences were not marginal. Under a sparse book — realistic for a prediction market where price levels cluster around 50% rather than spanning a full range — the array baseline consumed `56,356,142` gas for a single match. The RB-tree: `145,390` gas. That is a 99.7% reduction. The bitmap looked elegant but lost badly on dense and deep-queue scenarios.

The architecture we landed on separates two concerns that naive implementations merge: the **price-level index** (which prices have active orders?) and the **per-level queue** (which orders are at this price?). The RB-tree handles the index. Per-level, we use an append-only array with a moving cursor — lazy head advancement instead of O(n) shifts on cancellation:

```solidity
// Price index: RB-tree, updated only on 0↔1 active-count transitions
// Per-level: append-only id array + moving head cursor
mapping(uint16 => uint256[]) internal sellOrderIdsByPrice;
mapping(uint16 => uint256) internal sellQueueHeadByPrice;
mapping(uint16 => uint256) internal activeSellCountByPrice;

function _decrementActiveSellLevel(uint16 price) internal {
    activeSellCountByPrice[price]--;
    if (activeSellCountByPrice[price] == 0) {
        // Only remove from price tree on the 1→0 transition
        _sellPriceTree.remove(bytes32(uint256(price)));
    }
}
```

This amortizes tree-write costs across all orders at the same price. Deep queues at a single price pay tree maintenance once — on the first insert and last cancellation — not per order.

---

### Position Caps Are Not Optional

Once you have a working order book, the next temptation is to think you're done. You're not. A prediction market without position caps is an oracle manipulation waiting to happen.

The logic is simple: if a single wallet can accumulate 80% of the YES tokens, they have a strong incentive to manipulate the oracle to resolve in their favor. The profit from the concentrated position can easily exceed the cost of oracle corruption. Position caps bound this profitability and make manipulation unattractive relative to the operational cost.

What surprised us was how many entry points need the cap enforced. The obvious one is the CLOB market buy. But we also had to enforce it on:

- `mintCompleteSet` — buying the full set of outcomes and selling the ones you don't want is economically equivalent to a one-sided buy
- refund paths — receiving a refund from a cancelled order can increase your net position in the other outcomes

The cap uses a pool-relative formula: `maxPositionValuePoolFloor` sets a minimum denominator so the cap doesn't become absurd on tiny pools. The key insight is that you need to check `balanceOf(user, outcome) * BPS / totalPool` on every path that increases user exposure:

```solidity
function _enforceMaxPosition(address user, uint8 outcome, uint256 newBalance) internal view {
    uint256 poolRef = totalPool < maxPositionValuePoolFloor
        ? maxPositionValuePoolFloor
        : totalPool;
    uint256 shareBps = (newBalance * BPS_DENOMINATOR) / poolRef;
    if (shareBps > maxPositionShareBps) revert MaxPositionExceeded();
}
```

Key trade-off: **position caps reduce liquidity**. A whale who wants to provide 30% of the pool as a single directional bet can't. They need to split across wallets or accept partial fills. This is the right constraint for a prediction market — it's not a venue for leveraged concentration bets — but you need to design your seeding mechanism with it in mind, since the protocol itself is the maker in Phase 1 and those positions need special accounting treatment.

---

### The Two-Phase Model and Why It Matters

American Spend uses a two-phase lifecycle before the CLOB becomes the primary venue. This is where the parimutuel and CLOB models actually coexist rather than compete.

Phase 1 is a controlled buying phase. The protocol seeds asks at bootstrapping prices. Users can buy YES or NO at implied prices derived from the pool composition. Transfers of outcome tokens are locked — no OTC trades, no front-running of graduation. This phase accumulates collateral and builds the initial price signal. Tiered fees incentivize early liquidity: the first buyers pay 0%, later entrants pay progressively more.

Phase 2 is the open CLOB. Once the pool crosses a threshold, `graduate()` is called, transfers unlock, and the order book opens. The transition is gated — it requires the pool to be above minimum, and there's a bounty delay to prevent MEV races on the graduation transaction.

The lifecycle state machine is enforced via dedicated modifiers, not inline checks:

```solidity
modifier onlyOpen() {
    if (!isOpen()) revert MarketNotOpen();
    _;
}

modifier onlyGraduated() {
    if (!graduated) revert MarketNotGraduated();
    _;
}
```

This matters for auditing. Every external function declares its valid states by which modifiers it carries. There's no hunting for `require(state == State.Open)` scattered through a 1000-line contract. And the transition from Phase 1 to Phase 2 is a hard architectural boundary — different fee logic, different slippage semantics, different token transfer rules.

Key trade-off: **two phases add complexity**. You're maintaining two code paths for buying, two sets of accounting rules, and you need to make sure the protocol's seeded liquidity is correctly accounted when orders are filled or cancelled. The seeded asks generate callbacks — `onSeededAskFill` — that adjust the pool balances, because the protocol as maker receives collateral rather than tokens and that flow has to be reconciled separately.

---

### The Accounting That Keeps You Honest

At this point you might think the hard problems are behind you. They're not — they've just shifted from order book mechanics to accounting.

Any prediction market that integrates a yield vault — collateral earning yield while sitting in the contract — adds a third layer of complexity on top of the market model and the position caps.

The payout formula is not just "winning tokens / total winning tokens × pool". It's "winning tokens / total winning tokens × (pool + seedFund + yield − rake)", and each of those terms has edge cases. If the vault takes a loss — say, a USDC yield vault that underperforms — you need a waterfall to decide who absorbs it. In American Spend, the seed fund absorbs losses first, protecting speculators. If the loss exceeds the seed fund, the pools are haircut proportionally.

The yield cap is equally important: the aggregate surplus from the vault caps the total yield claimable. You cannot distribute per-user yield slices that individually exceed the collective vault gain — even if individual user entry prices would suggest a positive yield. This prevents a subtle drain where a few users with favorable entries claim more than the vault actually produced:

```solidity
uint256 aggregateSurplus = vaultSnapshot > totalPrincipal
    ? vaultSnapshot - totalPrincipal
    : 0;
uint256 userYield = (aggregateSurplus * userShares) / totalShares;
// sum(userYields) ≤ aggregateSurplus, always
```

And when the market resolves, we snapshot everything — `payoutPool`, `correctOutcomeTotalSupply` (excluding tokens still held by the protocol), `actualResolutionTime` — before the first redeem is called. Post-resolution reads come from the snapshot, not live state. This is mandatory: redeem calls happen in random order, and live reads would break fairness as the state changes with each claim.

---

### Final Thought

The market model you choose is not a configuration flag — it's a load-bearing wall. Every contract downstream of that decision inherits its constraints. Parimutuel gives you clean invariants and zero liquidity risk, but leaves your users trading blind. LMSR gives you always-on liquidity, but turns your protocol into a subsidized market maker with open-ended loss exposure. CLOB gives you real price discovery, but only if you're willing to build the infrastructure it actually demands — and it demands more than most teams expect.

The honest answer from building American Spend: the right choice depends on your expected liquidity, your users' sophistication, and how much operational complexity you're prepared to own long-term. There's no free lunch. Every model trades something.

---

If you're designing a prediction market — or evaluating the trade-offs in any DeFi protocol with an order book — I'd enjoy talking through the specifics. The devil is always in the details, and the details are usually in the accounting. Feel free to connect or send me a message.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
