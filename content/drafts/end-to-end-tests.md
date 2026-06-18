---
social-post: |-
  🧠 Unit tests pass. The system still breaks — at the seam between Market, CLOB, and Vault.

  Building American Spend at 33Labs taught me that the most interesting bugs don't live in
  isolated functions. They live in component handoffs. In my latest article I walk through
  how I test across those seams — from lifecycle flows to real-world data to the UI itself.

  If you're building a prediction market, DEX, or any multi-phase contract system, this one
  is for you. 👇 Read the article below

  hashtag#SmartContracts hashtag#Solidity hashtag#DeFi hashtag#Testing hashtag#Foundry hashtag#Web3 hashtag#PredictionMarkets hashtag#BlockchainDevelopment
---
# Beyond Unit Tests: E2E, Replay, and UI Prototypes for Smart Contracts

Unit tests give you confidence at the function level. Invariant tests give you confidence at the accounting level. But neither tells you whether your contract actually works as a system — whether the handoff between phases holds under real data, whether the UX makes any sense, or whether your implementation actually matches the protocol you were inspired by.

Those gaps are where the interesting bugs live. Not in isolated functions, but in the seams between components — Market ↔ CLOB ↔ OutcomeToken ↔ Vault. Building American Spend at 33Labs, I found three layers that close those seams: **E2E tests**, **back-tests against real-world data**, and **UI prototypes**. What follows is when to build each, what each one actually catches, and where each one falls short.

---

### The Hierarchy That Makes E2E Possible

Before I could write meaningful E2E tests, I had to get the test organization right. I landed on a five-layer hierarchy:

```
test/
  base/          # shared fixtures — MarketTestBase, configs
  unit/          # isolated function tests
  integration/   # end-to-end lifecycle flows
  fuzz/          # invariant handlers
  performance/   # gas benchmarks
```

This matters more than it sounds. Without a real `base/` layer with reusable fixtures and config builders, your E2E test ends up being 400 lines of duplicated setup. The `_buildSeedConfig()` and `_buildOpenMarketConfig()` helpers I extracted meant that each test started from a known, named state — not from copy-pasted constructor calls with magic numbers.

CI runs `unit/` on every PR (fast — seconds). `integration/`, `fuzz/`, and `performance/` run on-demand or on main. You want that split from day one, not after the test suite is already an unsorted pile.

---

### What a Real E2E Test Looks Like

The E2E test I'm most proud of in the American Spend codebase covers the full market lifecycle in a single flow, with multiple users:

```solidity
function test_fullLifecycle_multiUser() public {
    // Phase 1 — seeded AMM
    vm.prank(alice);
    market.buyOnPhase1(YES, 100e6, minOut);

    vm.prank(bob);
    market.buyOnPhase1(NO, 50e6, minOut);

    // Graduation — AMM → CLOB
    market.graduate();

    // Phase 2 — order book trading
    vm.prank(alice);
    clob.placeLimitBuy(YES, 60e4, 200e6, 0);

    vm.prank(bob);
    clob.placeLimitSell(YES, 60e4, 150e6, 0);

    // Resolution + claim
    oracle.resolve(marketId, YES);
    vm.prank(alice);
    market.claimPayout(alice);

    // Yield claim
    vm.prank(alice);
    market.claimYield(alice);
}
```

This is roughly 50 lines. But it exercises `Market`, `CLOB`, `OutcomeToken`, and `Vault` in sequence — crossing the phase boundary where the bonding-curve AMM hands off to the order book, then through resolution and payout.

That graduation boundary is where bugs hid. During development, the CLOB was written to assume certain invariants from the Market that the Market only guaranteed in Phase 2. Unit tests on the CLOB never caught that, because they started from an already-graduated state. The E2E test crossed the boundary and exposed it.

**Key trade-off:** E2E tests are slow, fragile at the edges, and hard to debug when they fail. When a 50-step test fails at step 38, you need good error messages and the discipline to bisect. I use Gherkin headers — `/// @dev Given: market in Phase 1 / When: graduation / Then: CLOB has correct seed liquidity` — on every test so the intent is readable when something breaks.

---

### Lens Parity: The Second Class of E2E Bug

American Spend has a companion **Lens** contract — a read-only view layer that the frontend calls for prices, odds, and positions. I wrote it as a gas-free computation layer so the main contract didn't need to expose derived views.

The problem: if the Lens computes implied odds differently from the Market's own logic, the frontend shows the wrong price. No funds at risk — but users see stale or incorrect data, which in a prediction market is effectively as bad.

My rule: every Lens function that reproduces Market logic needs a parity test.

```solidity
function test_lensOdds_matchesMarketComputation() public {
    _seedAndBuy(YES, 500e6);

    uint256 lensOdds = lens.getImpliedOdds(marketId, YES);
    uint256 marketOdds = market.computeImpliedOdds(YES);

    assertEq(lensOdds, marketOdds, "Lens/Market odds mismatch");
}
```

Simple. Mechanical. Caught a discrepancy introduced when I refactored the odds computation into a library and updated one side but not the other. Without the parity test, that bug would have shipped to production and been discovered when the frontend showed the wrong price during a live market.

**Key trade-off:** parity tests create coupling between Lens and Market internals. When you refactor the computation, both need to stay in sync. That's acceptable — the coupling already exists in production, the test just makes it visible.

---

### Back-Testing Against Real Protocol Data

American Spend's AMM in Phase 1 is mechanically inspired by how similar prediction markets work. That means I could validate our implementation not just against synthetic inputs, but against **real trade history** from a comparable live protocol — Polymarket.

