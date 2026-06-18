---
social-post: |-
  🤔 90% branch coverage and still shipping bugs — how is that possible?

  In my latest article, I explore the gap between tests that run and tests that actually catch bugs — and the tooling I used to measure it before sending the American Spend contracts to audit.

  If you're preparing a Solidity codebase for review, this one is worth a read before you run Slither.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#MutationTesting hashtag#Web3Security hashtag#Foundry hashtag#AuditPrep hashtag#DeFi hashtag#SoftwareEngineering
---

# Mutation Testing for Solidity: The Honest Metric Behind Test Suite Quality

Line coverage is a lie — or at least a very comfortable half-truth.

I've stared at `forge coverage` outputs showing 90%+ branch coverage and felt good about a codebase, only to realize later that most of those covered branches were trivially exercised by tests that didn't assert the right thing. The tests ran. The lines were touched. And the bugs sat there quietly, completely invisible.

That gap between "we have tests" and "our tests actually catch bugs" is what **mutation testing** was built to expose.

---

### What Mutation Testing Actually Is

The idea is deceptively simple. A mutation testing tool takes your production code, introduces a small deliberate change — a **mutant** — and then runs your test suite. If your tests still pass after the change, something is wrong. Either the test isn't asserting the right behavior, or the code is dead.

The kinds of mutations are intentionally minimal: swap `+` for `-`, flip `>` to `>=`, delete a `require`, change a == to !=. Each one of these is something that could appear in a real bug — a copy-paste error, an off-by-one, an accidentally removed guard.

The output is a **mutation score**: the percentage of mutants that your tests actually killed. 80% coverage at 30% mutation score tells you something very specific — you're touching the code, but you're not checking what it does.

For Solidity, the main tools are:

- **Vertigo-rs** — fast, built on Foundry, runs your existing test suite against each mutant
- **Gambit** — mutation engine from Certora, generates a full batch of mutants for manual or automated triage
- **Slither-mutate** — part of the Trail of Bits toolkit, integrates with static analysis workflow

They all follow the same core loop: generate mutants, run tests, report survivors.

---

### Why Coverage Doesn't Tell You This

When I was preparing the American Spend prediction market contracts for audit, I had a coverage check in CI with a hard threshold. Branch coverage above 90%. Tests were green. I felt confident.

Then I started looking at what the tests were actually asserting.

Some tests for state transitions were checking that the function didn't revert. That's it. They weren't checking that `totalPool` was updated correctly, that `pools[outcome]` stayed consistent, or that the invariant `sum(pools) == totalPool` held after the operation. The lines were covered. The assertions were close to worthless.

A mutation that flipped the sign in the pool accounting would have survived every single one of those tests. `forge coverage` would still report 90%+. Nothing would have warned me.

The invariant tests — written for `MarketInvariantHandler.t.sol` with handlers for `buyOnPhase1`, `mintCompleteSet`, `burnCompleteSet`, and `resolveMarket` — would have caught it immediately. Because invariants don't test execution paths. They test facts about the world after every operation. And that's exactly why invariant-driven tests are mutation-resistant by construction.

---

### What Survivors Actually Tell You

A mutant that survives your test suite is telling you one of three things:

1. **Your assertions are too weak.** The test covers the line but doesn't check the outcome that changed.
2. **The code is dead.** The branch is unreachable given real inputs, so no test ever exercises it.
3. **The behavior is equivalent.** The mutant doesn't actually change observable behavior in your system. These are rare but real.

In my experience, the first two cases are the useful signal. Dead code is a direct audit flag — during the American Spend audit prep, a coverage gap in a particular branch led me to remove a `require` that was logically impossible to reach. That's one fewer thing for an auditor to second-guess, and one fewer place for future contributors to get confused. Mutation testing would have surfaced it without me needing to manually trace execution paths.

