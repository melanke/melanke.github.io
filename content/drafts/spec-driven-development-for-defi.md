---
social-post: |-
  🤖 AI is writing Solidity faster than ever. And DeFi exploits are keeping pace.
  Vibe-coding works for web apps. In DeFi, it's a different story — bugs don't get patched quietly, they get exploited publicly and completely.
  In this article I walk through the Spec-Driven Development process I use before writing a single line of Solidity, and how to use AI seriously at every phase instead of just generating code and hoping for the best.
  👇 Read the full breakdown below:

  hashtag#DeFi hashtag#SmartContracts hashtag#Solidity hashtag#Web3Dev hashtag#BlockchainDevelopment hashtag#SoftwareEngineering hashtag#SpecDrivenDevelopment hashtag#SmartContractSecurity hashtag#EVM hashtag#AI hashtag#VibeCoding hashtag#Ethereum hashtag#ProtocolDesign
---
From my experience working on DeFi protocols, there's a pattern I've seen repeat itself across teams of all sizes: the bugs that hurt the most aren't the ones missed in testing. They're the ones never even thought of during design.

In traditional software development, shipping with a bug usually means a hotfix and a retrospective. In DeFi, a smart contract vulnerability can drain a protocol before a team even gets the chance to react — and depending on the upgrade strategy, the fix may come too late to matter. The stakes aren't just technical. They're economic, reputational, and sometimes existential for the protocol.

Generative AI has made this dynamic significantly more dangerous. The rise of **vibe-coding** — prompting an AI to generate code, reviewing it at a surface level, and shipping it — works reasonably well for frontends and CRUD APIs. If the output is wrong, you iterate. In DeFi, vibe-coding produces a different kind of failure: code that compiles, passes basic tests, and looks correct, but contains subtle invariant violations or exploitable economic assumptions that neither the developer nor the AI noticed.

The AI doesn't know your protocol. It doesn't know the post-mortems you didn't read. It doesn't simulate the adversarial actor who will analyze your bytecode for ten hours before you've even announced the launch.

I'm not arguing against using AI. I use it constantly. The argument is against using it as a substitute for understanding. The developers who use AI most effectively in DeFi are the ones who come in with enough domain knowledge and structured process to direct the AI precisely — and to know when to override it. The developers who get hurt are the ones who delegate the thinking, not just the typing.

This is why I've become a strong believer in **Spec-Driven Development** for DeFi. Not as bureaucratic ceremony, but as the framework that makes AI assistance actually safe to use in high-stakes contract development.

---

## What Is Spec-Driven Development?

**Spec-Driven Development** is the practice of writing thorough, formal specifications *before* writing any code. You think through the entire system — behaviors, edge cases, attack vectors, invariants, state transitions — and document them in a form that can be reviewed, challenged, and tested.

In most domains, SDD is a useful engineering discipline. In DeFi, it's closer to a non-negotiable.

The reason is simple: smart contracts are adversarial environments. Your users aren't just people trying to get things done — they include sophisticated actors scanning your bytecode for exploitable behavior. A well-written spec forces you to articulate every assumption your code makes, and that articulation is exactly what catches the assumptions that are wrong.

It's also the artifact that makes audits worthwhile. A smart contract audit without a spec is just a security researcher guessing what the protocol was supposed to do. With a spec, the auditor can verify intent vs implementation — a fundamentally different, and far more valuable, exercise.

And here's the connection to AI: a precise, detailed spec is also the best possible context you can give an AI model when asking it to help with implementation. An AI working from a clear spec produces dramatically better output than an AI trying to infer intent from a vague prompt. Spec-driven development and AI-assisted coding aren't in tension — the spec is what makes the AI assistance serious rather than reckless.

---

## The DeFi-Specific Layers

Before I walk through the phases, it's worth naming what makes DeFi different from any other software domain when it comes to planning.

**Immutability.** Once deployed, the code is the contract. Even with proxy patterns and upgrades, every change requires governance, timelocks, and often a new audit. There's no "push the hotfix, nobody noticed."