The setup: a TypeScript scraper in `tools/replay-pipeline/` fetches a snapshot of real trades — market IDs, amounts, timestamps, outcomes — and serializes them to JSON. A Foundry test hydrates that JSON and replays each trade against our local `Market` contract, then compares prices, fill amounts, and final payouts.

```solidity
function test_replay_polymarketSnapshot() public {
    SeededBookSnapshot memory snap = jsonLib.load("snapshots/market-42.json");

    for (uint i = 0; i < snap.trades.length; i++) {
        Trade memory t = snap.trades[i];
        uint256 out = market.buyOnPhase1(t.outcome, t.amount, 0);
        assertApproxEqRel(out, t.expectedOut, 1e15); // 0.1% tolerance
    }

    assertApproxEqRel(
        market.getImpliedOdds(YES),
        snap.finalOdds,
        1e15
    );
}
```

This test caught an off-by-one in how we normalized fee percentages before applying them to the AMM formula. Unit tests with synthetic inputs didn't expose it because the deviation was small enough that hand-crafted test values happened to be on the right side. Real-world amounts hit the edge case.

**Key trade-off:** back-testing is only useful when there's a real reference to compare against. If you're building something genuinely novel, there's no oracle — you're back to invariants and unit tests. And the scraper needs maintenance: if the reference protocol changes its API or data format, your snapshot pipeline breaks. I treat the snapshots as pinned artifacts, not live feeds.

---

### The Continuous Replay Script

Between the frozen snapshots of the back-test and full production, there's a gap: RPC issues, race conditions, indexer drift, and frontend integration bugs. Unit tests don't cover these. Fuzz tests don't either.

My solution was a TypeScript script that runs **continuously on testnet** — creating markets, placing trades, and resolving in an infinite loop. Not a test, not a benchmark. A live stress test against the full stack.

```typescript
async function replayLoop(market: MarketContract) {
  while (true) {
    const id = await market.create(randomConfig());
    await market.buy(id, YES, randomAmount());
    await market.buy(id, NO, randomAmount());
    await triggerGraduation(id);           // calls graduate bot
    await market.placeLimitBuy(id, ...);
    await market.resolve(id, randomOutcome());
    await market.claimPayout(id, signer.address);
    await sleep(CYCLE_DELAY_MS);
  }
}
```

This caught things no isolated test would: the indexer dropping events when the RPC rate-limited us mid-block, a subtle race condition between market resolution and the frontend fetching positions, and a case where the graduation bot submitted a transaction just as a large buy was being mined — the market graduated in a state the CLOB didn't expect.

**Key trade-off:** continuous replay requires a testnet with real RPC, a running indexer, and a bot to drive lifecycle transitions. It's not a "run `forge test`" situation — it's infrastructure. I wouldn't build this before the protocol is mostly stable. It's a pre-production hardening step, not a development tool.

---

### The UI Prototype That Found a UX Bug

The most unexpected source of bugs was a minimal React prototype I built before the final audit — not production UI, just enough to walk through the full lifecycle: create market → buy Phase 1 → graduate → CLOB orders → resolve → claim.

The specific bug it found: in American Spend, slippage for the Phase 1 AMM is specified as a **minimum output amount**, not a maximum slippage percentage. That's the mechanically correct design — you say "I want at least X tokens for this collateral." But the prototype revealed that the UX model users expect is the inverse: you specify how much you're willing to lose, not how much you require.

This wasn't a logic bug. The contract was correct. But it would have caused user confusion in production — and that confusion tends to manifest as failed transactions, negative reviews, and support load. Catching it pre-audit via the prototype meant we could redesign the UX before launch instead of after.

> A UX bug caught in a prototype costs an hour. The same bug caught post-launch costs weeks.

**Key trade-off:** building even a minimal UI prototype takes time — maybe two to three days. And it only finds semantic and ergonomic bugs, not accounting bugs. If you're on a tight timeline, this is the first thing that gets cut. My view: don't cut it. Cut some of the fuzz scenarios instead. The prototype surfaces a class of bugs that nothing else does.

---

### Putting It Together: When to Build Each Layer

| Layer | When to build | What it catches |
|---|---|---|
| Unit tests | From day one | Logic errors in isolation |
| Invariant + fuzz | From day one | Adversarial accounting edge cases |
| E2E (synthetic) | Once components connect | Cross-boundary bugs, phase transitions |
| Lens parity tests | When Lens exists | View/source-of-truth drift |
| Back-test + replay | Mid-development | Off-by-one vs real protocol data |
| Continuous testnet replay | Pre-production | RPC, indexer, race conditions |
| UI prototype | Pre-audit | UX/semantic bugs |

None of these replace the others. The E2E test caught the graduation boundary bug. The back-test caught the fee normalization error. The UI prototype caught the slippage semantics. No single layer would have found all three — because each covers a class of failure that the others are blind to.

---

### Final Thought

Each of these layers has a real cost. E2E tests are slow. Replay pipelines need maintenance. UI prototypes take days. But the bugs they catch are exactly the ones that slip through everything else — they live in component handoffs, in real-world data edge cases, and in the gap between what your contract does and what a user expects it to do.

Build the hierarchy early, add back-testing when you have a real reference, and prototype the UI before you audit. The protocol you ship will be meaningfully different from the one you would have shipped without them — and the difference will matter when it's in production.

---

If you're building a prediction market protocol, a DEX, or any contract system with multi-phase lifecycle logic, I'd love to hear how you approach integration testing. Feel free to connect or message me — I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
