---
social-post: |-
  🤔 How many orders can your matching engine sweep before it hits the block gas limit?

  Building American Spend's CLOB taught me that "a conservative guess" isn't an answer — it's a liability.
  In my latest article I share how we approached gas testing on American Spend's CLOB — turning
  architectural decisions and loop-safety questions into numbers your CI can enforce.

  If you're shipping any Solidity contract with a user-driven loop, this one's for you.
  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#Foundry hashtag#DeFi hashtag#Web3 hashtag#Blockchain hashtag#GasOptimization hashtag#SoftwareEngineering
---
# Solidity Performance Tests: Gas Snapshots, Benchmarks, and Regression Watermarks

If you've shipped a smart contract with a loop in it, you already know the anxiety. "How many iterations until it hits the block gas limit?" — and the answer is usually a shrug, a conservative guess, and a comment in the code that nobody updates.

From my experience building American Spend's prediction market, that shrug isn't good enough. Our CLOB matching engine sweeps resting orders every time a taker hits the book. There's no explicit cap in the source code. The only thing standing between a deep one-sided book and a permanently out-of-gas transaction is empirical gas headroom — and if you don't measure it, you don't have it.

Three classes of tests changed how we make decisions on American Spend: **comparative benchmarks**, **gas-budget watermarks**, and **stress tests at scale**. None of them are exotic. Each one converts a guess into a number — and a number into a CI-enforced constraint.

---

### Why Unit Tests Aren't Enough for Gas-Critical Code

Unit tests tell you that the function returns the right value. They don't tell you whether it'll still return that value after an attacker seeds 500 orders at the same price level.

Gas is a constraint that's invisible to correctness tests. `forge test` will green-check a function that'll OOG under production load every single time. The only way to surface gas bugs is to write tests where the pass/fail condition is the gas itself — not the output.

There's also a subtler problem: **refactoring blindness**. An innocuous cleanup — inlining a helper, adding an event, extracting a modifier — can silently add 5k gas per loop iteration. In a function that runs 1,000 iterations, that's 5M gas eaten without a single failing unit test. A watermark assertion in CI turns that silent regression into a red build.

---

### Benchmark Multiple Implementations Before Committing to One

When we were designing the CLOB for American Spend, we had a real architectural decision to make: what data structure should back the order book? The candidates were a bitmap, a linked list, a red-black tree, and a reference implementation.

Each has different trade-offs. Bitmap is fast to insert and match at the price level but burns bytecode size. Linked list is simple but slow to traverse. RB-tree is optimal in theory but expensive in Solidity. The "right" answer depends on which operation dominates your hot path — and that's not something you can reason your way to without data.

So we built `CLOBPerformance.t.sol`: a single test file that runs identical trade sequences through all four variants and outputs a markdown report — `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md` — with gas per place, per cancel, per match, bytecode size, and worst-case scenarios. That report goes into the PR that makes the architecture call.

Here's the pattern:

```solidity
contract CLOBPerformance is Test {
    IOrderBook bitmap;
    IOrderBook linkedList;
    IOrderBook rbTree;
    IOrderBook reference;

    function test_matchPerformance_compareImplementations() public {
        uint256 gasBitmap   = _measureMatch(bitmap,     ORDERS);
        uint256 gasLinked   = _measureMatch(linkedList, ORDERS);
        uint256 gasRBTree   = _measureMatch(rbTree,     ORDERS);
        uint256 gasRef      = _measureMatch(reference,  ORDERS);

        emit log_named_uint("bitmap",     gasBitmap);
        emit log_named_uint("linked",     gasLinked);
        emit log_named_uint("rbtree",     gasRBTree);
        emit log_named_uint("reference",  gasRef);
    }

    function _measureMatch(IOrderBook book, uint256 n)
        internal returns (uint256)
    {
        _seedBook(book, n);
        uint256 before = gasleft();
        book.placeLimitBuy(/* taker params */);
        return before - gasleft();
    }
}
```

After the block, the numbers go into `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md` and get linked directly in the PR. The team picks the winner. That report stays in the repo as permanent evidence of why the call was made — not a Slack message that disappears.

**Key trade-off:** Writing four implementations to benchmark takes real time. If there's a clear theoretical winner and you're under deadline pressure, you might skip this. What you lose is the ability to revisit the decision confidently. In our case, the benchmark showed the bitmap's match cost was non-obvious relative to bytecode size — data we couldn't have had by reasoning alone.

---

### Gas-Budget Watermarks: The Binary-Search Pattern

This is the one that changed how I think about matching engines entirely.

A **watermark test** answers a specific question: "What's the maximum N such that function F can process N items within a fixed gas budget?" For a matching engine, that's: how many resting orders can a single taker sweep before OOG?

The naive approach — loop from N=1 to N=2000 in a unit test and check gas — is O(N) and slow. The right shape is exponential probe then binary search:

