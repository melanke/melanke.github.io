---
linkedin-post: |-
  🔧 Most teams wire up CI after the first messy PR. That's too late.

  In my latest article, I walk through the full Solidity pipeline I set up before
  writing a single contract on American Spend — every gate, why it belongs there,
  and which ones are too heavy for PRs and belong in a nightly run instead.

  If you're building a Solidity protocol and want to know what a lean, opinionated
  security pipeline looks like from day one, this one's for you.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#Blockchain hashtag#Ethereum hashtag#DeFi hashtag#Foundry hashtag#CI_CD hashtag#Web3 hashtag#SoftwareEngineering hashtag#AuditPrep hashtag#FormalVerification
linkedin-url:
summary: >-
  Ten CI gates built before writing the first contract — from formatter
  enforcement to Slither, Semgrep, and NatSpec checks. Which ones block PRs,
  which ones run nightly, and what the pipeline looked like when the auditor
  opened the repo.
og-image: /blog-images/the-solidity-ci-pipeline-you-should-have-set-up-on-day-one.png
published-at: '2026-06-12T12:00:00.000+00:00'
---
Most teams wire up CI after the first messy PR review. Someone merges unformatted code, a test breaks in production, Slither spits out fifty warnings no one remembers how to triage — and only then does someone say "we should automate this." From my experience, that's exactly the wrong time to build your CI pipeline. The right time is before you write your first contract.

This isn't about being process-heavy. It's the opposite. A lean, opinionated pipeline set up on day one means you never have to argue about formatting, never wonder if CI matches your local build, and never hand an auditor a codebase running Slither warnings you can't explain. It's just less noise — permanently.

Working on American Spend, a prediction-market protocol with a CLOB, vault yield mechanics, and ERC6909 outcome tokens, I learned which gates actually matter and when they should bite you. This is that pipeline.

