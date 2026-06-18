---
social-post: |-
  🤔 "On-chain order books don't scale" — I heard that enough times that I almost believed it.

  In my latest article, I share what actually happened when we built four CLOB backends for American Spend at 33Labs and put them through a real benchmark shootout. The data structure question turned out to be the whole design — and the results were not what I expected.

  If you're designing a perpetuals exchange, a prediction market, or anything with resting orders on-chain, this one's for you. 👇

  hashtag#Solidity hashtag#DeFi hashtag#SmartContracts hashtag#OnChain hashtag#PredictionMarkets hashtag#OrderBook hashtag#Ethereum hashtag#Web3 hashtag#BlockchainDevelopment hashtag#GasOptimization
---
# Building an On-Chain Order Book: The Data Structure Is the Design

"On-chain CLOBs don't scale" — I've heard that enough times that I almost believed it. Then I actually built one and found out the real problem: most implementations pick a data structure by intuition and never measure the consequences.

When I was building American Spend — a prediction market protocol at 33Labs — we needed a **Central Limit Order Book** (CLOB) for the graduated trading phase. The model was clear: price-time priority, maker-taker fee structure, seeded liquidity from the protocol itself. The implementation question was anything but. And that question, it turned out, was the entire design.

---

### What Makes a CLOB Different from an AMM

An **AMM** replaces the order book with a pricing formula — you trade against a pool, no counterparty needed. Gas is predictable; the tradeoff is that price impact is always present.

A **CLOB** matches discrete resting orders. A buyer at 0.52 only fills against a seller at 0.52 or lower. Price-time priority means: same price, the earlier order fills first (**FIFO**). That's the whole matching engine in one sentence.

For a prediction market, CLOBs fit naturally: binary outcomes have terminal prices of 0 or 1, so tight spreads from resting liquidity make more sense than constant-function pricing. The challenge is gas. Every matching step touches storage — and storage on Ethereum is expensive.

---

### Four Candidates, One Shootout

We built four backends behind a shared `IOrderBook` interface instead of committing to one:

- `CLOBReference` — naive baseline: `mapping(price => uint256[])`, linear scan over the full tick range.
- `CLOBBitmap` — fixed-range bitmap of active prices, inspired by Uniswap v3's tick index.
- `CLOBLinkedList` — sorted doubly-linked list; buys descending, sells ascending.
- `CLOBRBTree` — balanced tree of active price levels using Solady's `RedBlackTreeLib`.

All four shared the same `placeLimit`, `marketBuy`, `cancelOrder` interface. `CLOBPerformance.t.sol` ran identical scenarios across all four; results went to `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md`. Raw gas numbers, not impressions.

The results were not what I expected.

---

### What the Numbers Said

The scenarios that mattered most: sparse matching (few price levels active), dense matching (many adjacent levels), deep queues (many orders at the same price level), and cancel churn (constant insert-cancel traffic).

Sparse match — a single taker hitting one price level in a mostly empty book:

| Implementation | Gas (sparse match) |
|---|---|
| Reference (linear scan) | 56,356,142 |
| Bitmap | 288,000 |
| RB-tree | 145,390 |
| Linked list | 145,000 |

The baseline isn't slow. It's catastrophically unusable — fifty-six million gas for a single match. On L1, that's more than an entire block. The scan over unpopulated ticks is the killer.

Dense match — taker sweeping across many adjacent price levels:

Bitmap was *worse* than the baseline here. Fixed-range bitmaps shine when active prices are scattered uniformly. When fills cascade through many contiguous levels, the O(words) range iteration compounds with per-level order scanning. This is the scenario nobody warns you about: the structure most commonly cited for on-chain DEX (Uniswap v3's tick bitmap) loses on exactly the fill pattern a prediction market generates. RB-tree and linked list maintained their edge.

Cancel churn — the scenario that shows up in real markets as makers adjust quotes:

| Implementation | Gas (cancel churn) |
|---|---|
| Reference | 33,400,000 |
| Bitmap | 2,270,000 |
| RB-tree | 2,060,000 |
| Linked list | 2,070,000 |

RB-tree and linked list were nearly tied across every scenario. We picked RB-tree for marginally better behavior on cancel-churn and clearer worst-case bounds on insert (O(log n) rebalance vs O(n) shift in a sorted array). The linked list was reintroduced once purely to re-bench `cancelAllOrders`, then deleted again.

**Key trade-off:** the shootout cost us two sprints. Implementing four backends, writing the benchmark harness, and generating the report is real work. The alternative — committing to the wrong structure — would have cost us a rewrite at a much worse moment, possibly after audit.

---

### The Structure That Won (and Why It Works)

The winning design separates two concerns that most implementations conflate: the **price-level index** and the **order queue**.

The **price-level index** is the RB-tree. It holds only price keys — no orders, no notionals, just the set of prices that currently have at least one resting order. To find the best ask, you call `nearestAfter(from)`. To find the best bid, `nearestBefore(from)`. One tree lookup instead of a scan.

The **order queue** lives at each price level as a simple append-only array plus a moving head pointer:

```solidity
mapping(uint256 price => uint256[]) private buyOrderIdsByPrice;
mapping(uint256 price => uint256) private buyQueueHeadByPrice;
mapping(uint256 price => uint256) private activeBuyCountByPrice;
```

Place an order: append its ID, increment the active count. Fill or cancel the head: advance the cursor, decrement. Active count hits `0 → 1`: insert the price into the tree. Hits `1 → 0`: remove it.

The tree is updated exactly twice per price level's lifetime — on first entry and last exit — regardless of how many orders accumulate there. Deep queues amortize tree maintenance to a flat cost.

Cancellation uses lazy head advancement instead of array shifts:

```solidity
while (head < queue.length) {
    uint256 orderId = queue[head];
    Order storage order = orders[orderId];
    if (!order.active || order.remaining == 0) {
        head++;
        continue;
    }
    // process order
    break;
}
buyQueueHeadByPrice[price] = head;
```

No `delete`, no shift, no O(n) cleanup. Cancelled orders are simply skipped on the next traversal.

**Key trade-off:** the append-only queue means cancelled orders leave gaps in the array forever. Storage isn't reclaimed on cancellation. For very long-running markets with constant churn, the gaps accumulate. We live with this — the alternative (compact shifts) costs more gas on the hot path than it saves on cleanup.

---

### Pricing in Basis Points

One detail that looks like a footnote but causes real bugs if you skip it: use **basis points** (BPS) as your canonical pricing unit.

In American Spend, `priceBps = 5000` means 50% implied probability. `10000 = 100%`. The constant `BPS_DENOMINATOR = 10_000` lives in a shared library used by every contract.

```solidity
library MarketConstants {
    uint16 internal constant BPS_DENOMINATOR = 10_000;
    uint16 internal constant MAX_GRADUATE_CALLER_REWARD_BPS = 1_000; // 10% hard cap
}
```

Why BPS and not a decimal? Solidity has no floats. BPS is the finance standard: a unitless integer ratio, always cleanly divisible. It also naturally separates "technically valid" (≤ 10000) from "economically sane" (≤ 1000 for a caller reward). Both checks are needed — a 100% caller reward is technically valid BPS and economically catastrophic.

---

### Seeded Liquidity and the Protocol-as-Maker Problem

The CLOB design in isolation is solvable. The interesting complexity arrives when the protocol itself places orders — what we call **seeded liquidity**.

In American Spend, markets start in a Phase 1 AMM. When enough liquidity accumulates and the market graduates, a ladder of seeded ask orders is placed by the protocol to provide initial CLOB depth. The protocol becomes a maker.

This creates an accounting problem that bit us in multiple places — on fill, on cancel, and on rebate:

- **On fill:** when a seeded ask fills, the notional needs to flow back into `pools[outcome]`. Otherwise the pool balance shrinks without the protocol "earning" anything. The CLOB triggers `onSeededAskFill(outcomeId, notional)`, and the market credits it back.
- **On cancel:** when a seeded ask is cancelled, the outcome tokens shouldn't be returned to the market contract. They should be **burned**. Returning them inflates `balanceOf(market, outcomeId)`, which contaminates the payout denominator. We also discovered — the hard way — that the collateral refunded to the market on cancel wasn't being credited back to `pools` either, corrupting the finalization snapshot. The fix accumulates `pendingSeedPoolInflow` and applies it before the snapshot.
- **On rebate:** the maker rebate path needs to special-case `if (maker == market)`. A protocol paying itself a rebate is just leaking to a different accounting bucket.

The fill callback:

```solidity
function onSeededAskFill(uint256 outcomeId, uint256 notional) external {
    require(msg.sender == address(clob));
    pools[outcomeId] += notional;
    totalPool += notional;
}
```

**Key trade-off:** callbacks add coupling. The CLOB now needs to know whether a maker is the market, and it can't be fully generic. We decided this was acceptable; the `IOrderBook` interface still hides the implementation, and the coupling is confined to one gated code path. The alternative — tracking seeded fills outside the CLOB — would require the market to replay fill events, which is worse. But every time we added a new seeded-order path (fill, cancel, graduation cancellation), we had to audit this coupling again. The accounting edge cases kept arriving.

---

### The Poison Pill Nobody Saw Coming

After an audit pass, we added a defensive guard inside the match loop: `if (notional == 0) revert ZeroAmount()`. Reasonable — prevent free token transfers from floor-division dust. But combined with a gap in invariant maintenance on the maker side, this guard became a **permanent denial-of-service primitive**.

An adversary places a sell order at `minTick` with `minOrderSize`. Partially fill it until `makerRemaining > 0` but small enough that `notional = makerRemaining * minTick / 10_000 = 0`. The next taker hits that price level and reverts — forever, unless the maker cancels. One dust order bricks the entire FIFO head.

Fix: don't revert inside the queue walk — skip and clean up. Detect a dust maker, call `_cleanupSellMakerDust()` to decrement the active counter (removing the level from the tree if empty) and advance the head.

```solidity
if (notional == 0) {
    // Dust maker: skip, clean up level, don't revert
    _cleanupSellMakerDust(price);
    head++;
    continue;
}
```

The lesson generalizes: any `revert` inside a loop that walks shared state is a potential poison pill. Before you add it, enumerate every state that satisfies the revert condition while still being marked "active" in the queue. If any such state exists, the revert is griefable. Convert it to a skip-and-cleanup.

---

### Final Thought

Building an on-chain CLOB is a sequence of interacting decisions, each with gas implications you can't fully reason about without measuring. The data structure determines matching complexity. The FIFO-per-level design determines cancellation cost. BPS pricing determines whether your fee math silently overflows. Seeded liquidity accounting determines whether your protocol owns its own capital correctly — across fill, cancel, and rebate, separately.

What I learned: commit to the interface first, implement the candidates, run the shootout, then delete the losers. The report stays in the repo. The next engineer doesn't have to re-derive the answer.

---

If you're building a prediction market, a perpetuals exchange, or anything with resting orders on-chain, I'd love to compare notes. Feel free to connect or message me — I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
