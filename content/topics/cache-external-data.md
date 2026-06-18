# Free Gas Wins on Solidity Function Boundaries: `calldata` Inputs and Cached External Reads

Original titles:
- How to handle Cache of external data
- use calldata for read-only params

> **Merged**: combines the original `cache-external-data.md` and `calldata-read-only-params.md` topics — both are gas wins on the *boundary* of a function call. `calldata` avoids the ABI-decode memcpy on inputs; cached external reads avoid the `STATICCALL` overhead on outputs. Same mental model: "don't pay the boundary cost more than once".

## Related Lessons

- [01 #4 — `calldata` instead of `memory` for read-only parameters](01-gas-optimization.md)
- [01 #5 — Cache external calls in batch (lens pattern)](01-gas-optimization.md)
- [01 #2 — Local cache of variables read multiple times in the same transaction](01-gas-optimization.md)
- [04 #2 — Cached payoutPool](04-defi-accounting.md)