**Economic consequences.** Smart contract state holds real value. Every function that can change state is a potential attack surface — not just for logic errors, but for economic exploits: flash loan attacks, sandwich attacks, oracle manipulation, value extraction through MEV.

**Composability.** DeFi protocols don't live in isolation. Other protocols will build on top of yours, integrate your tokens, call your functions. Behaviors you didn't intend to expose become attack vectors when composed with other protocols in unexpected ways.

**Protocol mechanics.** Building an AMM is not the same as building a lending protocol, which is not the same as building a prediction market. Each primitive has well-established prior art, known failure modes, and a body of post-mortems to learn from. Planning without studying that prior art is planning blind.

These four factors shape every phase of spec-driven development in DeFi. They also explain why AI alone can't replace the process — each of these dimensions requires judgment that has to be built by a human, not delegated to a tool.

---

## 🔬 Phase 1 — Protocol Research

Before writing a single spec, you need to deeply understand what you're building and what has been built before.

This phase is less about your protocol and more about the **category** your protocol belongs to. Are you building an AMM? A lending protocol? A yield optimizer? A prediction market? A bonding curve launchpad? Each category has a different set of invariants, risks, and design considerations.

### Study the canonical implementations

Read the actual source code of the most important protocols in your category. Not just the docs — the code. Uniswap v2 for constant-product AMMs. Compound or Aave for lending. Curve for stableswap math. Synthetix for synthetic assets. GMX for perpetuals.

The goal isn't to copy them. It's to understand *why* they made the design decisions they made — especially the ones that aren't obvious. Most of those decisions are answers to problems that cost someone money to discover.

One practical move here: paste a contract directly into an AI and ask it to walk you through a specific design decision or explain why a function is structured the way it is. It's not a substitute for reading — but it turns a passive read into an active discussion, which is a much faster way to build real comprehension. You can ask it to explain the invariant, trace the control flow, or describe the attack the code is defending against.

When I was working on American Spend, a prediction market protocol with vault-based yield strategies and CLOB integration, one of the first things I did was study how existing prediction markets handled settlement and the edge cases around late resolution. The literature was full of scenarios where protocols had been exploited through timing attacks on oracle settlement. None of that was in any official documentation — it was in post-mortems and audit reports.

### Read the post-mortems

Post-mortems from DeFi exploits are some of the most valuable technical documents in the ecosystem. They tell you exactly what went wrong, under what conditions, and why the code didn't catch it.

The honest problem with this phase: it's a lot of reading, and it's easy to feel like you need to absorb everything before you can move forward. AI can help you prioritize. Describe your protocol category and ask a model to list the most significant exploits in that space, explain the mechanism of each, and flag which patterns are most relevant to your design. You won't read every post-mortem — but you'll know which ones actually matter for what you're building. Sites like Rekt.news, BlockSec's publications, and individual team retrospectives are still essential reading, but you can read selectively rather than comprehensively.

When I was working on Mosaic — a protocol that includes Uniswap v3/v4 hooks — I spent time researching the security implications of hook architectures specifically. They introduce callback patterns that can create reentrancy-adjacent risks in ways that don't fit the classic "withdraw, then update state" pattern, and that wasn't obvious until I went looking for it.

> 📝 _One thing many teams defer until it becomes a legal problem: for protocols involving token issuance, derivatives, or anything that could be classified as a financial instrument in major jurisdictions, it's worth understanding the regulatory landscape early. Not to become a lawyer, but to avoid designing yourself into a corner._

---

## 📐 Phase 2 — Economic Design Spec

Protocol mechanics need to be designed and stress-tested on paper before they reach code.

