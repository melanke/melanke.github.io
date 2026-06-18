---
social-post: |-
  🧠 A test suite with 150+ tests is easy to write. Hard to navigate, hard to audit, and hard to hand to another human.

  In my latest article, I walk through the naming and folder conventions we adopted at American Spend to turn our Solidity test suite from a maze into something a teammate — or an auditor — can actually read.

  If you're preparing for your first audit or just tired of spending ten minutes locating a single edge case — this one's for you.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#Web3 hashtag#Blockchain hashtag#DeFi hashtag#Foundry hashtag#TestDrivenDevelopment hashtag#AuditPrep
---

# Organizing Hundreds of Solidity Unit Tests with Gherkin, Folders, and Fixtures

Somewhere between test number fifty and test number one hundred and fifty, a flat test file stops being a test file and becomes a maze. Not a broken maze — the tests still pass — but finding your way through it takes longer each week. You grep for "revert" and get forty hits across six files. An auditor asks what the expected behavior of `buyOnPhase1` with zero amount is. You spend ten minutes reading test bodies before you find the answer.

I went through this while building **American Spend**, the prediction market protocol we're developing at 33Labs. The codebase is a CLOB + AMM hybrid with ERC6909 outcome tokens and a yield vault underneath. By the time we approached audit prep, we had well over a hundred tests in a handful of files. Here's what we changed — and why it was worth a dedicated commit.

---

### The Problem with Flat Test Files

The instinct when you start is to put everything in one file, or maybe two: one happy-path file and one edge-case file. That works fine for a contract with eight functions. It breaks when you have a lifecycle with five phases, three token types, an external vault, and a CLOB order book — each with their own error conditions.

The specific failure mode is **attention fragmentation**. Test bodies start carrying implicit state that isn't obvious from the function name. You read `testBuyOnPhase1_ZeroAmount_Reverts()` and still have to open the function to understand the starting conditions. Is this a freshly deployed market? A seeded one? Does it matter? Usually it does.

We also had the classic copy-paste problem: repeated `MarketConfig` setups across every test, each with slightly different values. When a parameter changed — and in early development they always do — you were updating the same numbers in eight places.

---

### Gherkin Names and Headers: Tests as Specs

The first fix was to stop naming tests like methods and start naming them like sentences. The **Gherkin pattern** — `Given / When / Then` — forces you to state conditions, action, and expected outcome all in the function signature.

So `testBuyOnPhase1_ZeroAmount_Reverts()` becomes:

```solidity
/// @dev Given: Market in Phase 1, seeded with initial liquidity
/// When: buyOnPhase1 is called with amount = 0
/// Then: Reverts with ZeroTokenOutput
function test_Given_marketInPhase1_When_buyWithZeroAmount_Then_reverts()
    public
{
    _seedMarket(DEFAULT_SEED_FUND);
    vm.expectRevert(Market.ZeroTokenOutput.selector);
    market.buyOnPhase1(0, 0, 0);
}
```

The `/// @dev` block above the function is the **Gherkin header** — three lines that document the precondition, the action, and the assertion. The test compiles without it. But it changes how you read the file: you scan the comments at a glance, in plain language, without executing a single line in your head.

The trade-off is verbosity. Gherkin names are long. Your IDE wraps them. In a file with thirty tests the function list becomes a wall of text. My practical compromise: write short names during fast iteration, do a naming pass before any audit or external review. It's not a convention you have to enforce from day one.

---

### Hierarchical Folder Structure

Gherkin names solve readability within a file. They don't help you answer "where should I add a test for the vault integration?" when your `test/` folder is flat. That's a folder problem.

Here's what we landed on:

```
test/
  base/         ← shared fixtures and helpers
  unit/         ← isolated tests per function
  integration/  ← multi-contract and multi-phase flows
  fuzz/         ← invariant tests and fuzz campaigns
  performance/  ← gas benchmarks and stress tests
```

