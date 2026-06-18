---
social-post: |-
  🤔 More context doesn't always mean better output — sometimes splitting the work is what actually works.

  In my latest article, I dig into when parallel sub-agents in Claude Code are actually worth it — and what goes wrong when you reach for them too soon. Learned this the hard way on American Spend and Mosaic.

  If you're experimenting with agent orchestration, this one's for you. 👇 Read the article below.

  hashtag#ClaudeCode hashtag#AIAgents hashtag#SoftwareEngineering hashtag#LLM hashtag#Web3 hashtag#SmartContracts hashtag#DeveloperExperience hashtag#AgentOrchestration
---
# When to Split the Work: Running Parallel Sub-Agents in Claude Code

A few months into using Claude Code seriously, I hit a wall — not a bug, not a missing feature, but a strategy question. The model is capable. The context window is large. So why does giving it everything at once sometimes produce worse results than splitting the job across multiple agents working in parallel?

The answer isn't about the model's limits. It's about the structure of the work itself.

---

### The Problem With "Just One Big Prompt"

When I started using Claude Code for American Spend — building and iterating on the smart contract layer, the indexers, the frontend flows — my default was the obvious one: one conversation, one long context, throw everything in. File tree, requirements, existing code, the thing I want done. Let the model hold it all and figure it out.

That works. Until it doesn't.

What I kept noticing was a kind of **attention dilution** — the model would do a competent job on the most prominent part of the prompt and let quieter requirements slip. Ask it to refactor a contract, audit it for security issues, *and* update the tests, and you'd often get two of three done well. The third would be surface-level. Not wrong — just thin.

This isn't a flaw in the model. It's the same thing that happens to a senior developer who's asked to review a PR, write new tests for it, and draft the release notes in one sitting. Something gets less attention.

---

### What Parallel Sub-Agents Actually Are

In Claude Code, a **sub-agent** is a separate agent spawned with its own task, its own context window, and — crucially — its own focused mandate. You can run multiple sub-agents in parallel: one analyzing security properties, one writing tests, one updating documentation, all working at the same time without polluting each other's context.

The mental model that clicked for me: think of it less like threads and more like handing the job to three different specialists who each get a clean brief, rather than one generalist who has to juggle everything.

```
# Orchestrator spawns two agents — the second depends on the first's output.
# Independent tasks (no shared state) would run in parallel instead.

Task(
  subagent_type="general-purpose",
  description="Security review",
  prompt="Review contracts/MarketFactory.sol for reentrancy and access control issues.
          Write findings to scratch/security.md."
)

# Runs AFTER the above completes — reads its output as input.
Task(
  subagent_type="general-purpose",
  description="Test writer",
  prompt="Read contracts/MarketFactory.sol and scratch/security.md.
          Write Foundry tests covering the identified edge cases.
          Output to test/MarketFactory.t.sol."
)
```

The test-writer reads the security findings as input — that's the key. Sub-agents aren't isolated silos. They share artifacts through files. The orchestrator sequences dependencies; truly independent tasks run in parallel.

---

### When Parallel Sub-Agents Win

The pattern pays off clearly in three situations.

**1. Genuinely independent concerns at the same scope level.** When I was building Mosaic, I had several different contract modules that didn't share state. Analyzing each module's logic was truly independent work — no module needed to know what the analyzer found about the other. Spawning one sub-agent per module and running them simultaneously cut the wall-clock time dramatically, and each finding was sharper because the agent had focused context.

**2. Multi-phase pipelines where an earlier result feeds the next.** Security audit work is the cleanest example. Recon first — understand the architecture, map the attack surface, inventory state variables. Then breadth analysis — multiple agents each covering a portion of the codebase, in parallel. Then depth — targeted investigation of the highest-risk findings. Each phase hands artifacts to the next. A single long conversation trying to do all of this at once loses the thread by phase three.

**3. When you need model diversity or role separation.** There's a subtler benefit: two agents looking at the same code from different angles — one tasked with "find the bug," the other with "find why there is no bug here" — will produce richer output than one agent asked to do both. The Devil's Advocate pattern I use in audit work exists precisely because soft instructions ("think critically") don't create real divergence. A hard role assignment to a separate agent does.

---

### When a Single Bigger Prompt Is Better

Parallel sub-agents add overhead — orchestration logic, file I/O between agents, context setup per agent. For small, tightly coupled tasks, that overhead is pure waste.

If I'm asking Claude Code to refactor a single function and update its call sites, spawning sub-agents for "refactor" and "update callers" is slower and more fragile than one agent that holds both in context simultaneously. The agents would need to share intermediate state constantly. The task is inherently sequential and small — one prompt wins.

The heuristic I use:

> If the sub-tasks can each be fully specified *without knowing the result of the other*, they're parallel candidates. If specifying sub-task B requires knowing what sub-task A produced — and A is fast — keep it in one context.

Also: sub-agents are worse at catching their own gaps. A single agent that writes a function and its tests in one pass will naturally notice when the test doesn't cover a branch it just wrote. Two separate agents — one writing, one testing — need explicit instructions to close that loop. You have to design the artifact handoff carefully or you get tests that pass over incorrect assumptions.

---

### Failure Modes I've Actually Hit

**Context bleed through shared files.** If sub-agent A writes a file that sub-agent B reads, and A outputs something verbose and opinionated, B sometimes anchors on A's framing instead of doing independent analysis. The fix is to structure outputs as data, not prose — tables, structured findings, explicit fields — so the receiving agent ingests facts rather than inheriting reasoning.

**Orphan work.** A sub-agent finishes a task nobody reads. This happens when the orchestrator doesn't have a clear "merge" step that explicitly pulls sub-agent outputs together. Without it, parallel findings sit in separate files and the overall picture never forms. The orchestrator needs to do a deliberate synthesis pass — it's not automatic.

**Overconfident independence.** Sometimes I spawn parallel agents for work that turned out to be coupled. Agent 1 modifies a shared interface; Agent 2, not knowing, writes code against the old interface. In a real dev team you'd catch this in a PR. With parallel agents, you catch it when the orchestrator tries to merge and things don't compile. The lesson: be conservative about what you declare independent. When in doubt, sequence it.

---

### The Practical Pattern I've Settled On

For anything non-trivial — a feature that touches multiple layers, a security review of more than one contract, a refactor that has a discovery phase and an execution phase — I now default to this structure:

1. **One recon agent first.** Understand the codebase, map dependencies, write a compact brief. This is always sequential; you need the brief before you can assign work.

2. **Parallel analysis agents.** Each agent gets a scoped mandate and writes structured output to a named file. No agent reads another's work during this phase.

3. **One synthesis agent.** Reads all the output files, deduplicates, resolves conflicts, produces the final artifact.

It's more scaffolding upfront. But the quality of the outputs — especially on anything with real complexity — is consistently better than what a single long conversation produces. And because agents run in parallel, the wall-clock time is often *shorter* even though you're running more of them.

---

### Final Thought

The real skill here isn't prompt syntax or API calls. It's thinking about the *dependencies* of your tasks before you start. Parallel agents win when the work is actually parallel. A single context wins when the work is actually sequential. Knowing which you're in requires a brief moment of design thinking before you open a new conversation.

It's the same discipline that makes good software architecture. Break things apart at their natural seams. Hold things together where coupling is real.

---

If you're building with Claude Code and experimenting with agent orchestration, I'd love to compare notes — what's worked, what blew up, what's still an open question. Feel free to connect or message me.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