```solidity
contract CLOBSingleBuyMatchStress is Test {
    uint256 constant BENCHMARK_BLOCK_GAS = 30_000_000;
    uint256 constant MIN_ACCEPTABLE_MATCHES = 1_400;

    function test_watermark_singleBuyMatch() public {
        if (isRunningUnderCoverage()) return; // gas meaningless with instrumentation

        uint256 lo = 1;
        uint256 hi = 1;

        // Exponential probe: find upper bound
        while (_canMatch(hi)) { hi *= 2; }

        // Binary search between lo and hi
        while (lo < hi - 1) {
            uint256 mid = (lo + hi) / 2;
            if (_canMatch(mid)) { lo = mid; } else { hi = mid; }
        }

        assertGe(lo, MIN_ACCEPTABLE_MATCHES);
    }

    function _canMatch(uint256 n) internal returns (bool) {
        uint256 snap = vm.snapshotState();
        _seedBook(n);
        (bool ok,) = address(clob).call{gas: BENCHMARK_BLOCK_GAS}(
            abi.encodeCall(clob.placeLimitBuy, (/* taker params */))
        );
        vm.revertToState(snap);
        return ok;
    }
}
```

Three implementation details matter here. First, use `vm.snapshotState()` + `vm.revertToState()` between probes — otherwise each probe seeds on top of the previous one and you're not measuring what you think you are. Second, dispatch the call with `address(clob).call{gas: BENCHMARK_BLOCK_GAS}` so OOG is a clean bool, not a test revert that halts the search. Third, self-skip under `forge coverage` — instrumentation adds ghost gas to every opcode and makes watermark numbers completely meaningless.

The `assertGe(lo, MIN_ACCEPTABLE_MATCHES)` line is the CI invariant. It fails the build if a refactor silently shrinks the safe match depth. That's the seatbelt.

**Key trade-off:** Choosing `MIN_ACCEPTABLE_MATCHES` requires judgment. Set it too low and the guard is decorative. Set it too high and every optimization pass triggers a false failure. In practice, I aim for 30–50% headroom over the realistic worst-case depth on a production book. For L2 deployments, the block gas budget changes — be honest about your target chain.

> 📝 _Exercise the realistic maker path._ In American Spend, seeded liquidity triggers an `onSeededAskFill` callback on every fill. If your stress test shortcuts past that callback, the watermark is optimistic — you're not measuring the real hot path. Test what production actually runs.

---

### Stress Tests for Scale: Finding What Unit Tests Hide

The watermark test tells you the gas ceiling. **Stress tests** tell you what breaks before you hit it — logic bugs that only appear at scale.

In `CLOBSingleBuyMatchStress.t.sol`, running 500+ matches against a seeded ladder didn't just measure gas. It found a stack overflow that no unit test had touched. The invariant checks inside the loop — `sum(pools) == totalPool`, `payoutPool ≤ totalPool + seedFund` — caught an accounting drift that only accumulated over large N.

This is the thing about stress tests: they're not a different category from invariant tests. They're invariant tests with the volume turned up. Write them as a loop with inline assertions, not just as a "gas measurement" pass. If something's going to drift under load, the invariant will catch it.

```solidity
function test_stress_500Matches() public {
    _seedBook(500);
    for (uint256 i = 0; i < 500; i++) {
        _placeAndMatch(/* params */);
        assertEq(
            _sumPools(),
            market.totalPool(),
            "pool accounting drift"
        );
    }
}
```

**Key trade-off:** Stress tests are slow. Running 500 iterations in Foundry adds seconds to your CI. Put them in a `test/stress/` or `test/performance/` folder and run them on-demand or nightly, not on every PR. The hierarchical test layout — `base/unit/integration/fuzz/performance` — makes this easy: CI runs `unit/` on every PR, `performance/` only on merge to main.

---

### Putting It Together: The Performance Test Folder

From the work on American Spend, the folder layout that emerged looked like this:

```
test/
  performance/
    CLOBPerformance.t.sol         # comparative benchmarks
    CLOBSingleBuyMatchStress.t.sol # watermark + stress
  stress/
    CLOBSingleBuyMatchStress.t.sol # (or merged into performance/)
CLOB_ORDERBOOK_PERFORMANCE_REPORT.md
```

The markdown report is the output artifact that makes this work for teams. Raw `forge test -vvv` output disappears. A committed markdown file with a table of gas numbers per implementation shows up in PRs, gets linked in architecture decisions, and lives in the repo as evidence of why you made the call you made.

One last thing: **pin your Foundry version in CI**. Gas numbers shift between Foundry releases — optimizer changes, IR improvements, EVM version bumps. If you're comparing numbers across time, you need deterministic tooling. `foundryup --version v1.7.0` in your CI workflow makes your watermarks reproducible.

---

### Final Thought

Unit tests prove correctness. Performance tests prove correctness *under the conditions that actually happen in production* — adversarial book depth, block gas limits, accounting drift across hundreds of operations.

The difference is subtle but it matters: a unit test passes on a clean book with two orders. A watermark test tells you when a deep book breaks your transaction. Those are not the same guarantee, and only one of them is the one an attacker will probe.

The benchmark, watermark, and stress patterns aren't exotic methodology. They're just the discipline of measuring gas the same way you measure correctness — with assertions, not optimism.

---

If you're building a protocol with any kind of loop whose iteration count is influenced by user behavior, I'd love to hear how you're handling it. Feel free to connect or message me — I'm always open to exchanging ideas and learning from other builders.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
