# 01 — Gas Optimization

Lessons on reducing runtime gas. Not to be confused with bytecode size reduction (see `02-runtime-size-optimization.md`).

---

## [#1] Replace manual getters with `public` state variables

**Source commits:** `ce63bf7` Replace getters by public state variables; `6d8e824` Replace getter usage with direct state variable reading
**Pattern:**
> Instead of writing `function getFoo() external view returns (uint) { return foo; }`, declare `uint public foo;`. The compiler generates the getter more cheaply and with less bytecode.
**Why it matters:** manual getters cost more gas and add bytecode. In loops and critical operations (CLOB seeding, resolution), these savings accumulate.
**How to apply:** always prefer `public` state vars over explicit getters, except when there's validation logic on access.
**Skill seed:** "Audit contracts for redundant manual getters; suggest converting them to `public` state vars when there's no extra logic."

---

## [#2] Local cache of variables read multiple times in the same transaction

**Source commits:** `1d6e593` Create a cached payoutPool; `6d8e824` Merge loops in _seedOrderBookLiquidity
**Pattern:**
> If a state variable is read 2+ times in the same function, copy to a local variable at the start. A repeated SLOAD costs 2100 gas (or 100 when warm); MLOAD costs 3.
**Why it matters:** functions like resolution, redemption and seed access `totalPool` several times. Caching reduces dozens of SLOADs.
**How to apply:** when reviewing functions, count SLOADs from the same slot — cache if ≥ 2.
**Skill seed:** "When reviewing a Solidity function, identify state vars read multiple times and propose local cache."

---

## [#3] Fuse loops with the same iterator

**Source commits:** `6d8e824` Merge loops in _seedOrderBookLiquidity
**Pattern:**
> If two operations iterate the same array with the same range, fuse into a single loop. Reduces increment/check overhead.
**Why it matters:** double-loop over arrays (outcomes × levels) is common in multi-outcome markets — savings scale.
**How to apply:** look for sequential loops over the same `for (uint i; i < N; ++i)`. Fuse when operations are independent or can be reordered.
**Skill seed:** "Detect adjacent loops with the same iteration range and propose fusion."

---

## [#4] `calldata` instead of `memory` for read-only parameters

**Source commits:** `07e4009` Use calldata for read-only market creation params
**Pattern:**
> In external functions, unmodified parameters should be `calldata`, not `memory`. Calldata avoids the ABI decode memcpy.
**Why it matters:** factories and validators that receive `string`, `bytes`, `struct[]` only for reading save hundreds of gas per call.
**How to apply:** in entrypoints that only read inputs (without modifying them), use `calldata`. If you need to modify, copy to `memory` locally.
**Skill seed:** "Audit signatures of external/public functions and identify read-only params that can be `calldata`."

---

## [#5] Cache external calls in batch (lens pattern)

**Source commits:** `d81f44f` Reduce MarketLens external calls by using cache and avoiding loops of OutcomeToken calls
**Pattern:**
> Instead of making N external calls in a loop (`token.totalSupply(i)` per outcome), aggregate into a cache structure at the start and iterate in memory.
**Why it matters:** external calls cost a minimum of 700 gas + warm/cold overhead. In complex views (lens), N×M calls add up.
**How to apply:** in lens/views that iterate externals, batch into a struct cache.
**Skill seed:** "In Lens contracts, identify external calls inside loops and propose pre-fetch into a struct cache."

---

## [#6] Constants via imported library (no getter)

**Source commits:** `df45bf6` Cap graduate caller reward, dedupe constants
**Pattern:**
> `constant` in an imported library (e.g., `MarketConstants.BPS_DENOMINATOR`) costs zero runtime and emits no getter. `public constant` in a contract generates a getter (~50 bytes + read overhead).
**Why it matters:** constants accessed frequently (BPS_DENOMINATOR) shouldn't become public getters.
**How to apply:** library `XConstants.sol` with `uint256 internal constant Y = ...`. Import and use directly.
**Skill seed:** "When creating shared constants in multi-contract systems, suggest a constants library instead of `public constant` in each contract."

---

## [#7] ERC6909 instead of N ERC20 deploys (multi-token)

**Source commits:** `e15aa228` Refactor OutcomeToken as ERC6909 to improve performance
**Pattern:**
> For protocols with N correlated tokens (outcomes, positions), use ERC6909 single-contract multi-token instead of N ERC20 clones. Mints/transfers ~30-50% cheaper; no clone overhead.
**Why it matters:** prediction markets with 2-6 outcomes deploying 1 OutcomeToken per market is huge waste. ERC6909 unifies.
**How to apply:** when outcomes/positions are fungible within a market but distinct between markets, ERC6909 with `tokenId = outcomeIndex` is the pattern.
**Skill seed:** "Detect multi-token systems using N ERC20 clones and suggest migration to ERC6909."

