# 05 — Lifecycle Management

Lessons on managing state transitions in contracts with complex lifecycle: graduation, resolution, cancellation, async finalization.

---

## [#1] State machine via dedicated modifiers per state

**Source commits:** `3720ead` Enforce max position and record activity for front-running protection
**Pattern:**
> Modifiers `onlyOpen`, `onlyGraduated`, `onlyResolved`, `onlyNotFinalized`. Each external function declares valid state(s) via modifier — not inline check.
**Why it matters:** centralizes preconditions; auditor finds all checks in one place; reduces forgotten-check bugs.
**How to apply:** map states → modifiers → allowed functions. Document in comment block.
**Skill seed:** "For contracts with state machines, force modifier-per-state and audit each function for correct state."

---

## [#2] Pause/Unpause separate from cancel/resolve

**Source commits:** `7329d4c` Improve pause, unpause and cancel tests
**Pattern:**
> `paused` is reversible state (admin can unpause). `cancelled`/`resolved` are terminal. Don't compact.
**Why it matters:** different semantics; mixing = recovery bugs (unpause from cancelled?).
**How to apply:** separate flags with clear documented transitions.
**Skill seed:** "Audit contracts with pause: pause should be reversible and independent from terminal states."

---

## [#3] Emergency withdraw with timelock

**Source commits:** `12f4462` Implement emergency withdraw with a timelock
**Pattern:**
> `requestEmergencyWithdraw()` creates pending request with `executableAt = block.timestamp + delay`. `executeEmergencyWithdraw()` requires full delay. Cancellable via `cancelEmergencyWithdraw()`.
**Why it matters:** escape mechanism if contract gets stuck (vault broken, oracle down). Timelock prevents griefing/fast-drain.
**How to apply:** contracts custodying user funds should have 2-step emergency withdraw with configurable delay.
**Skill seed:** "Audit custody contracts for emergency withdraw mechanism with timelock; suggest if absent."

---

## [#4] Graduation gate: threshold check with factory bypass

**Source commits:** `908f566` Add post-vault graduation threshold check (with factory bypass)
**Pattern:**
> `graduate()` checks `totalPoolValue >= threshold` by default. If called by factory (`isFactoryTrigger=true`), bypass. For emergency overrides.
**Why it matters:** prevents self-serve graduation if vault loss dropped pool below threshold. Factory can force in admin emergency.
**How to apply:** critical transitions have default validation + documented admin bypass.
**Skill seed:** "State transitions with validation should have admin bypass with explicit flag."

---

## [#5] Async finalization with cursor-based batching

**Source commits:** `399285a` Implement batched async finalization for graduated markets
**Pattern:**
> `processFinalizationBatch(maxOrdersPerBatch)` advances an order cancellation cursor. Returns `(newCursor, done)`. Caller calls in loop until `done`. Single tx never exceeds gas.
**Why it matters:** populous markets (1000+ orders) exceed block gas. Unbounded loop = stuck market.
**How to apply:** loops over potentially large structures in finalization → batching cursor pattern.
**Skill seed:** "Detect unbounded loops in finalization and suggest async batched with cursor."

---

## [#6] Cancel CLOB orders on resolve/cancel market

**Source commits:** `ee9c5f8` Cancel graduated CLOB orders on resolve/cancel; `f60c26b` Cancel finalized books on settlement
**Pattern:**
> In `resolve()` and `cancel()` (graduated state), iterate through CLOBs and cancel all pending orders (with batching).
**Why it matters:** active orders in resolved CLOB = users with locked funds; LP loses refund right.
**How to apply:** whenever sub-component (CLOB) has pending state, force cleanup at parent terminal state.
**Skill seed:** "In parent contracts with stateful sub-components (CLOBs, vaults), force cleanup of sub-components at parent terminal state."

---

## [#7] Finalize vault accounting in cancel too (not just resolve)

