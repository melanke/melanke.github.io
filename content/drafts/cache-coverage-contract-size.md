---
social-post: |-
  💡 Your build passes, tests are green — and Market.sol just quietly grew 200 bytes closer to the EIP-170 wall.

  In my latest article I walk through the snapshot workflow I use on American Spend to keep contract size and branch coverage observable across sprints — so regressions surface on a PR, not in a staging deploy or an audit report.

  If you're building on-chain systems and care about catching quality drift before it compounds, 👇 read the article below.

  hashtag#Solidity hashtag#SmartContracts hashtag#Foundry hashtag#Web3 hashtag#DeFi hashtag#EVM hashtag#SoftwareEngineering hashtag#CI_CD
---
# Snapshot Your Coverage and Contract Size — Or Find Out the Hard Way

There's a class of regression nobody talks about until it bites them: the kind where the build still passes, all tests are green, and the contract is quietly 200 bytes larger than it was last week. Nobody wrote a bug. Nobody removed a test. The decay was silent.

I've been building American Spend — a prediction market protocol at 33Labs — and `Market.sol` spent weeks hovering around 22 KB. A careless refactor can push it over the EIP-170 24 KB limit without any CI alarm. Coverage has the same problem: a new code path gets added, no test covers it, and the gap only becomes visible when an auditor points it out or a bug ships to production.

The fix isn't complicated. It's discipline: **snapshot your last good run, then compare on every PR.**

---

### Why "passing tests" isn't enough

Code coverage and contract size are both *aggregate* metrics — they don't fail fast on a per-function basis the way a unit test does. You can add a new branch inside `claimYield()`, write zero tests for it, ship it, and every existing test still passes. The coverage number dropped by a fraction. Nobody noticed.

Contract size is even sneakier. The EIP-170 limit is hard — deploy fails at 24,576 bytes — but you don't hit it all at once. You creep toward it. A new error variant here, a new modifier there, a view function that should've gone into the Lens companion contract instead. One day you try to deploy to staging and the transaction reverts. That is a terrible time to discover you've been on a slow drift for three sprints.

What I've learned from building American Spend: the only way to stay ahead of both is to **treat the previous run as a baseline** and diff every change against it.

---

### The two numbers worth tracking

**Coverage** — specifically branch coverage, not just line coverage. Line coverage gives you a green bar even when you've never exercised the `false` side of a conditional. Branch coverage forces both paths. In Foundry:

```bash
forge coverage --report lcov
```

This produces `lcov.info`, which VS Code Coverage Gutters can render inline, and which CI can threshold-check. We run it on every push. The number that matters is the *delta* — if coverage dropped from 91% to 87%, something was added without tests.

**Contract size** — the runtime bytecode, not the artifact JSON size. Foundry gives you this:

```bash
forge build --sizes
```

The output is a table: every deployed contract gets a row with its runtime size in bytes. When we moved view methods out of `Market.sol` into `MarketLens.sol` we bought roughly 1 KB of breathing room. That breathing room has been spent — slowly — over subsequent sprints. Without a snapshot, you'd never know where it went.

---

### What "snapshotting" actually looks like

The pattern is simpler than it sounds. After a clean run on `main`, you cache the numbers in a file committed to the repo:

```json
{
  "timestamp": "2026-04-15",
  "git_sha": "f733c9a",
  "coverage": {
    "branch": 91.4,
    "line": 94.2
  },
  "contract_sizes": {
    "Market": 22318,
    "MarketFactory": 6102,
    "CLOB": 18940
  }
}
```

Call it `tooling/baseline.json`, or `ci/last-good.json` — the name doesn't matter. What matters is that it's in source control, it's human-readable, and it's produced by a script, not hand-edited.

Then on CI, a comparison script diffs the current run against the snapshot and fails the build if:

- Any contract grew by more than N bytes (I use 500 as a warning, hard fail at 1 KB growth)
- Branch coverage dropped by more than 1 percentage point

The numbers are arbitrary — pick thresholds that match your tolerance. The point is making regression *visible* before it becomes a production incident.

---

### Building the comparison into the Foundry workflow

Here's the shape of the comparison script (TypeScript or bash, doesn't matter):