This is where you define the **mathematical invariants** of your protocol. Every AMM has an invariant (for Uniswap v2, it's `x * y = k`). Every lending protocol has a collateralization model. Every yield strategy has an accounting model. If you can't write these down as precise mathematical statements before coding, you're not ready to code.

### Define the invariants

An **invariant** is a statement about your system that must always be true. For a token vault: "the sum of all user shares must equal the total supply of vault shares." For an AMM: "the product of reserve balances must never decrease except through fee collection." Write them down explicitly. These will become the backbone of your fuzz testing later.

Example from working on a vault-based yield strategy for American Spend:

```
// Invariant: vault solvency
// total assets >= sum of all redeemable user claims
// total shares is non-zero when total assets is non-zero
```

These aren't code comments. They're formal claims about the system's behavior that you commit to before writing any implementation.

Once you have them written, AI can help verify them. Give the model your invariant formulas and your edge cases and ask it to try to break them — it's reasonably good at algebraic manipulation and often spots division-by-zero scenarios or precision loss that's easy to miss. Treat it as a check on your work, not as the source of the work itself. The invariants have to come from your understanding of what the protocol is promising to users.

### Model the economics

Run the numbers manually before running them in code. What happens when liquidity is low? What happens at the edge of a valid price range? What happens if the oracle returns a stale price? What happens if a whale depositing 90% of total liquidity immediately withdraws?

For DeFi protocols with tokens or fee mechanisms, you also need to think through incentive alignment:

- Who captures fees? In what proportion?
- What prevents a rational actor from front-running other users?
- Are there circumstances where the protocol's incentives are misaligned with its users?
- What oracle does the protocol depend on, and what happens if that oracle is manipulated?
- Does your protocol create predictable state transitions that can be sandwiched, front-run, or back-run? MEV extraction is a design problem, not a deployment afterthought — commit-reveal schemes, TWAP oracles, and fee structures that redistribute MEV back to LPs are decisions made here, not later.

Working through these questions with an AI as a sounding board is productive — it can surface scenarios you haven't considered and check your reasoning. What AI consistently misses is second-order economic effects: behavior that only emerges when your protocol composes with others in unexpected ways, or when adversarial actors coordinate across multiple transactions. That reasoning requires a human who understands the broader DeFi landscape.

One discipline worth building into this phase: when you hit a question you can't answer with confidence, document it explicitly as an open question rather than resolving it silently with an assumption. In DeFi, an unresolved ambiguity in the economic model — "what happens when X and Y are simultaneously true?" — has a way of becoming an implicit assumption in the code, and implicit assumptions are where edge cases hide. Surface them now, resolve them deliberately, and write the decision down.

---

## 🏗️ Phase 3 — Architecture & Contract Design Spec

With the economics understood, you design the contract structure.

### Define the contract system

Most non-trivial DeFi protocols consist of multiple contracts. At this phase, you document:

- Which contracts exist and what each one is responsible for
- How they interact with each other (which contracts call which)
- What external protocols they integrate with and through which interfaces
- What the upgrade strategy is for each contract

One decision that belongs here and has downstream consequences: for each contract, whether to split its functionality further or keep it as a single unit. Splitting improves organization and helps with the 24KB size limit, but every cross-contract call costs gas — and in hot paths like swaps or liquidations, that overhead adds up. Sometimes the right answer for a specific contract is to keep it large rather than pay the call overhead. Document that decision explicitly where it applies — it has implications down the line that are easier to handle when the reasoning is already written down.

Once you have the economics from Phase 2 defined, AI can generate a first-draft contract structure quickly — interface stubs, dependency diagrams, boilerplate for standard patterns. Use it to skip the mechanical work and focus on the decisions that actually require judgment.

**Upgrade strategy**, the last item in that list, deserves particular attention. The trade-offs between immutable deployment, proxy patterns, and more complex upgrade architectures are significant enough to warrant their own study. What matters at the spec stage is that you make an explicit decision rather than defaulting to whatever your boilerplate uses — because that decision shapes your governance model, your audit scope, and your protocol's trust story with users.

### Define the access control model

Who can call what? Spell it out completely:

- Which functions are `external` and callable by anyone?
- Which require ownership or a specific role?
- Who holds the owner key? Is it an EOA, a multisig, a DAO governance contract?
- What is the timelock period for sensitive changes?
- Are there emergency functions? Who can call them?

AI is good at flagging common access control gaps — missing role checks, centralization risks, functions that should be restricted but aren't. I've found that the access control model is one of the most commonly underspecified parts of smart contract design, and a second opinion here costs nothing. The judgment call of *who actually holds the keys* and how much decentralization is appropriate for your protocol at this stage, though — that's yours. AI will give you a reasonable-sounding answer — reasonable isn't the bar here.

### On-chain vs off-chain boundaries

Not everything needs to live in the contract. In fact, on-chain storage is expensive, and putting computation off-chain (verified by signatures or Merkle proofs) is often the right trade-off for complex systems.

Define clearly:
- What data is stored on-chain vs off-chain
- What off-chain data is required for on-chain verification (oracles, Merkle roots, signed payloads)
- What happens if the off-chain component goes down or produces incorrect data

---

## 🛡️ Phase 4 — Security & Threat Modeling Spec

The previous phases covered attacks at the protocol level — economic models, access control architecture, known vulnerability patterns from post-mortems. This phase applies all of that systematically, function by function.

For each external function, document the value at risk, the attack vectors that apply, and the mitigations. The checklist to run against each function: reentrancy, flash loan amplification, oracle manipulation, integer arithmetic edge cases, front-running, access control bypass, and initialization attacks. These aren't new concepts at this point — the work here is being rigorous about applying them to your specific interface.

I keep a threat model document that looks roughly like this:

```
Function: withdraw(uint256 shares)
Value at risk: user's proportional share of vault assets
Attack vector 1: reentrancy — user contract receives ETH before state update
Mitigation: CEI pattern + nonReentrant
Attack vector 2: share price manipulation via donation attack before deposit
Mitigation: virtual shares / dead shares on initialization
Attack vector 3: flash loan to inflate share price before withdrawal
Mitigation: TWAP-based accounting or per-block lock
```

This is a good place for a structured AI threat modeling conversation — not an audit skill, which needs actual Solidity to analyze, but describing each function's intent and state mutations and asking the model to enumerate attack vectors. I use it as a second pass after my own analysis. It's caught real things. The limit is novel composition attacks — for those, you're protected against the past, not the future.

### Plan the emergency mechanisms

Every DeFi protocol should have a documented emergency plan:

- Is there a pause function? Which functions does it pause?
- Who can trigger it?
- What is the process for deploying a fix after a pause?
- Can users still withdraw in an emergency paused state?

The last point is important and often missed. A pause mechanism that also blocks user withdrawals creates a new attack vector: the protocol team (or an attacker who compromises the pause key) can trap user funds.

---

## 📋 Phase 5 — Interface, Storage & Events Spec

The architectural decisions from Phase 3 get formalized here: who can call what becomes pre-conditions, which data lives on-chain becomes storage layout, what the system promises becomes revert conditions and events. Nothing new is decided — everything is made precise.

### Function signatures and behavior

For every `external` and `public` function, specify:
- Full signature (name, parameters, return types)
- Parameter ranges (valid bounds for each input — what values are accepted, what triggers a revert, and what the behavior is at the boundary)
- Pre-conditions (`require` statements — what must be true before execution)
- Post-conditions (what is guaranteed to be true after successful execution)
- Revert conditions (every `revert` the function can emit, with message or custom error)
- State mutations (which storage variables change and how)

This isn't writing the code — it's writing a contract for how the code will behave. The distinction matters: you're making promises, not implementation choices.

Each requirement deserves a stable identifier so it can be traced through implementation and tests. Sequential IDs (`REQ-001`, `REQ-002`) seem natural but break down under maintenance — remove or reorder a requirement and everything shifts. A better approach is **slugs**: short descriptive identifiers like `REQ-withdraw-solvency` or `REQ-deposit-min-shares`. They carry no implied order, survive additions and removals without cascading changes, and are readable in a code comment or a test file. Naming is hard, but this is exactly where AI earns its keep — give it the requirement description and ask it to generate a slug. The result is consistent and takes seconds to review.

The invariants from Phase 2 work the same way: `INV-vault-solvency`, `INV-share-monotonic`. When implementation and tests reference these slugs, an auditor can trace the full chain from spec to code to test for every guarantee the protocol makes.

Once you have the behavioral spec written, AI can generate a first-draft Solidity interface file — function signatures, NatSpec comments, custom errors, events. The output is usually 80–90% correct and dramatically faster than writing by hand. The remaining 10–20% are always the interesting problems: semantics the AI interpreted differently than intended, edge cases in pre-conditions it didn't model. This is exactly why the spec exists — without it, the AI's interpretation silently becomes your implementation.

### Storage layout

In proxy-upgradeable contracts, storage layout is a security concern, not just an organizational one. A botched upgrade that writes to the wrong storage slot has caused real protocol losses.

Document your storage layout explicitly:

```
Slot 0: uint256 totalAssets
Slot 1: uint256 totalShares
Slot 2: mapping(address => uint256) shares
Slot 3: address feeRecipient
Slot 4: uint256 feeBps
...gap[50]: reserved for future upgrades
```

If you're using OpenZeppelin's upgradeable contracts, the gap pattern is built in. But you still need to document what goes in the gap and what constraints future upgrades must respect. AI is useful for spotting potential collisions and flagging variables that probably belong in the gap — mechanical checks it handles well.

### Events

Events are your protocol's audit log. Define them before implementation, not after:

- Every state transition that a user or indexer would want to observe should emit an event.
- Events should include enough information to reconstruct state without querying the contract.
- Index the fields you'll query by.

Poor event design is one of the most common sources of indexing pain later. In my experience building Dora (the Neo blockchain explorer) and working with The Graph on several protocols, the difference between a well-instrumented and a poorly-instrumented contract is enormous when you're building the off-chain query layer. Changing events after deployment means migration or protocol documentation that diverges from reality.

### Custom errors

Since Solidity 0.8.4, custom errors are the preferred way to revert. Define them in the spec with the function and condition that triggers each one:

```solidity
// withdraw() — caller's share balance is below requested amount
error InsufficientBalance(uint256 requested, uint256 available);

// any restricted function — caller lacks the required role
error UnauthorizedCaller(address caller, bytes32 requiredRole);

// any oracle-dependent function — price feed hasn't updated within maxAge
error StalePriceData(uint256 updatedAt, uint256 maxAge);
```

This traceability is what makes the spec auditable — a reviewer can verify that every revert condition in the implementation maps back to a documented intent.

One trade-off worth deciding at this stage: error granularity vs. contract size. Each distinct error type adds to the bytecode, and Solidity contracts have a 24KB size limit. If you've already decided in Phase 3 that a contract won't be split into multiple contracts — because the gas cost of cross-contract calls outweighs the benefit — you're working within a tighter size budget. In that case, define a consolidation policy upfront: keep granular errors only where the caller genuinely needs to distinguish the failure type; for the rest, use a parametrized form like `error InvalidOperation(uint8 code)`. You won't know the exact size until implementation, but the policy can be set here.

---

## 🧪 Phase 6 — Test Specification

The instinct here is to cover every possible path. Resist it. A contract with 200 passing unit tests can still have an economic vulnerability that none of them imagined — unit tests test what you thought to test, and the adversarial actor isn't constrained by your test cases.

The composition that actually works:

- **Invariant/fuzz tests**: the primary security layer. The invariants are already defined in Phase 2 — list them here as the fuzz test targets, one line each. Before closing this list, do one more pass for implicit invariants: properties the system guarantees by construction that were never explicitly stated. Ask the AI to review your complete spec and surface any invariants that fall out of the design but weren't declared — they're easy to miss precisely because they feel obvious in context.
- **Scenario tests**: for known attack patterns and multi-step flows, written in Gherkin.
- **Unit tests**: minimal — the most critical happy paths and a handful of obvious reverts. Treated as documentation, not as the security net.

### Scenario spec

Gherkin fits naturally here. The Given/When/Then structure makes the preconditions explicit and produces something an auditor can read alongside the test code:

```gherkin
Scenario: Flash loan attack on vault pricing
  Given a vault with 1 ETH initial deposit
  When an attacker takes a flash loan of 100 ETH
  And deposits 100 ETH into the vault
  And attempts to withdraw at the inflated share price
  And repays the flash loan
  Then the attacker has extracted no profit
  And the vault state is identical to before the attack
```

Describe the scenario in Gherkin; ask the AI to translate it into test code. The assertions need your validation — you're verifying that what the code calls "success" matches what the spec promises.

### Unit test spec

For the unit tests you do write, Gherkin keeps the initial state explicit and the intent clear:

```gherkin
Scenario: User withdraws correct proportional assets
  Given a vault with 100 ETH total assets
  And the user holds 50% of total shares
  When the user calls withdraw() with all their shares
  Then the user receives 50 ETH
  And totalShares is reduced by the withdrawn amount
  And a Withdraw event is emitted with correct parameters
```

---

## 🔁 Then: Implementation

Only after all six phases are documented do you write production code.

This might sound like a lot of upfront work — and it is. But the comparison isn't "spec-driven vs faster coding." It's "spec-driven vs spec-driven plus emergency response, post-exploit communications, and possibly a protocol that never recovers." The opportunity cost of a serious exploit in DeFi goes well beyond the stolen funds.

At this stage, AI-assisted coding is genuinely powerful. The prompt is no longer "write me a vault contract" — it's "implement this `withdraw` function according to these pre-conditions, post-conditions, and state mutations, resilient against these specific attack vectors." That level of context produces output you can actually review with confidence.

This is also where the audit skills finally enter the picture — run them after implementation, against the actual code. By this point, design-level bugs should already be resolved through the threat modeling in Phase 4. The audit is now hunting implementation divergences: places where the code doesn't match the spec, which is a fundamentally more targeted exercise than auditing code with no spec at all.

The spec doesn't slow down the coding. It makes the coding faster and the review dramatically more effective.

**Code reviews** become faster because a reviewer can check the implementation against the written spec directly — they're not reconstructing intent from code, they're verifying that the code matches a known contract. Discrepancies jump out.

**Audits** become more valuable for the same reason. An auditor working from a spec can flag not just bugs but spec violations — places where the code almost matches the intention but has subtle edge case differences. Without the spec, those are the hardest bugs for an auditor to find.

One practice that makes audits even more effective: when implementation diverges from the spec — because you discovered something during coding that the spec didn't anticipate — mark it explicitly with a `SPEC_DEVIATION` comment rather than silently updating either the code or the spec. The comment documents what changed and why. Auditors treat these as high-priority review points, and the spec gets updated after the fact with the reasoning intact. Deviations that aren't marked tend to quietly become assumptions that nobody questions later.

The complement is `UNDOCUMENTED CODE PATH`: a block of logic that the spec doesn't mention at all — not a deviation from stated behavior, but behavior that was never stated. Both markers serve the same purpose: making the gap between spec and code explicit and reviewable, rather than invisible.

---

## The Pragmatic Version

I want to be honest about trade-offs here. Not every DeFi project has the budget for six fully documented phases before writing any code. Deadlines exist. Resources are finite.

What I don't cut, regardless of timeline:

- The protocol research phase. You cannot safely design something you don't understand.
- The economic invariants. If you can't state your invariants, you can't test them.
- The threat model, even if abbreviated. At minimum, walk through the top-ten DeFi attack patterns against your interface.

What can be streamlined: the storage layout doc can be a code comment if the contract is small. The full event spec can be written as you implement if the protocol is simple. The interface spec can evolve alongside implementation on a fast-moving internal project.

But the security spec and the economic model don't have a streamlined version. Those are where the money is.


---

## Final Thought

In most of software engineering, speed and correctness trade off against each other. In DeFi, they don't — because an incorrect smart contract doesn't stay incorrect quietly. It gets exploited publicly, immediately, and often completely.

Vibe-coding is the practice of moving fast and trusting the AI. Spec-driven development is the discipline of moving deliberately and directing the AI. In most domains, the difference between them is code quality. In DeFi, the difference is whether your protocol survives.

The spec isn't the obstacle to shipping. It's the thing that makes shipping mean something.

---

The spec is one layer of what the industry is beginning to call **Harness Engineering** — the discipline of designing the complete environment in which AI agents operate reliably. The model is just one component; the spec, the constraints, the feedback loops, and the review gates are the harness. I'll be writing more about this in upcoming articles.

---

If you're building a DeFi protocol and want to talk through any phase of this process, feel free to connect. I'm always open to exchanging ideas with other builders who care about getting this right.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
