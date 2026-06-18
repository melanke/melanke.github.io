---
social-post: |-
  💡 Your contract hit the 24KB wall. The structural moves helped — but you're still 200 bytes over.

  In my latest article, I walk through the detail-level tactics I used on American Spend's Market.sol — the moves that get you across the finish line once the structural work is done.

  Each one comes with a "but" — the tradeoff you need to know before you apply it.

  If you're building a Solidity protocol and watching your bytecode creep up, this is for you. 👇 Read the article below.

  hashtag#Solidity hashtag#SmartContracts hashtag#EVM hashtag#DeFi hashtag#Ethereum hashtag#SoftwareEngineering hashtag#Web3 hashtag#Blockchain
---
# Solidity Contracts Are Getting Too Big — Here's How to Shrink Them

If you've ever seen a Foundry build fail with a cryptic size error right before a deployment, you know the feeling. Everything compiles, the tests pass, and then: your contract is 24,612 bytes and EIP-170 says the limit is 24,576. You're over by 36 bytes. Congratulations — you need to go on a diet.

I ran into this exactly while building American Spend, a prediction-market protocol at 33Labs with a CLOB order book, a vault yield layer, and ERC6909 multi-token positions all inside a single `Market.sol`. The contract was doing too much, the size crept up over months of features, and eventually the wall hit. What followed was a systematic bytecode reduction campaign — and I learned that this kind of constraint is actually clarifying. It forces you to think carefully about what belongs where.

A companion article covers the bigger structural moves — the Lens pattern, library extraction, factory-side validation, and when to reach for a full decomposition. This one focuses on the **detail-level tactics** that follow once you've made those structural calls: error consolidation, modifier deduplication, public state variables, and dead code deletion. These are the moves that get you across the finish line when the structural work alone isn't enough.

---

### Quick Recap: The Structural Baseline

Before the detail work, make sure you've done the cheap structural things:

- **`optimizer_runs = 1` in `foundry.toml`** — tells the compiler to optimize for bytecode size rather than runtime gas. Usually saves a few hundred bytes with zero code changes.
- **Move view functions to a Lens contract** — read functions don't belong in a contract whose job is enforcing state transitions. Extracting them to a companion `MarketLens.sol` reduced `Market.sol` by ~158 lines in American Spend.
- **Pure math into libraries** — anything `pure` or stateless is a candidate. The `MarketMath` extraction saved ~1.6KB in a single commit.

If you haven't done these yet, start there. The tactics below are additive — they work on what's left after the structural reduction.

---

### Consolidate Errors — They Add Up Faster Than You Think

This one surprised me the most, in the ratio of effort to savings.

Every custom error in Solidity adds ~20–30 bytes to the bytecode — the 4-byte selector, the ABI encoding schema, and the revert dispatch. `Market.sol` had errors like `OpenMustBeBeforeClose`, `CloseMustBeLteResolution`, `NoPayout`, and `NoYieldToClaim` — each a distinct selector, each with its own niche.

The question I started asking: *does the caller actually need to distinguish these, or does it just need the category of failure?* Almost never the former. So I consolidated:

- `OpenMustBeBeforeClose` + `CloseMustBeLteResolution` → `InvalidTradingWindow(uint256 given, uint256 bound)`
- `NoPayout` + `NoYieldToClaim` → `NothingToClaim()`

Eighteen errors became six. That's roughly 360 bytes — almost one full kilobyte saved across a protocol with multiple similar contracts.

```solidity
// Before — each is a separate selector entry in the dispatch table:
error OpenMustBeBeforeClose();
error CloseMustBeLteResolution();
error ResolutionMustBeInFuture();

// After — semantic category, one selector:
error InvalidTradingWindow(uint256 given, uint256 bound);
```

The consolidated error includes a `given` and `bound` parameter, so it's actually more useful for debugging than the three it replaced — you get the concrete values instead of just the error name.

**But:** don't consolidate errors that callers in your actual integration stack distinguish programmatically. If a dapp's frontend branches on `NoPayout` versus `MarketCancelled`, merging them breaks that logic. The rule I use: consolidate errors that exist purely for developer clarity in logs. Keep separate any error that drives behavior in a caller.

---

### Modifiers for Repeated Checks

The pattern I saw most often: the same three-line check — "is the market finalized?" — copy-pasted across twelve different functions.

