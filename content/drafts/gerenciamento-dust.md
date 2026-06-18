---
social-post: |-
  🤔 A number that's almost zero can brick your entire order book — or silently drain your vault.

  In my work on American Spend's CLOB, dust orders and unclamped loss waterfalls landed in the same audit report. I write about how both problems share the same root cause, and what it took to fix them without piling on defensive guards after the fact.

  If you're building CLOBs, prediction markets, or vault-based protocols, this one's for you.

  👇 Read the article below

  hashtag#Solidity hashtag#DeFi hashtag#SmartContracts hashtag#Web3 hashtag#BlockchainDevelopment hashtag#CLOB hashtag#SecurityEngineering hashtag#PredictionMarkets
---

# When Small Numbers Break Everything: Dust, Underflow, and Defensive Arithmetic in Solidity

If you've spent enough time shipping DeFi contracts, you've probably been burned by a number that was almost zero — but not quite. Or a subtraction that looked safe until it wasn't. These aren't exotic edge cases. They're the bugs that slip past code review and unit tests, then show up under specific market conditions, at the worst possible moment.

In my work on American Spend — a prediction market protocol with a central limit order book, seeded liquidity, and ERC6909-based outcome tokens — I ran into both of these problems in the same core accounting paths. **Dust** and **underflow** ended up in the same audit report, and fixing them taught me more about defensive arithmetic than any theoretical treatment ever did.

---

### What Even Is Dust?

**Dust**, in the context of a smart contract, is any value that satisfies the type system but violates the protocol's economic invariants — a remainder so small it can't be acted on, but that still consumes storage, skews accounting, and potentially blocks other operations.

In a CLOB (Central Limit Order Book), dust shows up at the maker side after partial fills. An order comes in with `remaining = 10`, the taker consumes 9 units, and the maker's order rests with `remaining = 1`. That single unit at a `minTick` price computes a `notional` of zero when the next taker hits it:

```solidity
uint256 notional = (makerRemaining * priceBps) / BPS_DENOMINATOR;
// makerRemaining = 1, priceBps = 1 (minTick), BPS_DENOMINATOR = 10_000
// result: 0
```

A zero-notional match transfers tokens for free. Or, if you added a defensive guard to prevent that:

```solidity
if (notional == 0) revert ZeroAmount();
```

Now you have something worse — a revert *inside the match loop* that bricks the FIFO head. Every taker hitting that price level bounces. A single dust order, placed at `minTick`, becomes a permanent denial-of-service primitive until someone cancels it.

That's exactly the poison pill we found in American Spend after audit fix #21 added the zero-notional guard without closing the placement gap that let dust orders rest. The defensive guard was right. The invariant maintenance was incomplete.

---

### The Right Fix: Enforce the Bound at Every Mutation Site

The real problem was **asymmetric invariant maintenance**. We enforced `remaining >= minOrderSize` at placement time, but not at mid-fill. Makers got partially filled to a sub-minimum remainder, and the system let that resting order stay active.

The fix was to enumerate every code path that could mutate `remaining` and handle dust at the source:

```solidity
// After partial fill, check maker remainder
if (makerOrder.remaining < minOrderSize) {
    // Cleanup: wipe the order, refund collateral (or burn tokens if market-as-maker)
    _cleanupBuyMakerDust(orderId, makerOrder);
    emit MakerOrderDustCleaned(orderId, makerOrder.remaining);
}
```

