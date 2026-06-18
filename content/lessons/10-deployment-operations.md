# 10 — Deployment & Operations

Lessons on deploy scripts, env management, upgrade flows.

---

## [#1] Private keys outside .env

**Source commits:** `a0a721f` Remove private keys from env; Separate Scripts; Improve Deploy Script
**Pattern:**
> `.env.example` documents variables without secret values. Private key loaded from secret manager (AWS Secrets, 1Password, etc.) at runtime:
> ```bash
> export PRIVATE_KEY=$(aws secretsmanager get-secret-value --secret-id mykey | jq -r '.SecretString')
> forge script Deploy --private-key $PRIVATE_KEY
> ```
**Why it matters:** keys in .env leak (git accidents, backup leaks). Secret manager rotates.
**How to apply:** every deploy script reads private key from external source, never from committed file.
**Skill seed:** "Audit deploy scripts: private keys never in committed .env; always from secret manager."

---

## [#2] Modular scripts (BaseBroadcastScript)

**Source commits:** `a0a721f` (separate scripts)
**Pattern:**
> ```
> script/
>   BaseBroadcastScript.sol      # logging, broadcast helpers
>   Deploy.s.sol                 # main deploy
>   CreateFirstMarket.s.sol      # post-deploy actions
>   LocalCollateral.s.sol        # local-only collateral mock
> ```
**Why it matters:** scripts composed via inheritance; reuse of logging/broadcast logic; testability.
**How to apply:** base script with logging/broadcast; specific scripts inherit.
**Skill seed:** "For deploy projects, suggest BaseBroadcastScript with logging + broadcast helpers; specific scripts inherit."

---

## [#3] Deployment JSON artifacts

**Source commits:** `a0a721f` (deployments/local.json)
**Pattern:**
> After deploy, save JSON in `deployments/{network}.json`:
> ```json
> {
>   "MarketFactory": "0x...",
>   "MarketLens": "0x...",
>   "OutcomeTokenImpl": "0x...",
>   "blockNumber": 1234567,
>   "timestamp": "2026-04-21T20:31:46Z",
>   "version": "1.0.0"
> }
> ```
**Why it matters:** frontends, monitoring, subsequent scripts read JSON. Auditable offline. Versioned.
**How to apply:** deploy script writes JSON immediately. CI validates presence.
**Skill seed:** "Deploy scripts must write JSON artifact with addresses, block, timestamp, version."

---

## [#4] Upgrade detection: redeploy vs upgrade

**Source commits:** `a0a721f` Improve Deploy Script to ... Upgrade Factory when its already deployed
**Pattern:**
> Deploy script reads deployment JSON. If factory already exists, executes upgrade (`upgradeToAndCall`) instead of redeploy. Idempotent.
**Why it matters:** mainnet deploys are not idempotent; scripts should support resume/upgrade.
**How to apply:** deploy script first checks JSON, then upgrades vs deploys as needed.
**Skill seed:** "Deploy scripts: detect existing deployment via JSON; upgrade if exists, deploy if not."

---

## [#5] setOutcomeTokenImplementation in factory

**Source commits:** `a0a721f` Add setOutcomeTokenImplementation to the Factory
**Pattern:**
> Factory has admin setter for OutcomeToken implementation. Deploy script writes new implementation and calls setter.
**Why it matters:** components evolve at different cadences; allows swapping OutcomeToken impl without factory redeploy.
**How to apply:** factory exposes admin setters for each sub-component implementation.
**Skill seed:** "In factories, expose admin setters for each sub-component implementation."

---

## [#6] Numbered deploy steps with logging

**Source commits:** `8778c22` (v2 first commit), implicit
**Pattern:**
> Deploy.s.sol goes through numbered steps with log:
> ```
> [1/5] Deploying Market implementation... 0xABC
> [2/5] Deploying CLOB implementation... 0xDEF
> ...
> ```
**Why it matters:** debugging when something fails; reproducibility.
**How to apply:** always number steps + log addresses.
**Skill seed:** "Force `[N/total] action... addr` logging in deploy scripts."

---

## [#7] Separate DeployConfig.sol

**Source commits:** Implicit (referenced in commits)
**Pattern:**
> `DeployConfig.sol` defines network-specific config (USDC address, treasury, thresholds). Deploy script imports.
> ```solidity
> struct NetworkConfig {
>   address usdc;
>   address treasury;
>   uint16 graduationThresholdBps;
>   uint16 maxPositionShareBps;
> }
> ```
**Why it matters:** eases multi-chain deploy; avoids hardcoded addresses.
**How to apply:** every deploy project separates config from logic in DeployConfig.sol.
**Skill seed:** "Deploy projects: separate NetworkConfig struct from Deploy logic."