```typescript
const baseline = JSON.parse(fs.readFileSync("tooling/baseline.json"));
const current  = parseFoundrySizes(execSync("forge build --sizes").toString());

for (const [contract, size] of Object.entries(current)) {
  const delta = size - (baseline.contract_sizes[contract] ?? 0);
  if (delta > WARN_BYTES) {
    console.warn(`⚠ ${contract}: +${delta} bytes`);
  }
  if (delta > FAIL_BYTES) {
    process.exit(1);
  }
}
```

The CLOB performance report in American Spend (`CLOB_ORDERBOOK_PERFORMANCE_REPORT.md`) was generated by a similar idea — run four implementations against the same benchmark, produce a markdown file, commit it. The insight transfers: *architecture decisions need data, and data needs to be captured and versioned*.

The coverage side is even simpler — `forge coverage --report lcov` already writes a file. The CI step just needs to parse the summary line and compare it against the baseline.

---

### The optimizer_runs trade-off

There's one wrinkle worth naming explicitly. In American Spend we use `optimizer_runs = 1` in `foundry.toml` for `Market.sol` — the optimizer setting that minimizes bytecode size at the cost of slightly higher runtime gas per call. This was the right call when `Market.sol` was approaching the limit.

**Key trade-off:** `optimizer_runs = 1` optimizes for *deploy size*. Hot paths — matching, resolution, claim — get marginally more expensive at runtime. For a contract like Market that's called frequently but needs to fit in 24 KB, this is the correct direction. For `MarketMath`, a pure math library called in loops, high `optimizer_runs` (200+) is better.

The practical implication: if you're snapshotting contract sizes and you're not pinning `optimizer_runs`, your baseline is meaningless — a Foundry update can shift bytecode size by hundreds of bytes even with identical source. Pin Foundry version in CI (`foundryup --version v1.7.0`) and pin the optimizer setting. Both belong in `foundry.toml` and in the snapshot file.

---

### When coverage gaps are a feature, not a bug

There's a subtlety I ran into during audit prep for American Spend. Improving coverage led to removing code — specifically, unreachable branches that existed as defensive checks.

Running coverage revealed branches that were never hit. Some were legitimately missing tests. Others were conditions that *could not* be true given the surrounding state machine — they existed because an earlier version of the function had different preconditions, and the refactor left the guard orphaned.

The right response to an unreachable branch is not to write a test that forces a state the contract can't actually reach. It's to confirm the branch is dead — trace the invariants, verify no path reaches it — and then delete it. Less bytecode, fewer moving parts, cleaner audit.

> 📝 *Note:* Coverage tells you which branches were never exercised. It doesn't tell you *why* — that's detective work. Slither fills a different gap: it flags structural issues like shadowed variables, reentrancy surfaces, and type issues that coverage can't surface. Running both regularly gives you two different lenses on the same codebase.

---

### Making it a habit, not a chore

The meta-lesson here is that this only works if the snapshot is updated deliberately. The workflow I use:

1. Open a PR with the intended change.
2. CI runs, compares against baseline, reports deltas.
3. If growth is acceptable (say, I added a new function family and the 800-byte increase is expected), I update `baseline.json` in the same PR with a commit message that explains *why*.
4. Reviewers see the delta alongside the code diff and can sanity-check the explanation.

This turns a footgun into a conversation. Instead of "the contract is mysteriously large," you have a commit history of intentional decisions: "moved view logic to Lens: −1,250 bytes," "added nonReentrant guards: +180 bytes," "extracted MarketMath library: −600 bytes."

That history is also invaluable for auditors. It shows the evolution of size constraints and demonstrates that the team has been deliberate — not just "it fits" but a timestamped trail of what was moved, extracted, or removed to make it fit.

---

### Final thought

Coverage and contract size are the kind of health metrics that feel boring until they aren't. Nobody celebrates 91% branch coverage. Nobody notices the contract growing 40 bytes per sprint. But after enough sprints — or after a failed deploy, or an auditor pointing at an untested path in a critical function — the cost of not tracking becomes very concrete.

The snapshot pattern is one of those small infrastructure investments that pays for itself immediately and keeps paying. Build a baseline. Diff against it on every PR. Update it deliberately when you ship new functionality. That's it. No fancy tooling required — just discipline and a JSON file in source control.

---

If you're building on-chain systems and care about keeping quality metrics observable across sprints, I'd love to compare notes. Feel free to connect or message me — I'm always open to exchanging ideas with other builders who've been through the same drift.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*

