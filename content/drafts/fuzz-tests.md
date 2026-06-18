---
social-post: |-
  🧠 Your test suite is green. Your staging deploy is clean. Then a bug report arrives — from a call sequence nobody thought to try.

  In my latest article, I share how I approached fuzz and invariant testing for American Spend's market contracts — what forced me to think differently about correctness, and what a passing unit test can silently hide.

  If you're prepping a DeFi protocol for audit or wrestling with state drift you can't reproduce, this one is for you.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#Foundry hashtag#FuzzTesting hashtag#DeFi hashtag#Web3 hashtag#BlockchainSecurity hashtag#AuditPrep
---
# Fuzz and Invariant Testing in Solidity: From `deposit(100)` Tests to Conservation Laws

A test suite full of passing unit tests, a deploy to staging, and then a bug report — from a sequence of calls nobody thought to try. A user mints complete sets, burns half, buys on Phase 1, and the pool accounting is off by a rounding error that compounds over a thousand transactions.

Unit tests are good at verifying that `deposit(100)` returns `100` shares under normal conditions. What they're bad at is verifying the system is still correct after 847 different operation sequences nobody anticipated. That's where fuzz testing — and more specifically, **invariant testing** — comes in.

---

### The Difference Between Fuzzing and Invariant Testing

These two terms get used interchangeably, but they sit at different points on the same spectrum.

**Fuzz testing** — the simpler form — takes a function and throws randomly-generated inputs at it. Instead of `test_deposit_100`, you write `testFuzz_deposit(uint256 amount)` and let Foundry call it thousands of times with arbitrary values. This catches off-by-one errors, type boundary issues, and the kind of edge cases where `amount = 0` or `amount = type(uint256).max` breaks something obvious.

**Invariant testing** goes further. Instead of testing a single function call, you define a property that must hold true across *any* sequence of state mutations — and then let the fuzzer try to break it. The fuzzer doesn't just randomize inputs; it randomizes the entire call sequence: which function gets called, in which order, with which arguments, by which actor.

Instead of testing that `deposit(100)` returns `100` shares, you assert a conservation law — `sum(userBalances) == totalSupply` — and let the fuzzer find the sequence that violates it.

That shift — from testing outputs to asserting invariants — is what makes invariant testing genuinely useful.

---

### Writing Invariant Tests: The Handler Pattern

In Foundry, invariant tests work through a **handler contract** — a wrapper that exposes every state-mutation operation the fuzzer can call. The invariant function itself runs after every call sequence and checks whether a property held.

Here's a simplified version of what the handler looked like in American Spend's market contracts:

```solidity
contract MarketInvariantHandler is Test {
    Market public market;
    address[] public actors;

    function buyOnPhase1(uint256 actorSeed, uint256 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = bound(amount, 1, 1_000_000e6);
        vm.prank(actor);
        market.buyOnPhase1(amount);
    }

    function mintCompleteSet(uint256 actorSeed, uint256 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = bound(amount, 1, market.totalPool());
        vm.prank(actor);
        market.mintCompleteSet(amount);
    }

    function burnCompleteSet(uint256 actorSeed, uint256 amount) external {
        address actor = actors[actorSeed % actors.length];
        amount = bound(amount, 0, market.balanceOf(actor, YES_OUTCOME));
        vm.prank(actor);
        market.burnCompleteSet(amount);
    }
}
```

The handler covers all mutations: buy, mint, burn, resolve. The fuzzer picks any of those in any order. Each call uses `bound()` to keep inputs in a realistic range — without it, 99% of fuzz runs fail on input validation before reaching interesting state.

Then the invariant assertions:

```solidity
function invariant_poolConservation() external view {
    uint256 sumPools;
    for (uint i = 0; i < market.outcomeCount(); i++) {
        sumPools += market.pools(i);
    }
    assertEq(sumPools, market.totalPool(), "pool conservation violated");
}

function invariant_supplyConsistency() external view {
    for (uint i = 0; i < market.outcomeCount(); i++) {
        assertEq(
            market.outcomeTotalSupply(i),
            market.sumOfUserBalances(i),
            "supply doesn't match sum of user balances"
        );
    }
}
```

These run after every call sequence. If any assertion fails, Foundry reports the exact sequence that broke it — you don't have to guess.

**Key trade-off:** Invariant tests are harder to write than unit tests. Writing a good handler means understanding every state transition in the contract, how they interact, and which invariants are actually worth asserting. It's an investment. But a single invariant test that covers 1,000+ call sequences is worth more than 50 unit tests that only exercise the happy path.

---

### What Goes in INVARIANTS.md

One of the most useful things I did before the American Spend audit was writing an `INVARIANTS.md` — a plain-language document listing every property the market contracts must maintain. Not just as test code, but as documentation.

The list looked something like this:

