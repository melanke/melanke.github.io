# 07 — Testing Strategies

Lessons on how to test contracts: fuzz, invariant, performance benchmarks, replay, Gherkin, stress.

---

## [#1] Invariant tests from the start

**Source commits:** `429c7b1` Implement complete set mint/burn and add fzz tests and invariant tests
**Pattern:**
> `MarketInvariantHandler.t.sol` with handlers for all state mutations (buyOnPhase1, mintCompleteSet, burnCompleteSet, resolveMarket). Foundry runs fuzz + invariant in a loop.
> Main invariants:
> - `sum(pools) == totalPool`
> - `payoutPool ≤ totalPool + seedFund`
> - `sum(userBalance[outcome]) ≤ totalSupply(outcome)`
**Why it matters:** invariants catch edge cases humans don't think of. Fuzz with 1000+ runs finds adversarial inputs.
**How to apply:** for each accounting aggregate, force invariant; codify handler covering each mutation.
**Skill seed:** "For contracts with accounting state, force invariant tests with handlers covering all mutations."

---

## [#2] Comparative performance benchmarks

**Source commits:** `0a1fffe` Create performance tests for CLOB; `f733c9a` Create different CLOB implementations, test and create a report
**Pattern:**
> `CLOBPerformance.t.sol` runs same trade sequence in 4 variants (Bitmap, LinkedList, Reference, RBTree). Generates `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md`. Data-driven decisions.
**Why it matters:** algorithms have real trade-offs (insert vs match vs size). Without benchmark, decision is a guess.
**How to apply:** gas-critical components → benchmark suite with identical scenarios.
**Skill seed:** "For gas-critical components with alternatives, suggest cross-implementation benchmark suite with markdown report."

---

## [#3] Replay tests against real oracle

**Source commits:** `47d9d7a` Add replay comparison test
**Pattern:**
> `ReplayComparison.t.sol` loads JSON snapshot of real trades (Polymarket); runs against local Market in Foundry; compares prices, fills, payouts.
> Tools/replay-pipeline with TypeScript scrapers generate the snapshots.
**Why it matters:** validates that implementation replicates reference system. Finds bugs unit tests don't catch (off-by-one in AMM, rounding).
**How to apply:** if system replicates another: real snapshot + comparison test.
**Skill seed:** "If system replicates known protocol, suggest pipeline: scrape snapshot → JSON → replay test → compare outputs."

---

## [#4] Stress tests for extreme conditions

**Source commits:** `066cfcd` Add Clob single buy match stress test
**Pattern:**
> `CLOBSingleBuyMatchStress.t.sol`: 500+ matches against ladder seeded. Measures gas, validates invariants, finds stack overflow.
**Why it matters:** edge cases of gas (1500 matches) and overflow bugs only appear at scale.
**How to apply:** for each operation that scales with input → stress test with large loops.
**Skill seed:** "Detect scalable operations and suggest stress test with large inputs to find gas/overflow issues."

---

## [#5] Gherkin headers in tests

**Source commits:** `843545a` Rename tests and add Gherkin headers
**Pattern:**
> Test names: `test_Given_marketInPhase1_When_buyWithZeroAmount_Then_reverts`. Comment header with:
> ```
> /// @dev Given: Market in Phase 1 state
> /// When: buyOnPhase1 called with zero amount
> /// Then: Reverts with ZeroTokenOutput
> ```
**Why it matters:** tests readable by non-devs; reduces ambiguity in expected behavior; documents intent.
**How to apply:** standardize naming + Gherkin header in every test file.
**Skill seed:** "Force Gherkin pattern (Given/When/Then) in test naming + headers."

---

## [#6] Hierarchical reorganization: base → unit → integration → fuzz

**Source commits:** `25e1c90` Reorganize unit tests and do audit prep
**Pattern:**
> ```
> test/
>   base/         # MarketTestBase fixture
>   unit/         # isolated unit tests
>   integration/  # end-to-end flows
>   fuzz/         # invariants
>   performance/  # benchmarks
> ```
**Why it matters:** organization eases test discovery; CI runs unit (fast) first, integration/fuzz on-demand.
**How to apply:** clear hierarchy from the start; one fixture per level.
**Skill seed:** "Organize tests in base/unit/integration/fuzz/performance hierarchy with fixtures per level."

