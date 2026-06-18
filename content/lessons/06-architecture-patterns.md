# 06 — Architecture Patterns

Lessons on overall structure: factory + clones, lens, libraries, modularization, interfaces.

---

## [#1] Factory + Clones with validation logic in the factory

**Source commits:** `21bb5ec` Add reentrancy guards and move validation of createMarket from Market to MarketFactory; `a2a136ee`
**Pattern:**
> Factory validates everything (timing, outcomes, fees, seed feasibility), then creates clone via OZ Clones lib, then calls `clone.initialize()`. Clone assumes inputs are already valid.
**Why it matters:** clones don't carry validation in bytecode (size saved); centralized validation (single source of truth); factory can validate against global state.
**How to apply:** factory + clones architectures always validate in the factory. Clone has minimal `initialize()`.
**Skill seed:** "In factory + clone architectures, audit duplicated validations in the clone and move to factory."

---

## [#2] Lens pattern to reduce runtime size

**Source commits:** `0ffe023` Move Market.sol's view methods to the new MarketLens.sol; `0b3aaf93` Move read methods from Market to MarketLens
**Pattern:**
> Separate `XLens.sol` with `IXLens` interface. Constructor `MarketLens(address market, address factory)`. Lens reads via interfaces. Frontends call Lens, not Market.
**Why it matters:** Market.sol fits below 24KB; Lens can be deployed/redeployed independently; isolated tests.
**How to apply:** derived views, non-mutative calculations, getter aggregates → Lens.
**Skill seed:** "For contracts close to EIP-170, suggest splitting into XLens.sol with derived views."

---

## [#3] ERC6909 for multi-token systems

**Source commits:** `e15aa228` Refactor OutcomeToken as ERC6909
**Pattern:**
> Instead of N ERC20 clones for N outcomes/positions, single ERC6909 contract with `tokenId = outcomeIndex`. Mints/transfers ~30-50% cheaper.
**Why it matters:** prediction markets, complete sets, multi-leg positions: ERC6909 eliminates clone overhead.
**How to apply:** when system has N correlated tokens with same lifecycle, ERC6909.
**Skill seed:** "Detect multi-token systems using N ERC20 clones and suggest migration to ERC6909."

---

## [#4] Library for shared math/pure logic

**Source commits:** `f1112b2` Reduce Market contract size by moving logic to MarketMath
**Pattern:**
> `library MarketMath { function _computeRakeAndNet(...) internal pure }`. `using MarketMath for ...` in consumer contracts.
**Why it matters:** reduces Market.sol by ~1.6KB; pure logic is testable in isolation; shared usage.
**How to apply:** `pure` functions appearing in 2+ contracts → library.
**Skill seed:** "Identify `pure` functions in large contracts and propose extraction to library."

---

## [#5] Library for shared constants

**Source commits:** `df45bf6` Cap graduate caller reward, dedupe constants
**Pattern:**
> `library MarketConstants { uint16 internal constant BPS_DENOMINATOR = 10000; ... }`. Each contract imports directly. No public getter.
**Why it matters:** prevents drift between contracts; change in one place propagates; smaller bytecode.
**How to apply:** constants in 2+ contracts → shared library.
**Skill seed:** "Detect duplicated constants between contracts and propose library."

---

## [#6] Interfaces in separate files

**Source commits:** `2fc7518` Use interfaces
**Pattern:**
> `src/interfaces/IMarket.sol`, `IMarketFactory.sol`, `IOutcomeToken.sol`, `IOrderBook.sol`. Implementations `is IFoo`. Tests mock via interface.
**Why it matters:** decouples contracts; allows mocks; clarifies external contract.
**How to apply:** every externally referenced contract has separate interface.
**Skill seed:** "Force interface/implementation separation for externally referenced contracts."

---

## [#7] Multiple alternative implementations + benchmark + delete losers

**Source commits:** `0a1fffe` Allow Market to have different CLOB implementations; `f733c9a` Create different CLOB implementations; `40184ef` Remove obsolete CLOB implementations
**Pattern:**
> For gas-critical components: code 2-3 alternatives (CLOBBitmap, CLOBLinkedList, CLOBRBTree, CLOBReference); run identical benchmarks; generate `PERFORMANCE_REPORT.md`; choose winner; delete losers in dedicated commit.
**Why it matters:** algorithm decisions (bitmap vs RB-tree) need data, not intuition. But alternative code in production = debt.
**How to apply:** A/B/C/D test → benchmark → choose → delete.
**Skill seed:** "For gas-critical components, suggest benchmark-then-delete workflow: explore N implementations, choose 1, delete others."

