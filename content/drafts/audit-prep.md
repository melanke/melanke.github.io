---
social-post: |-
  💡 The difference between a smooth audit and a painful one isn't the auditor — it's what you hand them.

  Building American Spend (a CLOB prediction market with ERC6909 outcome tokens and a vault yield layer), we went through a full audit cycle. By finding #21, I started recognizing patterns.

  In my latest article, I walk through the preparation work we did before handing American Spend off to auditors — and what I'd do differently next time.

  If you're preparing a protocol for audit, this one's for you. 👇

  hashtag#SmartContracts hashtag#Solidity hashtag#Web3Security hashtag#DeFi hashtag#Ethereum hashtag#AuditPrep hashtag#Foundry hashtag#PredictionMarkets
---
# How to Prepare a Smart Contract for Audit — Lessons from a Production Prediction Market

From my experience, the difference between a smooth audit and a painful one isn't the quality of the auditor — it's the quality of the codebase they receive.

I've been building American Spend, a prediction market protocol on Ethereum with a CLOB matching engine, ERC6909 outcome tokens, and a vault yield layer. We went through a full audit cycle earlier this year. Somewhere around the 21st finding, I stopped being surprised and started recognizing patterns. Most of the bugs weren't exotic. They were the kind of thing that surfaces when you hand 12,000 lines of Solidity to someone who didn't write it and ask them to find where your mental model diverges from the code.

This is what I learned — not about what auditors look for, but about what you can do *before* they arrive.

---

### Give Auditors a Map Before They Open a Single File

The first thing an auditor does is build a mental model of your protocol. You can make that take two hours or two days. The difference is documentation.

Before our audit, we produced five documents that lived in the repo root:

- **`README.md`** — one-page overview: what the protocol does, who the actors are, the lifecycle at a glance
- **`SCOPE.md`** — every in-scope contract with line counts, every external dependency (vault, collateral token), every explicit out-of-scope component
- **`INVARIANTS.md`** — the properties the protocol must maintain at all times
- **`KNOWN_ISSUES.md`** — static analysis findings with "fix or accept" decisions documented
- **`PRD.md`** — the full product requirements (ours ran to 45KB; the auditor read every line)

The `SCOPE.md` alone saved us at least half a day of back-and-forth. "Does this token implementation count?" is a question you don't want to answer in a Telegram thread at 11pm.

**Key trade-off:** writing these documents takes real time — for us, probably two to three days of engineering effort. That time competes with features and fixes. But every hour spent on docs at this stage is worth several hours of auditor time saved, and auditor time is expensive.

---

### INVARIANTS.md Is Not Just Documentation — It's Executable Spec

The most useful document we produced was `INVARIANTS.md`. Not because it told auditors what to look for, but because writing it forced *us* to articulate things we had been assuming implicitly.

The invariants we documented for American Spend's market contract:

```
totalPool == sum(pools[outcome])
outcomeTotalSupply[i] == sum(userBalance[user][i])
payoutPool <= totalPool + seedFund
vaultAccountingFinalized -> resolved || cancelled
```

The third one — `payoutPool <= totalPool + seedFund` — was directly implicated in one of our most interesting findings. We had a per-user yield calculation that could produce a positive slice for a user even when the vault was in aggregate loss (because their entry share price was lower than average). Individually, the slice looked correct. Across all users, it violated the invariant. The fix was straightforward once you see it:

```solidity
// Wrong: compute per-user yield directly
uint256 userYield = (vaultSnapshot - userPrincipal);

// Right: compute aggregate surplus first, then slice
uint256 surplus = vaultSnapshot > totalPrincipal
    ? vaultSnapshot - totalPrincipal
    : 0;
uint256 userYield = (surplus * userShares) / totalShares;
```

The aggregate cap — `sum(slices) <= aggregate` — is an invariant class, not just a fix. If you're distributing anything (yield, rewards, refunds) across users, write it down and test it.

**Key trade-off:** invariants can create false confidence if they're not kept in sync with the code. A stale `INVARIANTS.md` is worse than no document at all — it points auditors in the wrong direction. Treat it as living documentation with a CI check.

---

### Run Slither Before the Auditor Does

This one is unglamorous but important. Run `slither .`, triage every finding, and document your decisions. For each finding: fix it, or write down why you're accepting it in `KNOWN_ISSUES.md`.

The act of triaging Slither output before the audit serves two purposes. First, it removes noise from the auditor's signal — they don't waste time on timestamp dependency warnings in a DeFi context where everyone accepts this. Second, it demonstrates that you take security seriously. "We knew about this, we evaluated it, we made a trade-off" reads very differently than silence.

For suppressions, we used `slither.config.json` with a reason comment for each:

```json
{
  "filter_paths": "test/",
  "exclude_detectors": ["timestamp"],
  "exclude_optimization": true
}
```

`filter_paths` keeps test files out of analysis; `exclude_detectors` removes checks you've consciously accepted. Each excluded check also got a line in `KNOWN_ISSUES.md` explaining the decision. Auditors appreciate transparency over silence, every time.

**Key trade-off:** suppressing Slither warnings has a real cost — you might suppress something that matters. Keep the bar high. If you're not certain a finding is a false positive or an accepted trade-off, fix it.

---

### Organize Tests So an Outsider Can Read Them

