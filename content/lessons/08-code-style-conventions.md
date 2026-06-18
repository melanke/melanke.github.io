# 08 — Code Style & Conventions

Style lessons: naming, formatting, NatSpec, modifier ordering, error naming.

---

## [#1] Trailing underscore on external parameters

**Source commits:** `016c397` Add trailing underscore on external fn params
**Pattern:**
> `function foo(uint256 outcomeIndex_, uint256 amount_) external`. Internal/private functions: no underscore.
**Why it matters:** distinguishes params (with `_`) from state vars (without `_`); avoids shadowing; widely-adopted Solidity convention.
**How to apply:** custom lint rule; standardize in style guide.
**Skill seed:** "Audit Solidity contracts: external/public params should have trailing underscore; internal params don't."

---

## [#2] `@inheritdoc` instead of duplicating NatSpec

**Source commits:** `b884fd2` Add @inheritdoc tags across impl contracts
**Pattern:**
> In implementation: `/// @inheritdoc IFoo\nfunction bar() ... { }`. NatSpec maintained in interface; implementations point to it.
**Why it matters:** prevents duplicated NatSpec going out of sync; tooling generates docs from interface; changes propagate.
**How to apply:** every impl method coming from interface has `@inheritdoc`.
**Skill seed:** "Audit impl contracts with duplicated NatSpec; suggest `@inheritdoc IFoo`."

---

## [#3] `nonReentrant` before other modifiers

**Source commits:** `789659a` Move nonReentrant modifier before the others
**Pattern:**
> `function foo() external nonReentrant onlyOwner onlyOpen { }`. Order: guard → auth → business.
**Why it matters:** guard runs before any external check; prevents reentrancy in checks themselves.
**How to apply:** standardize ordering; lint rule.
**Skill seed:** "Lint rule: `nonReentrant` should always be the first modifier."

---

## [#4] Errors named with precise semantics

**Source commits:** `cf1c2e7` (several renames); `0b3d8ca` Consolidate errors
**Pattern:**
> `InvalidFinalizationOperation` (not `InvalidState`); `ResolutionConditionsNotMet` (not `NotReady`); `ClaimUnavailable` (not `NoClaim`). Names indicate **violated precondition**, not generic state.
**Why it matters:** callers can distinguish programmatically; auditors understand quickly.
**How to apply:** `error PreconditionFailed(uint8 given, uint8 max)` with data when relevant.
**Skill seed:** "Audit error names: should indicate violated precondition, not generic state. Suggest contextual data as params."

---

## [#5] line_length = 80, int_types = "long"

**Source commits:** `41d85de` Format code; `47baa63` Format int_types as "long"
**Pattern:**
> `foundry.toml`:
> ```toml
> [fmt]
> line_length = 80
> int_types = "long"
> number_underscore = "thousands"
> ```
**Why it matters:** community standard; readability; thousands separator (`10_000`) avoids off-by-zero.
**How to apply:** `forge fmt` in pre-commit; CI checks.
**Skill seed:** "Configure forge fmt with line_length=80, int_types=long, number_underscore=thousands."

---

## [#6] Comments explain "why", not "what"

**Source commits:** `1c302cd` Add event emittance and comments on CLOB; `6d8e824` (`/// @dev Intentionally callable even after market finalization so users can always recover reserved funds.`)
**Pattern:**
> Comments only where "why" is non-obvious. Don't comment "increments pool" — comment "allowed post-finalization for always-available recovery".
**Why it matters:** "what" is obvious from code; "why" is lost without comment. Counterintuitive decisions need justification.
**How to apply:** code review: ask "does this comment explain why or what?"
**Skill seed:** "Audit comments: if they describe 'what', suggest removal; if they describe 'why', keep."

---

## [#7] Parameter names reflect unit and direction

**Source commits:** `0dfb73c` Rename buyOnPhase1 input to collateralAmount and clarify docs
**Pattern:**
> `collateralAmount` (not `amount`); `maxAcceptableOddsBps` (not `slippage`). NatSpec clarifies units:
> ```
> /// @param collateralAmount Amount of collateralToken to pull from msg.sender
> ///        (native decimals / smallest units). NOT outcome-token quantity.
> ```
**Why it matters:** ambiguous AMM/order book params = bugs. "amount" is too generic.
**How to apply:** value params always named with unit + direction. Document in NatSpec with numeric example.
**Skill seed:** "Audit param names in trading functions; force explicit unit/direction (collateralAmount, tokensOut, maxOddsBps)."

---

## [#8] Domain names instead of implementation names

**Source commits:** `2ec2673` Rename CLOBRBTree to just CLOB
**Pattern:**
> `CLOB.sol` (domain), `RedBlackTree` library (implementation detail). Contract names reflect domain; libraries reflect implementation.
**Why it matters:** if you swap RBTree for another structure, contract name doesn't change. Stable API.
**How to apply:** contract = domain entity; library = plumbing/algorithm.
**Skill seed:** "Audit naming: contract names reflect domain; algorithm/structure names live in libraries."

---

## [#9] `using X for Y` for fluency