---

## [#8] Default deployer pattern (CLOBDefaultDeployer)

**Source commits:** `2ec2673` Move CLOBDefaultDeployer to the libraries folder
**Pattern:**
> `library CLOBDefaultDeployer` encapsulates CLOB implementation deploy with default config. Factory delegates to deployer; changing implementation = swap deployer.
**Why it matters:** decouples Factory from specific CLOB type. Testability: replace deployer in tests.
**How to apply:** components with multiple possible variants → pluggable deployer library.
**Skill seed:** "For pluggable components, suggest deployer library pattern."

---

## [#9] Preferred immutability in "instances"

**Source commits:** `53ab45b` Remove upgreadability from Market contract
**Pattern:**
> Distinguish "protocol upgrade" (Factory: UUPS) from "instance upgrade" (Market: immutable). Each market is "a game" — once created, immutable rules.
**Why it matters:** immutable instances are more auditable and secure; upgrade adds ~200-300 unnecessary bytes.
**How to apply:** only make upgradeable what has clear motivation. Markets/instances rarely.
**Skill seed:** "Evaluate each upgradeable contract: does it really need to be? If not, remove UUPS."

---

## [#10] Outcome token implementation set externally

**Source commits:** `a0a721f` setOutcomeTokenImplementation
**Pattern:**
> Factory has admin function `setOutcomeTokenImplementation(addr)`. Allows swapping OutcomeToken implementation without Factory redeploy.
**Why it matters:** evolution of implementations without disruptive migration.
**How to apply:** sub-components with independent lifecycle → admin setter on factory.
**Skill seed:** "In factory + clones, expose admin setters for sub-component implementations."

---

## [#11] Setter propagation for shared admin params

**Source commits:** `b961c09` Add setTreasury; `7af690d` Prepagate the setTreasury to the CLOBs
**Pattern:**
> `Market.setTreasury(addr)` iterates `clobs[]` and calls `clob.setTreasury(addr)`. Syncs shared state.
**Why it matters:** critical state in parent + children must sync; otherwise drift.
**How to apply:** identify state shared between parent and children; parent setter propagates.
**Skill seed:** "Audit admin params in parent: if shared with children, setter must propagate."

---

## [#12] Metadata struct in creation (not individual params)

