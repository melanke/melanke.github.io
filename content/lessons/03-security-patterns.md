# 03 — Security Patterns

Security lessons in Solidity: reentrancy, slippage, input validation, anti-front-running, anti-griefing.

---

## [#1] `ReentrancyGuardTransient` on all mutating entry-points

**Source commits:** `21bb5ec` Add reentrancy guards; `b579423e` Add nonReentrancy guards on cancelAllOrders; `008143207` Add nonReentrant finalization guards; `968951a` Add nonReentrant on processFinalizationBatch
**Pattern:**
> Use `ReentrancyGuardTransient` (transient storage / TSTORE/TLOAD, EVM-Cancun) instead of storage-based guards. Apply to all external functions that perform transfers or state mutations.
**Why it matters:** transient storage clears between transactions, without persisting cost. Significant savings in CLOBs (multiple transactions per block).
**How to apply:** `import {ReentrancyGuardTransient}`. Apply to: place/cancel order, market buy/sell, redeem, claim, processFinalizationBatch.
**Skill seed:** "Audit contracts for mutating external functions that perform transfers or external calls; suggest `nonReentrant` (transient) with correct ordering."

---

## [#2] `nonReentrant` before other modifiers

**Source commits:** `789659a` Move nonReentrant modifier before the others
**Pattern:**
> Canonical order: `nonReentrant` → auth modifiers (`onlyOwner`, `onlyFactory`) → business modifiers. Guard runs before any external check.
**Why it matters:** prevents reentrancy from bypassing auth checks via reentrancy in the auth checks themselves (rare but possible with delegatecall in libraries).
**How to apply:** standardize order in style guide; custom lint to detect inversions.
**Skill seed:** "Verify modifier order — `nonReentrant` should always be first."

---

## [#3] Slippage check must include ALL fees

