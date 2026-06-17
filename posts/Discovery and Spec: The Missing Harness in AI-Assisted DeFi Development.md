---
published-at: '2026-06-17T12:00:00.000+00:00'
summary: >-
  Harness Engineering has two layers. The CI pipeline is one of them. This is the other — a structured discovery and spec workflow that constrains AI before it writes a single line of Solidity.
og-image: /blog-images/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development.png
og-image-prompt: >-
  A 16:9 horizontal thumbnail illustration, no text or letters anywhere in the image. Modern flat-design tech illustration depicting a two-stage DeFi development workflow that happens before a CI/CD pipeline. Show a horizontal left-to-right flow: on the left, a thinking/discovery stage represented by a glowing lightbulb or brain icon surrounded by branching decision paths, magnifying glass, and a checklist clipboard symbolizing idea validation and risk assessment; in the middle, a blueprint/specification document with architectural diagrams and interlocking gears representing the spec phase; on the right, the entrance to a pipeline shown as glowing nodes and pipes leading off toward a deployment checkmark, slightly faded to indicate it comes later. The discovery and spec stages on the left should be visually dominant and brightly lit, while the pipeline on the right recedes. Include subtle Ethereum diamond motifs and abstract blockchain blocks linked by chains in the background. Color palette of deep navy blue and dark slate backgrounds with vibrant electric blue, purple, and emerald green accents. Clean vector style, soft glowing highlights, circuit-board line details, professional and minimal. Balanced composition with deliberate emphasis on the upstream stages.
social-post: |-
  OpenAI and others have been talking about Harness Engineering — the discipline of building the environment in which AI agents operate reliably, not just the code they produce.

  Most teams focus on one layer: the CI pipeline. Essential — but that's the downstream harness. It catches bad code after it's been written.

  The upstream harness is what I've been less satisfied with. Especially in DeFi.

  Building DeFi protocols and mentoring builders at BuidlGuidl, I kept running into the same gap: teams would hand an AI agent a vague idea and get moving. Fast code, confident tests, clean pipeline — and an incentive model nobody had stress-tested, a bootstrapping assumption nobody had validated, a failure mode nobody had named. The kind of thing that shows up months after deploy when an arbitrageur finds the drain you left open.

  By the time a test suite or auditor surfaces a design flaw like that, the architecture is already built around it. What follows is rounds of refactoring and new audit cycles — a bill that can make the whole thing financially unviable. The harness that catches it early is the one that runs before the AI opens the editor.

  So I built defi-builder-skills — a marketplace of Claude Code skills that implements that upstream harness: structured protocol discovery (go/no-go before any code), followed by a full spec phase before any Solidity, then function-by-function implementation with audit passes built in.

  The upstream and downstream harnesses connect directly — the discovery skill hands off a Protocol Brief to the spec skill, and the spec skill bootstraps a Foundry project from the same security template the CI pipeline is built around.

  Full breakdown of the workflow on my blog:
  👉 https://gil.solutions/blog/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development

  Repository (CC-BY-4.0): https://github.com/melanke/defi-builder-skills

  Install in Claude Code:
  /plugin marketplace add melanke/defi-builder-skills

  If you're thinking about how to structure AI development in your team — especially in high-stakes domains like DeFi — I'd love to compare notes.

  hashtag#DeFi hashtag#Solidity hashtag#SmartContracts hashtag#Web3 hashtag#ClaudeCode hashtag#HarnessEngineering hashtag#Blockchain hashtag#OpenSource hashtag#ProtocolDesign hashtag#DeFiSecurity
twitter-post: |-
  The CI pipeline catches bad code. Discovery and Spec is the harness that runs before that — and it's what's missing from most AI-assisted DeFi builds.

  I packaged it as open-source Claude Code skills.

  https://gil.solutions/blog/discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development

  /plugin marketplace add melanke/defi-builder-skills
---

