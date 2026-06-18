# End-to-End and Back-Testing for Smart Contracts: Replay Scripts, Comparative Oracles, and UI Prototypes That Surface UX Bugs

Original titles:
- Como e quando criar end to end tests?
- Como e quando criar back-testing (scripts que replicam comportamentos de contratos similares)? E sobre criar scripts que fazem replay continuo em tempo real para sentir a UX com um protótipo de UI?

> **Merged**: combines the original `end-to-end-tests.md` and `back-testing-replay.md` topics — both go beyond unit/integration tests to exercise the contract end-to-end, just on different inputs (synthetic full-lifecycle scenarios vs replayed real-world traces from a comparable protocol). One article covers when to write each and how UI prototypes amplify both.

## Related Lessons

### E2E (synthetic full-lifecycle)
- [07 #16 — E2E test covering all phases](07-testing-strategies.md)
- [07 #6 — Hierarchical reorganization: base → unit → integration → fuzz](07-testing-strategies.md)
- [07 #10 — Separate vault interaction tests](07-testing-strategies.md)
- [07 #11 — Lens vs Market parity tests](07-testing-strategies.md)

### Back-testing / replay (real-world scenarios + UI prototype)
- [07 #3 — Replay tests against real oracle](07-testing-strategies.md)
- [12 #2 — Continuous replay script for integration](12-tooling-development.md)
- [12 #4 — Replay pipeline with scrapers](12-tooling-development.md)
- [12 #1 — UI prototype for pre-audit contract feel](12-tooling-development.md)
- [09 #6 — Pre-audit replay comparison test](09-audit-preparation.md)
- [10 #11 — Continuous replay script](10-deployment-operations.md)
- [10 #12 — UI prototype to feel the contract](10-deployment-operations.md)
