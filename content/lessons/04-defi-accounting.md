# 04 — DeFi Accounting Patterns

Lessons on accounting in prediction markets with vault yield, CLOB and seeded liquidity.

---

## [#1] Symmetric mint/burn with double-entry accounting

**Source commits:** `d621059` Fix totalPool accounting
**Pattern:**
> `mintCompleteSet(amount)` does `pools[i] += amount; totalPool += amount` for each outcome. `burnCompleteSet` debits symmetrically. Invariant: `sum(pools) == totalPool`.
**Why it matters:** symmetry is testable (invariant fuzz). Asymmetry bugs cause drift that accumulates and drains funds.
**How to apply:** every multi-mutation operation has explicit inverse; codify the invariant and test with fuzz.
**Skill seed:** "For state that changes in multiple dimensions (pools, totalPool), force a sum invariant and fuzz test."

---

## [#2] Cached payoutPool

**Source commits:** `1d6e593` Create a cached payoutPool
**Pattern:**
> After resolution, snapshot `payoutPool = totalPool + seedFund - paidYield - rake` is recorded once. `redeem()` reads this cache, not recomputes.
**Why it matters:** payoutPool is used in multiple redeems; recomputing violates idempotency (state changes during claims) and costs SLOADs.
**How to apply:** values derived from post-finalization state → snapshot once at finalization moment.
**Skill seed:** "After terminal state transitions, identify derived values that will be read by multiple users and snapshot them."

---

## [#3] Vault loss waterfall (seed-first absorption)

**Source commits:** `af8044d` Apply seed-first loss absorption when the vault has taken a loss
**Pattern:**
> `_applyVaultLossWaterfall()`:
> 1. `expectedAssets = totalPool + seedFund`
> 2. If `redeemedAssets < expected`, there's a loss
> 3. Consume `seedFund` first
> 4. Haircut `pools[]` proportionally to cover the rest
> 5. `Math.min` to avoid underflow
> Emits `VaultLossAbsorbed(expected, redeemed, seedLoss, poolLoss)` event.
**Why it matters:** structured loss absorption protects yield LPs (seed) first; haircuts speculators (pools) after. Without waterfall, losses distribute chaotically.
**How to apply:** every vault-backed pool should have declared waterfall: tier 1 (seed/insurance), tier 2 (user pools).
**Skill seed:** "For vault-backed pools, require multi-tier loss absorption waterfall with detailed event."

---

## [#4] Tracking seeded liquidity refunds via callback

**Source commits:** `cf1c2e7` Fix accounting problem when cancelling seeded orders; `d4f57cac`; `f2058c87` Fix accounting problem for when user is buying from seeded liquidity on phase 2
**Pattern:**
> When market is maker (seeded), special treatment:
> - `_makerRebate(maker, ...)`: returns 0 if `maker == market` (seeded gets no rebate)
> - `cancelOrdersRange()` returns `refundedToMarket` (collateral only, not tokens)
> - Market accumulates in `pendingSeedPoolInflow`
> - Callback `onSeededAskFill(outcome, notional)` when match consumes seeded ask: market does `pools[outcome] += notional; totalPool += notional`
**Why it matters:** seeded is protocol-owned capital, not user. Mixing accounting = lost funds or over-payout.
**How to apply:** identify special participants by address; treat them with distinct accounting rules; use callbacks to sync when orderbook fills with the market.
**Skill seed:** "In systems with protocol-as-maker, audit all match/refund/rebate paths for special-case treatment via callback."

---

## [#5] Aggregate yield cap (not per-user)

