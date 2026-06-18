# Mutation Testing for Solidity: The Honest Metric Behind Test Suite Quality (Vertigo, Gambit, Slither-Mutate)

Original title: Mutation testing (ex: vertigo, gambit, slither-mutate pra Solidity) — muta o código de
  produção (troca + por -, > por >=, deleta requires) e roda a suíte. Se nenhum teste falha, o
  teste é tautológico ou cobre código morto. Mutation score é a métrica honesta de qualidade da
   suíte, não cobertura de linhas.

## Related Lessons

- [07 #1 — Invariant tests from the start](07-testing-strategies.md) (related: invariants are mutation-resistant by construction)
- [09 #8 — Remove redundant checks](09-audit-preparation.md) (related: dead code is a mutation-test signal)

> **Lesson gap**: mutation testing as a methodology (`vertigo`, `gambit`, `slither-mutate`, mutation score interpretation) is not yet captured. Phase 2 will check for any commit/code evidence — if none exists, this remains aspirational and no lesson is created.