`unit/` tests a single function in isolation — no vault running, no CLOB wired. `integration/` tests an entire user flow: seed → buy → graduate → CLOB order → resolve → claim, with everything wired together. That distinction matters for CI: unit tests are fast, fuzz tests want 1000+ runs. Split them into folders and you can run `forge test --match-path test/unit` on every push, saving the full suite for merges to main.

The trade-off: more files, more overhead when deciding where a new test lives. A test that starts as a unit test sometimes grows into an integration test. You'll move things once or twice. That's acceptable — the organizational clarity is worth it.

---

### Reusable Fixtures and Helper Builders

The copy-paste problem goes away when you extract shared setup into **helper builders** on the base fixture contract.

In our test base we have helpers like `_buildSeedConfig()` and `_buildOpenMarketConfig()` that return a fully populated `MarketConfig` struct with sensible defaults. Tests that need a variation pass arguments or override a single field.

```solidity
function _buildSeedConfig(
    uint256 seedFund,
    uint256 feeRateBps
) internal view returns (MarketConfig memory) {
    return MarketConfig({
        collateralToken: address(token),
        oracle: address(oracle),
        seedFund: seedFund,
        feeRateBps: feeRateBps,
        resolutionDelay: RESOLUTION_DELAY,
        outcomeCount: 2
    });
}
```

`RESOLUTION_DELAY` is a named constant defined on the base contract, not a magic number. When we changed the resolution delay from 24 hours to 48 hours, one line propagated to every test automatically. Without the constant, that's a grep-and-replace with the attendant risk of missing one instance.

The trade-off is a deeper inheritance chain. Your test contract inherits the base, which imports a bunch of fixtures. In Foundry that's generally fine — compile times barely move — but new contributors need to understand what they're inheriting before they can write a test. A brief `README` in the `base/` folder handles most of that.

---

### Golden Inputs as Test Seeds

One pattern that surprised me by how much it helped: **seed constants** for test inputs. Not just configuration — actual input values used across tests.

The idea is to pick a small set of "golden" inputs — amounts, prices, timestamps — that appear across many tests and promote them to named constants in the base fixture. In American Spend, constants like `SEED_AMOUNT`, `BUY_AMOUNT_PHASE1`, and `MIN_PRICE` appear everywhere. They're not realistic production values. They're chosen to stay clear of rounding-dominated ranges and overflow limits. When a test fails, you immediately know which golden input triggered it.

The counterpoint: golden inputs can mask boundary bugs. A test that always runs with `SEED_AMOUNT = 1_000e18` will never catch an overflow that triggers at `type(uint128).max`. That's what fuzz tests are for. Golden inputs give you readability and consistency; fuzz inputs give you coverage. Don't conflate them — that's why the folders exist.

---

### When It Really Pays Off: Audit Prep

The honest reason we invested in all of this was audit preparation. When an auditor opens your test folder, they're trying to answer two questions fast: what behavior does the team consider correct, and where are the gaps?

Gherkin names answer the first question without any conversation. A well-named test function is a spec line. An auditor reading `test_Given_resolvedMarket_When_claimRewards_Then_emitsEvent` knows immediately what you expect — and then looks for cases you didn't write.

Hierarchical folders answer the second question. `test/unit/Market.buyOnPhase1.t.sol` shows an auditor every case covered for that one function, and makes gaps visible. A flat `Market.t.sol` with two hundred mixed tests makes gaps invisible.

We did the reorganization and the Gherkin naming pass in a single dedicated audit-prep commit. A few hours of work. The test suite went from "we have tests" to "we have tests that document our expectations" — and those are different things.

---

### Bottom Line

A test file is also a document. The patterns here — Gherkin names with `/// @dev` headers, a `base/unit/integration/fuzz/performance` hierarchy, helper builders, named seed constants — require no new library and no new toolchain. They're conventions you adopt once. The entry cost is one refactor afternoon. The payoff lands the next time someone else has to reason about your contract's behavior: an auditor, a teammate, or you six months from now.

---

If you're building a smart contract system and thinking through how to structure tests for the long haul — or preparing for your first audit — feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