> **TL;DR:** Everything described here is already wired up at [melanke/foundry-security-template](https://github.com/melanke/foundry-security-template).

---

### Gate 1: Lock Your Foundry Version

The first thing I add to any new project is a Foundry version pin. Not "install the latest" — a specific version. In our CI:

```yaml
- name: Install Foundry
  uses: foundry-rs/foundry-toolchain@v1
  with:
    version: 'v1.7.0'
```

**Why it matters:** Foundry updates change gas semantics. A refactor that passes locally on `nightly` might fail on a peer's machine running last month's build — or worse, the gas benchmark watermarks shift silently. When we added a gas-budget stress test for the CLOB matching engine (ensuring at least 1,400 consecutive fills within a 30M gas block), an unintentional Foundry upgrade would have made that assertion meaningless without anyone noticing.

**Key trade-off:** You have to intentionally upgrade. That's not a downside — that's the point. Treat Foundry as a dependency, not ambient infrastructure.

Pair this with `lib/` submodules pinned to specific commits, not branches. Reproducible builds aren't just for production deployments.

---

### Gate 2: Formatting as a Hard Block — Not a Suggestion

```yaml
- run: forge fmt --check
```

This runs before tests. If code isn't formatted, the pipeline dies there. Not a warning — a failure.

The formatter config lives in `foundry.toml`:

```toml
[fmt]
line_length = 80
int_types = "long"
number_underscore = "thousands"
bracket_spacing = false
wrap_comments = true
```

`int_types = "long"` means `uint256`, never `uint` — explicit types eliminate ABI-level surprises in signatures and storage layout. `number_underscore = "thousands"` means `10_000` instead of `10000`, removing a real category of digit-counting bugs once your constants get long. These aren't aesthetic choices — they make code review faster because reviewers aren't squinting at digit counts or guessing what `uint` resolves to.

**Key trade-off:** If you add this gate to an existing project, the first `forge fmt` commit will touch hundreds of lines. Do it in a single dedicated commit with a message that makes clear it's formatting-only — reviewers can skip it, and git blame stays meaningful afterward. Do it once, do it early, and you never touch it again.

---

### Gate 3: Build and Test — The Obvious One

```yaml
- run: forge build
- run: forge test
```

Two non-obvious points hide in this gate.

**Compile separately**: run `forge build` before `forge test`. Build errors produce cleaner output than test failures caused by compile errors — debugging is faster when you know exactly which stage broke.

**Warnings still pass the build**: `forge build` succeeds even with unused variables, shadowed state, unreachable code. Those warnings are information. They often indicate dead code that confuses auditors or, worse, logic paths the team forgot to test.

My rule: **warning-free from the first commit.** Fix warnings the moment they appear rather than accumulating them into a pile you'll never triage. In American Spend, we ran this discipline through the whole lifecycle — by the time we hit audit prep, there was nothing to clean up because it was already clean.

---

### Gate 4: Coverage Threshold

```yaml
- run: forge coverage --report lcov
```

I don't enforce a rigid percentage and pretend that's the whole story — but I do enforce a threshold check on main. The number matters less than the discipline of looking at it. Gaps in coverage mean one of two things: dead code (remove it) or missing tests (write them). Either way, you want to know.

The `--report lcov` output generates `lcov.info`, which integrates with VS Code Coverage Gutters. During active development, I have that extension open. You can see exactly which branches are untested as you write the code — not in CI, not in a separate review, but right there in the editor. That tight feedback loop changes how you write tests.

**Key trade-off:** Coverage instrumentation distorts gas readings. If you have gas-budget stress tests, you need to skip those under coverage. Mixing coverage with gas assertions produces garbage numbers. A separate `[profile.coverage]` in `foundry.toml` handles this cleanly — run gas-heavy tests under the default profile, coverage under the coverage profile.

---

### Gate 5: Optimizer Settings — Pick Your Bottleneck

This one trips up almost every team building a complex Solidity system, and it bit us too. EIP-170 caps runtime bytecode at 24,576 bytes. Once your contract gets complex enough — Market.sol with its CLOB integration, vault yield mechanics, and multi-phase lifecycle — you hit that wall.

The fix is `optimizer_runs = 1`:

```toml
[profile.default]
optimizer = true
optimizer_runs = 1
```

Low `optimizer_runs` tells the compiler to optimize for deployment size rather than runtime gas. High runs (think 10,000+) optimize for repeated calls — great for math libraries called in loops, bad for large contracts fighting the size limit.

**Key trade-off:** `optimizer_runs = 1` makes hot paths slightly more expensive per call, and it shifts more of the optimization burden onto you. With high runs, the compiler does the heavy lifting — inlining, deduplication, hoisting common subexpressions. At runs=1, much of that work doesn't happen, so the developer has to compensate manually: caching SLOADs explicitly, choosing `calldata` over `memory` deliberately, avoiding redundant arithmetic.

The insight is that `optimizer_runs` is a per-contract decision, not a project-wide setting. We set it at the project level for the size-constrained contracts and extracted the math-heavy logic into libraries that could run with different settings.

---

### Gate 6: Contract Size Check

`optimizer_runs = 1` buys you headroom — but only if you actually measure. CI is where you enforce that the headroom doesn't quietly evaporate as features land.

```yaml
- name: Enforce EIP-170 size limit
  run: |
    SIZES=$(forge build --sizes --json)
    VIOLATIONS=$(echo "$SIZES" | jq -r '
      to_entries[]
      | select(.value.runtime_size > 24576)
      | "  \(.key): \(.value.runtime_size)B"
    ')
    if [ -n "$VIOLATIONS" ]; then
      echo "EIP-170 violations detected:"
      echo "$VIOLATIONS"
      exit 1
    fi
    echo "All contracts within EIP-170 limit"
```

One thing worth knowing: `forge build --sizes --json` returns a **JSON object** keyed by contract name — not an array. The `to_entries[]` call is what unwraps it for filtering; without it the `select` never runs and violations slip through silently.

`forge build --sizes` also prints a human-readable table in the logs, so reviewers see "Market.sol +312 bytes" on every PR and can ask whether that's expected. That conversation, on every PR, is the discipline that keeps you off the cliff.

---

### Gate 7: Slither — The Static Analysis You Actually Use

```yaml
slither:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        submodules: recursive
    - uses: crytic/slither-action@v0.4.0
      with:
        target: '.'
        slither-config: slither.config.json
        fail-on: all
```

Slither runs as a separate job, not part of the test job. Why separate? Because Slither failures have different implications than test failures. A test failure means broken code. A Slither warning might mean broken code, or it might be an accepted trade-off you documented.

The workflow I follow:

1. Run `slither .` with no suppression
2. Triage every warning — is this actionable or acceptable?
3. Fix the actionable ones immediately
4. Document the acceptable ones in `KNOWN_ISSUES.md` with a one-paragraph justification
5. Suppress at the narrowest scope that fits — inline comment for a single occurrence, project-level config only when the detector is broadly noisy

That `KNOWN_ISSUES.md` file is worth its weight when an auditor opens the repo. "We know about this; here's why we accept it" is a completely different signal than silence.

For a one-off suppression:

```solidity
// block.timestamp is a coarse clock for the ~30 min resolution delay — exact ordering doesn't matter.
// See KNOWN_ISSUES.md §timestamp.
// slither-disable-next-line timestamp
require(block.timestamp >= resolutionTime, "TooEarly");
```

Project-level suppression in `slither.config.json`:

```json
{
  "filter_paths": "lib/",
  "detectors_to_exclude": []
}
```

`filter_paths: "lib/"` is the first thing to set — you want Slither analyzing your code, not vendored dependencies. Start with `detectors_to_exclude` empty and add only what you've explicitly triaged.

---

### Gate 8: Semgrep — Pattern-Based Security Checks Slither Doesn't Cover

Slither does data-flow analysis — it traces how values move through a contract and flags known dangerous patterns. Semgrep does something different: it matches code structure against rules, the way grep matches text but with AST-level precision. The two tools cover different attack surfaces, and running them together means fewer blind spots.

The community ruleset I reach for is [Decurity's semgrep-smart-contracts](https://github.com/Decurity/semgrep-smart-contracts): 50+ Solidity-specific rules derived from real post-mortems — reentrancy via ERC677/ERC721/ERC777 callbacks, unprotected Uniswap flash callbacks, proxy storage collisions, missing `Ownable2Step`. About a third are specific to protocols like Compound or Curve. Not every rule will fire in your codebase, and that's fine — a static analyzer with no findings isn't wasted effort.

```yaml
- name: Install semgrep
  run: pip install semgrep

- name: Clone Decurity rules
  run: git clone --depth 1 https://github.com/Decurity/semgrep-smart-contracts /tmp/decurity-semgrep

- name: Run semgrep
  run: |
    semgrep \
      --config /tmp/decurity-semgrep/solidity/ \
      --config .semgrep/ \
      --error \
      src/
```

The `--config .semgrep/` is where project-specific rules live — patterns derived from your own conventions and AGENTS.md. Working on American Spend, I noticed three gaps the community ruleset didn't cover: bare `safeTransfer` inside loops (the push-payment freeze pattern that bricked more than one finalization path in production DeFi), `revert` inside loops over shared state, and UUPS implementation constructors missing `_disableInitializers()`. Two of those are patterns Slither doesn't reliably catch either.

Suppression is lighter than Slither's. A single inline comment is enough — no `KNOWN_ISSUES.md` entry required. But the reason still needs to be there, same as with Slither:

```solidity
// Snapshot taken immediately after settlement; no external call between snapshot and use.
// nosemgrep: exact-balance-check
uint256 snapshot = token.balanceOf(address(this));
```

**Key trade-off:** The Decurity ruleset runs everything — including rules specific to Compound forks, Curve integrations, and OlympusDAO patterns. If you're not integrating those protocols, those rules add noise to the finding count and occasionally flag coincidental matches. Suppress inline and move on. The signal-to-noise ratio across the whole ruleset is high enough to justify running it unfiltered.

---

### Gate 9: Mutation Testing — The Honest Version

Mutation testing answers a question coverage doesn't: if there were a bug here, would your tests find it? The tool makes small changes to your source — flipping operators, removing conditions — and runs your test suite against each mutant. If a mutant survives, you have a gap.

`slither-mutate` ships with Slither, so no extra toolchain. It scopes to specific contracts via `--contract-names`, matching the diff-based approach:

```yaml
- name: Run mutation testing on changed contracts
  run: |
    BASE="${{ github.base_ref }}"
    CHANGED=$(git diff --name-only "origin/${BASE}...HEAD" -- 'src/**/*.sol' \
      | sed 's|.*/||; s|\.sol$||' | tr '\n' ',')
    CHANGED="${CHANGED%,}"
    if [ -z "$CHANGED" ]; then exit 0; fi
    slither-mutate . \
      --test-cmd "forge test" \
      --ignore-dirs lib/ \
      --timeout 120 \
      --contract-names "$CHANGED"
```

**Key trade-off:** `slither-mutate` invokes a full crytic-compile cycle per mutant — roughly 30–40 seconds each. A contract with 50 mutants takes 30+ minutes. That's too slow for per-PR gates. In practice, mutation testing belongs in a **nightly run**, not the PR pipeline. It reports surviving mutants without blocking CI (exits 0 regardless), so the workflow is: triage the output once a day and address gaps before they accumulate.

For each surviving mutant, choose one of two paths:

- **Semantically equivalent** (e.g., `a++` vs `++a` where the return value is unused): document in `KNOWN_ISSUES.md` — it cannot be killed by a meaningful test.
- **Real gap**: write the missing assertion.

---

### Gate 10: Lintspec — NatSpec as a Hard Requirement

NatSpec is what an auditor reads when they want to understand your intent, not just your implementation. A function that does the right thing but documents nothing forces the auditor to reverse-engineer the expected behavior from code — slower, more error-prone, and a signal that the codebase wasn't written with review in mind.

Lintspec enforces NatSpec completeness as a CI gate. It checks every public and external function, event, error, and struct for missing `@notice`, `@param`, and `@return` tags — and fails the job if anything is absent.

```yaml
lintspec:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: beeb/lintspec@v0.12.2
      with:
        fail-on-problem: "true"
```

Configuration lives in `.lintspec.toml` — run `lintspec init` to generate it, then adjust visibility rules. Set `paths = ["src"]` there rather than passing it to the action input; newer versions of lintspec expect an array and the action passes a plain string, which breaks the job. By default, enforce on public and external items. Whether to also require NatSpec on internal functions is a judgment call; I require it for anything with non-obvious behavior, skip it for simple getters.

One other thing to watch: the `inheritdoc` setting defaults to `true` in recent releases, which flags functions that don't implement an interface as missing `@inheritdoc`. For contracts that don't implement interfaces, set `inheritdoc = false` in `.lintspec.toml`.

**Key trade-off:** Adding this gate to an existing codebase will generate a wall of failures on the first run. Same as the formatting gate — do it in a single dedicated commit, fix everything at once, and from that point forward the gate keeps the bar where you set it.

---

### The Nightly Pipeline

Some gates are too heavy for every PR but too valuable to skip entirely. I run three of them nightly:

**Mutation testing** (covered above) — `slither-mutate` on all `src/` contracts, 10-minute budget. Daily signal without blocking PRs.

**Property-based fuzzing** — Medusa with the [Recon/Chimera pattern](https://getrecon.xyz). The Chimera pattern generates a `CryticToFoundry` contract that runs the same property tests under Medusa, Echidna, and Foundry's invariant runner. The key is corpus persistence: each nightly run builds on the last, and the fuzzer's coverage compounds over weeks in ways a single PR run never could.

```yaml
- name: Run Medusa
  run: medusa fuzz --config medusa.json --timeout 600
```

The corpus is saved to GitHub Actions cache between runs — not committed to the repo, but accumulated there.

**Formal verification** — Halmos for symbolic proofs. Tests prefixed `check_` are treated as formal proofs: Halmos uses symbolic execution to find any input that violates the assertion, or proves none exists. Unlike fuzz tests, a passing `check_` is a guarantee over all inputs within the specified bounds.

```solidity
function check_increment(uint256 initial) public {
    vm.assume(initial < type(uint256).max);
    counter.setNumber(initial);
    counter.increment();
    assert(counter.number() == initial + 1);
}
```

Halmos is deterministic and fast on simple contracts — the three proofs above run in under a second. Complexity scales with loop depth and external calls; add `--loop` bounds and `--solver-timeout-assertion` as needed.

---

### Git Hooks — Moving the Feedback Loop Earlier

For some teams, part of this pipeline lives one step earlier — as git hooks firing on `pre-commit` or `pre-push`. The upside is fast feedback: a failing format check in two seconds beats the same failure in a CI job five minutes later. The downside is real too — slow hooks push developers straight to `--no-verify`.

My rule: keep `pre-commit` cheap and deterministic, let CI carry the slow gates.

The cleanest implementation: a `.githooks/` directory committed to the repo, activated with a single command after cloning.

```bash
bash scripts/install-hooks.sh
```

Which runs:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

No copying, no per-developer setup beyond running one script. The hooks live in version control alongside the code, so the team always has the same hooks.

**`pre-commit`** — runs in under five seconds:

```bash
forge fmt --check
forge build
```

**`pre-push`** — runs the full test suite before anything reaches the remote:

```bash
forge test
```

If tests become slow enough to impede flow, move `forge test` out of `pre-push` and let CI carry it. The hook speeds up the loop; it doesn't replace CI.

---

### Putting It Together

Two pipelines, not one.

**Per-PR (blocking):**

```yaml
test:
  - forge fmt --check
  - forge build
  - forge build --sizes --json  # EIP-170 check
  - forge test
  - forge coverage --report lcov

slither:
  - crytic/slither-action

semgrep:
  - pip install semgrep
  - git clone decurity-semgrep-smart-contracts
  - semgrep --config decurity/solidity/ --config .semgrep/

lintspec:
  - beeb/lintspec
```

**Nightly (reporting):**

```yaml
medusa:
  - medusa fuzz --config medusa.json --timeout 600

halmos:
  - halmos --match-contract ProofTest

mutation:
  - slither-mutate . --test-cmd "forge test" --ignore-dirs lib/
```

Each gate enforces exactly one contract:

- Foundry version pin → build reproducibility
- `forge fmt --check` → style consistency
- `forge build` → compilation correctness, warning visibility
- `forge build --sizes` → EIP-170 ceiling enforcement
- `forge test` → behavioral correctness
- `forge coverage` → test coverage floor
- `slither` → static analysis, documented trade-offs
- `semgrep` → pattern-based security checks, custom project conventions
- `lintspec` → NatSpec completeness
- `slither-mutate` → mutation testing, test gap detection
- Medusa → property-based fuzzing with corpus accumulation
- Halmos → formal verification within bounded input spaces

---

### The Compounding Benefit

Here's what I've learned from running this discipline across multiple codebases: the return is front-loaded but compounds. The first week, the formatting gate feels annoying — it rejects PRs for whitespace. By month two, you've stopped thinking about formatting entirely. By audit time, the Slither job has no new warnings because every warning has either been fixed or documented since day one.

When we handed American Spend to an auditor, the repo had `KNOWN_ISSUES.md`, `INVARIANTS.md`, and a CI pipeline that had been green on main for months. Every Slither warning had been triaged or documented. The auditor could focus on business logic — which is where the real bugs live — rather than triaging lint warnings or chasing formatting noise.

That's not magic. It's the seatbelt: not exciting, invisible when working, clearly worth it when it matters.

---

If you want a starting point with all of this already wired up — the CI workflows, git hooks, Recon/Chimera scaffolding, Medusa and Echidna configs, Halmos proof structure, and every configuration decision documented — I published it as a GitHub template: [melanke/foundry-security-template](https://github.com/melanke/foundry-security-template). Use it as a reference or click "Use this template" to start your next protocol with the pipeline already in place.

---

If you're building a Solidity protocol and want to compare notes on CI setup, tooling choices, or audit prep workflows, feel free to connect. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
