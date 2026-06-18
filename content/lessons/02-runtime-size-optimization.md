# 02 — Runtime Size Optimization (EIP-170)

EIP-170 limits runtime bytecode to 24576 bytes. Lessons on how to stay below that limit in large contracts.

---

## [#1] Lens pattern: move view methods to a separate contract

**Source commits:** `0ffe023` Move Market.sol's view methods to the new MarketLens.sol; `0b3aaf93` Move read methods from Market to MarketLens
**Pattern:**
> View functions (getImpliedOdds, getUserTrades, calculatePotentialPayout, etc.) consume runtime bytecode without adding essential functionality. Move to `XLens.sol` with `IMarketLens` interface, deploy separately, connect via factory.
**Why it matters:** reduced Market.sol by ~158 lines; allows isolated test coverage; lens can be upgraded/redeployed without touching the main contract.
**How to apply:** if a contract exceeds 20KB, top candidate to move are views/read helpers. Pattern: `MarketLens(address market)` constructor, lens reads via interface.
**Skill seed:** "For contracts close to EIP-170, suggest splitting into `XLens.sol` with all derived views."

---

## [#2] External library for reusable math/logic

**Source commits:** `f1112b2` Reduce Market contract size by moving logic to MarketMath and deduping code
**Pattern:**
> `pure` functions (fee, rake, payout calculations) become `library MarketMath { function ...(...) internal pure }`. `using MarketMath for ...` in the contract.
**Why it matters:** ~1.6KB savings observed. Pure logic is testable in isolation.
**How to apply:** anything that's `pure` or `view` without state next-step → library. Use `internal` to inline; `external` to delegate.
**Skill seed:** "Identify `pure` or state-readonly functions in large contracts and propose extraction to library."

---

## [#3] Consolidate similar errors into one error with context

**Source commits:** `0b3d8ca` Consolidate errors to reduce Market contract size; `cf1c2e7`
**Pattern:**
> Errors like `OpenMustBeBeforeClose` + `CloseMustBeLteResolution` → `InvalidTradingWindow`. `NoPayout` + `NoYieldToClaim` → `NothingToClaim`. Each error costs ~20-30 bytes in the selector table.
**Why it matters:** 18 errors consolidated to 6 = ~360 bytes. In contracts with 50+ errors, savings scale.
**How to apply:** errors covering a single semantic category (e.g., "claim impossible") can be merged. Don't consolidate errors that callers want to distinguish programmatically.
**Skill seed:** "Audit error enums and propose semantic consolidation to reduce bytecode."

---

## [#4] Move validations to Factory (before clone deploy)

**Source commits:** `21bb5ec` Move validation of createMarket from Market to MarketFactory; `a2a136ee` Add validations on MarketFactory
**Pattern:**
> In Factory + Clones architecture, input validations (timing window, outcome count, fee bps) live in the Factory. Clones assume valid inputs.
**Why it matters:** clones don't need to carry validation logic in runtime bytecode — saves hundreds of lines per clone.
**How to apply:** Factory validates → creates → initializes clone. Clone has minimal `initialize()`.
**Skill seed:** "In factory + clone architectures, audit duplicated validations in the clone and move to factory."

---

## [#5] Remove upgradability when not needed

**Source commits:** `53ab45b` Remove upgreadability from Market contract
**Pattern:**
> UUPS adds ~200-300 bytes (proxy slot logic, _authorizeUpgrade). Distinguish "protocol upgrade" (factory, settings) from "instance upgrade" (each market is an immutable game).
**Why it matters:** immutable instances are also more auditable and secure.
**How to apply:** only make upgradeable what has clear motivation (factory that registers new implementations). Markets/instances rarely need it.
**Skill seed:** "Evaluate if each upgradeable contract really needs to be upgradeable; remove UUPS from instances."

---

## [#6] Delete alternative implementations after benchmarking

