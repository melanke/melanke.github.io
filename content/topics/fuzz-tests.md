# Fuzz and Invariant Testing in Solidity: From `deposit(100)` Tests to Conservation Laws

Original titles:
- Como e quando criar fuzz tests?
- Invariant/property-based fuzzing (Foundry invariant_*, Echidna, Medusa) — em vez de "testar que deposit(100) retorna 100 shares", você afirma propriedades globais que valem em qualquer trajetória de estado: conservação (Σ user balances == totalSupply), monotonicidade (graduated nunca volta pra false), no-cross book (bestBid < bestAsk). O fuzzer encontra a sequência de chamadas que viola — você não precisa adivinhar o cenário.

> **Merged**: combines the original `fuzz-tests.md` and `invariant-property-fuzzing.md` topics — invariant/property-based fuzzing is the strongest form of fuzz testing, so a single article covers parameter fuzzing → property assertions → stateful invariants on the same continuum.

## Related Lessons

- [07 #1 — Invariant tests from the start](07-testing-strategies.md)
- [09 #2 — INVARIANTS.md documents core properties](09-audit-preparation.md)
- [09 #15 — Bounded loops and evident cursor patterns](09-audit-preparation.md)
- [07 #6 — Hierarchical reorganization: base → unit → integration → fuzz](07-testing-strategies.md)
