---
social-post: |-
  🤔 "It scales" is not a test. Do you actually know how many orders your matching engine can sweep before it runs out of gas?

  In this article I walk through the approach I used in American Spend's CLOB to turn that vague hope into a measurable, CI-enforced guarantee.

  If you're building matching engines, batch processors, or any function that loops over attacker-controlled input — this one's for you. 👇 Read the article below.

  hashtag#SmartContracts hashtag#Solidity hashtag#Foundry hashtag#DeFi hashtag#CLOB hashtag#GasOptimization hashtag#Web3 hashtag#BlockchainDevelopment hashtag#Testing hashtag#PredictionMarkets
---
# How Many Orders Can One Buy Match? The Binary-Search Stress Test Every CLOB Needs

There's a question every team building a matching engine eventually asks — and almost never answers rigorously: *how deep can an order book get before a single taker sweep runs out of gas?*

In American Spend, our prediction market protocol, this question wasn't hypothetical. We have a CLOB where market-seeded asks sit waiting for buyers. A single `placeLimitBuy` can sweep through an arbitrarily long chain of resting sells. No explicit cap in the source. No per-match gas budget enforced on-chain. Just the implicit, unverified hope that "it scales."

That hope is not a test. So we wrote one.

---

### The Problem With Unbounded Matching

In a **Central Limit Order Book (CLOB)**, a taker order matches against resting maker orders one by one, consuming gas for each fill. The gas cost grows linearly with the number of matches. At some `N`, the transaction runs out of gas and reverts — permanently, if the book stays that deep.

The practical risk is real: a market where a single adversarial participant places 2,000 resting sell orders at a price that will be swept by the next buyer. The buyer's transaction hits the gas cap, reverts, and the book becomes permanently unusable at that price level. That's a denial-of-service attack, and it costs the attacker only the price of placing 2,000 cheap asks.

The correct mitigation is not always "add an explicit cap" — sometimes you genuinely want the engine to match as many orders as the block allows. The correct mitigation is knowing your **gas watermark** and enforcing a floor on it via CI.

---

### The Binary-Search Watermark Test

The core idea: use a binary search to find the largest `N` such that sweeping `N` resting orders fits inside the target block gas budget. Then assert that `N` is at least some minimum acceptable value.

In American Spend, we implemented this in `test/stress/CLOBSingleBuyMatchStress.t.sol`. The test seeds a one-sided book — all asks stacked at a single price level, forming a FIFO chain — and dispatches a taker buy with a fixed gas cap matching the Ethereum mainnet block target.

```solidity
uint256 constant BENCHMARK_BLOCK_GAS = 30_000_000;
uint256 constant MIN_ACCEPTABLE_MATCHES = 1_400;

function _canMatchN(uint256 n) internal returns (bool) {
    uint256 snap = vm.snapshotState();
    _seedAskLadder(n);                      // place n resting sells
    bytes memory data = abi.encodeCall(
        clob.placeLimitBuy, (params)
    );
    (bool success,) = address(clob).call{gas: BENCHMARK_BLOCK_GAS}(data);
    vm.revertToState(snap);                 // clean slate for next probe
    return success;
}
```

The search proceeds in two phases. First, an **exponential probe** — try 1, 2, 4, 8, 16, ... matches until the call fails. This gets us to the right order of magnitude in O(log N) steps. Then a **binary search** between `pow/2` and `pow` finds the exact watermark.

```solidity
function test_singleBuyMatchWatermark() public {
    vm.skip(isForgeGasCoverage()); // gas meaningless under instrumentation

    uint256 lo = 1;
    uint256 hi = 1;

    // exponential probe: find upper bound
    while (_canMatchN(hi)) {
        hi *= 2;
    }

    // binary search: find exact watermark
    while (lo < hi - 1) {
        uint256 mid = (lo + hi) / 2;
        if (_canMatchN(mid)) lo = mid;
        else hi = mid;
    }

    assertGe(lo, MIN_ACCEPTABLE_MATCHES, "gas watermark below floor");
}
```

When a run completes, you know the exact number. When a refactor shrinks headroom, the assertion fails in CI before it ships.

---

### Why the Realistic Path Matters

One detail that looks like plumbing but is actually load-bearing: the asks are seeded through the **market's liquidity seeding mechanism**, not by placing cheap synthetic orders directly in the CLOB.

