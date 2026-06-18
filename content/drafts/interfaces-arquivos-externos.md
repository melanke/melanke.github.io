---
social-post: |-
  🤔 If your Solidity interface is still living inside the implementation file, you're missing half the contract.

  In my latest article I walk through how we structured American Spend's external surfaces — and why getting that structure right is about more than keeping files tidy.

  If you're preparing a protocol for a security review, this one's for you. 👇 Read the article below.

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#Ethereum hashtag#Web3 hashtag#SoftwareArchitecture hashtag#CodeQuality hashtag#BlockchainDevelopment
---
# Your Interface Is a Contract — Treat It Like One

If you've been writing Solidity long enough, you've probably worked in a codebase where the interface lives inside the same file as the implementation. It's common. It starts as a shortcut, and then one day you have a 600-line file where a consumer has to scroll past three internal helper functions, two libraries, and a modifier before they find what the contract actually *exposes*.

I've been through that. And then I made a deliberate habit change while building American Spend — a prediction market protocol with a CLOB matching engine, ERC6909 outcome tokens, and a vault yield layer. The habit is simple: every external surface gets its own file, and every surface gets documented *once* in that file. The implementation inherits, not duplicates.

It sounds like tidiness. It's actually architecture.

---

### What "External Surface" Means

When I say external surface, I mean the things that other contracts, frontends, and auditors interact with: `external` and `public` functions, events, custom errors, and structs used in function signatures.

All of those belong in the interface file. Not just the function signatures — the full vocabulary of what your contract communicates to the outside world.

In American Spend, a market interface might look like this:

```solidity
// src/interfaces/IMarket.sol

interface IMarket {
    /// @notice Emitted when a position is purchased in the AMM phase.
    event PositionPurchased(
        address indexed buyer,
        uint256 outcomeIndex,
        uint256 collateralAmount,
        uint256 tokensReceived
    );

    /// @notice The caller has no claimable payout or yield.
    error NothingToClaim();

    /// @notice The market has already been finalized.
    error MarketAlreadyFinalized();

    /// @param collateralAmount Amount of collateralToken in native decimals.
    /// @param outcomeIndex     The outcome to buy. Must be < outcomeCount.
    function buyOnPhase1(
        uint256 collateralAmount_,
        uint256 outcomeIndex_
    ) external;
}
```

The file has events, errors, and functions — all documented in the interface. The implementation just does `is IMarket` and refers back with `@inheritdoc`.

**Key trade-off:** you now have two files to maintain instead of one. If you add a parameter to a function, you update the interface. If you add an error, it goes in the interface. This is a small friction you accept in exchange for a much larger benefit — a single canonical description of what your contract *is* to the outside world.

---

### Why `@inheritdoc` Instead of Copy-Paste

Once you define NatSpec in the interface, the implementation should use `/// @inheritdoc IFoo` instead of duplicating the documentation.

Here's what that looks like in `Market.sol`:

```solidity
// src/Market.sol

contract Market is IMarket {
    /// @inheritdoc IMarket
    function buyOnPhase1(
        uint256 collateralAmount_,
        uint256 outcomeIndex_
    ) external nonReentrant onlyOpen {
        // implementation
    }
}
```

One line. The tooling — `forge doc`, Etherscan, IDEs — all know to pull the documentation from the interface. If you later revise the NatSpec in `IMarket.sol`, the implementation inherits the correction automatically.

We applied this across the entire American Spend codebase in a single commit (`b884fd2 Add @inheritdoc tags across impl contracts`). Before that, we had NatSpec blocks on both the interface and the implementation for the same functions — drift was inevitable. After, there was one source of truth.

**Key trade-off:** `@inheritdoc` only works when the implementation fully satisfies the interface signature. Overloaded functions, slightly different parameter names, or visibility changes can break the inheritance chain. If you rename a parameter in the implementation, the tag still works — but the NatSpec mentions the interface's parameter name. Keep parameter names in sync.

---

### Where the "Why" Lives

There's a distinction I care about between `@notice` and `@dev` in NatSpec:

- `@notice` is for users and frontends: what this function does.
- `@dev` is for engineers and auditors: why it works this way.

The most valuable NatSpec I've written isn't the obvious stuff. It's the comments that explain *counterintuitive* behavior — the kind of thing that looks like a bug to anyone who didn't write it.