The weak-assertion problem is more dangerous. It means you have tests that create a false sense of security. A test that calls `mintCompleteSet(1000)` and only checks that the call didn't revert is worse than no test in a subtle way: it consumes review time and CI budget while proving almost nothing about correctness.

---

### Running Vertigo-rs on a Foundry Project

For a Foundry project, Vertigo-rs is the most practical starting point. It plugs into your existing test setup with no test rewriting required.

```bash
# Install
cargo install vertigo-rs

# Run against your test suite
vertigo run --foundry-toml foundry.toml

# Focus on a specific contract
vertigo run --match-contract Market
```

The output gives you a list of mutants with their status — killed or survived — and the specific mutation applied. Survived mutants are your action items.

A simple example of what a surviving mutant might look like:

```solidity
// Original
function _updatePool(uint256 outcomeId, uint256 amount) internal {
    pools[outcomeId] += amount;
    totalPool += amount;
}

// Mutant (survived — your tests didn't notice)
function _updatePool(uint256 outcomeId, uint256 amount) internal {
    pools[outcomeId] += amount;
    // totalPool += amount; ← deleted
}
```

If this mutant survives, you have no test asserting `totalPool` stays consistent with the sum of `pools`. For a prediction market payout system, that's not a style issue — it's the core accounting invariant. A bug there means users get paid the wrong amount.

---

### The Audit Prep Connection

I'd argue mutation testing belongs in the same checklist as Slither and `forge coverage` when you're preparing for a security audit. Not as a replacement for either — as a third layer that catches what they miss.

Slither finds structural issues: missing reentrancy guards, integer overflow risks, dangerous patterns. Coverage finds untested code. Mutation testing finds tests that exist but don't assert enough.

The combination is what gives you real confidence. Before sending the American Spend codebase to audit, the process looked like this:

- Slither pass → fix actionable issues, document acceptable trade-offs in `KNOWN_ISSUES.md`
- Coverage report → gap audit: dead code or missing test? Remove or add accordingly
- Invariant handlers for every accounting aggregate → these act as always-on mutation killers
- (Mutation testing as the explicit validation that the handlers actually catch what they claim to)

An auditor reading a codebase with 80% mutation score has to assume that 20% of the logic isn't actually verified by the test suite. That's work they have to do manually. Every surviving mutant you leave in is scope you're handing back to the auditor.

---

### The Trade-off You Should Know About

Mutation testing is slow. Generating and running tests against 300 mutants on a moderately complex codebase can take 30–60 minutes, or more depending on suite speed. You're not going to run it on every commit.

**Key trade-off:** mutation testing is a periodic quality gate, not a CI loop fixture. The right cadence is before significant milestones — pre-audit, before a major refactor, after adding a new module. Running it weekly on `main` is probably the right rhythm once the project is stable. Running it on every PR is usually overkill.

The other limitation is equivalent mutants — mutations that are syntactically different but semantically identical in your specific system. These inflate your "survivors" count and require human triage. In practice, most survivors on a well-tested codebase are either weak assertions or dead code, so the noise is manageable.

There's also a tooling maturity gap. Vertigo-rs and Gambit are solid but younger than the equivalent tools in other ecosystems. Expect some rough edges: timeout handling, output formatting, integration with complex multi-contract projects. Plan time for setup, not just execution.

---

### Final Thought

Line coverage measures how much of your code a test runner touched. Mutation score measures how much of your code a test runner actually understood.

The second metric is harder to game. You can pad line coverage by calling functions without asserting anything meaningful. You can't pad mutation score — either your tests fail when the code changes, or they don't.

For smart contracts, where a weak assertion is the difference between a test suite and a false seatbelt, that distinction matters. It's not magic. It's not a replacement for sound logic or well-designed invariants. But it's the closest thing to an honest answer to the question: "Do our tests actually protect us?"

---

If you're preparing a Solidity codebase for audit or just want an honest read on how good your test suite really is, I'd love to hear how you've approached it. Feel free to connect or message me — I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
