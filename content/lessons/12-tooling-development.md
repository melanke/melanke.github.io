# 12 — Tooling & Development

Lessons on auxiliary tooling for smart contract development: bots, replay scripts, prototypes.

---

## [#1] UI prototype for pre-audit contract feel

**Source commits:** `86330ae6` Create a UI Prototype to feel the contract usage
**Pattern:**
> Pre-audit, build minimal UI (React/TS) walking through full lifecycle: createMarket → buyPhase1 → graduation → CLOB orders → trades → resolve → claim → yield.
**Why it matters:**
> - Catches UX friction early (inverted slippage semantics in Fix #21 was discovered via UI test)
> - Validates mental model of the contract before production
> - UX-driven audit findings (not just logic bugs)
**How to apply:** prototype UI before final audit; cover every user action path.
**Skill seed:** "Pre-audit, build minimal UI prototype to discover UX/semantic bugs beyond logic bugs."

---

## [#2] Continuous replay script for integration

**Source commits:** `57fe164c` Create a Continuous replay script to create Markets and Place trades in real time
**Pattern:**
> TS script continuously creates markets and places trades on testnet. Stress test: RPC, indexer, frontend, contract integration.
**Why it matters:** unit tests don't cover network/RPC issues, race conditions, indexer drift. Continuous load reproduces real bugs.
**How to apply:** multi-component integrations (contract + indexer + frontend) → continuous replay on testnet.
**Skill seed:** "For multi-component integrations, suggest continuous replay script on testnet with diverse scenarios."

---

## [#3] Graduation bot

**Source commits:** `9bed81aa` Create a Graduation Bot
**Pattern:**
> Off-chain bot monitors markets in "ready to graduate" state via Lens. When threshold reached + overdueDelay passed, calls `graduate()`. Collects caller bounty.
**Why it matters:** permissionless transitions need caller; without bot, depends on users; bounty incentivizes but requires execution. Reference bot reduces friction.
**How to apply:** lifecycle contracts with permissionless transitions → official open-source reference bot.
**Skill seed:** "For permissionless lifecycle transitions with bounty, suggest public reference bot implementation."

---

## [#4] Replay pipeline with scrapers

**Source commits:** `47d9d7a` Add replay comparison test (referenced tools/replay-pipeline)
**Pattern:**
> ```
> tools/replay-pipeline/
>   scrapers/         # TypeScript fetch from Polymarket / The Graph
>   snapshots/        # JSON serialized trade history
>   format-spec.md    # JSON schema
> ```
> Test (`ReplayComparison.t.sol`) hydrates JSON via SeededBookSnapshotJsonLib and replicates trades in Foundry.
**Why it matters:** validates implementation against real protocol; finds logical bugs of off-by-one, rounding.
**How to apply:** if system replicates known protocol, pipeline scrape → JSON → replay test.
**Skill seed:** "For protocol replicas, suggest tooling pipeline: TS scraper → JSON snapshot → Foundry replay test."

---

## [#5] Performance benchmark report

**Source commits:** `f733c9a` Create different CLOB implementations, test and create a report
**Pattern:**
> `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md` consolidates benchmarks of 4 implementations:
> - Gas per place/cancel/match
> - Bytecode size
> - Worst-case scenarios
**Why it matters:** architecture decisions need data; markdown report shareable in PRs.
**How to apply:** gas-critical components → benchmark suite + markdown report.
**Skill seed:** "For component selection, generate markdown report with gas/size/worst-case benchmarks."

---

## [#6] Test fixture with external mock (ReentrantOrderBookMock)

**Source commits:** `968951a` Add nonReentrant on processFinalizationBatch (mock in test)
**Pattern:**
> Mock contracts in `test/mocks/`:
> - `ReentrantOrderBookMock` — tests nonReentrant guards
> - Mock vault — tests vault failure scenarios
> - Mock collateral — blacklist behavior
**Why it matters:** real contracts don't easily allow testing failure scenarios; mocks simulate.
**How to apply:** test/mocks/ for each external dependency with failure scenarios.
**Skill seed:** "For each external dependency, require test/mocks/ with happy + failure variants."

---

## [#7] Custom forge fmt rules

**Source commits:** `cdb581b` reformat with new fmt rules; `47baa63` Format int_types as long
**Pattern:**
> `foundry.toml`:
> ```toml
> [fmt]
> line_length = 80
> int_types = "long"
> number_underscore = "thousands"
> bracket_spacing = false
> wrap_comments = true
> ```
**Why it matters:** cross-team consistency; community standard alignment.
**How to apply:** check fmt config at the start of project; never override in individual files.
**Skill seed:** "For Foundry projects, configure fmt rules in foundry.toml + CI gate."

---

## [#8] Lcov coverage tracking

**Source commits:** Implicit (presence of `lcov.info`)
**Pattern:**
> `forge coverage --report lcov`. Generates `lcov.info` readable by VS Code Coverage Gutters extension. Threshold check in CI.
**Why it matters:** coverage gaps = dead code OR missing tests. Visualization in editor speeds up.
**How to apply:** integrate coverage into dev workflow; threshold in CI.
**Skill seed:** "Configure forge coverage in CI with lcov export for editor integration."

---

## [#9] Issue drafts folder workflow

**Source commits:** Implicit (presence of `issue-drafts/`)
**Pattern:**
> ```
> issue-drafts/
>   001-yield-cap.md      # in progress
> issues/
>   001-yield-cap.md      # finalized, ready for GitHub
> ```
> Markdown template: title, severity, description, root cause, fix, test.
**Why it matters:** traceability during audit; smooth transition to GitHub.
**How to apply:** during audit, standardize template + folders.
**Skill seed:** "Audit issue tracking: use issue-drafts/ + issues/ folders with standard template."

---

## [#10] GitHub issue references in commit messages

**Source commits:** `e0985b6a` Cap aggregate yield claims at realized vault surplus. Fix #17
**Pattern:**
> `<description>. Fix #<issue-number>` or `Fix #5 #8`. Links commit to issue tracker.
**Why it matters:** traceability; auditor verifies fixes; cherry-pick via issue.
**How to apply:** mandatory audit fix workflow links issue.
**Skill seed:** "Force issue reference in audit fix commits via `Fix #N` convention."

---

## [#11] Basic CI workflow (test + fmt + slither)

**Source commits:** Implicit (presence of `.github/workflows/`)
**Pattern:**
> ```yaml
> jobs:
>   test:
>     - foundryup --version v1.7.0
>     - forge fmt --check
>     - forge build
>     - forge test
>     - forge coverage --report lcov
>   slither:
>     - slither . --config-file slither.config.json
> ```
**Why it matters:** automated safety net; PRs don't merge without passing.
**How to apply:** CI workflow from commit 1.
**Skill seed:** "Foundry CI baseline: foundryup pin + fmt check + build + test + coverage + slither."

---

## [#12] Deployment broadcast folder

**Source commits:** Implicit (presence of `broadcast/`)
**Pattern:**
> Foundry's `broadcast/` folder logs every `forge script` execution. Auditable; rollback reference.
**Why it matters:** post-mortem of deploys; reproduction of transactions.
**How to apply:** `.gitignore` excludes only ephemeral logs; keeps structure.
**Skill seed:** "Configure adequate `.gitignore` for broadcast/ — preserve audit trail."

---

## [#13] Foundry lock file pinning

**Source commits:** Implicit (presence of `foundry.lock`)
**Pattern:**
> `foundry.lock` pins versions of dependencies (`lib/`). Reproducible builds.
**Why it matters:** dependencies updates can break; lockfile ensures consistency.
**How to apply:** commit foundry.lock; intentional updates via `forge update`.
**Skill seed:** "Always commit foundry.lock for reproducible builds."

---

## [#14] Detailed PRD.md (Product Requirements Document)

**Source commits:** Implicit (presence of 45KB PRD.md)
**Pattern:**
> Detailed PRD.md documents full product behavior: phases, lifecycle, fee structures, edge cases, examples.
**Why it matters:** auditor uses PRD to understand intent; future dev understands design decisions.
**How to apply:** non-trivial projects → PRD.md kept in sync.
**Skill seed:** "For complex projects, maintain detailed PRD.md in sync with implementation."

---

## [#15] Separate README_DEPLOYMENT.md

**Source commits:** Implicit (presence of README_DEPLOYMENT.md, 13KB)
**Pattern:**
> README.md focused on overview/quickstart. README_DEPLOYMENT.md details deploy steps, env vars, network configs, post-deploy actions.
**Why it matters:** deploy is complex topic; mixing with README pollutes both.
**How to apply:** always separate deploy docs from overview.
**Skill seed:** "Separate README.md (overview) from README_DEPLOYMENT.md (deploy detail)."