This matters because each fill on a seeded ask triggers an `onSeededAskFill` callback from the CLOB back into the Market contract. That callback handles accounting — crediting collateral, adjusting the pool, updating balances. It is the expensive path. A synthetic shortcut that bypasses the callback would give you a watermark that's dangerously optimistic.

If your stress test measures a fast synthetic path and your production code runs the expensive realistic path, the only thing you've proven is that your test doesn't test the right thing.

> The rule I follow: if the code under test has callbacks, the stress test must exercise them.

---

### Snapshot and Revert: The O(log N) Trick

Without `vm.snapshotState` / `vm.revertToState`, each probe would build on the previous book state. The 8th probe would have 7 previous asks still sitting in the book. Your results would be nonsense, and the setup cost would be O(N²).

With snapshot/revert, each probe starts from a clean, empty book. The total setup cost is O(log N) probes × O(N) setup for the final watermark — entirely tractable.

This is also why the test is in `test/stress/` and not `test/unit/`: it takes a few seconds to run the binary search, and that's acceptable in a dedicated stress suite but not in a fast unit suite.

---

### Self-Skipping Under Coverage

One counterintuitive requirement: the test skips itself when Foundry's coverage instrumentation is active.

```solidity
vm.skip(isForgeGasCoverage());
```

Coverage instrumentation adds hooks to every opcode, inflating gas consumption by an order of magnitude. A test that passes at 30M gas uninstrumented will fail at 2M instrumented matches — not because the engine regressed, but because the measurement environment changed. Treating that as a regression would be a false positive. More importantly, the watermark you'd measure would be useless.

The solution is explicit: skip the test in coverage runs, and run it separately in a dedicated CI step without coverage flags.

**Key trade-off:** you lose branch coverage credit for the stress test paths. That's acceptable because the test's value is in its gas measurement, not its branch coverage. Mixing the two goals produces neither well.

---

### Setting the Right Floor

The `MIN_ACCEPTABLE_MATCHES` constant deserves deliberate thought. In American Spend, we set it to 1,400. Here's why:

We looked at the realistic adversarial book depth — how many orders could a griefer place at a single price level before our market creation parameters or economic friction made it unviable. We estimated a realistic worst case around 800–1,000 orders. We set the floor at 1,400, giving roughly 40% headroom above the adversarial scenario.

The 40% exists because refactors add gas. A new storage write here, a new event there — those cost a few thousand gas each, and the watermark shrinks. The floor buys you room to grow the codebase without constantly re-measuring.

If the watermark drops below the floor, CI fails and you know exactly what to look at. If the watermark drops but stays above the floor, you can choose when to optimize — it's a known debt, not a silent regression.

**Key trade-off:** set the floor too high and you'll get spurious CI failures every time a legitimate feature adds a storage write or event. Set it too low and you lose the regression signal. The 40% headroom above the realistic adversarial scenario is a heuristic; tune it to your own protocol's pace of change.

---

### Where This Pattern Applies Beyond CLOBs

The binary-search watermark approach generalizes to any function where worst-case gas grows with attacker-controlled input:

- **Batch processors** that iterate over queues (in American Spend, `cancelOrdersRange` uses cursor-based batching for exactly this reason — a single cancellation tx over 1,000+ orders would hit the block gas limit)
- **Multi-hop routers** that traverse paths
- **Queue compaction functions** that merge or evict entries
- **Settlement loops** that iterate over unfilled orders

The test structure is always the same: identify the input that scales the loop, use exponential probe + binary search via snapshot/revert, dispatch via `.call{gas: budget}`, assert the floor.

---

### Final Thought

The matching engine in American Spend has no explicit per-transaction match cap in its source code. That's an intentional design choice — we didn't want to artificially limit how many orders a taker can sweep in a single block if gas allows it. But "no explicit cap" doesn't mean "no cap." The block gas limit is always the cap. The question is whether you know where it bites.

The watermark test turns that implicit, unknown limit into a CI-enforced invariant. "We hope it scales" becomes "we know it handles at least 1,400 matches per transaction at mainnet block gas, and we'll know within one CI run if a refactor changes that."

It's not magic. It's not a replacement for sound algorithm design. But it's a seatbelt — one that costs a few hours to write and pays for itself the first time an innocuous optimization silently shrinks your match depth by 40%.

---

If you're building matching engines, batch processors, or any function that loops over attacker-controlled input — I'd love to hear how you're approaching the gas headroom problem. Feel free to connect or send me a message. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