---

## [#7] Reusable helpers (config builders)

**Source commits:** `d621059` (with helper `_zeroSeedFeeOrderBookSeedConfig()`)
**Pattern:**
> Builder helpers `_buildSeedConfig()`, `_buildOpenMarketConfig()`. Reduces duplication; eases variants.
**Why it matters:** test duplicates copy-paste bugs; helpers ensure consistency.
**How to apply:** repeated complex configs/states → helper builder.
**Skill seed:** "Detect test duplicates of config setup and propose helper builders."

---

## [#8] Reentrant mock to test guards

**Source commits:** `968951a` Add nonReentrant on processFinalizationBatch (with `ReentrantOrderBookMock`)
**Pattern:**
> `ReentrantOrderBookMock.sol` in test fixture: orderbook callback tries to re-enter Market. Test verifies `nonReentrant` reverts.
**Why it matters:** untested reentrancy guards = security theater. Mock confirms effectiveness.
**How to apply:** every applied `nonReentrant` has test with mock attempting reentry.
**Skill seed:** "For each `nonReentrant`, require reentrant mock + test confirming revert."

---

## [#9] Coverage with lcov + report

**Source commits:** Implicit (presence of `lcov.info`)
**Pattern:**
> `forge coverage --report lcov` generates `lcov.info`. CI validates threshold.
**Why it matters:** ensures branches are exercised; coverage gaps indicate dead code or missing tests.
**How to apply:** integrate coverage into CI; minimum threshold on main.
**Skill seed:** "Configure coverage check in CI with branch coverage threshold."

---

## [#10] Separate vault interaction tests

**Source commits:** `0add8ca` Add vault interaction tests
**Pattern:**
> `Market.vaultInteractions.t.sol`: vault.deposit via market, claim yield, edge cases (vault = address(0), vault paused, vault revert).
**Why it matters:** external integration is bug zone; mock external tests scenarios real vault doesn't easily allow.
**How to apply:** each external dependency has dedicated fixture with failure scenarios.
**Skill seed:** "For each external dependency, require fixture with happy path + failure scenario tests."

---

## [#11] Lens vs Market parity tests

**Source commits:** `0315928` Match Lens implied odds with Market
**Pattern:**
> For each Lens-derived view that reproduces main contract logic: test comparing `lens.getX(input)` with `market.computeX(input)` side-by-side.
**Why it matters:** discrepancy = arbitrage or frontend shows wrong price.
**How to apply:** Lens tests always include parity check with source-of-truth.
**Skill seed:** "For Lens derived views, require parity test against source-of-truth contract."

---

## [#12] Test seeds: golden inputs as constants

**Source commits:** `3199e09` Do a cleanup on tests regarding lint and magic numbers
**Pattern:**
> `BPS_DENOMINATOR`, `RESOLUTION_DELAY`, `DEFAULT_SEED_FUND` as constants in test base. Magic numbers eliminated.
**Why it matters:** readable tests; changes propagate (change const, all tests use new value).
**How to apply:** cleanup pass: extract magic numbers to named constants.
**Skill seed:** "Audit tests for magic numbers; suggest extraction to named constants."

---

## [#13] Foundry pin + regular reformat

**Source commits:** `cdb581b` Pin foundry to v1.7.0 in CI and reformat with new fmt rules
**Pattern:**
> `.github/workflows/test.yml`: `foundryup --version v1.7.0`. Specific pin; format check before tests.
**Why it matters:** Foundry updates may change gas, semantics. Pin = deterministic CI.
**How to apply:** always pin Foundry version in CI; document version in foundry.toml.
**Skill seed:** "Pin Foundry version in CI; configure format check before tests."

---

## [#14] Forge fmt config aligned with style guide

**Source commits:** `41d85de` Format code; `cdb581b`
**Pattern:**
> `foundry.toml`: `[fmt] line_length = 80, int_types = "long", number_underscore = "thousands"`. Aligned with Solidity community.
**Why it matters:** automatic formatter eliminates style debates; consistency reduces review bugs.
**How to apply:** `forge fmt` regularly; CI blocks non-formatted code.
**Skill seed:** "Configure forge fmt in CI as gating check."

