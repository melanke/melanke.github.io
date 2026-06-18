---
social-post: |-
  💡 A struct isn't just a style choice — used wrong, it introduces a silent bug the compiler will never catch.

  Building MarketFactory and MarketLens for American Spend forced me to think carefully about when a struct genuinely earns its place and when it quietly undermines the value it was supposed to create. I share what I learned from those decisions.

  If you write or review Solidity, this one's for you. 👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#EVM hashtag#SoftwareEngineering hashtag#Web3 hashtag#DeFi hashtag#BlockchainDevelopment hashtag#APIDesign
---
# When to Reach for a Struct in Solidity

From my experience building prediction market contracts at American Spend, structs are one of those things developers underuse in some places and misuse in others. The underuse shows up as functions with eight positional parameters — good luck calling that from a test without constantly second-guessing the order. The misuse shows up as tuple destructuring, which looks clean until a teammate reorders fields and the compiler says nothing.

Three situations where a struct genuinely earns its keep, and one consumption pattern that quietly destroys the value you just created.

---

### The Stable-API Problem: When Your Function Has Four or More Related Parameters

The first place a struct belongs is at the boundary of a factory API — anywhere you're creating a new entity and passing in its configuration.

When we built the `MarketFactory` for American Spend, the original `createMarket` call had loose parameters: a title string, an array of outcome labels, a spend ID, an icon URI, a symbol. That's already five. The moment anyone on the team added a field — which happened more than once — it was an ABI-breaking change. Every caller needed updating. Tests needed updating. Frontends needed updating.

The fix was a **metadata struct**:

```solidity
struct OutcomeMetadata {
    string name;
    string symbol;
    string[] outcomeLabels;
    bytes32 spendId;
    string iconUri;
}

function createMarket(
    OutcomeMetadata calldata metadata_,
    MarketConfig calldata config_
) external returns (address market);
```

Adding a field to `OutcomeMetadata` is now a non-breaking change for callers that don't use the new field. The struct also names the group — you're not passing seven anonymous values, you're passing outcome metadata. That's readable in both the implementation and the callsite.

**Key trade-off:** structs in calldata are slightly more ABI-decoding overhead than individual scalar params. For factory calls that happen infrequently, this is irrelevant. For hot paths — matching, settlement — profile before reaching for a struct purely for aesthetic reasons.

---

### The Batch-Accessor Pattern: One External Call Instead of N

The second place structs genuinely help is on the read side — batching related getters into a single call.

In the `MarketLens` contract, there was a stretch where the lens made separate external calls to get `openTime`, `closeTime`, and `resolutionTime` from the market. Three calls. The market was warm after the first, so cost wasn't catastrophic, but it's still three round-trips, three selectors in bytecode, and three opportunities for the lens to drift from the market.

The refactor collapsed them into a single **batched accessor**:

```solidity
struct MarketTiming {
    uint256 openTime;
    uint256 closeTime;
    uint256 resolutionTime;
}

function timing() external view returns (MarketTiming memory) {
    return MarketTiming({
        openTime: openTime,
        closeTime: closeTime,
        resolutionTime: resolutionTime
    });
}
```

One call. One struct. The caller gets everything it needs and doesn't have to care about what order the values come back in — because it reads by field name.

This pattern compounds in lens contracts that aggregate state. If you find yourself writing a frontend query that does five calls to the same contract just to display one card, the contract is probably missing a batched view. The lens pattern in general is about paying the external-call cost once, not per field.

**Key trade-off:** the batched struct means you're always reading all fields, even when the caller only needs one. That's usually fine for view functions — reads are cheap and gas-irrelevant on the frontend path — but if you're calling this in an on-chain loop, think twice about how much memory you're allocating per iteration.

---

### The Typed Bundle: When "Metadata" Is Already a Struct in Disguise

There's a specific anti-pattern worth naming: keeping a string when what you really have is structured data masquerading as free text.

The `Outcome` entity in American Spend originally had a `title string`. That's fine for a simple label. But as the protocol matured, outcomes needed more: a symbol for the ERC6909 token, a set of display labels, a sport identifier for indexers, an icon URI. All of that was conceptually the same thing — metadata about an outcome — and cramming it into a single string (or passing it as separate parameters) was just ignoring the structure that was already there.

The outcome metadata struct didn't just clean up the API. It made validation obvious. The factory can now check `metadata_.outcomeLabels.length == outcomeCount` in one place, fail clearly, and the struct's field names make the intent self-documenting for auditors.

**Key trade-off:** structs in storage cost more writes than individual values if you're only updating one field frequently. If `iconUri` changes weekly and the other fields are immutable, a flat storage layout with individual variables is cheaper. Structs shine when the fields are written together (creation, initialization) and read together (lens queries, validation).

---

### The Silent Bug: Tuple Destructuring of Struct Returns

Now for the misuse pattern — and this one actually bit us.

The `MarketLens` had code that destructured struct returns positionally:

```solidity
// Dangerous
(uint256 a, uint256 b, uint256 c) = market.timing();
```

This works exactly as long as nobody touches the field order in `timing()`'s return struct. The moment a teammate adds a field in the middle — or reorders for readability — the destructuring silently reads the wrong values. No compiler error. No warning. Just wrong data at runtime.

The fix is **field-by-field assignment**:

```solidity
// Safe
MarketTiming memory t = market.timing();
uint256 openTime = t.openTime;
uint256 closeTime = t.closeTime;
uint256 resolutionTime = t.resolutionTime;
```

If `resolutionTime` gets renamed or removed, the compiler flags it immediately. You trade three characters of concision for a compile-time guarantee. In a codebase where the lens lives separately from the market and multiple people touch both, that guarantee is not optional.

**Key trade-off:** field-by-field assignment is more verbose. On a struct with twelve fields, it's a lot of lines. But the alternative is a latent bug that surfaces when the struct evolves — which structs do, by design. The whole point of grouping fields is to make it easy to add more.

---

### The Decision Heuristic

When I'm deciding whether a struct belongs somewhere, I run through three questions:

1. **Will this group of values evolve together?** — If you'll add fields over time (metadata, config bundles), use a struct so new fields are additive, not breaking.

2. **Will callers always need all of this together?** — Batched accessors in view functions are almost always worth it. Batched structs in hot on-chain paths need a gas justification.

3. **Am I using positional destructuring on the return?** — If yes, refactor to field-by-field immediately. The time you save typing is not worth the debugging session when the struct changes.

The corollary: avoid structs in pure math hot paths. If you have a function that does a division and a subtraction, don't bundle the inputs into a struct just because there are four of them — that's a code-style preference masquerading as architecture.

---

### Final Thought

A struct is a contract between the caller and the callee: _these fields belong together_. When that relationship is real — outcome metadata, market timing, lens query results — the struct earns its keep. It stabilizes your ABI, names the group, and prevents the positional-argument trap where parameter order is load-bearing and invisible. When the relationship is forced, you've added indirection without adding meaning.

The structs that caused us the most pain weren't the ones we didn't create. They were the ones we created correctly but then consumed incorrectly — destructuring by position instead of reading by name. Get the consumption pattern right and the rest follows.

---

If you're building smart contracts and thinking through API design patterns like this, let's connect. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