In American Spend's order book, cancellation is allowed even after a market is finalized. That's intentional — users should always be able to recover reserved collateral. But it looks wrong at first glance. So the interface says:

```solidity
/// @notice Cancel a limit order and recover reserved collateral.
/// @dev    Intentionally callable even after market finalization so users
///         can always recover reserved funds. Does not revert on
///         already-cancelled orders.
function cancelOrder(uint256 orderId_) external;
```

A future auditor sees this and understands immediately: it's not a missing access gate, it's a deliberate UX invariant. Without that comment, it becomes a finding. With it, it's explained architecture.

The rule of thumb I use: if I'd flag it in a code review, I document it in the interface. "Why no state check here?" → that's a `@dev` comment.

---

### Errors and Events Belong in the Interface Too

This is the part teams most often skip. The function signatures go in the interface, but errors and events stay scattered across the implementation file.

That's a problem for two reasons. First, consumers — whether they're test contracts or off-chain indexers — import the interface to reference your protocol. If errors and events aren't in there, they have to import the implementation directly, which defeats the purpose of interface segregation. Second, auditors read interfaces first. If your error naming tells a story, they'll understand the protocol's safety model before opening a single implementation file.

In American Spend, we renamed errors to express violated preconditions rather than generic state:

- `InvalidState` → `InvalidFinalizationOperation`
- `NoPayout` → `NothingToClaim`
- `TooLate` → `ResolutionConditionsNotMet`

Each error name answers the question "what assumption did the caller violate?" All of these live in the interface, with a NatSpec line:

```solidity
/// @notice The market resolution window has not elapsed yet.
error ResolutionConditionsNotMet();

/// @notice outcomeIndex_ is out of bounds for this market's outcome count.
error InvalidOutcomeIndex(uint256 given, uint256 max);
```

When errors carry contextual data — like `given` vs `max` — put that data in the error signature and document the fields. It costs nothing at compile time and makes on-chain debugging orders of magnitude easier.

---

### The `@custom:security-contact` You'll Forget

There's one NatSpec tag that teams consistently skip until they prepare for audit: `@custom:security-contact`.

Every production contract in American Spend has this at the top of the interface and at the top of the implementation:

```solidity
/// @custom:security-contact security@33labs.ai
interface IMarket {
    // ...
}

/// @custom:security-contact security@33labs.ai
contract Market is IMarket {
    // ...
}
```

Note: `@inheritdoc` is a function-level directive — it doesn't propagate contract-level tags. Repeat `@custom:security-contact` in both files. It's two lines in each.

Responsible disclosure needs a channel. Bug bounty programs need an address. When a whitehat finds something in your deployed bytecode and wants to report it without going public, they need somewhere to go.

**Key trade-off:** adding an email to on-chain metadata makes it publicly readable by anyone scanning bytecode. Use a security-specific alias or role address, not a personal inbox. The disclosure channel should be monitored; a stale or unmonitored address is worse than none because it gives whitehats false confidence that their report will be received.

---

### What Auditors Actually See First

From my experience preparing American Spend for audit, the first thing a security researcher does is list the `src/interfaces/` directory. If it's there and complete, they have an immediate map: what the protocol exposes, what it can revert with, what it emits. They can form a mental model of the system before opening a single `.sol` file.

If the interfaces are missing or partial, auditors reconstruct that surface themselves — reading implementations, guessing which errors are internal and which are public, inferring what events matter. That's extra work billed to the audit budget, and it means their initial model is built from implementation noise rather than designed contracts.

In American Spend, we had separate interface files for `IMarket`, `IMarketFactory`, `IMarketLens`, `IOutcomeToken`, and `IOrderBook`. Each one was fully populated — errors, events, NatSpec, the works. An auditor asking "what can a Market contract do?" had a single file to read, with nothing hidden in the implementation below it.

That's not a cosmetic choice. It's a signal about how much the team thought about the boundary between their code and everyone else's.

---

### Final Thought

The interface file is the contract you're signing with your consumers — and with your future self. Move it into its own file. Put your events, errors, and structs there. Write the NatSpec once, in the right place. Let `@inheritdoc` do the propagation.

None of this prevents the subtle accounting bug or the edge case in your finalization logic. But it does mean that anyone reading your code — a security researcher, a new contributor, yourself six months from now — starts from intent, not inference. That's a compounding advantage over the life of the codebase.

---

If you're building a protocol and care about how you present it to auditors or contributors, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