```solidity
modifier onlyNotFinalized() {
    if (resolved || cancelled) revert MarketFinalized();
    _;
}

modifier onlyValidOutcome(uint256 outcomeIndex) {
    if (outcomeIndex >= outcomeCount) revert InvalidOutcome(outcomeIndex);
    _;
}
```

Before: twelve copies of `if (resolved || cancelled) revert;` inline in function bodies. After: one modifier, applied twelve times. The compiler still emits the check for each function call site, but repeated patterns compact better under the optimizer, and the source duplication drops to zero.

The bigger win is correctness. If the finalization check needs an extra condition later — say, checking `paused` alongside `resolved || cancelled` — you change it in one place. With inline copies, one missed update becomes a silent inconsistency that slips through tests.

**But:** modifiers obscure control flow for someone reading a single function in isolation. When I review code with three modifiers stacked on a function, I sometimes have to chase through three separate definitions before I understand what runs before the body. Use modifiers for *semantic categories* — access control, state gating, input boundaries. Don't use them for arbitrary multi-line logic that's incidental to one function.

---

### Public State Variables Instead of Manual Getters

This is the easiest habit to build, and it's the one I see skipped most often in contracts that are clearly watching their size.

Every manual `function getFoo() external view returns (uint) { return foo; }` is a function with its own selector, its own dispatch entry, and its own bytecode. The Solidity compiler generates an equivalent getter when you declare `uint public foo` — but it does it more compactly, without the explicit function overhead.

```solidity
// Before:
uint256 private totalPool;

function getTotalPool() external view returns (uint256) {
    return totalPool;
}

// After:
uint256 public totalPool;
```

Same external interface. Less bytecode. One fewer thing to maintain.

**But:** `public` state variables expose the raw storage type directly. If `totalPool` ever needs to become a struct, or if you want to gate read access with a check, the compiler-generated getter can't accommodate that — you'd need to revert to an explicit function and break the external ABI. For stable, simple values that won't need getter logic, prefer `public`. For anything that might evolve — especially if external integrators depend on the interface — a named explicit getter with inline documentation is the safer API surface.

---

### Delete Dead Code — All of It

During American Spend's CLOB development, I wrote three implementations to benchmark against each other: `CLOBBitmap`, `CLOBLinkedList`, and `CLOBRBTree`. The benchmarks showed the red-black tree won decisively. Then I kept the other two around. *Just in case.*

Those alternatives were ~3,489 lines of code. Tests, imports, everything.

The commit that removed them was one of the highest-ROI commits in the project — zero functionality changed, significant bytecode and cognitive overhead removed. The commit message was just: *"Remove obsolete CLOB implementations."*

There's a real psychological barrier here. Code you wrote takes mental ownership. "What if we need it?" The answer: you have version control. If you need it, check out that commit. Dead code in `main` is never a safety net — it's weight.

**But:** the one genuine downside is the one-time cost of a deletion commit. A contributor who wasn't involved in the benchmark phase may want to re-derive the approach. Leave a comment in the git history explaining why you chose the winner, or a brief note in the relevant doc. That's enough context; keeping three dead implementations indefinitely is not.

---

### The Order That Worked

From my experience, applying these in the wrong order wastes effort. The sequence:

1. `optimizer_runs = 1` — free, immediate, no structural cost
2. Lens extraction — biggest structural gain
3. Library extraction — pure logic out, testable in isolation
4. Error consolidation — high bytes-per-effort ratio
5. Modifier dedup — incremental, correctness benefit
6. Public state vars — small but consistent across many functions
7. Dead code deletion — last, once you've committed to an implementation

Start with the compiler, then move architecture, then details. Don't start with error consolidation when the contract still has 3,000 lines of dead code that would be removed anyway.

---

### Final Thought

The 24KB limit is a wall, but it's also a signal. When a contract strains against it, the contract is usually doing too much. The tactics above aren't just bytecode tricks — they're pressure toward better structure: cleaner separations, honest ownership of logic, no dead weight.

American Spend's `Market.sol` is now safely under the limit with room to grow. More importantly, the codebase is cleaner. Each file has a clear purpose, the duplication is gone, and a new contributor can read any single file without needing to hold the whole system in their head.

The constraint forced the clarity.

---

If you're working on a Solidity protocol and running into size issues — or want to talk through architecture decisions before they become problems — feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