**Source commits:** `f60c26b` Cancel finalized books on settlement and finalize vault on cancel
**Pattern:**
> `_finalizeVaultAccounting()` is called in both resolve and cancel. Vault deposits redeemed at any terminal state.
**Why it matters:** not finalizing vault in cancel = stuck funds; users with no refund.
**How to apply:** map "external custodied funds" for all terminal states; ensure cleanup in each.
**Skill seed:** "Audit cancel/resolve paths to ensure liquidation of external custodians (vault, escrow) happens in all."

---

## [#8] Idempotency via boolean flag for vault redeem

**Source commits:** `a5fccdf9` Track vault finalization with a flag (Fix #18)
**Pattern:**
> `bool vaultAccountingFinalized`. Set after first successful `vault.redeem()`, regardless of value. Re-execution checks flag and early-returns.
**Why it matters:** snapshot can be legitimately zero (total loss); flag separates "executed" from "has value".
**How to apply:** one-shot side-effects → explicit flag.
**Skill seed:** "For one-shot operations (redeem, withdraw) in finalization, use explicit boolean flag for idempotency."

---

## [#9] Deferred settlement with permissionless retry

**Source commits:** `636d0012` Defer vault settlement on lifecycle revert and add settleVault retry (Fix #20)
**Pattern:**
> `_finalizeVaultAccounting(tolerateFailure)`. In resolve/cancel: `tolerateFailure=true`, catch revert, set pending flag, continue (state flips anyway). Permissionless `settleVault()` function retries strict.
**Why it matters:** external vault may revert; without tolerance, lifecycle freezes and emergency withdraw requires resolved||cancelled = total deadlock.
**How to apply:** external dependency in critical path → tolerateFailure flag + retry function.
**Skill seed:** "For state transitions dependent on external calls, suggest tolerateFailure + permissionless retry."

---

## [#10] Distinguish cancelledWithRefund from cancelled

**Source commits:** `be917755` Unlock vault yield claims on cancel-with-refund (Fix #13)
**Pattern:**
> `cancel(refund=true)` sets `cancelledWithRefund = true`. Yield claim allowed in `resolved || cancelledWithRefund`. Cancel-no-refund sweeps yield to treasury, claim blocked.
**Why it matters:** alternative cycles have different semantics; granular flag prevents semantic bugs.
**How to apply:** terminal states with sub-types need distinct flags.
**Skill seed:** "Audit terminal states: each sub-type with unique semantics should have distinct flag."

---

## [#11] Bounty gate with delay post-trigger

**Source commits:** `dff82af9` Add overdue gate to graduate-caller bounty
**Pattern:**
> `thresholdReachedAt` timestamp recorded when state crosses threshold. Bounty requires `now >= thresholdReachedAt + overdueDelay`. Flag clearable if threshold "un-crossed".
**Why it matters:** immediate bounty incentivizes mempool race / MEV. Delay forces "market had a chance to self-resolve first".
**How to apply:** every permissionless incentive tied to state transition has mandatory delay.
**Skill seed:** "For permissionless bounties gated by state, suggest mandatory delay."

---

## [#12] Reentrancy-safe bounded order cancellation

**Source commits:** `008143207` Add nonReentrant finalization guards; `b579423e` Add nonReentrancy guards on cancelAllOrders; `968951a` Add nonReentrant on processFinalizationBatch
**Pattern:**
> Each step of async finalization (`processFinalizationBatch`, `cancelAllOrders`, `cancelOrdersRange`) has `nonReentrant`. Stateful step-handlers in multi-step flows are especially vulnerable.
**Why it matters:** concurrent multiple txs can corrupt cursor/flag; reentrancy in callback (transfer fee) too.
**How to apply:** multi-step finalization → guard each public step-handler.
**Skill seed:** "In multi-step async flows with cursor, audit each step-handler for nonReentrant."

---

## [#13] State snapshot for post-finalization reads

**Source commits:** `1d6e593` Cached payoutPool; `9d99a23` Bring back resolutionTime
**Pattern:**
> In terminal transition, snapshot everything that will be used in redeem distribution: `payoutPool`, `correctOutcomeTotalSupply`, `resolutionTime`, etc. Subsequent reads read snapshot.
**Why it matters:** redeem changes state in random order; live reads break fairness if calculations recompose.
**How to apply:** terminal transitions → identify all derived values + snapshot.
**Skill seed:** "In terminal state transitions, identify reads multiple users will make and snapshot once."

---

## [#14] Immutable resolution time vs actualResolutionTime

**Source commits:** `9d99a23` Bring back resolutionTime
**Pattern:**
> `resolutionTime` (initial config, immutable). `actualResolutionTime` (set when resolve actually happens, can be later). Use `actualResolutionTime` in UI/payout calculations.
**Why it matters:** resolution may be delayed; need to know "when it should" and "when it happened" separately.
**How to apply:** time-based events with possible delay → 2 timestamps.
**Skill seed:** "For events with expected vs actual time, maintain 2 distinct timestamps."

---

## [#15] Transition ordering validations

**Source commits:** `aaceb01` Enforce open-to-resolution ordering in _validateTiming
**Pattern:**
> `_validateTiming(open, close, resolution)` forces `open < close <= resolution`. Called on creation AND any setter.
**Why it matters:** invalid ordering creates markets that never open or never resolve.
**How to apply:** structs with timing windows always have internal `_validate()`.
**Skill seed:** "In structs with multiple timestamps, force `_validate()` function checking monotonic ordering."

---

## [#16] Open time lock after first trade

**Source commits:** `14098f9` Add a restriction to change openTime when the market has trades
**Pattern:**
> Bool `tradedSinceLastOpenTimeChange`. `setOpenTime()` reverts if a trade has occurred.
**Why it matters:** changing timing after trade = breaking implicit contract with users.
**How to apply:** identify each admin-settable; map "point of no return" and enforce.
**Skill seed:** "For admin setters, identify event making param immutable and suggest lock flag."

---

## [#17] Validate ladder feasibility on creation

**Source commits:** `855f2d4e` Validate seed fund covers ladder minOrderSize at market creation
**Pattern:**
> Configs that generate pre-finalized structures (seed ladder) → calculate `minSeedFundAtGraduation()` worst-case on creation. Revert if infeasible.
**Why it matters:** discovering infeasibility in graduate() = funds locked, users with no recourse.
**How to apply:** factory simulates worst-case of config before accepting.
**Skill seed:** "In factory validation, simulate worst-case (graduation/resolution) and fail fast."

---

## [#18] Burn instead of returning tokens in refunds

**Source commits:** `645bac0` Burn outcome tokens; `9840a64e` Burn at the source (Fix #24)
**Pattern:**
> CLOB cancels seeded ask order → `OutcomeToken.burn()` directly, not transfer to Market.
**Why it matters:** prevents shadow supply; keeps `totalSupply` as source of truth.
**How to apply:** tokens minted by protocol: refund = burn.
**Skill seed:** "For protocol-emitted tokens in refund flows, prefer burn-on-source."

---

## [#19] Failed refunds → escrow → pull pattern

**Source commits:** `5159fc6` Escrow failed buy refunds (Fix #5, #8)
**Pattern:**
> In batch finalization, `trySafeTransfer(user, refund)`. On failure (USDC blacklist), credit `failedRefunds[user]`. `claimFailedRefund(to_)` lets user retry with alternative address.
**Why it matters:** without this, a blacklisted user freezes `processFinalizationBatch`. Escape impossible.
**How to apply:** push refunds in critical paths → try + escrow + pull.
**Skill seed:** "Audit push refunds in finalization; suggest try + escrow + pull for recipient failure tolerance."

---

## [#20] Finalization state visibility via Lens

**Source commits:** `008143207` expose graduated/paused market data; `636d0012` expose vaultAccountingFinalized
**Pattern:**
> Lens exposes granular flags: `graduated`, `paused`, `resolved`, `cancelled`, `cancelledWithRefund`, `vaultAccountingFinalized`. Frontends and bots distinguish sub-states.
**Why it matters:** UIs need to show correct status; bots need to know which transition to execute (e.g., call `settleVault()`).
**How to apply:** all granular state relevant to external clients exposed via Lens.
**Skill seed:** "For multi-stage state machines, expose sub-state flags via Lens, not just top-level state."