**Source commits:** `62421b2` Allow the owner to inform the whole OutcomeMetadata
**Pattern:**
> `createMarket(metadata: OutcomeMetadata)` instead of `createMarket(title: string, ...)`. Struct contains: name, symbol, label[outcome], spendId, iconUri.
**Why it matters:** stable ABI (adding field doesn't break); readable in caller; centralized documentation.
**How to apply:** APIs with 4+ related parameters → struct.
**Skill seed:** "In factory APIs with many params, suggest struct param for stable evolution."

---

## [#13] Test-only compat library scoped to `test/`

**Source commits:** `0315928` scope test-only compat lib to tests
**Pattern:**
> `MarketFactoryTestCompat.sol` in `test/` (not `src/`), with comment `/// @dev TEST-ONLY: production uses new API`.
**Why it matters:** prevents accidental use of helper in production; signals API breakage.
**How to apply:** test helpers in `test/` with explicit naming + comment.
**Skill seed:** "Test-only helpers never in src/; always in test/ with `@dev TEST-ONLY` comment."

---

## [#14] Pluggable modular CLOB via `IOrderBook`

**Source commits:** `0a1fffe` Allow Market to have different CLOB implementations
**Pattern:**
> `IOrderBook` interface with placeLimit, marketBuy/Sell, cancelOrder, etc. Market interacts with `IOrderBook[] clobs`. Factory injects implementation via `CLOBDefaultDeployer`.
**Why it matters:** allows different algorithms per market type (HFT vs longtail); swap implementation without redeploy.
**How to apply:** components with chooseable algorithm → interface + factory selector.
**Skill seed:** "For components with possible algorithmic variants, suggest interface + pluggable via factory."

---

## [#15] BPS (basis points) as canonical pricing unit

**Source commits:** `b69176a` Start CLOB implementation; several
**Pattern:**
> Pricing in `priceBps` (e.g., 5000 = 50%, or 0.5). 10000 = 100%. Constant `BPS_DENOMINATOR = 10000`.
**Why it matters:** avoids unit ambiguity; divisible by 2/4/5; finance standard.
**How to apply:** always use BPS for fees, slippage, percentages.
**Skill seed:** "In pricing/percentage code, force BPS as canonical unit (10000 = 100%)."

---

## [#16] Sequential order IDs

**Source commits:** `b69176a` Start CLOB implementation
**Pattern:**
> `uint256 nextOrderId = 1; orderId = nextOrderId++`. Monotonic IDs, easy to search/cursor.
**Why it matters:** matching, cancel range, indexers — all work better with sequential IDs.
**How to apply:** ordering systems → always sequential IDs.
**Skill seed:** "In order books, use sequential IDs (not hash/uuid)."

---

## [#17] 2-step ownership for admin contracts

**Source commits:** `f6ab2b0` Use Ownable2StepUpgradeable
**Pattern:**
> Factory uses `Ownable2StepUpgradeable`. New owner needs `acceptOwnership()`.
**Why it matters:** prevents fat-finger transfers to wrong addresses.
**How to apply:** every admin-critical contract → 2-step.
**Skill seed:** "Audit OwnableUpgradeable in admin contracts; suggest Ownable2Step."

---

## [#18] DisableInitializers in implementation constructor

**Source commits:** `b6911a3d` Add disableInitializers in the constructors
**Pattern:**
> In UUPS implementation contracts: `constructor() { _disableInitializers(); }`. Prevents implementation from being initialized directly (only via proxy).
**Why it matters:** without this, implementation can be hijacked + initialized by attacker.
**How to apply:** every UUPS implementation has `_disableInitializers()` in constructor.
**Skill seed:** "Audit UUPS implementations: constructor must call `_disableInitializers()`."

---

## [#19] Custom security contact in all contracts

**Source commits:** `e3b1f3be` Add 33labs.ai as security contact
**Pattern:**
> NatSpec `/// @custom:security-contact security@33labs.ai` in each contract. Auditors and bug bounties have a clear channel.
**Why it matters:** responsible disclosure; defined channel prevents public vulns.
**How to apply:** every contract deployed on mainnet → security contact.
**Skill seed:** "Force `@custom:security-contact` in all production contracts."

---

## [#20] Scope documentation via SCOPE.md

**Source commits:** `25e1c90` Reorganize unit tests and do audit prep
**Pattern:**
> `SCOPE.md` lists in-scope contracts, LOC, external dependencies (Vault, CollateralToken), explicit assumptions.
**Why it matters:** auditors know what to audit; reduces "scope surprises".
**How to apply:** before audit, prepare SCOPE.md with contracts, LOC, deps, assumptions.
**Skill seed:** "Before audit, generate SCOPE.md auto from imports and dependencies."

---

## [#21] Red-Black tree as on-chain price-level index for an order book

**Source commits:** `f733c9a` Create different CLOB implementations, test and create a report comparing them; `40184ef` Remove obsolete CLOB implementations; `2ec2673` Rename CLOBRBTree to just CLOB
**Category:** orderbook data structures
**Pattern:**
> Active bid/ask **price levels** are indexed in two `solady RedBlackTreeLib.Tree` instances. The matcher uses `nearestAfter(from)` (asks) and `nearestBefore(from)` (bids) to **hop directly to the next populated level** instead of scanning the tick range. Per-level FIFO queues hold the actual order ids, so the tree only stores price keys, not orders.
**Why it matters:** linear scans over the full tick space (`CLOBReference` baseline) are catastrophic in sparse books — e.g. the comparison report measured `56,356,142` gas for a single sparse match in the array baseline vs `145,390` with the RB-tree (~99.74% reduction). The same pattern bricks `cancelChurn` (`33.4M` → `2.06M`). On L1, this is the difference between a usable book and an unusable one.
**How to apply:** for any on-chain ordered set with sparse keys, frequent insert/delete and "next non-empty key ≥ X" queries (order book price levels, sparse expiry buckets, scheduled-tasks calendar), prefer a balanced tree (Solady's RB-tree) over a tick-scan or fixed bitmap. Maintain the tree only on the **0↔1 transition** of an active counter so multiple orders at the same price don't pay tree-write costs.
**Skill seed:** "When auditing on-chain order books or sparse-key indexes, flag designs that linear-scan a tick/price range and propose a balanced-tree price index (RB-tree) with `nearestBefore`/`nearestAfter` traversal."

---

## [#22] FIFO per price level: append-only id queue + moving head + active-counter for tree maintenance

**Source commits:** `f733c9a` Create different CLOB implementations; `b69176a` Start CLOB implementation; `2ec2673` Rename CLOBRBTree to just CLOB
**Category:** orderbook data structures
**Pattern:**
> Each price level holds three structures, NOT a doubly-linked list of orders:
> 1. `mapping(price => uint256[]) buyOrderIdsByPrice` — append-only queue of order ids.
> 2. `mapping(price => uint256) buyQueueHeadByPrice` — moving consume cursor; cancelled / fully-filled heads are skipped lazily (`if (!order.active || order.remaining == 0) { head++; continue; }`).
> 3. `mapping(price => uint256) activeBuyCountByPrice` — counts live orders at the level; on `0→1` insert price into the RB-tree, on `1→0` remove it.
> The price tree is **only** updated on the active-count edge transitions, so deep same-price queues amortize tree maintenance to one insert + one remove per level.
**Why it matters:** writing one tree node per order would multiply gas on deep-queue scenarios (the perf report measured first-insert / deep-insert = `345,969 / 210,581` for RB-tree; doing tree work per order would have been multiples of that). Lazy head also avoids O(n) shifts on cancellation. Mid-fill dust cleanup (`63e9ac8`) plugs into the same active-counter invariant — when a maker is removed early, `_decrementActiveSellLevel` keeps the tree index consistent.
**How to apply:** when you need price-time priority on-chain, separate "level set" (tree) from "order queue" (array + head). Gate tree writes on a counter so per-level bookkeeping is paid once, not per order. Use lazy head advancement instead of array shifts for cancellation/dust.
**Skill seed:** "In on-chain CLOBs, audit whether the price-level index is updated per-order or per-level transition. Suggest counter-gated tree maintenance and lazy head pointers over array shifts."

---

## [#23] Decision-by-shootout: bench RB-tree vs linked-list vs bitmap vs array baseline before committing

**Source commits:** `f733c9a` Create different CLOB implementations, test and create a report comparing them; `40184ef` Remove obsolete CLOB implementations; `5bec3ce` Bring back CLOBLinkedList to compare cancelAllOrders performance; `2fc7518` Use interfaces (final removal of LinkedList)
**Category:** orderbook data structures
**Pattern:**
> Four order-book backends were implemented behind a shared `IOrderBook` (#14): `CLOBReference` (baseline `mapping(price => uint256[])` linear-scan), `CLOBBitmap` (fixed-range bitmap of active prices), `CLOBRBTree` (Solady RB-tree of active prices), `CLOBLinkedList` (sorted doubly-linked list — buys descending, sells ascending). All run the same harness over Sparse / Dense / Deep-queue / Cancel-churn scenarios; `CLOB_ORDERBOOK_PERFORMANCE_REPORT.md` records the gas numbers. Outcome: RB-tree and Linked-list near-tied at the top, RB-tree picked for slightly better cancel-churn behaviour and stable scaling. LinkedList was reintroduced once (`5bec3ce`) just to bench `cancelAllOrders` and removed again (`2fc7518`).
**Why it matters:** the structures look interchangeable on paper but diverge by 1–3 orders of magnitude under realistic loads:
> - Sparse single match: baseline `56.4M` gas, bitmap `288K`, RB-tree `145K`, linked-list `145K`.
> - Cancel churn: baseline `33.4M`, bitmap `2.27M`, RB-tree `2.06M`, linked-list `2.07M`.
> - Dense match: bitmap was actually **worse** than baseline; RB-tree won.
> Picking by intuition would have shipped the bitmap (most-cited ERC-DEX trick), which loses on dense and deep-queue paths.
**How to apply:** for gas-critical data structures with multiple plausible designs (price index, expiry index, leaderboard), implement at least 2 candidates behind a shared interface, run a uniform benchmark across realistic scenarios (sparse, dense, deep, churn), and **archive the report in the repo with raw gas numbers**. Keep the baseline implementation (or a snapshot thereof) as the correctness anchor when extending the winner.
**Skill seed:** "Before committing to a complex on-chain data structure, propose a 2–4 candidate shootout behind a shared interface and a markdown gas report covering sparse/dense/deep-queue/churn scenarios."