**Source commits:** `4ec5391a` Include taker fee in marketBuy slippage check (Fix #29)
**Pattern:**
> `if (spentCollateral + paidTakerFee > maxCollateralIn_) revert`. DO NOT compare only `spentCollateral` — user thinks in total spend.
**Why it matters:** users define `maxCollateralIn` as the worst case accepted. Excluding fees from the check violates expectation and exposes them to unexpected losses.
**How to apply:** whenever there's `maxCollateralIn`/`minCollateralOut`, aggregate all outflows/inflows (principal + fees + rebates) before the compare.
**Skill seed:** "Detect slippage checks that compare only principal and ignore taker/maker fees or rake — suggest full inclusion."

---

## [#4] Slippage in odds (not in token amount), with "max acceptable" semantics

**Source commits:** `c6fafd0e` Flip buyOnPhase1 slippage bound to a max acceptable odds (Fix #21); `0dfb73c` Rename buyOnPhase1 input to collateralAmount
**Pattern:**
> In prediction markets, slippage in token amount is ambiguous (more odds = fewer tokens). Use `maxAcceptableOddsBps`: higher odds = worse fill = revert.
**Why it matters:** "min acceptable odds" semantics seems intuitive but is the opposite: a floor on odds means a floor on tokens, and floor on tokens in a buy is the wrong side of protection.
**How to apply:** explicitly document the bound direction. "Max acceptable odds" for buys; "min acceptable odds" for sells.
**Skill seed:** "In AMMs/order books, validate slippage bound direction relative to what the user is protecting (worst-case price = upper bound on buys)."

---

## [#5] `Ownable2StepUpgradeable` for admin-critical contracts

**Source commits:** `f6ab2b0` Use Ownable2StepUpgradeable on MarketFactory
**Pattern:**
> Replace `OwnableUpgradeable` with `Ownable2StepUpgradeable` in factories/registries. New owner needs to call `acceptOwnership()`.
**Why it matters:** prevents fat-finger transfers to wrong or uncontrolled addresses (multisig migrations).
**How to apply:** every contract with critical admin privileges (factory, registry, vault) uses 2-step.
**Skill seed:** "Audit `OwnableUpgradeable` use in admin contracts and suggest migration to `Ownable2StepUpgradeable`."

---

## [#6] Activity timestamp for anti-front-running of resolution

**Source commits:** `3720ead` Record activity for front-running protection
**Pattern:**
> Every mutation operation (buy, mint, burn, place order) records `lastActivityTimestamp = block.timestamp`. Resolution requires `block.timestamp >= lastActivityTimestamp + resolutionDelay`.
**Why it matters:** prevents resolution manipulation via flash loan in the same block; forces minimum window between last activity and finalization.
**How to apply:** for any state machine where "final state reads mutable state", record timestamp and force delay.
**Skill seed:** "In state machines with state-based resolution, suggest activity timestamp + delay to resist intra-block manipulation."

---

## [#7] Max position cap per wallet (and on all increase paths)

**Source commits:** `3720ead`; `9d99a23` maxPositionValuePoolFloor; `e85b8161` Enforce Max Position on mintCompleteSet
**Pattern:**
> `maxPositionShareBps` (e.g., 25%) limits position vs `totalPool`. Enforce on ALL paths that increase balance: market buy, mintCompleteSet, refunds. Use `maxPositionValuePoolFloor` as a sentinel for enforcement on small pools.
**Why it matters:** without cap on all paths, whales can use unprotected paths (mintCompleteSet) to escape the limit. Without floor, small pools have absurd caps.
**How to apply:** audit every path that increases `userBalance[outcome]`; apply the same cap. Use floor for pools < threshold.
**Skill seed:** "For position caps, map all paths that increase user exposure and enforce on each."

---

## [#8] Lock admin params after first trade

**Source commits:** `14098f9` Add a restriction to change openTime when the market has trades
**Pattern:**
> Bool `tradedSinceLastOpenTimeChange`. openTime setter reverts if a trade has occurred. Same idea for other critical params (close time, max position).
**Why it matters:** retroactive changes violate implicit contract with users. Lock proves "point of no return".
**How to apply:** identify each admin-settable param; document "point at which it becomes immutable" and enforce.
**Skill seed:** "For each admin setter, identify the event that should make it immutable (first trade, graduation, resolution) and suggest flag/timestamp lock."

---

## [#9] Order cancellation always allowed (even post-finalization)

**Source commits:** `6d8e824` Remove enforceOrderPlacementStatus on cancelOrder
**Pattern:**
> `cancelOrder()` callable in any state. NatSpec: `/// @dev Intentionally callable even after market finalization so users can always recover reserved funds.`
**Why it matters:** users with funds locked in orders need to always be able to recover. Lock after finalization = griefing.
**How to apply:** never gate refund/cancel paths on terminal state — always allow recovery.
**Skill seed:** "Audit gates on refund/cancel/withdraw paths — should always allow recovery, even in terminal states."

---

## [#10] Outcome tokens non-transferable before graduation

**Source commits:** `87d4e54` Enforce outcome tokens cannot be transfered before graduation
**Pattern:**
> `OutcomeToken.transfer()` reverts if `!graduated`. Phase 1 trades only via controlled mechanism (direct buy with tier fee).
**Why it matters:** prevents graduation front-running and sandwich attacks via OTC transfers in Phase 1.
**How to apply:** tokens with multi-phase lifecycle should gate transfers in pre-liquidity phases.
**Skill seed:** "For tokens with multi-phase lifecycle, audit if transfers are gated in pre-graduation phases."

---

## [#11] Timing ordering validations

**Source commits:** `aaceb01` Enforce open-to-resolution ordering in _validateTiming
**Pattern:**
> `_validateTiming(openTime, closeTime, resolutionTime)` ensures `openTime < closeTime <= resolutionTime`. Internal function called on creation AND in setters.
**Why it matters:** invalid ordering creates markets that never open or never resolve. Catch early.
**How to apply:** struct with timestamps always has internal `_validate()` called in constructor and in any setter.
**Skill seed:** "In any struct/config with timing windows, force a `_validate()` function that checks monotonic ordering."

---

## [#12] Bounded loops to avoid DoS via gas limit

**Source commits:** `399285a` Implement batched async finalization for graduated markets and bounded CLOB order cancellation
**Pattern:**
> `cancelOrdersRange(fromId, maxOrders) returns (newCursor, done)`. Caller calls in a loop until `done`. A single tx never exceeds gas limit.
**Why it matters:** unbounded loops in finalization = stuck markets. 1000+ orders = block gas overflow.
**How to apply:** any loop over a potentially large structure (>100 elements) needs cursor + batch.
**Skill seed:** "Detect unbounded loops over arrays/lists and suggest cursor batching."

---

## [#13] Fail-tolerant push refunds (escrow → pull) to avoid blacklist deadlock

**Source commits:** `5159fc6` Escrow failed buy refunds to unblock blacklisted finalization (Fix #5, #8)
**Pattern:**
> In batch finalization, `safeTransfer(user, refund)` reverts if user is on the collateral blacklist (USDC). Use `trySafeTransfer`; on failure, credit `failedRefunds[user]`. `claimFailedRefund(to_)` function lets user retry with alternative address.
**Why it matters:** without this, a single blacklisted user freezes `processFinalizationBatch`, `resolve`, `cancel` — total deadlock.
**How to apply:** in any push payment within a critical batch, use try-catch and escrow on failure.
**Skill seed:** "In loops doing transfers to multiple recipients in critical paths (finalization), replace direct push with try-catch + escrow."

---

## [#14] Tolerance to third-party failures in state transitions

**Source commits:** `636d0012` Defer vault settlement on lifecycle revert and add settleVault retry (Fix #20)
**Pattern:**
> `_finalizeVaultAccounting(tolerateFailure)`: if `tolerateFailure=true` (in resolve/cancel), catch vault.redeem() revert, set flag `vaultAccountingFinalized=false`, continue (state flips → emergency withdraw available). Permissionless `settleVault()` function retries.
**Why it matters:** external vault may revert (oracle down, paused). Without tolerance, lifecycle freezes; emergency withdraw isn't available in pre-final state = total deadlock.
**How to apply:** external dependencies in critical paths should have a `tolerateFailure` flag + permissionless retry function.
**Skill seed:** "For state transitions that depend on external calls, suggest pattern: `tolerateFailure` flag + pending flag + permissionless retry function."

---

## [#15] Idempotency via boolean flag (not via zero value)

**Source commits:** `a5fccdf9` Track vault finalization with a flag to keep redeem idempotent (Fix #18)
**Pattern:**
> `vaultAccountingFinalized: bool` instead of `if (resolvedVaultAssetsSnapshot > 0)`. Snapshot can be legitimately zero (total loss).
**Why it matters:** zero-value-as-sentinel fails when zero is a legitimate value. Re-execution duplicates side-effects (vault.redeem called 2x).
**How to apply:** for any one-shot operation, explicit flag; never depend on "special value" as sentinel.
**Skill seed:** "Audit idempotency checks: if based on numeric value, consider whether zero is a possible value and suggest explicit flag."

---

## [#16] Aggregate yield cap (not per-user)

**Source commits:** `e0985b6a` Cap aggregate yield claims at realized vault surplus (Fix #17)
**Pattern:**
> `surplus = max(0, vaultSnapshot - totalPrincipal)`; then `userYield = (surplus * userShares) / totalShares`. Don't allow individual slice to exceed aggregate surplus.
**Why it matters:** with per-user slicing, a user with low entry share price can have nominal slice > principal even with vault in aggregate loss. Yield drains payout pool.
**How to apply:** always clamp aggregate before slicing per-user. `payout_total ≤ surplus_total`.
**Skill seed:** "In yield distribution, validate that aggregate cap is applied before per-user slice."

---

## [#17] Slither + KNOWN_ISSUES.md

**Source commits:** `ec94747` Fix problems pointed by Slither
**Pattern:**
> Run Slither, fix actionables, document acceptable trade-offs (timestamp dependency in DeFi is OK) in `KNOWN_ISSUES.md`. `slither.config.json` to suppress checks with justification.
**Why it matters:** auditors expect transparency. "We knew, we accepted this trade-off because of X" > "we ignored".
**How to apply:** integrate Slither into CI; each suppressed finding has an entry in KNOWN_ISSUES.md.
**Skill seed:** "Audit Slither findings and generate KNOWN_ISSUES.md with fix vs justify-and-suppress decisions."

---

## [#18] Anti-griefing: delay for permissionless incentives

**Source commits:** `dff82af9` Add overdue gate to graduate-caller bounty
**Pattern:**
> `thresholdReachedAt` timestamp when crossing threshold. Bounty only after `block.timestamp >= thresholdReachedAt + overdueDelay`. Flag clearable if threshold "un-crossed" (burnCompleteSet).
**Why it matters:** immediate bounty incentivizes mempool spam (MEV-like racing) and premature graduation.
**How to apply:** every permissionless incentive tied to state transition must have mandatory delay post-trigger.
**Skill seed:** "In permissionless bounties gated by state, suggest mandatory delay post-cross to avoid mempool race."

---

## [#19] Validate config feasibility on creation (fail fast)

**Source commits:** `855f2d4e` Validate seed fund covers ladder minOrderSize at market creation
**Pattern:**
> Configs that generate pre-finalized structures (ladder, fee tiers): validate on creation that the setup is executable until the end. If `seedFund < minSeedFundAtGraduation()`, revert in createMarket — not just in graduate().
**Why it matters:** errors discovered in transition state = funds locked; users with no recourse.
**How to apply:** for any config that will generate pre-calculated arrays/structures, calculate worst-case and validate against inputs.
**Skill seed:** "In factory validations, simulate worst-case of the config (graduation, resolution) and revert if infeasible."

---

## [#20] Exclusive state: distinguish resolved vs cancel-with-refund vs cancel-no-refund

**Source commits:** `be917755` Unlock vault yield claims on cancel-with-refund (Fix #13)
**Pattern:**
> Flag `cancelledWithRefund` separate from `cancelled` and `resolved`. Yield claim allowed in `resolved || cancelledWithRefund` (yield already allocated), but NOT in plain `cancelled` (yield went to treasury).
**Why it matters:** alternative finalization cycles have different semantics; a single "cancelled" flag can't express it.
**How to apply:** state machines with multiple terminal states need granular flags.
**Skill seed:** "Audit state machines: each terminal state with unique semantics should have a distinct flag (don't compact into generic booleans)."