A few weeks ago I wrote about [the CI pipeline I set up before writing the first contract on American Spend](https://gil.solutions/blog/the-solidity-ci-pipeline-you-should-have-set-up-on-day-one). Ten gates — formatter, static analysis, mutation testing, formal verification — all designed so that when an AI agent writes code, quality doesn't depend on the agent's judgment. The pipeline enforces it.

That's one half of what OpenAI has been calling **Harness Engineering**: building the environment in which AI agents operate reliably, so the model is just one component and the spec, constraints, and feedback loops are the harness. The CI pipeline is the downstream harness — it catches bad code after it's written.

But there's an upstream harness — and in AI-assisted DeFi development, it's mostly missing.

---

### The problem the pipeline can't solve

A CI pipeline can catch a reentrancy bug. It can't easily catch an incentive structure that looked rational on a whiteboard but becomes a drain target the moment a rational actor looks at it sideways — and when it does, it's usually an auditor who finds it, not a linter.

Most DeFi failures I've seen post-mortem don't trace back to bad code — they trace back to an assumption nobody challenged before the first commit. By the time a test suite or audit surfaces it, the architecture is already built around the flaw. What follows is rounds of refactoring, new audit cycles, and a bill that can make the whole thing financially unviable. These are things you have to reason through before the AI opens the editor.

The upstream harness is the structured process that forces that reasoning — and gives the AI a well-defined context to code against once it's done.

---

### The missing harness: `defi-builder-skills`

I packaged this process as a marketplace of Claude Code skills: **defi-builder-skills**.

Two skills. Two phases of the build.

**`defi-protocol-discovery`** takes you from blank page to a go/no-go decision through seven phases:

- **Opportunity Discovery** — systematic scan when you don't have a specific idea yet
- **Idea Sharpening** — Jobs-to-be-Done framing, 5 Whys, problem/solution separation
- **Landscape & Analogues** — competitive map, what succeeded and why, what failed and how
- **DeFi Lean Canvas** — value proposition, unique mechanism, channels, revenue, bootstrapping path
- **Economic Viability** — sustainable yield audit, TVL scenarios, unit economics, bootstrapping cost
- **Risk & Assumptions** — ranked assumptions, death spiral mapping, validation plan
- **Go / No-Go** — kill criteria first, then synthesis, verdict, and a Protocol Brief

The output is a set of structured documents in `.discovery/` in your project. If the verdict is GO, the Protocol Brief feeds directly into the next skill.

**`defi-spec-driven`** runs six specification phases before a single line of Solidity:

1. Research — canonical implementations, post-mortems, known failure modes
2. Economic Design — invariants, stress tests, oracle and MEV analysis
3. Architecture — contract system, access control, on/off-chain boundaries
4. Threat Modeling — per-function attack vectors and mitigations
5. Interface, Storage & Events — REQ-* slugs, storage layout, error types
6. Test Specification — fuzz targets, attack scenarios, unit test specs

After the spec, it bootstraps a Foundry project from `melanke/foundry-security-template` — the same template the CI pipeline post is built around — and guides implementation function by function: implement, test, gate, commit, with two audit passes per contract built in.

---

### Three things that shaped the design

**Kill criteria before synthesis.** In the go/no-go phase, the skill asks you to define what would make this a clear *no* before synthesizing whether it's a yes. In practice, almost no one does this — the instinct is to build the case for your own idea. Forcing kill criteria first prevents survivorship bias from creeping into the verdict.

**Challenge mode, not document mode.** A discovery process that just turns your idea into a polished canvas isn't a discovery process — it's a writing exercise. Every phase has a "most dangerous assumption" check built in. The skill's job is to find the weakest point in your economic model before the AI finds the weakest point in your codebase.

**Implicit assumptions are attack vectors.** An unresolved ambiguity in the economic model becomes an implicit assumption in the spec. An implicit assumption in the spec is a potential attack vector in the code. Everything has to be resolved explicitly before the go/no-go — nothing gets answered silently with optimism.

> Key trade-off: this process is deliberately slow at the front. Discovery takes hours. The spec phases take days. What you're buying is a code phase that moves faster, with fewer reworks, and without the category of failure that shows up months after deploy — the kind the pipeline would never have caught anyway.

---

### How to install

```
/plugin marketplace add melanke/defi-builder-skills
/plugin install defi-protocol-discovery@defi-builder-skills
/plugin install defi-spec-driven@defi-builder-skills
```

Repository (CC-BY-4.0): [github.com/melanke/defi-builder-skills](https://github.com/melanke/defi-builder-skills)

Start from any entry point:

```
/defi-protocol-discovery                        — open exploration, no idea yet
/defi-protocol-discovery something for LPs      — focused on a space
/defi-protocol-discovery A fixed-rate lending vault for protocol treasuries
```

---

### Final thought

The CI pipeline is the seatbelt. The discovery and spec workflow is the road test you run before you get on the highway. Both are part of the same discipline: building the harness that lets AI move fast without moving recklessly.

Neither replaces good engineering judgment. Both make it easier to apply.

---

If you're building in DeFi and want to compare notes on this workflow — or on Harness Engineering more broadly — feel free to connect or message me. I'm always open to exchanging ideas with other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