**Source commits:** `40184ef` Remove obsolete CLOB implementations
**Pattern:**
> During exploration, code N alternatives (CLOBBitmap, CLOBLinkedList, CLOBReference). After choosing RBTree, delete ~3489 lines of dead code + tests.
**Why it matters:** dead code increases deploy size, accumulates technical debt, confuses new devs.
**How to apply:** workflow A/B → benchmark → choose → delete losers in dedicated commit with clear message. Don't keep "just in case".
**Skill seed:** "After choosing one implementation among alternatives, suggest a dedicated commit deleting the alternatives."

---

## [#7] Foundry optimizer + `optimizer_runs = 1`

**Source commits:** `c51b32cb` Optimize the Market runtime size by set up foundry optmizer
**Pattern:**
> `foundry.toml`: `optimizer = true`, `optimizer_runs = 1`. Optimizes for bytecode size instead of runtime gas.
**Why it matters:** contracts with size limit as bottleneck need this. Trade-off: hot path gets slightly more expensive.
**How to apply:** runs=1 for Market.sol-like large contracts; high runs for Math libraries called in loops.
**Skill seed:** "Recommend `optimizer_runs` per contract based on the bottleneck (size vs runtime gas)."

---

## [#8] Interfaces as separate files

**Source commits:** `2fc7518` Use interfaces
**Pattern:**
> `src/interfaces/IMarket.sol`, `IMarketFactory.sol`, etc. Implementations import and `is IFoo`. Allows mocking, multi-inheritance, and physical split.
**Why it matters:** interfaces stay stable while implementation changes; clearly documents external contract.
**How to apply:** always define interface before implementation for reused components; reduces circular dependency.
**Skill seed:** "Force interface/implementation separation for all externally referenced contracts."

---

## [#9] Constants via shared library (not `public constant` in each contract)

**Source commits:** `df45bf6` Cap graduate caller reward, dedupe constants
**Pattern:**
> `library MarketConstants { uint16 internal constant BPS_DENOMINATOR = 10000; ... }`. Each contract imports directly, no public getter.
**Why it matters:** prevents drift between contracts (all use the same source) and reduces bytecode (no duplicated getters).
**How to apply:** constants shared by 2+ contracts become a library. Never duplicate.
**Skill seed:** "Detect duplicated constants between related contracts and propose shared library."

---

## [#10] Shared modifiers for repeated checks

**Source commits:** `25557ef` Dedupe Market.sol via shared modifiers/helpers
**Pattern:**
> `onlyNotFinalized`, `onlyValidOutcome` etc. group checks like `if (resolved || cancelled) revert;`. Used across N functions.
**Why it matters:** dedup = smaller bytecode (compiler inlines but still saves); one place to fix bugs.
**How to apply:** check pattern repeated 3+ times → modifier.
**Skill seed:** "Detect repeated check patterns in large contracts and extract to modifier."

---

## [#11] Move non-critical methods to auxiliary libraries

**Source commits:** `40184ef` Move seed ladder methods to CLOB to free space on Market
**Pattern:**
> Domain logic that belongs more to a sub-component (seeding belongs to CLOB, not Market). Moving frees space in the main contract.
**Why it matters:** correct domain organization + size savings.
**How to apply:** if function X is more about component Y than the main component, change its home.
**Skill seed:** "Audit function ownership: 'does this belong here or in the sub-component?'"

---

## [#12] General pattern: tactic list in order of application

**Consolidated strategy:**
1. `optimizer_runs = 1` in foundry.toml
2. Lens for all public views
3. Math/Pure logic in libraries
4. Validations in factory (not in clone)
5. Constants in shared libraries
6. Errors consolidated semantically
7. Modifiers/helpers for dedup
8. Remove upgradability if not needed
9. Delete alternative implementations
10. Move methods to sub-components of correct domain

**Why it matters:** order matters — starting with #1-#4 yields big gains without restructuring; #5-#10 attacks dedup and organization.
**Skill seed:** "Create a bytecode reduction workflow that applies tactics in ROI order: optimizer → lens → libraries → factory validations → constants → errors → modifiers → upgradability → dead code → reorg."