---

## [#8] Foundry version pin in CI

**Source commits:** `cdb581b` Pin foundry to v1.7.0 in CI and reformat with new fmt rules
**Pattern:**
> `.github/workflows/test.yml`:
> ```yaml
> - name: Install Foundry
>   uses: foundry-rs/foundry-toolchain@v1
>   with:
>     version: 'v1.7.0'
> ```
**Why it matters:** Foundry updates may change gas, semantics. Pin = deterministic CI.
**How to apply:** CI always pins version; document in foundry.toml.
**Skill seed:** "CI: pin Foundry version explicitly in workflow."

---

## [#9] forge fmt as CI gate

**Source commits:** `cdb581b`; `47baa63` Format int_types as long
**Pattern:**
> CI step: `forge fmt --check`. Fails if code not formatted.
**Why it matters:** eliminates formatting debates; consistency reduces review noise.
**How to apply:** CI workflow has fmt check before tests.
**Skill seed:** "Add `forge fmt --check` as CI gate."

---

## [#10] Graduation bot

**Source commits:** `9bed81aa` Create a Graduation Bot
**Pattern:**
> Off-chain bot monitors markets in "ready to graduate" state; calls `graduate()` when threshold reached + overdueDelay passed; collects caller bounty.
**Why it matters:** graduation needs caller; without bot, depends on users; bounty incentivizes but requires execution.
**How to apply:** lifecycle contracts with permissionless transitions → consider official open-source bot.
**Skill seed:** "For permissionless lifecycle transitions with bounty, suggest open-source reference bot implementation."

---

## [#11] Continuous replay script

**Source commits:** `57fe164c` Create a Continuous replay script to create Markets and Place trades in real time
**Pattern:**
> TS/JS script that continuously creates markets and places trades on testnet. End-to-end stress tests integrations (RPC, indexer, frontend).
**Why it matters:** unit tests don't cover network/RPC/timing issues. Continuous load reproduces real bugs.
**How to apply:** multi-component integrations benefit from continuous replay on testnet.
**Skill seed:** "For multi-component integrations, suggest continuous replay script on testnet."

---

## [#12] UI prototype to feel the contract

**Source commits:** `86330ae6` Create a UI Prototype to feel the contract usage
**Pattern:**
> Pre-audit, build minimal UI walking through full lifecycle. Catalog UX friction (slippage semantics, etc.) that becomes latent bugs.
**Why it matters:** many bugs are discovered via UI (e.g., slippage bound flip in commit `c6fafd0e` was discovered via UI test).
**How to apply:** pre-audit, always create UI prototype of complete flow.
**Skill seed:** "Pre-audit, build minimal UI prototype of full lifecycle to discover UX/semantic bugs."

---

## [#13] Treasury setter as admin function

**Source commits:** `b961c09` Add a method to change the treasury address
**Pattern:**
> Treasury is mutable via admin (Factory owner). Allows migration when rake recipient changes (DAO transition).
**Why it matters:** hardcoded rake recipient = immutable fee = loss in organizational changes.
**How to apply:** all fee recipients should have admin setter (with 2-step ownership protecting the admin).
**Skill seed:** "Audit hardcoded recipients (treasury, dev, fee); all should have admin setter via 2-step owner."

---

## [#14] Network-specific scripts

**Source commits:** `a0a721f` (separate scripts)
**Pattern:**
> `LocalCollateral.s.sol` deploys USDC mock only locally; mainnet uses real USDC. Scripts gated by chain id.
**Why it matters:** prevents accidentally deploying mock on mainnet.
**How to apply:** scripts check `block.chainid` before network-specific actions.
**Skill seed:** "Deploy scripts: gate network-specific actions by block.chainid."

---

## [#15] Removing temp/build files in commits

**Source commits:** `6459e037` Add a graduate caller reward and remove temp files
**Pattern:**
> Clean temp files (build artifacts, debug logs, scratch files) before commit.
**Why it matters:** repo gets polluted; reviewers distracted; bloat history.
**How to apply:** `.gitignore` + pre-commit hook check.
**Skill seed:** "Audit repo for committed temp files; suggest `.gitignore` updates + pre-commit hook."