```
totalPool == sum(pools[outcome])
outcomeTotalSupply[i] == sum(userBalance[user][i]) for all users
payoutPool ≤ totalPool + seedFund
vaultAccountingFinalized → resolved || cancelled
graduated is monotonic (once true, stays true)
bestBid < bestAsk (CLOB invariant, no crossed book)
```

This document serves three audiences at once: the auditor (who now knows which invariants to probe), the fuzz test suite (which uses these as assertions in handlers), and future developers (who know which properties they must preserve when they change the code).

Writing `INVARIANTS.md` before writing the fuzz tests forces a clarity that's hard to get otherwise. You can't write "the system is correct" as an invariant — you have to be specific. That specificity is what makes the test meaningful.

**Key trade-off:** Writing `INVARIANTS.md` first means doing design work before testing. Some teams skip it and add invariants opportunistically — which works, but you'll assert the properties you thought of, not necessarily the ones that matter most. The document forces exhaustive thinking before the fuzzer runs.

---

### Organizing the Test Suite

Mixing invariant tests, unit tests, and integration tests in the same folder becomes a problem quickly — different run times, different failure modes, different CI triggers. The test hierarchy we landed on for American Spend:

```
test/
  base/         # shared fixtures (MarketTestBase, CLOBTestBase)
  unit/         # isolated per-function tests
  integration/  # multi-contract E2E flows
  fuzz/         # invariant handlers and property tests
  performance/  # gas benchmarks, stress tests
```

CI strategy matters here: unit tests run on every push (fast, cheap), invariant tests run on PRs (slower, more runs), performance tests on-demand or before audits. Foundry's `--match-path` flag makes this trivial to separate.

One distinction worth enforcing: a fuzz test randomizes inputs to a single function; an invariant test randomizes entire call sequences. They live in different directories because they have different purposes, different run times, and different failure modes. A test that uses `vm.assume` to skip invalid inputs belongs in `unit/`, not `fuzz/`.

---

### The Class of Bugs Invariant Tests Actually Catch

Not every bug shows up in invariant tests. In my experience, the bugs this approach catches best fall into a few categories.

**Accounting drift under compound operations.** A `mintCompleteSet` followed by a `burnCompleteSet` should leave the pool exactly as it was. Unit tests check this for clean inputs. The invariant test checks it after 300 other operations have run first — and that's where rounding errors accumulate into meaningful drift.

**State monotonicity violations.** `graduated` in American Spend's markets should never go from `true` back to `false`. Writing `invariant_graduatedIsMonotonic()` takes five lines. Finding the sequence that breaks it — if it exists — is something a human reviewer would likely miss.

**Cross-book integrity.** On the CLOB side, the best bid must always be below the best ask. If any sequence of limit orders crosses the book, it's either a match that should have executed or a bug in price ordering. The invariant is one assertion; the fuzzer does the exploration.

**Key trade-off:** Invariant tests are poor at finding bugs that require very specific, non-obvious preconditions. If a bug only triggers when the first depositor holds exactly 1 wei of a specific token and a reentrant call arrives mid-execution, the fuzzer is unlikely to discover it without guidance. For those, you need targeted unit tests — often written after an auditor surfaces the specific scenario.

---

### Invariant Tests and Audit Preparation

Auditors read `INVARIANTS.md` and test code the same way they read source code. A well-written handler tells an auditor: "We understand our own state machine. These are the properties we're asserting. Here are the sequences we're exercising."

That's the opposite of "we have 95% branch coverage" — which often means 95% coverage on the happy path and zero coverage on adversarial sequences.

Before the American Spend audit, going through the full prep checklist (Slither pass, test reorganization, scope documentation, `INVARIANTS.md`) made the invariant tests feel like a communication tool as much as a testing tool. They say: these are the conservation laws of this protocol. If you find a violation, it's a critical bug. If you can't find one, that's evidence the accounting holds.

It's not magic. It's not a replacement for sound logic. But it's a seatbelt — and one that gets tighter the more sequences the fuzzer explores.

---

### Final Thought

Unit tests answer: "does this function do what I expect?"

Invariant tests answer: "is this system correct under any sequence of operations a user or attacker might try?"

The second question is the one that matters in production. Users don't follow your happy-path test scripts. Attackers definitely don't. Writing invariant tests is a forcing function for understanding your own protocol deeply enough to state its conservation laws — and then proving those laws hold across thousands of adversarial sequences.

Start small: pick one accounting aggregate and write one invariant. A `sum(pools) == totalPool` assertion with a three-function handler takes a few hours to write and covers more ground than a week of unit test expansion.

---

If you're building a DeFi protocol and thinking about how to approach testing before an audit — or if you've run into unexpected state drift in production — I'd be glad to compare notes. Feel free to connect or send me a message.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
