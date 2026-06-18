---
social-post: |-
  💡 Solidity doesn't stop you from paying the ABI-decode cost on every read-only input — or making the same external call eight times in a loop. The compiler won't warn you. The code looks correct. It just costs more than it has to.

  In my latest article I look at where that invisible overhead actually hides in a real protocol — and what I changed while building American Spend to stop paying for data I already had.

  If you write or review Solidity hot paths — factories, redeem flows, lens aggregators — this one's for you. 👇

  hashtag#Solidity hashtag#SmartContracts hashtag#EVM hashtag#GasOptimization hashtag#DeFi hashtag#Web3 hashtag#BlockchainDevelopment hashtag#SoftwareEngineering
---
# Stop Paying for the Same Data Twice: Caching External Reads in Solidity

From my experience building on-chain systems, there's a class of gas bugs that hides in plain sight — not in complex loops or heavy computation, but at the boundary of function calls. You pay to cross the boundary once. Then you pay again. And again.

Two patterns live here and they're easy to miss: passing `memory` where `calldata` would do, and making the same external call multiple times inside a view or function. Together they add up to hundreds of wasted gas per transaction — sometimes thousands — in protocols with non-trivial logic.

This is a practical look at both, grounded in what I've actually encountered while building American Spend, a prediction market protocol with a CLOB, vault yield mechanics, and ERC6909 multi-token accounting.

---

### The Boundary Cost

Every time a Solidity function receives data from the outside world, the EVM decodes and copies it. Every time your contract calls another contract, the EVM pays for the call setup, context switch, and return. Neither is free — and the costs stack up when you're not deliberate about minimizing them.

The mental model I keep coming back to: **don't pay the boundary cost more than once**. If data arrived at the function boundary, don't copy it into `memory` unless you're going to mutate it. If data came back from an external call, don't re-fetch it in a loop.

---

### `calldata` vs `memory` — The Most Common Free Win

When an `external` function receives a `string`, `bytes`, or a struct — if it only reads from that input — you can declare it as `calldata` instead of `memory`.

```solidity
// Wastes gas: forces ABI-decode copy from calldata → memory
function createMarket(
    MarketParams memory params,
    string memory metadata
) external returns (address) { ... }

// Better: stays in calldata, zero copy
function createMarket(
    MarketParams calldata params,
    string calldata metadata
) external returns (address) { ... }
```

`calldata` avoids the ABI-decode memcpy. For a function like market creation — which receives a config struct and a metadata string and only reads them — the savings are direct and free.

In the American Spend codebase, the commit that introduced `calldata` for market creation params (`07e4009`) was a one-line change across a handful of signatures. No logic changed. Just the location qualifier. The savings show up on every call to the factory.

**Key trade-off:** if you need to mutate the input — even partially — you must copy it to `memory` first. `calldata` is read-only by definition. When that's the case, the explicit copy is the right move; just make it deliberate, not accidental.

---

### Repeated External Calls — The Sneakier Problem

This one shows up in views and Lens contracts. You have a loop over outcomes or positions, and inside the loop, you call an external contract for each element:

```solidity
// N external calls — each one costs 700+ gas baseline
for (uint i; i < outcomeCount; ++i) {
    uint supply = outcomeToken.totalSupply(i);
    uint balance = outcomeToken.balanceOf(user, i);
    marketData[i] = MarketData(supply, balance, ...);
}
```

Each `totalSupply()` and `balanceOf()` call is a `STATICCALL` — at minimum 700 gas per call, plus the warm/cold account overhead. In a market with four outcomes, that's potentially 8 external calls in a single view. Multiply that across a frontend polling dozens of markets and it becomes significant.

The fix is to **batch into a cache struct** at the top of the function, then iterate in memory:

```solidity
// Pre-fetch into cache — 1 external call for all data
TokenCache memory cache = _buildTokenCache(outcomeToken, outcomeCount, user);

for (uint i; i < outcomeCount; ++i) {
    marketData[i] = MarketData(
        cache.supplies[i],
        cache.balances[i],
        ...
    );
}
```

This is what we did in the MarketLens refactor (`d81f44f`). The lens aggregates token state in one pass, then all downstream logic iterates the in-memory struct. N external calls become O(1) external calls per batch.

---

### The `payoutPool` Lesson — Caching Across Users

There's a deeper version of this pattern in DeFi accounting. After a prediction market resolves, every user who held winning outcome tokens calls `redeem()`. If each call recomputes the payout from live state, you have a problem: the state changes with every claim.

The solution in American Spend (`1d6e593`) is to snapshot `payoutPool` once, at finalization — a single value computed from `totalPool + seedFund - paidYield - rake`. Every `redeem()` after that reads the snapshot. It doesn't recompute. It doesn't re-read `totalPool`. It reads one cached slot.

```solidity
// At resolution time — computed once
payoutPool = totalPool + seedFund - paidYield - rake;

// At redeem time — reads cache, not live state
function redeem(uint8 outcome) external {
    uint payout = (userBalance * payoutPool) / correctOutcomeTotalSupply;
    // ...
}
```

This matters for two reasons. First, it's cheaper — one `SLOAD` versus several. Second, it's correct — live state changing mid-distribution would give different users different fractions of the same pool, breaking the fairness invariant.

**Key trade-off:** the cached value is stale by design. Any write to `totalPool` after finalization shouldn't affect payouts — and it shouldn't be allowed. The cache only makes sense when the underlying state is frozen. If your protocol finalizes state in stages, make sure you're caching values at the right stage, behind the right finalization flag.

---

### Detecting the Pattern in Your Code

A few heuristics I use when reviewing Solidity functions:

- Count `SLOAD`s from the same storage slot in a single function. Two reads of the same variable → cache it in a local `uint256` at the top. A warm `SLOAD` costs 100 gas; `MLOAD` costs 3.

- Look for external calls inside loops. `for (...) { token.someView(i) }` is almost always a sign. Pull the data out first.

- Audit `external`/`public` function signatures for struct or array params. If the function body never assigns to the param, it should be `calldata`.

- Ask: when this state is consumed by multiple callers over time — like payout amounts after resolution — should it be a snapshot rather than a recomputed view?

None of these require redesigning your protocol. They're mechanical improvements, mostly localized to the call site.

---

### When the Savings Don't Matter

There are situations where these optimizations genuinely don't apply.

If your function receives a struct and needs to modify one field before passing it along, you need `memory`. The copy is the point — don't fight it.

If your external call is already outside a loop and happens only once, caching it into a local variable adds noise without saving gas.

And if you're optimizing a view function that's only called off-chain — by a frontend, by a subgraph — the gas cost is zero. Optimize those for readability, not efficiency.

I'm pragmatic about this. The patterns above are worth applying in hot paths: factories, resolution handlers, redeem flows, lens aggregators. Not in one-off admin setters.

---

### Final Thought

Solidity's data location system (`calldata`, `memory`, `storage`) forces you to be explicit about where data lives — but it doesn't force you to be efficient. You can write perfectly correct code that pays the ABI-decode cost on every read-only input, or that makes the same external call eight times in a loop. The compiler won't stop you.

From my experience, the boundary cost is the easiest gas to leave on the table — precisely because the code looks fine. It does what it's supposed to do. It just does it more expensively than it needs to.

The fix is to read function signatures with one question in mind: is this data crossing a boundary more times than it has to?

---

If you're building DeFi protocols and care about getting this kind of detail right, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
