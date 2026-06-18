# 11 — Bug Patterns from Audit Fixes

Bug patterns discovered in audit, generalized as reusable classes. Each comes from a `Fix #N` commit.

---

## [#1] Slippage check without fees included

**Source commits:** `4ec5391a` Include taker fee in marketBuy slippage check (Fix #29)
**Bug:** `if (spentCollateral > maxCollateralIn_) revert` — didn't consider `paidTakerFee`.
**Class:** **Incomplete slippage** — bound doesn't capture all outflows/inflows.
**Pattern:** In every slippage check, aggregate principal + all fees + other components (rake, rebate) before compare. User thinks in "total spent".
**Skill seed:** "Detect slippage checks that ignore fees or other components; suggest full aggregation."

---

## [#2] Semantically inverted slippage bound

**Source commits:** `c6fafd0e` Flip buyOnPhase1 slippage bound to a max acceptable odds (Fix #21)
**Bug:** Param `minAcceptableOdds_` but semantics were upper bound (higher odds = worse fill = revert).
**Class:** **Direction confusion in bounds**.
**Pattern:** In prediction markets / pricing, "min acceptable odds" for buy is the opposite of what it seems (floor on odds = floor on tokens = wrong side of protection). Use `maxAcceptableOddsBps` for buys; `minAcceptableOddsBps` for sells. Document direction explicitly.
**Skill seed:** "Audit slippage bound naming: confirm bound direction (min/max) protects user from real worst-case."

---

## [#3] Idempotency based on zero-check

**Source commits:** `a5fccdf9` Track vault finalization with a flag (Fix #18)
**Bug:** `if (resolvedVaultAssetsSnapshot > 0)` as idempotency guard. But snapshot can be legitimately zero (vault total loss). `vault.redeem()` called 2x.
**Class:** **Sentinel value fails when zero is legitimate value**.
**Pattern:** For one-shot operations, use explicit boolean flag (`vaultAccountingFinalized`), never depend on "value != 0".
**Skill seed:** "Audit idempotency checks based on zero-value; replace with boolean flag when zero is legitimate value."

---

## [#4] Aggregate cap not applied in per-user distribution

**Source commits:** `e0985b6a` Cap aggregate yield claims at realized vault surplus (Fix #17)
**Bug:** Per-user yield calc: `userAssets - userPrincipal` can be positive individually in vault with aggregate loss (user with low entry share price). Yield drains payoutPool.
**Class:** **Sliced value without aggregate cap**.
**Pattern:** `aggregateSurplus = max(0, vaultSnapshot - totalPrincipal)`; then `userYield = (aggregateSurplus * userShares) / totalShares`. Always: `sum(slices) ≤ aggregate`.
**Skill seed:** "In per-user yield/profit/refund distribution, validate aggregate cap before slicing."

---

## [#5] Push refund deadlocks finalization when recipient is blacklisted

**Source commits:** `5159fc6` Escrow failed buy refunds to unblock blacklisted finalization (Fix #5, #8)
**Bug:** Batch finalization uses `safeTransfer(user, refund)`. User blacklisted on USDC reverts → freezes `processFinalizationBatch`, `resolve`, `cancel`. No escape (emergency withdraw requires resolved||cancelled).
**Class:** **Push payment block on critical path**.
**Pattern:** In batch iterating multiple recipients on critical path, use `trySafeTransfer`; on failure, escrow `failedRefunds[user]` + pull function `claimFailedRefund(to_)`.
**Skill seed:** "Detect push refunds in finalization loops; replace with try + escrow + pull."

---

## [#6] Yield locked after cancel-with-refund

**Source commits:** `be917755` Unlock vault yield claims on cancel-with-refund (Fix #13)
**Bug:** `claimYield()` requires `resolved`. In `cancel(refund=true)`, yield is allocated but not accessible (not resolved nor cancelled-without-yield).
**Class:** **Terminal states with sub-types not distinguished**.
**Pattern:** Separate flag `cancelledWithRefund`. Yield gate: `resolved || cancelledWithRefund`. Each terminal substate with unique semantics has dedicated flag.
**Skill seed:** "Audit terminal states: each sub-type with different semantics should have distinct flag, not compact."

---

## [#7] Vault failure deadlocks lifecycle transition

**Source commits:** `636d0012` Defer vault settlement on lifecycle revert and add settleVault retry (Fix #20)
**Bug:** `_finalizeVaultAccounting()` calls `vault.redeem()` directly. Vault revert → resolve/cancel revert → state never flips → emergency withdraw blocked (requires terminal state).
**Class:** **External call on critical path without fallback**.
**Pattern:** `tolerateFailure` flag in finalize. In critical paths: catch revert, set pending flag, continue. Permissionless `settleVault()` function retries strict.
**Skill seed:** "For state transitions dependent on external calls, suggest tolerateFailure + permissionless retry."

---

## [#8] Burn-on-source vs return to parent

**Source commits:** `9840a64e` Burn outcome tokens at the source (Fix #24)
**Bug:** Ask-side refunds (outcome tokens) returned to Market contract. `balanceOf(market)` grows; payout calculations need to subtract (fragile; indexers do it wrong).
**Class:** **Shadow supply via balance on parent contract**.
**Pattern:** Tokens emitted by protocol + refunded by sub-component → burn at source via `OutcomeToken.burn(...)`, not transfer to Market.
**Skill seed:** "For protocol-emitted tokens in refund flows, prefer burn-at-source to avoid shadow supply."

---

## [#9] Seeded liquidity without refund tracking

**Source commits:** `d4f57cac` Fix accounting problem when cancelling seeded orders (Fix #16, #19)
**Bug:** When Market cancels its own seeded orders, collateral refund not tracked. Pools/totalPool don't reflect return; finalization corrupted.
**Class:** **Protocol-as-maker without separate accounting**.
**Pattern:** 
> - `cancelOrdersRange()` returns `refundedToMarket` separately.
> - Market accumulates in `pendingSeedPoolInflow`.
> - Finalize applies to `totalPool` before snapshot.
> - `_makerRebate(maker, ...)` returns 0 if `maker == market`.
**Skill seed:** "In systems with protocol-as-maker, audit all paths (match/cancel/refund/rebate) for separate accounting treatment."

---

## [#10] Per-iteration cap calc without final pre-compute

**Source commits:** `41f85598` Fix mintCompleteSet cap calculation (Fix #7)
**Bug:** `mintCompleteSet(amount)` checked cap per outcome iteratively. Last outcome compares against pool without previous outcomes → smaller cap than it should.
**Class:** **Loop check against incrementally calculated aggregate**.
**Pattern:** Pre-compute `totalPoolAfter = totalPool + amount * outcomeCount` ONCE. Pass to each iteration.
**Skill seed:** "In loops checking against an aggregate, pre-compute final state and pass to each step."

---

## [#11] Phase 2 buy from seeded ask without accounting callback

**Source commits:** `f2058c87` Fix accounting problem for when user is buying from seeded liquidity on phase 2 (Fix #6)
**Bug:** In Phase 2, buy fills seeded ask. Notional debited from market pool (in fill), but not credited back. Pools ↓, supply ↑, mismatch.
**Class:** **Indirect operation without accounting callback**.
**Pattern:** Callback `onSeededAskFill(outcomeId, notional)` called when match fills seeded ask. Market `pools[outcome] += notional; totalPool += notional`. Callback gated by `maker == market`.
**Skill seed:** "In multi-phase systems with indirect ops, identify flows where cross-contract state needs callback."

---

## [#12] Permissionless bounty without delay (mempool race)

**Source commits:** `dff82af9` Add overdue gate to graduate-caller bounty (Fix #N)
**Bug:** Bounty available immediately when threshold crossed. MEV/mempool race; spam.
**Class:** **Immediate incentive on state transition**.
**Pattern:** `thresholdReachedAt` timestamp. Bounty requires `now ≥ thresholdReachedAt + overdueDelay`. Flag clearable if threshold un-crossed.
**Skill seed:** "In permissionless bounties gated by state, suggest mandatory delay post-cross."

---

## [#13] Infeasible config accepted on creation

**Source commits:** `855f2d4e` Validate seed fund covers ladder minOrderSize at market creation (Fix #14)
**Bug:** Seed ladder pre-calculated on creation. If `seedFund < minRequired`, `graduate()` reverts. Invalid config discovered late; funds locked.
**Class:** **Feasibility validation only on later transition**.
**Pattern:** Calculate worst-case (`minSeedFundAtGraduation()`) on factory. Revert in createMarket if infeasible.
**Skill seed:** "In factory validations, simulate worst-case of config (graduation, resolution) and fail fast."

---

## [#14] Bounty cap without absolute max bps

**Source commits:** `df45bf6` Cap graduate caller reward
**Bug:** Bounty bps validated against `BPS_DENOMINATOR` (≤ 100%). But 100% drains the entire seed fund; should be max 10%.
**Class:** **Technical bounds vs economic bounds**.
**Pattern:** `MAX_GRADUATE_CALLER_REWARD_BPS = 1000` (10%). Validate in factory + setter. Technical bps (≤ 10000) is necessary, not sufficient.
**Skill seed:** "Audit bps params: do they have economic cap (10%) beyond technical cap (100%)?"

---

## [#15] Lens drift from Market

**Source commits:** `0315928` Match Lens implied odds with Market; `df45bf6` harden MarketLens drift
**Bug:** `MarketLens.getImpliedOdds()` calculated odds slightly differently from `Market._getBuyImpliedOdds()` (missing floor). Frontend showed price ≠ actual fill price.
**Class:** **Reimplementation in Lens diverges from source**.
**Pattern:** Lens must replicate EXACT logic of source. Test parity side-by-side: `lens.getX(input) == market.computeX(input)`. Consider extracting logic to shared library.
**Skill seed:** "For Lens-derived views, require parity test against source-of-truth + consider extraction to shared library."

---

## [#16] Fragile tuple destructuring of struct returns

**Source commits:** `df45bf6` (field-by-field assignment)
**Bug:** Lens did `(a, b, c) = info()`. Field reorder in struct → lens reads wrong silently.
**Class:** **Position-based destructuring instead of name-based**.
**Pattern:** `Info memory data = info(); a = data.field1; b = data.field2`. Field assignment = compile error if field doesn't exist.
**Skill seed:** "Detect tuple destructuring of struct returns; suggest field-by-field assignment."

---

## [#17] Outcome-token totalSupply contaminated by self-balance

**Source commits:** `7002f55` Exclude market-held winning tokens from payout denominator; `41f85598`
**Bug:** Payout `correctPool * userBalance / totalSupply`. Market holds tokens (seeding), inflating supply. Users receive unfairly smaller fraction.
**Class:** **Self-balance contaminating denominator**.
**Pattern:** `denominator = totalSupply(outcomeId) - balanceOf(self, outcomeId)`. Whenever protocol mints to itself, subtract self-balance.
**Skill seed:** "Audit divisions by totalSupply in systems with protocol-owned positions; subtract self-balance."

---

## [#18] Underflow risk in loss waterfall

**Source commits:** `b579423e` Fix underflow risk in _applyVaultLossWaterfall
**Bug:** In loss waterfall, subtractions without `Math.min()` can underflow if rounding misalignment.
**Class:** **Unsigned subtraction without clamp**.
**Pattern:** `loss = Math.min(seedFund, expected - redeemed)`. Always clamp in subtractions of unsigned values.
**Skill seed:** "Audit subtractions in loss/refund calculations; always use Math.min for clamp."

---

## [#19] cancelOrder gated by market state

**Source commits:** `6d8e824` Remove enforceOrderPlacementStatus on cancelOrder
**Bug:** Original `cancelOrder` reverted if market non-Open. Users couldn't recover post-resolution funds; griefing potential.
**Class:** **Recovery path gated by terminal state**.
**Pattern:** `cancelOrder` callable in any state. NatSpec explains: refund always available.
**Skill seed:** "Audit gates on refund/cancel/withdraw paths; recovery always available, even in terminal."

---

## [#20] Treasury not propagated to sub-contracts

**Source commits:** `7af690d` Prepagate the setTreasury to the CLOBs
**Bug:** `Market.setTreasury()` changed only Market. CLOBs continued paying rake to old treasury.
**Class:** **Shared admin state without propagation**.
**Pattern:** Setter for shared admin state should iterate children and propagate. Tests covering propagation.
**Skill seed:** "Audit shared admin params between parent + children; parent setter must propagate."

---

## [#21] Mid-fill dust poison pill: defensive zero-notional revert weaponized into a FIFO brick

**Source commits:** `63e9ac8` Fix mid-fill dust poison pill in CLOB; add CLOB invariants; polish events/NatSpec.; `c4a0dc9` Guard zero-notional matches; let cancel-all skip book activity bumps; add permissionless queue compaction. Fixes #34 #12
**Bug:** Audit fix `c4a0dc9` added `if (notional == 0) revert ZeroAmount()` inside the match loop to prevent free token transfers from floor-division. Combined with placement-time dust handling that only checked the *placer's own* remainder, an adversary could place a sell at the smallest legal price (`minTick`) with size `minOrderSize`, get partially filled to leave `0 < makerRemaining < minOrderSize`, and the next taker hitting that price level would compute `notional = 1 * minTick / 10_000 = 0` and revert — bricking the FIFO head until someone cancelled it. A defensive guard became a permanent denial-of-service primitive at any minTick-anchored level.
**Class:** **Asymmetric invariant maintenance** (placer side enforced `remaining >= minOrderSize`, maker-side did not after partial fill) compounded by **defensive revert in a non-cancellable hot path**.
**Pattern:** Whenever you add a defensive revert (`require notional > 0`, `require shares > 0`, `require amount > 0`) inside a loop that walks shared state (FIFO queue, linked list, set), also enumerate every way the inner state can drift into the reverting precondition while still being marked "active". Either (a) prevent the drift at *every* mutation site, or (b) on entering the loop, cleanup-and-skip the offending entry (`_cleanupSellMakerDust`/`_cleanupBuyMakerDust`) instead of reverting the whole call. Reverting the outer call lets a single dust order grief the entire price level.
**Skill seed:** "Audit any `revert` inside a queue/loop iteration: enumerate states that can satisfy the revert condition AND remain in the queue. If any exists, the revert is a poison-pill primitive — convert it to a skip-and-cleanup."

---

## **Summary: bug classes in order of frequency**

1. **Incomplete slippage / inverted direction** (#1, #2)
2. **Fragile idempotency** (#3)
3. **Aggregate vs slice mismatch** (#4)
4. **Push payment deadlock** (#5)
5. **Terminal substate not distinguished** (#6)
6. **External call without fallback** (#7)
7. **Shadow supply** (#8, #17)
8. **Protocol-as-maker accounting** (#9, #11, #14, #20)
9. **Loop calc per-iteration vs final** (#10)
10. **Bounty/incentive without delay** (#12)
11. **Validation only at late transition** (#13)
12. **Lens drift from source** (#15)
13. **Fragile tuple destructuring** (#16)
14. **Underflow in loss math** (#18)
15. **Recovery path gated** (#19)
16. **Defensive revert weaponized into queue brick** (#21)