---

## [#8] Pre-compute final state before loops (avoid per-iteration recomputation)

**Source commits:** `41f85598` Fix mintCompleteSet cap calculation
**Pattern:**
> In multi-step state changes (mintCompleteSet iterates N outcomes), pre-calculate the total final state and pass it to each iteration, instead of recalculating incrementally.
**Why it matters:** beyond bug-fix, avoids SLOAD/computation in the loop hot path.
**How to apply:** when processing a batch that changes aggregates, compute `final = current + total_delta` before the loop and pass `final` to each check.
**Skill seed:** "In loops checking against an aggregate, identify if the final aggregate can be pre-computed before the loop."

---

## [#9] Reduce external calls with batched accessors (struct returns)

**Source commits:** `c51b32cb` Optimize the Market runtime size by set up foundry optmizer, change getters
**Pattern:**
> Instead of `getOpenTime()`, `getCloseTime()`, `getResolutionTime()` (3 calls), aggregate into `timing()` returning a struct/tuple. Caller makes 1 call.
**Why it matters:** benefits both runtime size (fewer selectors) and gas (fewer external calls).
**How to apply:** identify groups of getters that will always be called together; aggregate into a single struct-returning getter.
**Skill seed:** "Detect sequences of getters called together on the caller side and suggest aggregation into a struct-returning function."

---

## [#10] Foundry optimizer with `optimizer_runs = 1` when size is the bottleneck

**Source commits:** `c51b32cb`; `cdb581b` Pin foundry to v1.7.0 in CI
**Pattern:**
> Low `optimizer_runs` (1) optimizes for size. High (10000) optimizes for runtime gas. Choose based on the real bottleneck.
**Why it matters:** contracts close to EIP-170 need runs=1 (Market.sol). Contracts called millions of times need high runs.
**How to apply:** runs=1 for large implementations; high runs for reusable libraries called in loops.
**Skill seed:** "Recommend `optimizer_runs` value per contract based on the bottleneck (size vs hot-path gas)."

---

## [#11] `nonReentrant` before other modifiers

**Source commits:** `789659a` Move nonReentrant modifier before the others
**Pattern:**
> Canonical order: `nonReentrant` first, then auth (`onlyOwner`), then business modifiers. Guard runs before everything.
**Why it matters:** prevents reentrancy from bypassing checks via delegatecall or flash loans before the guard activates.
**How to apply:** standardize order in style guide; lint for ordering.
**Skill seed:** "Verify that `nonReentrant` is the first modifier in all mutating external functions."

---

## [#12] Burn instead of returning tokens (keep `totalSupply` as source of truth)

**Source commits:** `645bac0` Burn outcome tokens instead of sending back to the Market; `9840a64e` Burn outcome tokens at the source
**Pattern:**
> Tokens created by the protocol (seeded liquidity) that return after cancel should be **burned at source**, not returned to the parent contract.
**Why it matters:** prevents `balanceOf(market)` from distorting `totalSupply` in payout calculations. `totalSupply` becomes a clean source of truth.
**How to apply:** in CLOB/orderbook when refund involves the protocol, call `token.burn(...)` instead of transferring to the market.
**Skill seed:** "For protocol-emitted tokens, suggest burn-on-refund instead of returning them to avoid shadow supply."

---

## [#13] Exclude internal tokens from payout denominator

**Source commits:** `7002f55` Exclude market-held winning tokens from payout denominator; `41f85598`
**Pattern:**
> When the contract holds tokens (seeding/protocol-owned), `totalSupply` includes those tokens. Pay pro-rata over `supply - balanceOf(self)`.
**Why it matters:** without the adjustment, users receive an unfairly smaller fraction (pool divided by inflated supply).
**How to apply:** in any division by `totalSupply`, subtract `balanceOf(address(this), id)` first.
**Skill seed:** "Audit divisions by totalSupply in contracts that mint to themselves; suggest subtracting self-balance."

---

## [#14] Internal helpers for repeated state-access patterns

**Source commits:** `25557ef` Dedupe Market.sol via shared modifiers/helpers
**Pattern:**
> Patterns like `_outcomeBalanceOf()`, `_outcomeTotalSupply()`, `_externalOutcomeSupply()`, `_payTreasury()` extracted as `internal` helpers. Reduce duplication and centralize invariants.
**Why it matters:** dedup reduces bytecode AND ensures invariant changes (e.g., fee adjustment) propagate in one place.
**How to apply:** patterns appearing 3+ times become an internal helper.
**Skill seed:** "Detect repeated state-access patterns in large contracts and propose extraction into internal helpers."
