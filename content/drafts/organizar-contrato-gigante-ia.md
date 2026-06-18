---
social-post: |-
  🤔 AI gave us a working first draft of American Spend in hours. It also gave us a contract that broke the EIP-170 limit, accounting that drifted under edge cases, and zero documentation for the auditor.

  In my latest article, I walk through the engineering decisions we had to make to take that draft somewhere safe to ship — from bytecode limits to accounting correctness to audit readiness.

  If you're shipping a DeFi protocol with AI-generated scaffolding, this is the layer the model doesn't give you.

  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#Web3 hashtag#Blockchain hashtag#EVM hashtag#SoftwareEngineering hashtag#Web3Dev
---
# When AI Gives You a 2,000-Line Contract — And You Still Have to Ship It Safely

A prediction market with seeded liquidity, a CLOB order book, vault yield integration, and multi-outcome ERC6909 tokens. Ask an LLM to scaffold that and it will give you something that compiles. Maybe something that looks right. But "looks right" and "is correct" diverge badly when state has to hold under adversarial conditions and complex accounting flows.

At American Spend — the prediction market protocol we've been building at 33Labs — AI got us to a working first draft fast. What it didn't give us was a contract that fit inside the EIP-170 limit, accounting that held under edge cases, or documentation that made an auditor's job tractable. Those required deliberate engineering decisions. Here's what actually worked.

---

### The First Problem: Your Contract Outgrows the EIP-170 Limit

**EIP-170** caps deployed bytecode at 24,576 bytes. AI-generated contracts hit this limit faster than hand-written ones because models optimize for completeness, not bytecode cost. You end up with a `Market.sol` that does everything: trade execution, view helpers, validation logic, constants, events, modifiers for every state transition.

The first thing to touch isn't the contract structure — it's `foundry.toml`. Setting `optimizer_runs = 1` tells the compiler to optimize for size over runtime gas. It costs a little on hot-path execution but can drop a contract from over-limit to under-limit without touching a line of Solidity. Try this before anything else.

After the optimizer, the highest-ROI structural move is the **Lens pattern**: split every derived view into a separate `MarketLens.sol`. Functions like `getImpliedOdds`, `getUserTrades`, `calculatePotentialPayout` — anything that reads state and computes something but never mutates — consume bytecode without adding essential runtime logic. Moving them out dropped `Market.sol` by over 150 lines. The Lens deploys independently and can be upgraded or replaced without touching the core contract.

Next, extract pure math into a **library**. In our codebase that became `MarketMath` — fee calculations, rake splits, payout formulas. Pure functions are testable in isolation and, as `internal` library functions, get inlined by the compiler without adding a separate deployment unit. We measured around 1.6KB saved from this step alone.

```solidity
library MarketMath {
    function computeRakeAndNet(
        uint256 notional,
        uint16 rakeBps,
        uint16 makerRebateBps,
        address maker,
        address market
    ) internal pure returns (uint256 rake, uint256 makerRebate, uint256 net) {
        rake = (notional * rakeBps) / BPS_DENOMINATOR;
        // Protocol-as-maker gets no rebate — seeded liquidity is internal capital
        makerRebate = (maker == market) ? 0 : (notional * makerRebateBps) / BPS_DENOMINATOR;
        net = notional - rake - makerRebate;
    }
}
```

This shows the protocol-as-maker special case: when the market itself is the maker (seeded liquidity), the rebate is zero — paying a rebate to the contract would be circular. The `pure` signature means the compiler can inline this anywhere `MarketMath` is imported, without a separate deploy.

**Key trade-off:** splitting into libraries and Lens contracts adds deployment complexity. You now have multiple addresses to manage, and each additional deploy is one more thing to verify across chains. Only split when size pressure is real — not speculatively.

---

### The Second Problem: Validation Scattered Everywhere

In a **Factory + Clones** architecture — the right pattern for a protocol that deploys many instances of the same market contract — AI tends to duplicate validation in both places. The factory validates inputs before cloning; the clone validates the same inputs again on `initialize()`. Double the bytecode, double the maintenance surface.

