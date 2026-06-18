---
social-post: |-
  🧠 Passing an audit checklist and writing contracts that hold up under real money are two different skills.

  After 112 commits, multiple audits, and a handful of production bugs on American Spend — a CLOB with vault yield and ERC6909 multi-token — I wrote about the categories of skill that actually separated "works in tests" from "holds up under real money."

  If you're building a DeFi protocol and wondering where the real leverage is, this one's for you.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#Web3 hashtag#EVM hashtag#Foundry hashtag#BlockchainDevelopment hashtag#SoftwareEngineering
---
# The Solidity Skills That Actually Move the Needle

If you've been writing smart contracts for a while, you've probably noticed that most Solidity advice falls into two camps: "here's a footgun to avoid" or "here's how to pass an audit checklist." Both are useful. Neither of them is what separates contracts that hold up under real money from contracts that don't.

I've been building a prediction market protocol — a CLOB with vault yield and ERC6909 multi-token — through 112 commits, multiple audits, and a handful of production bugs. The categories of skill that actually mattered surprised me.

---

### Accounting Before Architecture

The most consequential skill in DeFi isn't design patterns. It's the ability to reason about accounting — precisely, invariantly, at every code path.

The pattern I return to most: **aggregate before you slice**. If your contract distributes yield, don't compute each user's share in isolation. Compute the aggregate surplus first, then slice. In our vault, early-entry users had favorable share prices. Without the aggregate cap, their individual yield slice could be positive even when the vault had an aggregate loss — silently draining the payout pool that winning bettors expected.

The fix is straightforward once you see it:

```solidity
uint256 surplus = vaultSnapshot > totalPrincipal
    ? vaultSnapshot - totalPrincipal
    : 0;

uint256 userYield = (surplus * userShares) / totalShares;
```

That's it. But getting there required building the invariant — `sum(userYields) ≤ surplus` — as a Foundry fuzz test and letting it run against adversarial inputs.

**Key trade-off**: aggregate capping means some users receive less than a naive per-user calculation would give them. That's intentional. The alternative is a contract that overpays early claimants and leaves nothing for later ones.

The same principle governs loss waterfalls. When our vault took a loss, we absorbed it tier by tier: seed fund first, then proportional haircut on the pools. Without a declared waterfall, losses distribute chaotically — whoever claims first gets the best deal. That's not a DeFi product. It's a race condition with money.

---

### State Machines — With No Shortcuts

The second area: lifecycle management. Prediction markets have natural state machines — phase 1, graduated, resolved, cancelled. But "state machine" means nothing if you compact terminal states into a single flag.

We learned this when we added `cancelledWithRefund` as a distinct flag from `cancelled`. In `cancelled`, yield goes to treasury. In `cancelledWithRefund`, yield is available to users. A single bool can't express that. Every time you compress two semantically different states into one bit, you're writing a future bug.

The rule I apply now: **each terminal substate that has different semantics for the user gets its own flag**. Not a bitmask, not an enum value — an explicit named boolean. It's verbose. It's worth it.

The corollary: **idempotency via explicit flag, not zero-value sentinel**. We had a vault finalization path that checked `if (resolvedVaultAssetsSnapshot > 0)` to avoid double-execution. That breaks completely when the vault suffers a total loss — snapshot is zero legitimately. The fix:

```solidity
bool public vaultAccountingFinalized;

function _finalizeVaultAccounting(bool tolerateFailure) internal {
    if (vaultAccountingFinalized) return;
    // ... finalization logic
    vaultAccountingFinalized = true;
}
```

Zero as a sentinel is a trap. If zero is a valid value in your domain, use a dedicated flag.

**Key trade-off**: more state flags mean more surface area to maintain and sync. The answer isn't fewer flags — it's better tooling. We added a `MarketLens` that exposes every sub-state granularly so frontends could display "resolved (settlement pending)" separately from "fully settled." Granular state without good read interfaces is just complexity.

---

### Security Is a Practice, Not a Checklist

The third category: security patterns that compose — meaning patterns you apply consistently, not just where you remembered to think about it.

`ReentrancyGuardTransient` (using TSTORE/TLOAD from EVM Cancun) over every mutating entry-point. Not just the obvious ones. In our CLOB, that meant `place/cancelOrder`, `marketBuy/Sell`, `redeem`, `claim`, and `processFinalizationBatch`. Every one got a guard. The transient version is especially clean here — it clears between transactions without persisting to storage, which matters in a system processing multiple transactions per block.

The ordering matters: `nonReentrant` before auth modifiers, always. If your guard runs after `onlyOwner`, a reentrant call could theoretically bypass the auth check via a delegatecall in a library before the guard activates. It's an edge case. The fix — one line reorder — is free.

