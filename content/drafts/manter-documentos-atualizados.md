---
social-post: |-
  💡 Documentation rot in smart contracts isn't just messy — it's a security issue.

  When intent and implementation diverge, auditors file findings. Your own team
  starts making decisions on a mental model that no longer matches the code.

  From building American Spend, I've been thinking hard about which documentation
  artifacts actually hold up over time — and how to keep them alive without making
  them a burden on the team.

  In my latest article I explore that question and share the approach I landed on.

  👇 Read the article below

  hashtag#SmartContracts hashtag#Solidity hashtag#Web3 hashtag#DeFi hashtag#SecurityAudit hashtag#Blockchain hashtag#SoftwareEngineering hashtag#SmartContractDevelopment
---
# Living Documentation in Smart Contract Development: PRD, INVARIANTS, KNOWN_ISSUES, and SCOPE

If you've shipped a non-trivial smart contract protocol, you already know the feeling: three months into the build, you open the README and it describes a system that no longer exists. The invariants in the comments are half-wrong. The edge cases in the original design doc were never written down, so each new developer has to reverse-engineer them from the code — or from bugs.

Documentation rot in smart contracts isn't just inconvenient. It's a security issue. Auditors read your docs to understand *intent*, and when intent and implementation diverge, findings get filed. More dangerously, your own team starts making decisions based on a mental model that has drifted from the actual system.