---

## [#15] Audit prep: replicate prior issues

**Source commits:** `25e1c90` Reorganize unit tests and do audit prep
**Pattern:**
> Before audit: reorganize tests, extract helpers, force coverage, add Gherkin, scope `KNOWN_ISSUES.md`, INVARIANTS.md.
**Why it matters:** auditor finds issues faster in organized codebase; focus on business logic, not understanding layout.
**How to apply:** audit prep checklist: organize tests, fix Slither, document invariants, scope.md.
**Skill seed:** "Create audit prep checklist: organize tests, run slither, document invariants/scope/known-issues."

---

## [#16] E2E test covering all phases

**Source commits:** `836ba37` Include graduation, complete set and order book on the E2E tests
**Pattern:**
> Single E2E test covers: seed → buy phase 1 → graduation → CLOB orders → trades → resolve → claim → yield. Multi-user scenario.
**Why it matters:** E2E catches bugs between boundaries (Market ↔ CLOB ↔ OutcomeToken ↔ Vault). Unit tests don't cover.
**How to apply:** at least one E2E that walks through complete lifecycle with 3+ users.
**Skill seed:** "For lifecycle contracts, require at least one E2E walking through full path with multi-user."

---

## [#17] Per-tx gas-budget stress test for matching engines (binary-search watermark)

**Source commits:** `8c09ca8` Fix accounting problem for when user is buying from seeded liquidity on phase 2. Fix #6
**Category:** stress / gas-budget regression guard
**Pattern:**
> `test/stress/CLOBSingleBuyMatchStress.t.sol` measures the largest `N` such that a single `placeLimitBuy` can sweep `N` resting sells (all stacked at one price level → FIFO chain of N matches) before the subcall runs out of a fixed gas budget (`BENCHMARK_BLOCK_GAS = 30_000_000`, i.e. mainnet block target).
> Search shape: exponential probe (1, 2, 4, 8, …) until OOG, then binary-search between `pow/2` and `pow` to find the exact watermark. Each probe uses `vm.snapshotState` + `vm.revertToState` to reuse a clean book; the taker call is dispatched with `address(clob).call{gas: BENCHMARK_BLOCK_GAS}(data)` so success/failure is purely a gas verdict, not a logic verdict.
> Regression guard: `assertGe(maxN, MIN_ACCEPTABLE_MATCHES = 1400)`. Test self-skips under `forge coverage` because instrumentation distorts gas. The book is sized via market-seeded `placeLimitSell` (maker = market) so each fill exercises the realistic `onSeededAskFill` callback path, not a cheap pure-CLOB path.
**Why it matters:** matching engines have no explicit per-tx cap in the source (`grep MAX_MATCHES` ≡ ∅). The only thing standing between a deep one-sided book and a permanently-OOG taker is empirical gas headroom. Without a watermark test, an innocuous refactor that adds 5k gas per fill silently shrinks the safe match depth from ~1400 to ~700. A floor assertion turns "we hope it scales" into a CI-enforced invariant.
**How to apply:**
- Identify any function whose worst-case gas grows with attacker-controlled input (matching engines, batch processors, queue compaction, multi-hop routers).
- Pick the realistic block-gas budget for the target chain (30M for L1, 1B+ for L2 — be honest about target).
- Build a probe helper that places `n` rests at one price and dispatches the taker via `.call{gas: budget}` so the verdict is a clean bool.
- Use exponential-then-binary search; never linearly enumerate.
- Snapshot/revert between probes so the search is O(log N) probes × O(N) setup, not O(N²).
- Assert a `MIN_ACCEPTABLE_MATCHES` floor that gives e.g. 30–50% headroom over realistic adversarial book depth.
- Self-skip under coverage: gas is not meaningful with instrumentation.
- Exercise the realistic maker path (e.g. seeded liquidity hitting a callback) — not a synthetic shortcut — or the watermark lies.
**Skill seed:** "For any matching/loop function whose iteration count is attacker-controlled, generate a gas-budget stress test: exponential probe → binary search via `vm.snapshotState`/`revertToState`, dispatch the call with `gas: BLOCK_GAS_TARGET`, assert `assertGe(maxN, FLOOR)`, and self-skip under coverage."
