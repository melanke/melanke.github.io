# 09 — Audit Preparation

Lessons on preparing the codebase for audit.

---

## [#1] Slither + KNOWN_ISSUES.md

**Source commits:** `ec94747` Fix problems pointed by Slither
**Pattern:**
> Workflow:
> 1. Run `slither .`
> 2. Triage: fixable vs acceptable
> 3. Fix actionable issues
> 4. Document trade-offs in `KNOWN_ISSUES.md` with justification
> 5. `slither.config.json` to suppress checks with reason comment
**Why it matters:** auditors expect transparency; "we know, we accept it for reason X" > "we ignore".
**How to apply:** pre-audit checklist always includes a Slither pass.
**Skill seed:** "Audit prep checklist: Slither pass → triage → fix actionable → document trade-offs in KNOWN_ISSUES.md."

---

## [#2] INVARIANTS.md documents core properties

**Source commits:** `a65e7405` Improve Documentation
**Pattern:**
> `INVARIANTS.md` lists properties that market always maintains:
> - `totalPool == sum(pools[outcome])`
> - `outcomeTotalSupply[i] == sum(userBalance[user][i])`
> - `payoutPool ≤ totalPool + seedFund`
> - `vaultAccountingFinalized → resolved || cancelled`
**Why it matters:** auditor knows which invariants to verify; fuzz tests can use as assertions; future dev understands contract.
**How to apply:** extract invariants from code, document; replicate as assertions in fuzz handlers.
**Skill seed:** "Extract invariants from accounting contracts and generate INVARIANTS.md + corresponding assertions."

---

## [#3] Auto-generated SCOPE.md

**Source commits:** `25e1c90` Reorganize unit tests and do audit prep
**Pattern:**
> `SCOPE.md` lists:
> - In-scope contracts with LOC
> - External dependencies (Vault, CollateralToken)
> - Out-of-scope contracts
> - Assumptions (e.g., "OutcomeToken implements ERC6909 correctly")
**Why it matters:** auditor knows boundaries; reduces "scope surprises" and time wasted on out-of-scope.
**How to apply:** auto-generate from imports + manually mark out-of-scope.
**Skill seed:** "Pre-audit: generate SCOPE.md with contracts + LOC + deps + assumptions."

---

## [#4] Hierarchical test reorganization

**Source commits:** `25e1c90` Reorganize unit tests and do audit prep; `843545a` Rename tests and add Gherkin headers
**Pattern:**
> Pre-audit: tests organized in `base/`, `unit/`, `integration/`, `fuzz/`. Gherkin naming (`test_Given_X_When_Y_Then_Z`).
**Why it matters:** auditor quickly finds what's tested and what's not; clear coverage per level.
**How to apply:** audit prep checklist includes test reorg.
**Skill seed:** "Audit prep: organize tests in base/unit/integration/fuzz with Gherkin naming."

---

## [#5] Gherkin headers in all tests

**Source commits:** `843545a` Rename tests and add Gherkin headers
**Pattern:**
> ```solidity
> /// @dev Given: Market in Phase 1 state
> /// When: buyOnPhase1 called with zero amount
> /// Then: Reverts with ZeroTokenOutput
> function test_Given_marketInPhase1_When_buyWithZeroAmount_Then_reverts() public { ... }
> ```
**Why it matters:** auditor reads tests as specs; clear intent.
**How to apply:** standardize naming convention pre-audit.
**Skill seed:** "Force Gherkin pattern in pre-audit tests (Given/When/Then)."

---

## [#6] Pre-audit replay comparison test

**Source commits:** `47d9d7a` Add replay comparison test
**Pattern:**
> Tests that replicate reference protocol with real snapshots. Auditor confirms implementation matches oracle.
**Why it matters:** quantitative confidence of parity; reduces scope of logical bugs.
**How to apply:** if replicating known protocol, replay test pre-audit.
**Skill seed:** "For protocol replicas, suggest replay test against real oracle pre-audit."

---

## [#7] Code coverage report

**Source commits:** `1b7e094` Improve code coverage and remove redundant checks
**Pattern:**
> `forge coverage --report lcov`. 90%+ branch coverage threshold. Gaps expose dead code OR missing tests.
**Why it matters:** auditor trusts tested code; dead code is red flag.
**How to apply:** coverage check in CI; high threshold pre-audit.
**Skill seed:** "Pre-audit: enforce coverage threshold; gap audit for dead code vs missing test."

---

## [#8] Remove redundant checks