Slippage bounds are a similar story. We had a bug where `maxCollateralIn` was checked against `spentCollateral` alone, without including the taker fee. Users set their budget in total spend. The check has to reflect that:

```solidity
if (spentCollateral + paidTakerFee > maxCollateralIn_) {
    revert SlippageExceeded();
}
```

The lesson isn't "check slippage." It's **check slippage against what the user actually thinks they're spending** — which includes every outflow.

**Key trade-off**: exhaustive guard coverage adds gas. `ReentrancyGuardTransient` is cheaper than storage-based guards, but it's not zero. On a CLOB where match loops run deep, this matters. Profile before and after. In our case, the overhead was acceptable and the alternative was unacceptable.

---

### Gas Optimization: Reactive, Not Dogmatic

I want to be honest about gas: most early optimization is premature. But a few habits are always correct.

**Prefer `public` state variables over manual getters.** A function `getFoo() external view returns (uint256) { return foo; }` costs more gas and bytecode than `uint256 public foo`. The compiler generates the getter for free. We caught this pattern across multiple contracts in one cleanup pass.

**Cache storage reads when a variable is read 2+ times in a function.** A repeated SLOAD costs 2100 gas (cold) or 100 (warm). An MLOAD costs 3. In redemption paths and resolution logic, this adds up fast.

**ERC6909 for multi-token systems.** We were deploying N ERC20 clones for N outcome tokens per market. Switching to a single ERC6909 contract with `tokenId = outcomeIndex` cut mint/transfer costs by 30-50% and eliminated the per-market clone overhead. If your protocol has N correlated tokens with the same lifecycle, ERC6909 is the right default.

The bigger optimization lesson came from our CLOB implementation shootout. We built four backends behind a shared `IOrderBook` interface — a reference implementation, a bitmap, a linked list, and a red-black tree — then ran them through identical scenarios: sparse matches, dense matches, deep queues, cancel churn. The results:

| Scenario | Baseline (array) | Bitmap | RB-tree |
|---|---|---|---|
| Sparse single match | 56.4M gas | 288K | 145K |
| Cancel churn | 33.4M | 2.27M | 2.06M |

The bitmap looked like the obvious choice — it's the most-cited DEX trick. But on dense matches, it was *worse* than the baseline. We picked the RB-tree, archived the report in the repo, and deleted the losers.

**Key trade-off**: implementing four alternatives and benchmarking them took real time. That investment only makes sense for genuinely gas-critical components where you'll run tens of thousands of operations. For most contracts, choose the clearest implementation and move on.

---

### Testing as Specification

The category that surprised me most: testing isn't just a verification layer. It's the best specification tool I have.

Invariant tests force you to articulate what must always be true. `sum(pools) == totalPool`. `payoutPool ≤ totalPool + seedFund`. `sum(userBalances[outcome]) ≤ totalSupply(outcome)`. Writing these is a design activity — you're deciding what your protocol promises. Then Foundry fuzzes them with 1000+ adversarial inputs and tells you where the promise breaks.

The gas-budget stress test is a specific pattern worth calling out. For our matching engine, we built a binary-search watermark test: find the largest `N` such that sweeping `N` resting orders stays within a block gas budget. Not a gut feeling — a CI-enforced assertion: `assertGe(maxN, 1400)`. Any refactor that silently adds 5K gas per match will fail this test before it ships.

```solidity
// Exponential probe → binary search via vm.snapshotState
uint256 low = lastOk;
uint256 high = probe;
while (low + 1 < high) {
    uint256 mid = (low + high) / 2;
    bool ok = _tryMatch(mid, budget);
    ok ? low = mid : high = mid;
}
assertGe(low, MIN_ACCEPTABLE_MATCHES);
```

**Key trade-off**: invariant and stress tests take time to write and maintain. Handlers need to cover every mutation. If your protocol changes, tests may need updating. The discipline required is real. In my experience, the bugs caught — including three issues we found before our first external audit — far outweigh the maintenance cost.

---

### The Skill That Ties It All Together

All of these categories share a common requirement: thinking about failure modes before they happen. The accounting invariant before it drifts. The state flag before the terminal case appears. The gas watermark before the refactor. The slippage check before the user takes an unexpected hit.

Working through American Spend pushed me toward something I'd describe as **defensive specificity** — not just "be careful" but "be precise about what can go wrong, and codify it." Fuzz the accounting. Write the waterfall. Name every terminal state. Make the gas ceiling a test.

That specificity is what I look for when reviewing a codebase. Cleverness is usually the first thing to break under adversarial conditions.

---

If you're building a DeFi protocol and thinking through any of these challenges, I'd genuinely enjoy the conversation. Connect with me or drop a message — I'm always open to exchanging ideas with other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