**Source commits:** Implicit in several commits (libraries for Math)
**Pattern:**
> `using MarketMath for uint256` allows `value.computeFee(bps)` instead of `MarketMath.computeFee(value, bps)`.
**Why it matters:** readability; method-style is more natural.
**How to apply:** libraries with `(T, ...)` signatures used frequently → `using` directive.
**Skill seed:** "Detect verbose library calls and suggest `using X for Y`."

---

## [#10] @custom:security-contact

**Source commits:** `e3b1f3be` Add 33labs.ai as security contact on the contracts
**Pattern:**
> Each production contract has `/// @custom:security-contact security@example.com` in the header.
**Why it matters:** responsible disclosure; clear bug bounty channel.
**How to apply:** every mainnet-deployed contract → mandatory security contact.
**Skill seed:** "Force `@custom:security-contact` in all production contracts."

---

## [#11] Events with sufficient fields for indexers

**Source commits:** `1c302cd` Add event emittance and comments on CLOB; `af8044d` (`VaultLossAbsorbed`)
**Pattern:**
> Events include all fields indexers need to reconstruct state: `OrderPlaced(orderId, trader, outcomeId, side, price, size)`. Don't skimp on fields.
**Why it matters:** indexer needs to rebuild state from events; missing field = re-fetch chain (expensive/slow).
**How to apply:** when creating event, think "what does indexer need?"; include all identifiers.
**Skill seed:** "Audit events: each event should have all fields for state reconstruction."

---

## [#12] Detailed events on critical paths

**Source commits:** `af8044d` Apply seed-first loss absorption (`VaultLossAbsorbed(expected, redeemed, seedLoss, poolLoss)`)
**Pattern:**
> Loss/clawback operations emit detailed event with each component: expected, actual, seedLoss, poolLoss.
**Why it matters:** post-mortem audit/debugging; UIs alert users with detail.
**How to apply:** loss absorption, fee distribution, batch settlement → granular event.
**Skill seed:** "For redistribution operations (loss, fee, settlement), require event with detailed breakdown."

---

## [#13] Field-by-field struct assignment (not tuple destructuring)

**Source commits:** `df45bf6` (Lens reorder)
**Pattern:**
> ```solidity
> // Avoid:
> (a, b, c) = info();
> // Prefer:
> Info memory data = info();
> a = data.field1;
> b = data.field2;
> ```
**Why it matters:** if struct reorders fields, tuple destructuring silently reads wrong. Field-by-field = compile error.
**How to apply:** avoid tuple destructuring of struct returns; assign by name.
**Skill seed:** "Detect tuple destructuring of struct returns and suggest field-by-field assignment."

---

## [#14] Naming of fixers vs new features

**Source commits:** Several `Fix #N` commits
**Pattern:**
> Bugfix commit messages link to issue: `Cap aggregate yield claims at realized vault surplus. Fix #17`. Numbering tracks audit findings.
**Why it matters:** post-audit traceability; each finding has dedicated commit.
**How to apply:** audit fixes in dedicated commits, linked to issue tracker.
**Skill seed:** "For audit fix workflow, require dedicated commit per finding with `Fix #N` in message."

---

## [#15] Constants in SCREAMING_SNAKE_CASE

**Source commits:** Implicit in all
**Pattern:**
> `BPS_DENOMINATOR`, `MAX_OUTCOMES`, `MAX_RAKE_BPS`. Constants are all-caps with underscore.
**Why it matters:** universal convention; distinguishes constant from variable.
**How to apply:** lint rule.
**Skill seed:** "Lint constants in SCREAMING_SNAKE_CASE."

---

## [#16] Explanatory comments for non-obvious reverts

**Source commits:** `6d8e824` (cancelOrder can be called in any state)
**Pattern:**
> When function has counterintuitive behavior, NatSpec `@dev` explains:
> ```
> /// @dev Intentionally callable even after market finalization so users
> ///      can always recover reserved funds.
> ```
**Why it matters:** future auditor/dev may see "callable in any state" and think it's a bug. Comment explains intent.
**How to apply:** deliberate decisions that look like bugs need explanatory comment.
**Skill seed:** "Audit functions with counterintuitive behavior (no usual gates); require explanatory `@dev`."

---

## [#17] Events for admin action audit trail

**Source commits:** Implicit (`emit TreasurySet(addr)`, `emit Paused()`)
**Pattern:**
> Every admin action emits event. Indexers/monitors can track.
**Why it matters:** transparency; community/multisig can audit admin activity.
**How to apply:** every admin setter → event.
**Skill seed:** "Force event emission in every admin setter for audit trail."

---

## [#18] Outcome metadata struct instead of string title

**Source commits:** `62421b2` Allow the owner to inform the whole OutcomeMetadata
**Pattern:**
> ```solidity
> struct OutcomeMetadata {
>   string name;
>   string symbol;
>   string[] outcomeLabels;
>   bytes32 sportId;
>   string iconUri;
> }
> ```
> Instead of loose `(string title, string[] labels)`.
**Why it matters:** stable ABI (adding field doesn't break); readable; namespacing.
**How to apply:** APIs with 4+ related params → struct.
**Skill seed:** "APIs with many related params → struct param for stable evolution."
