# Building an On-Chain CLOB: Price-Time Priority, Ladder Seeding, and the Data Structures Behind Each Matching Choice

Original titles:
- diferentes abordagens ao construir um clob
- LinkedList, RBTree e outros tipos que podem ser usados para melhorar performance em contratos

> **Merged**: combines the original `abordagens-clob.md` and `linkedlist-rbtree-tipos.md` topics — data-structure selection (RB-tree vs linked list vs bitmap vs sorted-array baseline) IS the central CLOB design choice, validated in this codebase by an explicit four-implementation shootout behind `IOrderBook`. Article covers high-level model (CLOB vs AMM, price-time priority, ladder seeding) and the structures that implement it.

## Related Lessons

### CLOB design
- [06 #14 — Pluggable modular CLOB via `IOrderBook`](06-architecture-patterns.md)
- [06 #15 — BPS (basis points) as canonical pricing unit](06-architecture-patterns.md)
- [06 #16 — Sequential order IDs](06-architecture-patterns.md)
- [04 #15 — Zero maker rebate for protocol-as-maker](04-defi-accounting.md)
- [11 #11 — Phase 2 buy from seeded ask without accounting callback](11-bug-patterns-from-fixes.md)
- [05 #12 — Reentrancy-safe bounded order cancellation](05-lifecycle-management.md)
- [05 #6 — Cancel CLOB orders on resolve/cancel market](05-lifecycle-management.md)

### Data structures
- [06 #21 — Red-Black tree as on-chain price-level index for an order book](06-architecture-patterns.md)
- [06 #22 — FIFO per price level: append-only id queue + moving head + active-counter for tree maintenance](06-architecture-patterns.md)
- [06 #23 — Decision-by-shootout: bench RB-tree vs linked-list vs bitmap vs array baseline before committing](06-architecture-patterns.md)
- [07 #2 — Comparative performance benchmarks](07-testing-strategies.md)
- [12 #5 — Performance benchmark report](12-tooling-development.md)

> **Lesson gap candidate**: an even higher-level design comparison (price-time priority vs pro-rata, ladder seeding strategies, on-chain vs off-chain matching). Could grow into a separate companion piece if the article gets too long.