From my experience building [American Spend](https://33labs.xyz) — a prediction-market protocol with a CLOB, vault yield, and ERC6909 multi-token settlement — the answer isn't better discipline. It's treating your documentation as a set of artifacts with distinct, bounded purposes, each updated at a predictable moment in the development rhythm.

---

### Start With a PRD — and Mean It

The **PRD** (Product Requirements Document) is the first document of the protocol, written before any Solidity. Not a one-pager. Not a Notion dump of bullet points. A structured document that captures every phase, every fee structure, every edge case, every user-facing behavior — in plain language.

On American Spend, the PRD.md ended up at 45KB. That sounds heavy, but it paid off: when the auditor had questions about lifecycle transitions or fee semantics, we could point to a paragraph instead of explaining from scratch. More importantly, it made disagreements productive — "the PRD says X" is a way to have design arguments without ego.

A PRD that actually works has four things:

- **Phases with clear entry/exit conditions.** Not just "Phase 1 is the AMM phase" but "Phase 1 starts at market creation and ends when cumulative volume exceeds the graduation threshold." Every lifecycle state machine has entry/exit conditions; write them.
- **Concrete numeric examples.** Percentages, fee calculations, rounding rules — all should appear with worked examples. "The protocol fee is 2% of the payout pool, applied after seed fund recovery" is not the same as showing what that means with a $100K pool.
- **Edge cases named and decided.** What happens if a market is resolved before graduation? What if all outcomes except one have zero liquidity at settlement? Write the decision, not just the happy path.
- **Out-of-scope decisions, explicitly.** What the protocol deliberately does *not* handle. Auditors waste time on things you've already thought about and decided against — document the decision so they don't have to re-litigate it.

**Key trade-off:** A detailed PRD takes real time upfront — time when you're eager to write code. It also becomes stale if you update the implementation without updating it. The discipline required is to treat PRD changes as blocking — before merging an implementation change that alters contract behavior, the PRD update ships in the same PR.

---

### INVARIANTS.md: Your Protocol's Truth Table

Once the system is running, you need a separate document that captures the **invariants** — the properties that must hold at all times, regardless of which operations are called, in what order.

For American Spend, the core invariants look like this:

```
// INVARIANTS.md
totalPool == sum(pools[outcome])
outcomeTotalSupply[i] == sum(userBalance[user][i])
payoutPool <= totalPool + seedFund
vaultAccountingFinalized → resolved || cancelled
```

Each line maps directly to an assertion in `test/fuzz/handlers/` — if an invariant is in the doc, it should have a handler. These four lines represent hours of reasoning about the accounting model. Writing them down forces precision — the moment you try to state an invariant clearly, you often find that it's not quite right, or that there's an exception you hadn't fully thought through.

The `INVARIANTS.md` document is the single most useful file for an auditor. It tells them which properties to verify — and it gives them a lens for judging every other part of the code. The doc and the fuzz handlers should stay in sync; if one drifts from the other, something is wrong.

**Key trade-off:** Invariants can only be extracted from code that is stable enough to reason about. Writing them too early means rewriting them constantly. Writing them too late means you've lost the reasoning that generated them. The sweet spot, in my experience, is after the first integration test suite passes — the system is defined enough to formalize, but the team still remembers why each property holds.

---

### KNOWN_ISSUES.md: Transparency as a Security Property

Every non-trivial protocol has known issues — static analysis findings you've assessed and consciously accepted, design trade-offs that look like bugs but are intentional, patterns that would be a problem in a different context but are safe in yours.

The workflow on American Spend was:

1. Run `slither .` before audit
2. Triage every finding: fixable vs. acceptable
3. Fix what can be fixed
4. Document what can't — with reasoning

For each suppressed finding, `KNOWN_ISSUES.md` gets an entry: what the tool flagged, why it's not actionable, and what mitigating design decisions apply. The format matters less than the content — the point is to put the reasoning on record.

```json
// slither.config.json — suppress after documenting in KNOWN_ISSUES.md
{
  "filter_paths": "lib/",
  "exclude": [
    "incorrect-equality"
  ],
  "exclude_informational": false
}
```

This config suppresses a check the team analyzed and decided was a false positive in the protocol's context — the reasoning lives in `KNOWN_ISSUES.md`, not just in the config. "We know, we accept it for reason X" is vastly better than silence — an auditor who finds the same issue and sees it documented treats it very differently than one who finds it undocumented.

This isn't about gaming the audit. It's about shifting the conversation from "is this a bug?" to "is the reasoning sound?" — which is a much higher-quality discussion.

**Key trade-off:** The risk is that KNOWN_ISSUES.md becomes a list of things you've stopped thinking about. The mitigation is treating each entry as requiring a review whenever adjacent code changes. If you modify the settlement logic, re-read the KNOWN_ISSUES entries related to settlement. Most of the time, the reasoning still holds — but occasionally you'll catch that a change invalidated an assumption.

---

### SCOPE.md: Draw the Boundary Before Audit

An **auditor who doesn't know the boundary wastes time** — theirs and yours. SCOPE.md is the document that draws the line.

On American Spend, SCOPE.md lists:

- Every in-scope contract with its line-of-code count
- External dependencies (Vault, CollateralToken) and what assumptions the protocol makes about them
- Out-of-scope contracts and why
- Explicit assumptions ("OutcomeToken implements ERC6909 correctly and is not adversarial")

The assumptions section is often skipped, but it matters most. Smart contract protocols compose heavily — you're always relying on external contracts behaving within some envelope. When you write the assumption explicitly, you're also creating a checklist: if the assumption is violated in production, you know exactly which attack surfaces open up.

SCOPE.md can be partially auto-generated from the import graph — a script that walks the project's imports and separates in-scope contracts from `lib/` dependencies. The assumptions section requires human reasoning, but the contract list can be automated.

**Key trade-off:** Auto-generated scope boundaries can be wrong — a file that's in-scope because it's imported may actually be an audited library. The automation handles the tedious part; someone on the team still needs to review and annotate the output.

---

### README and README_DEPLOYMENT.md: Separate the What from the How

A common mistake is treating the README as the primary documentation artifact — stuffing it with overview, architecture, setup instructions, deployment steps, and protocol mechanics all at once. The result is a document that serves every purpose and none well.

What worked better: splitting into two files with a strict boundary.

`README.md` covers the *what* — what the protocol does, who it's for, how to run the test suite. It's a 3-minute read for anyone who wants to understand the system at a high level, including the auditor doing initial triage.

`README_DEPLOYMENT.md` covers the *how* — every environment variable, every forge script invocation, every post-deploy action (setting fees, whitelisting collateral, verifying on Etherscan). On American Spend this file ended up at 13KB — dense, procedural, not something you'd want mixed into the protocol overview.

The separation also has a maintenance benefit: deployment docs change with infrastructure; protocol docs change with design decisions. Keeping them apart means each document has a clear owner and a predictable update cadence.

---

### The Update Trigger: Documentation as Part of the PR

The real discipline isn't writing the documents — it's keeping them current. The pattern that worked for me is making documentation updates a **blocking condition** on PRs that change contract behavior, not an afterthought.

One question per PR: does this change any behavior described in `PRD.md`, `INVARIANTS.md`, `KNOWN_ISSUES.md`, or `SCOPE.md`? If yes, those files update in the same PR. A PR that adds a new fee tier and doesn't update the PRD doesn't merge.

This sounds strict, but it has a hidden benefit: it makes the cost of design changes visible. When updating the PRD requires explaining in plain language what changed and why, you think harder about whether the change is actually worth it. Documentation friction, applied correctly, is a useful forcing function.

---

### Final Thought

A smart contract protocol is, at its core, a set of commitments — to users, to investors, to auditors. The code encodes what the system *does*. The documents encode what it's *supposed* to do, what it deliberately doesn't do, and what you already know about its limits.

The gap between those two is where bugs live — and where audit time gets wasted.

PRD, INVARIANTS, KNOWN_ISSUES, and SCOPE aren't paperwork. They're the artifact set that turns an audit into a structured conversation instead of a guessing game. Keep them current and they pay back the investment multiple times over: in audit efficiency, in team alignment, and in the clarity that comes from having to write things down.

---

If you're building a smart contract protocol and thinking about how to structure your documentation before audit, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