**Source commits:** `e0985b6a` Cap aggregate yield claims at realized vault surplus (Fix #17); `66fc5de` (re-application)
**Pattern:**
> ```
> aggregateSurplus = max(0, vaultSnapshot - totalPrincipal)
> userYield = (aggregateSurplus * userShares) / totalShares
> ```
> DO NOT use `userAssets - userPrincipal` per-user (can be positive individually even with aggregate loss).
**Why it matters:** sliced yield per-user can be positive in an aggregate loss → drains payoutPool, harms winners.
**How to apply:** clamp at aggregate before distributing. Principle: `sum(userYields) ≤ aggregateSurplus`.
**Skill seed:** "Detect per-user yield/profit distribution that doesn't respect aggregate cap; suggest clamping at total surplus."

---

## [#6] Exclude internal tokens from payout denominator

**Source commits:** `7002f55` Exclude market-held winning tokens from payout denominator; `41f85598` Fix mintCompleteSet cap calculation
**Pattern:**
> Instead of `totalSupply(outcomeId)`, use `totalSupply(outcomeId) - balanceOf(market, outcomeId)`. Tokens held by the protocol (seeding) shouldn't enter the denominator.
**Why it matters:** without adjustment, users receive an unfairly smaller fraction (denominator inflated by "phantom" protocol tokens).
**How to apply:** any division by `totalSupply` in a contract that mints to itself must subtract `self-balance`.
**Skill seed:** "Audit divisions by totalSupply in systems with protocol-owned positions; subtract self-balance."

---

## [#7] Burn-on-refund for protocol-emitted tokens

**Source commits:** `645bac0` Burn outcome tokens instead of sending back to the Market; `9840a64e` Burn outcome tokens at the source (Fix #24)
**Pattern:**
> When CLOB cancels a seeded ask order: instead of transferring tokens to the Market, call `OutcomeToken.burn(outcomeId, amount)` directly. Tokens don't return to the protocol "in hold".
**Why it matters:** prevents shadow supply (tokens in market while totalSupply still counts them). Keeps `totalSupply` clean as source of truth.
**How to apply:** for tokens minted by the protocol, refund = burn (not transfer).
**Skill seed:** "For protocol-emitted tokens, suggest burn-on-refund instead of returning to the parent contract."

---

## [#8] Pre-compute final aggregate before per-iteration checks

**Source commits:** `41f85598` Fix mintCompleteSet cap calculation
**Pattern:**
> `mintCompleteSet(amount)`: pre-calculate `totalPoolAfter = totalPool + amount` ONCE; pass to each outcome iteration cap check. Don't calculate incrementally per-outcome.
**Why it matters:** if calculated per-iteration, last outcome compares against pool without previous outcomes → smaller cap than it should be.
**How to apply:** in multi-step state changes, pre-compute final state and use as reference at each step.
**Skill seed:** "In loops checking against an aggregate, identify if final aggregate can be pre-computed."

---

## [#9] Tiered fee based on pool size

**Source commits:** `90d45fc` Add impliedPrice mechanism and tiered fee on buyOnPhase1
**Pattern:**
> `seedFeeTierStarts = [0, 1000, 5000]`, `seedFeeBpsPerTier = [0, 100, 1000]`. Fee = tier where `totalPool` falls. Early seeders (tier 0) = 0%; late entrants (tier 2) = 10%.
**Why it matters:** allocates risks: early bears risk, late pays for convenience. Immunizes minnow vs whale.
**How to apply:** Phase 1 / bootstrapping mechanisms benefit from tiered fees. Document the table.
**Skill seed:** "In bootstrap phases, suggest tiered fees by pool size to incentivize early liquidity."

---

## [#10] Implied odds with clamp and edge cases

**Source commits:** `90d45fc`; `9d99a23` Fix calculatePayout and calculatePotentialPayout on an edge-case; `0315928` Match Lens implied odds with Market
**Pattern:**
> `impliedOdds = (pool[outcome] * BPS) / totalPool`, with floor of 1 bps in empty pools. Clamp to avoid div-by-zero. Lens must replicate EXACT logic of Market (same floors, same roundings).
**Why it matters:** discrepancy between lens and market = arbitrage or frontend shows wrong price. Edge case of empty pool (zero) needs explicit floor.
**How to apply:** always test lens vs market side-by-side with the same inputs.
**Skill seed:** "For any derived view (lens) that reproduces logic from another contract, require parity test with same inputs."

---

## [#11] Snapshot post-resolution state for idempotency

**Source commits:** `9d99a23` Bring back resolutionTime; `1d6e593` Cached payoutPool
**Pattern:**
> On resolution, record snapshots: `actualResolutionTime`, `payoutPool`, `correctOutcomeTotalSupply` (excluding self). Post-resolution reads read snapshots, not live state.
**Why it matters:** redeem makes claims in random order; live state changes with each claim and breaks fairness if calculation recomputes.
**How to apply:** terminal transitions always snapshot everything that will be used in distribution.
**Skill seed:** "In market finalization, identify all reads multiple users will make and snapshot once."

---

## [#12] Sentinel value for correctOutcome (uint8 max)

**Source commits:** `c0f4d585` initialize correctOutcome with max value as sentinel
**Pattern:**
> `correctOutcome` initialized with `type(uint8).max`. Resolution sets to 0..N-1. Check `correctOutcome != type(uint8).max` instead of `resolved == true`.
**Why it matters:** zero is valid outcome (Yes in binary market). Sentinel different from zero avoids ambiguity.
**How to apply:** always choose sentinel outside the valid range. For uint, max value; for enum, dedicated UNINITIALIZED.
**Skill seed:** "Audit zero use as 'unset': if zero is valid value, suggest sentinel outside the range."

---

## [#13] Treasury setter propagated to sub-contracts

**Source commits:** `b961c09` Add a method to change the treasury address; `7af690d` Prepagate the setTreasury to the CLOBs
**Pattern:**
> `setTreasury(newTreasury)` on Market iterates through all CLOBs and calls `setTreasury()` on each. Syncs rake recipients.
**Why it matters:** if Market and CLOBs diverge in treasury, rake goes to wrong address. Inconsistency = lost revenue.
**How to apply:** critical state shared between parent contract and dependents must have a setter that propagates.
**Skill seed:** "For state shared between parent and child contracts, audit setters: must propagate to all children."

---

## [#14] `pendingSeedPoolInflow` to accumulate refunds before reconciling

**Source commits:** `cf1c2e7`; `d4f57cac`
**Pattern:**
> Refunds from CLOB to Market (collateral only) accumulate in `pendingSeedPoolInflow`. On finalization, the aggregate is added to `totalPool` before payoutPool snapshot.
**Why it matters:** refunds arrive in batches during finalization (async); immediate reconciliation messes up intermediate invariants.
**How to apply:** asynchronous refund flows need a separate buffer, reconciled in the terminal transition.
**Skill seed:** "For asynchronous refund flows, suggest pending bucket reconciled at terminal transition."

---

## [#15] Zero maker rebate for protocol-as-maker

**Source commits:** `d4f57cac` (part of Fix #16, #19)
**Pattern:**
> `function _makerRebate(maker, notional, rebateBps) returns (uint)`. If `maker == market`, returns 0. Other makers receive normal rebate.
**Why it matters:** seeded liquidity shouldn't receive rebate (rebate is protocol-to-protocol, drains revenue).
**How to apply:** calculation functions that distinguish participants must do explicit check.
**Skill seed:** "In systems with protocol-owned positions, audit incentive calculations (rebate, fee, reward) for special-case of the protocol."

---

## [#16] Idempotency in redeem via flag (not via zero value)

**Source commits:** `a5fccdf9` Track vault finalization with a flag (Fix #18); `9b101bf` (re-application)
**Pattern:**
> `vaultAccountingFinalized: bool` separate from snapshots. Redeem is idempotent because of explicit flag; snapshots can be legitimately zero (total loss).
**Why it matters:** trusting "value != 0" as sentinel fails in legitimate cases where zero is the result.
**How to apply:** every one-shot has explicit flag.
**Skill seed:** "Audit zero-check based idempotency; replace with explicit flag when zero is a legitimate value."

---

## [#17] Gate payout reads on finalization flag

**Source commits:** `636d0012` Defer vault settlement on lifecycle revert (Fix #20)
**Pattern:**
> `calculatePayout()` returns 0 if `!vaultAccountingFinalized`. Frontend shows "settlement pending", not optimistic payout the contract can't deliver.
**Why it matters:** views reading pre-reconciliation state can show values the contract can't pay; UI deceives user.
**How to apply:** views derived from post-finalization should gate on completion flag.
**Skill seed:** "Audit views: if they depend on potentially pre-reconciliation state, gate on finalization flag."

---

## [#18] Expose granular sub-state flags in Lens

**Source commits:** `636d0012` (part of the same fix)
**Pattern:**
> Add `vaultAccountingFinalized` to IMarket and MarketLens interface. Frontends/bots can distinguish "resolved (yes) but settlement pending" from "fully settled".
**Why it matters:** clients need to know which transition to execute (e.g., call settleVault).
**How to apply:** multi-stage state machines expose granular flags via lens.
**Skill seed:** "For multi-stage state machines, expose sub-state flags granularly via Lens (not just top-level state)."

---

## [#19] Enforce `minOrderSize × minTick ≥ BPS` at the factory

**Source commits:** `b454d48` Cap seed ladder levels-per-side and enforce min order notional at factory; `b35594d` Validate seed fund covers ladder minOrderSize at market creation
**Category:** Min-notional invariant / fixed-point sizing
**Pattern:**
> CLOB notional uses `(amount * priceBps) / BPS_DENOMINATOR` (floors). If the smallest legal order at the smallest legal price floors to zero, every match at the bottom of the book can produce `notional == 0`. Factory `_validateOrderBookSeedConfig` reverts `InvalidOrderBookConfig` when `uint256(minOrderSize) * minTick < BPS_DENOMINATOR` — i.e., the cheapest legal trade must produce at least 1 wei of collateral.
**Why it matters:** a `notional == 0` match at runtime either silently transfers tokens for free (pre-audit) or reverts and bricks the FIFO head (post-audit). The cleanest fix is to make the bad input set unreachable: enforce the floor at deployment and refuse to instantiate the market otherwise.
**How to apply:** any product of (size, price/rate) divided by a bps/ray scalar must have its **minimum-input pair** ≥ scalar. Validate at the construction boundary, not inside hot paths. Same idea applies to lending interest accrual at minimum-debt × minimum-rate, AMM swap-in × tick-spacing, vault deposit × share-rate.
**Skill seed:** "Wherever a `(size * rate) / SCALE` floors, audit the smallest legal `(size, rate)` pair: if that product < SCALE, demand a constructor-time invariant that rejects the config."

---

## [#20] "No active dust" invariant: every active order ≥ minOrderSize at all entry/exit points

**Source commits:** `63e9ac8` Fix mid-fill dust poison pill in CLOB; add CLOB invariants; polish events/NatSpec.; `b6911a3` Dust cancellation for the sender
**Category:** Symmetric dust handling
**Pattern:**
> `CLOBInvariants.invariant_clob_noActiveDust` asserts: for every order with `active == true && remaining > 0`, `remaining >= minOrderSize`. To uphold it, three entry points zero out the dust: (a) **placement** in `placeLimitBuy`/`placeLimitSell` — if unfilled remainder `< minOrderSize`, refund/return it and skip resting; (b) **mid-fill** via `_cleanupBuyMakerDust`/`_cleanupSellMakerDust` — if a maker partial-fill drops `remaining < minOrderSize`, wipe in-book state, refund collateral or burn/return outcome tokens (burn when maker is `Market`), emit `MakerOrderDustCleaned`; (c) **cancel** clears any remainder regardless of size. Buy-side dust burn vs transfer is asymmetric to match the burn-on-fill semantics for protocol-owned (Market) liquidity.
**Why it matters:** allowing `0 < remaining < minOrderSize` to persist creates an order that *cannot legally match* (next match would compute `notional == 0`). It poisons FIFO heads, skews `getOrderBook` snapshots, and inflates escrow accounting. The invariant lets fuzzing prove the property mechanically.
**How to apply:** for any state field that has a documented lower bound (`>= MIN`), enumerate **every code path** that can transition it (placement, partial mutation, external operations, recovery) and either (i) prevent the transition or (ii) collapse the post-state back inside the bound. State a positive invariant (`active ⇒ x >= MIN`) and fuzz it; do not rely on per-call defensive checks alone.
**Skill seed:** "For any field with a stated lower bound on active state, list every transition site; require each to either gate or collapse-back-to-bound; encode as a fuzz invariant."