An auditor reading your test suite is trying to answer: what is this contract supposed to do, and is that what it actually does? If your tests are flat files named `MarketTest.t.sol` with 200 functions and no structure, they've extracted very little useful signal.

We reorganized our test suite into a four-level hierarchy:

```
test/
  base/          # shared state, fixtures, helpers
  unit/          # single-function behavior
  integration/   # multi-contract, multi-step scenarios
  fuzz/          # invariant tests with handlers
```

And standardized all function names to Gherkin format:

```solidity
/// @dev Given: Market in Phase 1
/// When: buyOnPhase1 called with zero amount
/// Then: Reverts with ZeroTokenOutput
function test_Given_marketInPhase1_When_buyWithZeroAmount_Then_reverts()
    public
{
    // arrange
    vm.prank(user);
    // act + assert
    vm.expectRevert(Market.ZeroTokenOutput.selector);
    market.buyOnPhase1(0, maxOdds);
}
```

An auditor can read that function name and know exactly what scenario it covers. They can grep for `Given_marketInPhase1` and find every test touching that state. That's signal.

**Key trade-off:** renaming 200 test functions takes a day. Not renaming them taxes auditors for the entire engagement. We did the work before the audit window opened.

---

### Coverage Gaps Are Either Dead Code or Missing Tests — Neither Is Acceptable

We ran `forge coverage --report lcov` and set a 90% branch coverage threshold in CI. What we found surprised me less than how clearly it surfaced problems.

A branch with zero coverage is one of two things: dead code that never runs, or a scenario you haven't tested. Both are red flags in an audit. Dead code confuses the auditor ("if this revert is unreachable, why is it here?"), and untested branches are where bugs hide.

When we audited our own coverage gaps, we found several branches that were genuinely unreachable — defensive checks that an earlier refactor had made impossible to hit. We removed them. That's a better outcome than an auditor flagging them as potentially significant.

```bash
forge coverage --report lcov
# check summary in terminal; open lcov.info in VS Code Coverage Gutters
```

The `--report lcov` flag produces a file you can browse line-by-line in VS Code with the Coverage Gutters extension — you see exactly which branches are green, which are red, and which are dead.

**Key trade-off:** high coverage thresholds slow down development if they're not designed well. A coverage check without understanding *which* branches matter is bureaucracy. Use it as a signal, not a gate — and investigate every gap rather than padding with trivial tests to hit the number.

---

### Every External Mutating Function Needs a Reentrancy Guard

This one should be automatic, but it wasn't — not fully — until we audited it explicitly.

We use `ReentrancyGuardTransient` (TSTORE/TLOAD, EVM Cancun) on all external functions that perform transfers or state mutations. Transient storage clears between transactions without the persistence cost of storage-based guards, which matters on a CLOB where multiple transactions hit the same contract per block.

The modifier ordering is not obvious: `nonReentrant` should always come before auth modifiers like `onlyOwner`. If the guard is outermost, nothing runs before it — not even an access control check that might call into another contract internally.

```solidity
// Wrong order
function placeOrder(...) external onlyOpen nonReentrant returns (...) { }

// Right order — guard runs before anything else
function placeOrder(...) external nonReentrant onlyOpen returns (...) { }
```

We scanned every external function with `grep -n "external" src/**/*.sol` and confirmed each had a guard. During audit, we added `nonReentrant` to `cancelAllOrders` and `processFinalizationBatch` — neither was obvious on first read, but both perform transfers in loops.

**Key trade-off:** transient reentrancy guards add a small gas cost per call. On functions like `placeOrder` called thousands of times per day, this is real. But the alternative is a reentrancy vector, and that cost is much higher.

---

### Audit Fix Commits Are a Deliverable, Not an Afterthought

When findings come in, how you fix them matters as much as what you fix. We adopted a strict convention: one finding, one commit, with the issue number in the message.

```
Cap aggregate yield claims at realized vault surplus. Fix #17
Escrow failed buy refunds to unblock blacklisted finalization. Fix #5 #8
Track vault finalization with a flag to keep redeem idempotent. Fix #18
```

This discipline does two things. First, the auditor can verify each fix in isolation — no hunting through a 500-line commit to find the three lines that address issue 17. Second, when you re-apply fixes on a clean branch for re-audit, the cherry-pick is clean and traceable.

After our first audit round, we rebased all fixes onto a clean base branch. The re-audit was faster because the history was linear and the commit messages made the fix intent explicit.

**Key trade-off:** this workflow requires discipline when you're under pressure to ship. The temptation is to batch fixes. Resist it — a batched fix commit is invisible to the re-auditor.

---

### The Real Point of Audit Prep

Looking back, the audit prep work probably took two weeks of engineering time. Some of it surfaced bugs before the audit even started — the idempotency bug (using a zero-value check where zero was a legitimate vault loss scenario) was something we caught while writing `INVARIANTS.md`, not during the formal audit.

The codebase goes into the audit. But what you've written *about* the codebase — the invariants, the scope, the known issues — is what makes the audit productive. It's the same discipline that makes code reviewable and maintainable: making your mental model explicit in a form that can be examined and challenged by someone who wasn't there when you made the decisions.

---

If you're preparing a smart contract protocol for audit and want to compare notes on what worked and what didn't, feel free to connect. I'm always open to exchanging ideas with other builders who care about this.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*