**Source commits:** `1b7e094` Improve code coverage and remove redundant checks
**Pattern:**
> After coverage analysis, unreachable branches = redundant checks. Removing reduces size + clarity.
**Why it matters:** dead code confuses auditor; "if this revert is unreachable, why is it here?"
**How to apply:** coverage gap → confirm unreachable → remove check.
**Skill seed:** "Audit branches without coverage; confirm if unreachable and remove redundant checks."

---

## [#9] Issue drafts and issues folders

**Source commits:** Implicit (presence of `issue-drafts/`, `issues/` folders)
**Pattern:**
> `issue-drafts/` for in-progress audit findings; `issues/` for finalized. Markdown with title, severity, description, fix.
**Why it matters:** traceability; smooth transition to GitHub issues.
**How to apply:** standardize issue file template (title, severity, root cause, fix, test).
**Skill seed:** "Pre/during audit: standardize markdown issue template with severity, root cause, fix, test."

---

## [#10] Dedicated audit fix commits with `Fix #N`

**Source commits:** `e0985b6a` Fix #17, `5159fc6` Fix #5 #8, etc.
**Pattern:**
> Each audit finding = dedicated commit. Message: `<description>. Fix #N`. Links to issue tracker. Cherry-pickable.
**Why it matters:** auditor verifies each finding in isolated commit; clean rebase/cherrypick.
**How to apply:** audit fix workflow: dedicated branch, commit per finding, link in message.
**Skill seed:** "Audit fix workflow: branch + commit per finding + `Fix #N` in message."

---

## [#11] Reapply audit fixes on clean base branch

**Source commits:** Visible in timeline (re-applied commits on `2026-05-01` with same messages)
**Pattern:**
> After audit, re-apply fixes on clean base branch (rebased/cherry-picked). History stays linear.
**Why it matters:** re-audit (post-fix) is easier with clean history.
**How to apply:** after audit, prepare clean branch with fixes in order; submit for re-audit.
**Skill seed:** "Post-audit: clean fix history via cherry-pick on base branch."

---

## [#12] PRD.md / SCOPE.md / KNOWN_ISSUES.md / INVARIANTS.md / README.md

**Source commits:** Several (presence in repo)
**Pattern:**
> Pre-audit documentation:
> - `README.md` — overview
> - `PRD.md` — product requirements (45KB! detailed)
> - `SCOPE.md` — audit scope
> - `KNOWN_ISSUES.md` — slither/mythril findings with decisions
> - `INVARIANTS.md` — testable properties
> - `README_DEPLOYMENT.md` — deploy guide
**Why it matters:** auditor receives everything. Reduces back-and-forth.
**How to apply:** mandatory pre-audit template; each doc has required section.
**Skill seed:** "Pre-audit doc package: README, PRD, SCOPE, KNOWN_ISSUES, INVARIANTS, DEPLOYMENT_GUIDE."

---

## [#13] Detailed events as audit trail

**Source commits:** `1c302cd` Add event emittance; `af8044d` VaultLossAbsorbed event
**Pattern:**
> Critical operations (loss waterfall, settlement, finalization) emit events with detailed breakdown.
**Why it matters:** indexers/monitoring catch anomalies in production; auditor can confirm semantics via tests + events.
**How to apply:** events always include each component of the operation.
**Skill seed:** "In redistribution/settlement operations, events with full breakdown."

---

## [#14] Custom security contact

**Source commits:** `e3b1f3be` Add 33labs.ai as security contact on the contracts
**Pattern:**
> `/// @custom:security-contact security@example.com` in each production contract.
**Why it matters:** responsible disclosure; bug bounty channel.
**How to apply:** force in all production contracts.
**Skill seed:** "Pre-audit: confirm `@custom:security-contact` in all contracts."

---

## [#15] Bounded loops and evident cursor patterns

**Source commits:** `399285a` Implement batched async finalization
**Pattern:**
> Pre-audit: no unbounded loops in critical paths. Document "this loop is bounded by X".
**Why it matters:** unbounded loops = DoS via gas. Auditor will flag.
**How to apply:** audit own code for loops; replace unbounded with cursor batching.
**Skill seed:** "Pre-audit: scan for unbounded loops in critical paths; bound or batch."

---

## [#16] Reentrancy guards in audit checklist

**Source commits:** `21bb5ec`, `b579423e`, `008143207`, `968951a`
**Pattern:**
> Audit prep loop: each mutating external function has `nonReentrant`? Tests with reentrant mock?
**Why it matters:** reentrancy is vector #1 in DeFi.
**How to apply:** scan grep `external` in mutating functions; verify guard.
**Skill seed:** "Pre-audit: scan external mutating functions; confirm `nonReentrant` in all with transfers/calls."