Three entry points, three places to enforce the same invariant: **placement** (don't rest if remainder is already sub-minimum), **mid-fill** (cleanup and remove), and **cancel** (always clears regardless of size). Note that cleanup-and-remove is specifically the right move here — reverting the outer call instead would let a single dust order grief the entire price level indefinitely.

The cleaner property to reason about is positive: *every active order has `remaining >= minOrderSize`*. Encode it as a fuzz invariant and run it. If it ever breaks, you find the missing site.

---

### The Factory-Level Defense

But there's an even earlier defense, and it's the one I like most: **enforce the floor at construction**, before any order ever touches the book.

The minimum notional in the CLOB is `(minOrderSize * minTick) / BPS_DENOMINATOR`. If that product is less than `BPS_DENOMINATOR`, you've allowed a configuration where the cheapest legal trade produces `notional == 0` by construction. The system is broken before it even starts.

We enforced this at the factory:

```solidity
function _validateOrderBookSeedConfig(
    uint256 minOrderSize,
    uint256 minTick
) internal pure {
    if (uint256(minOrderSize) * minTick < BPS_DENOMINATOR) {
        revert InvalidOrderBookConfig();
    }
}
```

Fail at `createMarket`. Don't defer the problem to runtime.

**But:** factory-level guards catch bad config early, but they also reject valid configurations that might be intentional. Be precise about what you're rejecting and document it clearly. "Configurations where the cheapest legal order computes zero notional" is a specific, auditable invariant. "Suspicious small numbers" is not.

This pattern generalizes beyond CLOBs. Lending protocols compute `debt * interestRate / RAY`; AMMs compute `amountIn * tickSpacing / precision`. Any time you have `(size * rate) / SCALE`, audit the minimum-input pair at construction. If `minSize * minRate < SCALE`, reject the config at deployment.

---

### Underflow: Solidity 0.8 Does Not Save You Here

The other half of this problem is **underflow** in multi-step arithmetic, particularly in loss waterfalls.

Solidity 0.8 added built-in overflow/underflow protection — so developers got comfortable. But the protection only applies to individual operations on individual values. When you're computing a *sequence of subtractions* across a multi-tier waterfall, the arithmetic can still go wrong.

In American Spend's `_applyVaultLossWaterfall()`, we compute losses in two tiers: seed fund absorbs first, then the outcome pools take the remainder. The intent is sound — seed is insurance capital, pools are speculative positions. But without clamping, any rounding misalignment between `expectedAssets` and `seedFund` can push an unsigned subtraction below zero:

```solidity
// Buggy version — underflows if totalLoss exceeds seedFund
uint256 totalLoss = expectedAssets - redeemedAssets;
seedFund -= totalLoss;          // panics if totalLoss > seedFund
uint256 poolLoss = totalLoss - seedFund; // already corrupted
```

Solidity's protection threw a panic, but the panic itself was the bug. The contract reverted on a legitimate loss scenario — exactly when users needed it most.

The fix is a clamp before every unsigned subtraction where the left side isn't guaranteed to exceed the right:

```solidity
uint256 totalLoss = expectedAssets - redeemedAssets; // safe: expectedAssets >= redeemedAssets
uint256 seedLoss = Math.min(seedFund, totalLoss);
uint256 poolLoss = totalLoss - seedLoss; // safe: totalLoss >= seedLoss by construction
seedFund -= seedLoss;
// distribute poolLoss proportionally across pools
```

Every subtraction is guarded by construction. The order of operations matters — derive the clamp before the arithmetic, not after.

**But:** explicit clamping means you need to reason carefully about what "clamped to zero" signifies. A `seedLoss` clamped to its full fund balance means the seed fully absorbed the loss — that's a legitimate state, not a silent failure. Document it and emit a detailed event:

```solidity
emit VaultLossAbsorbed(expectedAssets, redeemedAssets, seedLoss, poolLoss);
```

If you don't emit, you'll never know which tier took the hit when something goes wrong in production.

---

### The Common Thread: Invariant-First Thinking

Both dust and underflow come from the same root failure: *not stating the invariant before writing the arithmetic*.

For dust, the invariant is: *every active order has `remaining >= minOrderSize`*. If you state that first, you naturally ask "what code paths can violate this?" and you enumerate them systematically — placement, mid-fill, cancel.

For the loss waterfall, the invariant is: *`seedLoss + poolLoss == totalLoss`, and neither term can be negative*. If you derive the arithmetic from the invariant, you use `Math.min` before you subtract, not after.

In practice, DeFi code is much more often written as a sequence of operations that "feel right" than as a derivation from a stated invariant. The bugs live in the gap. What helped most on American Spend was encoding these as fuzz-testable assertions and running them after every significant change. When a fuzz run surfaced a dust order with `remaining = 1` sitting active in the book, we knew immediately which commit broke the invariant. No manual reproduction needed.

---

### Bottom Line

Dust and underflow are boring-sounding problems with spectacular consequences. A zero-notional match either transfers tokens for free or — if you patched it defensively without fixing the source — becomes a FIFO brick that denies service at the price level. An unclamped subtraction in a loss waterfall panics the contract at precisely the moment users can't afford a revert.

The pattern is the same in both cases: write the invariant down first, then enumerate every mutation site, then enforce the floor as early in the call stack as possible. A 30-line fuzz handler will find what code review misses.

---

If you're working through similar problems — CLOB design, vault accounting, prediction market mechanics — feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