The correct pattern: all validation lives in the factory. The clone assumes its inputs are already sane.

For American Spend, `MarketFactory` validates timing windows, outcome counts, fee configurations, and seed fund adequacy before deploying a clone via OpenZeppelin's `Clones` library. The clone's `initialize()` is minimal — it stores the pre-validated params and sets initial state. This isn't just a size optimization; it's a correctness benefit. Validation against global protocol state (does this fee rate make sense given the current treasury configuration?) can only happen at the factory level anyway.

**The trade-off:** if you ever need instance-level re-validation because the factory's rules evolve after markets are deployed, you have a gap. We handle this by treating each deployed market as immutable — once created, its rules don't change. That's the right design for a prediction market anyway: the rules of a game shouldn't change mid-game.

---

### The Third Problem: Accounting That Looks Right But Drifts

This is where AI-generated code is most dangerous. The scaffold will look plausible. Pool accounting, yield distribution, payout calculations — they'll have the right shape. But accounting in DeFi is adversarial. Small asymmetries accumulate. Edge cases that seem impossible happen in production.

The discipline I've applied is **double-entry accounting with invariants**. Every state change that touches a pool must have an inverse. `mintCompleteSet(amount)` adds `amount` to each `pools[outcome]` and to `totalPool`. `burnCompleteSet` subtracts symmetrically. The invariant `sum(pools) == totalPool` must hold after every operation — not approximately, exactly.

```solidity
// INVARIANT: sum(pools[i] for all i) == totalPool
// Enforced by symmetric mint/burn and fuzz tests
function mintCompleteSet(uint256 amount) external nonReentrant {
    uint256 n = outcomeCount;
    uint256 totalPoolAfter = totalPool + amount; // pre-compute ONCE before the loop
    for (uint256 i; i < n; ++i) {
        pools[i] += amount;
    }
    totalPool = totalPoolAfter;
    outcomeToken.mintBatch(msg.sender, amount);
}
```

Notice the pre-computation of `totalPoolAfter` before the loop. This matters when you have cap checks: if you compute the post-state incrementally per-outcome inside the loop, each iteration sees a different total — and the last outcome's cap check compares against a pool that doesn't yet include the other outcomes' additions. Pre-compute the final aggregate once, use it as the reference everywhere.

The accounting gets more complex when the protocol acts as a market maker via seeded liquidity. Tokens minted by the market for seeding live in the CLOB as open offers. When those orders are cancelled, the refund can't just be a token transfer back to the contract — that would create shadow supply (tokens "in" the market while `totalSupply` still counts them as outstanding). The correct action is **burn-on-refund**: call `outcomeToken.burn()` directly. `totalSupply` stays clean as ground truth.

Similarly, when computing payout denominators, you have to exclude tokens held by the protocol itself. Using raw `totalSupply(outcomeId)` inflates the denominator with phantom protocol-owned tokens, and users receive less than their fair share. The correct formula: `totalSupply(outcomeId) - balanceOf(market, outcomeId)`.

And when the external vault backing a market takes a loss, the shortfall needs to be absorbed in a defined order. In American Spend, `_applyVaultLossWaterfall()` works like this: `expectedAssets = totalPool + seedFund`; if `redeemedAssets < expectedAssets`, consume `seedFund` first, then haircut `pools[]` proportionally. Without an explicit waterfall, losses distribute chaotically — early claimers might get full payout before the shortfall is realized, leaving later claimers with nothing.

**Key trade-off:** strict invariants and explicit waterfalls require more engineering per feature. Adding a new state transition means auditing every code path against every documented invariant. That's the cost. The benefit is that the fuzzer can verify your claims mechanically — and in my experience, it finds things code review misses.

**`INVARIANTS.md`** is the artifact that makes all of this auditable. Before our external security review, we documented every invariant the system claims to maintain:

- `totalPool == sum(pools[outcome])`
- `outcomeTotalSupply[i] == sum(userBalance[user][i])`
- `payoutPool ≤ totalPool + seedFund`
- `vaultAccountingFinalized → resolved || cancelled`

These aren't comments — they become assertions in fuzz test handlers. The fuzzer tries to break them; if it can't after millions of runs, you have meaningful confidence.

---

### The Fourth Problem: State You Can't Reason About

AI-generated contracts tend to have too many independent state variables with unclear relationships. State that needs to move together gets updated in separate places — and there's always a code path that misses one.

The pattern I reach for is **internal helpers for co-dependent state clusters**: small private functions that encapsulate updates that always happen together. Not just for gas (fewer SLOADs), but for correctness. If updating `totalPool` and `pools[outcome]` always happen together, a function that does both means you can't accidentally do one without the other.

For state shared between a parent contract and its children — like the treasury address that determines where rake goes — admin setters must propagate explicitly. `Market.setTreasury(addr)` iterates through all CLOBs and calls `setTreasury()` on each. If parent and children drift, you end up routing fees to different addresses. You may not notice until someone audits the events.

**Key trade-off:** explicit propagation setters add coordination overhead. Every shared-state update becomes a loop. In a system with many sub-components, this can get expensive on-chain. The answer is to minimize shared mutable state: most CLOBs don't need to know about the treasury at match time, only at settlement. Delay the propagation until it matters.

---

### The Fifth Problem: Nothing Is Documented for the Auditor

AI generates code. It doesn't generate `INVARIANTS.md`, `SCOPE.md`, or `KNOWN_ISSUES.md`. Those are engineering artifacts that have to come from you.

Before our external security review, I went through the codebase and extracted every invariant the accounting depended on. Then I ran Slither, triaged the findings, fixed what was fixable, and documented the trade-offs for what wasn't — with explicit justifications. A `KNOWN_ISSUES.md` that says "we're aware of this, here's why it's acceptable" is worth more than a clean Slither run you got by suppressing everything without comment.

Test organization matters too. Auditors read tests as specs. Gherkin-style naming — `test_Given_marketResolved_When_redeemCalled_Then_paysProportion` — makes intent obvious to someone reading the file cold. And a hierarchical structure (`base/`, `unit/`, `integration/`, `fuzz/`) tells the auditor exactly where to look for what.

The full documentation package we prepared before audit: `README.md`, `PRD.md` (product requirements), `SCOPE.md` (in-scope contracts, LOC, external dependencies, explicit assumptions), `KNOWN_ISSUES.md`, `INVARIANTS.md`, and `README_DEPLOYMENT.md`. That's not paperwork — it's the difference between an auditor spending their time verifying your claims and spending it reverse-engineering what the protocol is supposed to do.

---

### Putting It Together

The pattern for taming an AI-generated megacontract, in order of impact:

1. **`optimizer_runs = 1`** in `foundry.toml` — start here, before touching any code.
2. **Lens for views** — move all derived reads to `XLens.sol`.
3. **Libraries for pure math** — testable, reusable, inlineable.
4. **Validation in the factory** — clones assume valid inputs.
5. **Explicit invariants** — document them in `INVARIANTS.md`, then fuzz them.
6. **Helpers for co-dependent state** — updates that always travel together belong in the same function.
7. **Propagate shared admin params** — setters on parents must cascade to children.
8. **Documentation package before audit** — `SCOPE.md`, `INVARIANTS.md`, `KNOWN_ISSUES.md`.

The AI is a force multiplier for getting to a first working draft. The architecture and accounting discipline is still yours to apply. The model doesn't know about the vault loss waterfall you need, the burn-on-refund invariant, or the payout denominator exclusion. It knows how to fill in the shape you give it.

Give it a better shape.

---

If you're working through similar problems on a DeFi codebase — organizing a large Solidity system, designing accounting invariants, preparing for audit — feel free to connect or message me. I'm always open to exchanging ideas with other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
