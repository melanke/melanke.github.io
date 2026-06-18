# Lessons Learned — Markets V2

Knowledge base extracted from the 112 commits by Gil Lopes Bueno on the `markets` project (prediction market with CLOB + vault yield + ERC6909). Organized by theme for future use as a basis for skills.

## How to use

- Each file groups lessons by theme, in a format consumable by both human and LLM.
- Each lesson has: title, source commits, pattern, motivation, how to apply, "skill seed" (prompt-hint to turn into a skill).
- Filter what matters: tag with `[KEEP]` what you want to turn into a skill; remove or ignore the rest.

## Index

| # | File | Content |
|---|---|---|
| 01 | [gas-optimization.md](01-gas-optimization.md) | Storage reads, getters vs public state vars, calldata vs memory, loop fusion, caching |
| 02 | [runtime-size-optimization.md](02-runtime-size-optimization.md) | EIP-170 (24KB), Lens pattern, libraries, error consolidation, optimizer settings |
| 03 | [security-patterns.md](03-security-patterns.md) | Reentrancy (transient), slippage bounds, max position, front-running, timing locks |
| 04 | [defi-accounting.md](04-defi-accounting.md) | Vault loss waterfall, seeded liquidity tracking, mint/burn symmetry, payout caps, supply exclusion |
| 05 | [lifecycle-management.md](05-lifecycle-management.md) | Graduation, resolution, cancellation, async finalization, idempotency flags, deferred settlement |
| 06 | [architecture-patterns.md](06-architecture-patterns.md) | Factory + clones, Lens pattern, library extraction, ERC6909 multi-token, interface segregation |
| 07 | [testing-strategies.md](07-testing-strategies.md) | Fuzz/invariant, performance benchmarks, replay tests, Gherkin, stress tests, mock reentrant |
| 08 | [code-style-conventions.md](08-code-style-conventions.md) | Naming (`_` suffix), `@inheritdoc`, modifier ordering, error naming, NatSpec discipline |
| 09 | [audit-preparation.md](09-audit-preparation.md) | Slither workflow, KNOWN_ISSUES.md, INVARIANTS.md, SCOPE.md, replay comparison |
| 10 | [deployment-operations.md](10-deployment-operations.md) | Deploy scripts, env separation, JSON artifacts, multi-step init, CI pinning |
| 11 | [bug-patterns-from-fixes.md](11-bug-patterns-from-fixes.md) | Generalizable patterns from audit-finding fixes (idempotency, escrow, blacklist tolerance) |
| 12 | [tooling-development.md](12-tooling-development.md) | UI prototypes, replay bots, graduation bots, integration scripts |

## File format

```
## [#N] Lesson title

**Source commits:** `hash` <commit msg>; (optional next)
**Category:** optional subcategory
**Pattern:**
> 2-4 lines describing the "what"
**Why it matters:** context/risk that motivated it
**How to apply:** criteria to reuse in future projects
**Skill seed:** suggested short prompt to turn into a skill
```

## Suggested filtering format

Add inline tags:
- `[KEEP]` — turn into skill
- `[DROP]` — discard
- `[MERGE→01]` — move/merge with lesson #X in another file
- `[REVISE]` — want it, but rewrite
