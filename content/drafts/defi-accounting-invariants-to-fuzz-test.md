---
status: ready
linkedin-post: |-
  🧠 I shipped DeFi accounting logic I thought was correct. Foundry's invariant runner found the bug on run 847.

  Unit tests verify the scenarios you imagined. Invariant fuzz tests find the ones you didn't — adversarial action sequences, secondary paths, states that only emerge when three flows intersect.

  In my latest article, I walk through the 5 accounting invariants I wish I'd wired from day one — drawn from production bugs and audit findings on American Spend, a CLOB prediction market at 33Labs.

  If you're building a DeFi protocol and care about audit-readiness, this one's for you. 👇

  hashtag#Solidity hashtag#DeFi hashtag#SmartContracts hashtag#FuzzTesting hashtag#InvariantTesting hashtag#Blockchain hashtag#Ethereum hashtag#AuditPrep hashtag#Web3 hashtag#SoftwareEngineering
og-image-prompt: "A 16:9 aspect ratio digital illustration in dark mode. Deep navy-to-black gradient background. In the center-left, a simplified smart contract state diagram: three hexagonal nodes connected by directed arrows, each node labeled with a short math expression in white monospace font (e.g., Σ pools = totalPool, payoutPool ≤ total, remaining ≥ min). One arrow is rendered in a sharp amber/orange color, diverging from the others in a slightly different direction — representing an invariant violation discovered by a fuzzer. On the right side, a subtle visual of a branching tree of test paths (thin white lines, low opacity), suggesting thousands of fuzz runs exploring state space. A thin purple glow highlights the divergent arrow node. Color palette: #0A0A1A background, #6B5BFF accent purple, #FFB347 amber violation highlight, #E8E8FF soft white text nodes. Mood: precise, analytical, slightly ominous. No humans, no stock art, no gradients on text."
twitter-post: |-
  I shipped DeFi accounting logic I thought was correct.
  Foundry's invariant runner found the bug on run 847. 🧵

  Invariant #1 — Pool symmetry. `sum(pools) == totalPool`. Obvious? Yes. Still breaks. Seeded order cancellations, CLOB fill callbacks, and batch refunds each touch pool balances differently. One path drifts and you're overpaying users.

  Invariant #2 — Payout soundness. `payoutPool ≤ totalPool + seedFund`. With vault yield, you can have per-user gains in a vault with an aggregate loss. You need an aggregate surplus cap BEFORE slicing to individuals.

  Invariant #3 — No active dust. In a CLOB, `remaining < minOrderSize` means `notional = 0` on next match. Zero-notional matches poison FIFO heads and silently waste gas on every subsequent buy. This is a DoS vector, not a cosmetic issue.

  Invariant #4 — Supply integrity. In a protocol that seeds liquidity to itself, `totalSupply` includes protocol-held tokens. You need `externalTotalSupply = totalSupply - balanceOf(address(this))` or your payout denominator silently dilutes users.

  The highest-leverage starting point if you have zero invariants: pool symmetry (#1). It's the easiest to write and catches a disproportionate share of accounting drift. Full article with Solidity snippets for all 5 → [blog URL]
---
# 5 DeFi Accounting Invariants Every Protocol Should Fuzz Test from Day One

I shipped accounting logic I thought was correct.
Foundry's invariant runner found the bug on run 847.

That was early in the American Spend protocol at 33Labs — a prediction market with a parimutuel phase, a CLOB order book, vault yield integration, and ERC6909 outcome tokens. The unit tests were green. Slither was clean. Coverage was above 90%. The fuzz handler found a sequence of actions that no human tester had imagined: a seeded order cancellation followed by a pool purchase, which together caused `sum(pools)` to drift from `totalPool` by exactly the refunded collateral amount. The protocol would have paid out more than it held.

That experience changed how I think about correctness in DeFi. Unit tests verify the scenarios *you imagined*. Invariant fuzz tests find the ones you didn't — adversarial action sequences, edge cases in secondary paths, states that only emerge when three different flows intersect. The auditor who reviewed American Spend later confirmed the pattern: most of the accounting findings they see in production protocols are on paths that look fine in isolation but break in combination.

This article is about the five accounting invariants I wish we had codified from day one — drawn from production bugs, audit findings, and the lessons that changed how I think about correctness in DeFi.

---

### 1. Pool symmetry: `sum(pools) == totalPool`

The most fundamental invariant in any multi-pool system: the sum of individual outcome pools must exactly equal the total tracked pool.

In American Spend, every market has N outcomes. When users buy outcome tokens, both `pools[outcome]` and `totalPool` increase. Burn operations decrease both. This seems obvious — and that's exactly why it's worth testing.

**Why it breaks:** "obvious" accounting symmetry is the first casualty when you add secondary paths. In our protocol, we had seed liquidity (protocol-owned capital), parimutuel purchases, CLOB trades, refund flows, and vault yield — each of which touches pool balances in a slightly different way. The invariant held for the simple paths but drifted on edge cases: when the protocol cancelled its own seeded orders, when a CLOB fill triggered a callback, when a batch finalization processed multiple refunds.

```solidity
function invariant_poolSymmetry() public {
    uint256 computedTotal = 0;
    for (uint256 i = 0; i < market.outcomeCount(); i++) {
        computedTotal += market.pools(i);
    }
    assertEq(computedTotal, market.totalPool());
}
```

The handler calls every mutation: `buyOnPhase1`, `mintCompleteSet`, `burnCompleteSet`, `placeLimitBuy`, `cancelOrdersRange`, `processFinalizationBatch`. You need all of them, because the invariant only survives if every path maintains it.

**Key trade-off:** writing comprehensive handlers takes time upfront. But the alternative is discovering drift on audit finding #14, after four months of feature work has built on top of the broken accounting.

---

### 2. Payout pool soundness: `payoutPool ≤ totalPool + seedFund`

At resolution, the protocol computes a `payoutPool` — the amount available for winners to claim. It must never exceed what the protocol actually holds.

This sounds trivial. It isn't. We integrated with a yield vault: assets earn yield between market creation and resolution. But vaults can also incur losses. Our first implementation computed payoutPool optimistically, assuming yield would always be positive. The auditor asked: what happens if the vault loses value?

The fix was a structured loss waterfall: if `redeemedAssets < totalPool + seedFund`, absorb losses from `seedFund` first, then haircut `pools[]` proportionally. The invariant test for this:

```solidity
function invariant_payoutPoolSoundness() public {
    if (!market.resolved()) return;
    assertLe(market.payoutPool(), market.totalPool() + market.seedFund());
}
```

But the more subtle version is checking *before* resolution, during settlement:

```solidity
function invariant_noOverpromisedYield() public {
    uint256 vaultSnapshot = vault.totalAssets();
    uint256 totalPrincipal = market.totalPool();
    uint256 aggregateSurplus = vaultSnapshot > totalPrincipal
        ? vaultSnapshot - totalPrincipal
        : 0;
    // sum of all user yield claims must not exceed aggregate surplus
    assertLe(market.totalAllocatedYield(), aggregateSurplus);
}
```

**Why it matters:** per-user yield calculations can be individually positive even when the vault has an aggregate loss. If a user entered when the vault share price was low, their "yield" computation shows a gain — but distributing that gain drains the pool and harms winners. The aggregate cap must be enforced before slicing to individuals.

---

### 3. No active dust: every active order has `remaining ≥ minOrderSize`

This one surprised me. It sounds like a UI concern — dust orders are annoying, not dangerous. In a matching engine, they're a denial-of-service vector.

In the American Spend CLOB, `notional = (amount * priceBps) / BPS_DENOMINATOR`. If `remaining < minOrderSize`, the next match can compute `notional == 0`. A zero-notional match still consumes FIFO position — it can permanently block the queue head without transferring anything, and every subsequent market buy silently wastes gas on a poisoned slot.

The invariant:

```solidity
function invariant_noActiveDust() public {
    uint256[] memory orderIds = clob.getActiveOrderIds();
    for (uint256 i = 0; i < orderIds.length; i++) {
        Order memory o = clob.getOrder(orderIds[i]);
        if (o.active) {
            assertGe(o.remaining, clob.minOrderSize());
        }
    }
}
```

Maintaining this invariant requires checking three entry points: order placement (if unfilled remainder falls below minimum, refund and don't rest the order), partial fills (if mid-fill drop crosses the threshold, clean up the maker), and cancellations (always clears regardless of size). The fuzz test is what reveals whether you've covered all three.

---

### 4. Supply integrity: `sum(userBalances[outcomeId]) ≤ externalTotalSupply(outcomeId)`

In any token system, the sum of individual balances must never exceed the total supply. ERC6909, ERC1155, and ERC20 all carry this as an implicit invariant — but in prediction markets it has a wrinkle.

When the protocol seeds liquidity, it mints outcome tokens to itself. Those tokens aren't "in circulation" in the payout sense — they shouldn't appear in the denominator when computing user redemptions. We had to distinguish between `totalSupply(outcomeId)` and `externalTotalSupply(outcomeId)`:

```solidity
function _externalOutcomeSupply(uint256 outcomeId) internal view returns (uint256) {
    return outcomeToken.totalSupply(outcomeId) - outcomeToken.balanceOf(address(this), outcomeId);
}
```

The invariant test verifies that `sum(userBalances) ≤ externalTotalSupply` — not the raw total. If you use raw total, you may actually pass the invariant while silently diluting user payouts.

**Key trade-off:** this requires your test framework to enumerate user addresses that interacted with the protocol. A common pattern is to track them in a `Set<address> ghost_participants` variable in your invariant handler, adding each address that interacts in any handler function. The overhead is worth it — this invariant catches a category of bug that code review consistently misses.

---

### 5. Lifecycle monotonicity: state transitions are one-way

DeFi protocols have state machines: created → active → resolved → finalized. The final invariant is that no transition can reverse. A market that has resolved must never see `resolved == false` again. A finalized vault settlement must not run twice.

This sounds obvious until you have vault failures. Our first implementation called `vault.redeem()` directly inside the resolution function. If the vault reverted (paused, undercollateralized, blacklisted sender), the resolution function reverted — and the market could never reach its terminal state. Users couldn't exit. Emergency withdrawals required a resolved state. Deadlock.

The fix was a `tolerateFailure` pattern: catch the vault revert, record a pending flag, and expose a permissionless `settleVault()` retry. The invariant test:

```solidity
function invariant_lifecycleMonotonicity() public {
    // Once resolved, always resolved
    if (ghost_wasResolved) {
        assertTrue(market.resolved());
    }
    if (market.resolved()) {
        ghost_wasResolved = true;
    }
    // Vault finalization is idempotent
    if (ghost_vaultFinalized) {
        assertTrue(market.vaultAccountingFinalized());
    }
}
```

Note the `ghost_wasResolved` variable — this is maintained by the invariant handler across calls. Foundry's invariant framework supports ghost variables exactly for this purpose.

---

### Writing the handlers

The invariants above only catch bugs if the handler covers all mutation paths. A handler that only calls `buyOnPhase1` will find bugs in the buy path; the CLOB cancel path stays dark.

From my experience on American Spend, the handler checklist is:
- All user-facing buy/sell/mint/burn operations
- Order placement, partial fill, and cancellation
- Seed operations (protocol-as-maker paths)
- Batch finalization calls
- Resolution and settlement
- Emergency paths (if any)

Each handler should also bound its inputs realistically — generating a `price` between `1` and `BPS_DENOMINATOR`, amounts between `minOrderSize` and some reasonable cap. Unconstrained fuzz inputs waste runs on states that the protocol's own validation rejects before doing anything.

Cross-link: for the CI integration side of this workflow — pinning Foundry, setting run counts per environment, and gating on invariant health — I wrote about it in [The Solidity CI Pipeline You Should Have Set Up on Day One](/posts/the-solidity-ci-pipeline-you-should-have-set-up-on-day-one).

---

### Where to start if you have none of this

If your protocol has zero invariant tests, the highest-leverage first step is the pool symmetry invariant (#1). It's the easiest to write, the easiest to understand in a PR review, and it catches a disproportionate share of accounting drift.

Once that's in CI and green, add payout soundness (#2). Those two cover the most common class of audit finding I've seen in production DeFi codebases: accounting paths that diverge under edge cases that unit tests never visited.

The rest — dust (#3), supply integrity (#4), lifecycle monotonicity (#5) — follow once you have the handler infrastructure in place. The marginal cost of adding an invariant once handlers exist is low. The marginal cost of discovering the missing invariant during an audit is not.

---

If you're building a DeFi protocol and care about audit-readiness, these invariants are worth setting up before you're two months into feature development. I'm always open to comparing notes — feel free to connect.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
