---
social-post: |-
  🛡️ Knowing that `nonReentrant` exists is not the same as having it wired correctly.

  In my latest article I walk through what it actually takes to install reentrancy guards in a real DeFi protocol — from choosing the right variant to proving the defense actually fires under attack conditions.

  If you're building or auditing a DeFi protocol, this one is for you.
  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#EthereumDev hashtag#SmartContractSecurity hashtag#Web3 hashtag#Blockchain hashtag#Foundry
---
# Reentrancy Guards Done Right: Transient Storage, Modifier Order, and Testing What You Ship

In a [previous article](URL) I covered reentrancy as a concept — the DAO hack, Checks-Effects-Interactions, why the vulnerability keeps resurfacing. That one was about understanding the threat. This one is about the mechanics of actually installing the defense: which guard to reach for in 2025, where it sits in the modifier stack, how to apply it consistently across a multi-contract system, and how to prove it works before you ship.

Knowing that `nonReentrant` exists is not the same as having it wired correctly everywhere it needs to be.

---

### The Guard Has a Newer Variant — and It's Worth the Switch

**`ReentrancyGuardTransient`** was added to OpenZeppelin's contracts alongside the Cancun upgrade (EIP-1153). Instead of writing the lock flag to regular storage (`SSTORE`/`SLOAD`), it uses transient storage — `TSTORE`/`TLOAD`. Transient storage is wiped at the end of every transaction automatically, so there's no cleanup needed between calls.

The gas difference is real. The standard storage-based guard costs a cold `SSTORE` on entry (roughly 20,000 gas the first time a slot is written per block) and another `SSTORE` on exit to reset it. Transient reads and writes cost 100 gas each instead.

In American Spend — a prediction market with a CLOB and vault yield — users can place, cancel, and match orders several times per block. Multiply even modest savings across hundreds of operations in high-throughput periods and it adds up.

```solidity
import {ReentrancyGuardTransient} from
    "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";

contract Market is ReentrancyGuardTransient {
    function placeOrder(
        uint256 outcomeIndex_,
        uint256 price_,
        uint256 size_
    ) external nonReentrant onlyOpen {
        // ...
    }
}
```

**Trade-off**: `ReentrancyGuardTransient` requires Cancun EVM support — it won't compile for targets below `cancun`. Some L2s lagged on adoption, so check your chain's EVM compatibility before switching. For chains that do support it, this is the right default in 2025.

---

### Modifier Order Is Not Cosmetic

One pattern I had to standardize explicitly during American Spend development: `nonReentrant` must always be the **first modifier** in the list. Not second. Not after `onlyOwner`. First.

```solidity
// Wrong — auth check runs before the guard is active
function cancel(uint256 orderId_) external onlyOpen nonReentrant {
    // ...
}

// Right — guard is set before anything else runs
function cancel(uint256 orderId_) external nonReentrant onlyOpen {
    // ...
}
```

Why does order matter? Modifiers in Solidity wrap each other. If `onlyOpen` runs first and makes an external call — reading state from another contract to determine market status, for instance — a reentrant call can fire *before* the `nonReentrant` flag is set. This is rare in practice but not theoretical: delegatecall flows in libraries create exactly this situation.

In our codebase the rule is: `nonReentrant` → auth modifiers (`onlyOwner`, `onlyFactory`) → state modifiers (`onlyOpen`, `onlyGraduated`). I had this backward on some early functions and we normalized it in a dedicated commit (`789659a`). Now it's enforced by a linter rule. The point isn't just about security — it's about having a consistent mental model so you never have to think about it again.

---

### Applying Guards Across a Multi-Contract System

Single-contract guard hygiene is relatively straightforward. The harder problem is a system where a **factory deploys multiple market contracts**, each with their own entry points, all sharing business logic but owning their own state.

In American Spend, `MarketFactory` deploys individual `Market` contracts. Each `Market` has its own CLOB and vault accounting. Any external mutating function — `placeOrder`, `cancelOrder`, `marketBuy`, `processFinalizationBatch`, `resolve`, `cancel` — is a potential reentrancy vector.

The pattern I ended up with: `Market` inherits `ReentrancyGuardTransient` directly, and every external function that touches balance state or calls external contracts carries `nonReentrant`. The factory itself is not guarded at that level — it doesn't hold user funds, it only deploys and registers. That separation is intentional.

```solidity
contract Market is ReentrancyGuardTransient, Ownable2StepUpgradeable {

    function processFinalizationBatch(
        uint256 maxOrders_
    ) external nonReentrant returns (bool done) {
        // calls orderbook.cancelOrdersRange() internally
        // orderbook can call back into external collateral token
        // guard prevents re-entry of this function
    }

    function claimPayout() external nonReentrant {
        // reads userBalance, updates it, then calls collateralToken.safeTransfer
        // CEI pattern AND nonReentrant — belt and suspenders
    }
}
```

Where I've seen teams get this wrong: they guard the "obvious" functions (withdraw, claim) but skip the operational ones (`cancelAllOrders`, `processFinalizationBatch`) because those aren't directly user-facing. In a CLOB system, the finalization batch loops over orders and triggers refund transfers. Each transfer can invoke a receiver hook. That receiver can try to call back into the market. The guard has to be on `processFinalizationBatch`, not just `withdraw`.

**Trade-off**: Every `nonReentrant` function is slightly more expensive to call, and over-applying guards can block legitimate composability — other contracts calling your protocol in sequence within one transaction. In practice, for entry points that move funds this is always the right call. For pure-view functions or administrative setters that don't touch balances, the guard is unnecessary overhead.

---

### Beyond Fund-Flow Reentrancy

Not all reentrancy is about draining funds. Some contracts have functions that can be re-entered in ways that corrupt state without immediately stealing anything — an operation that's supposed to run once, sets a flag, but re-entry runs it twice and leaves the flag in a valid-looking but inconsistent state.

In American Spend, `settleVault` is a good example. It's the permissionless retry for deferred vault accounting — it doesn't move user funds directly, but it updates `vaultAccountingFinalized`. Re-entering it could trigger double-accounting. So it gets `nonReentrant` even though it looks like an administrative function at first glance.

The practical rule: if a function mutates state that another function reads to decide whether to execute, guard it. The attack surface is wider than just "functions that call `.transfer()`".

---

### Testing the Guard Actually Works

The most underrated step: **writing a test that proves the guard fires**.

Deploying a contract with `nonReentrant` everywhere and calling it a day is security theater. The only way to know the guard is actually effective is to have a test where a malicious contract tries to re-enter and the transaction reverts.

In American Spend's test suite we built `ReentrantOrderBookMock` — a mock CLOB that, when its internal function is called during finalization, immediately tries to call back into the `Market`.

```solidity
contract ReentrantOrderBookMock {
    IMarket market;

    function cancelOrdersRange(
        uint256 from_,
        uint256 max_
    ) external returns (uint256, bool) {
        // Attempt to re-enter the market during finalization
        market.processFinalizationBatch(10);
        return (from_, true);
    }
}

function test_Given_finalization_When_reentered_Then_reverts() public {
    // Wire up the market with the reentrant mock as its orderbook
    vm.expectRevert(/* ReentrancyGuardReentrantCall */);
    market.processFinalizationBatch(100);
}
```

The test confirms two things: the guard is present on the function, and it triggers in a real callback scenario — not just a direct recursive call. Most simple reentrancy tests call the function twice in sequence. A mock that simulates the actual attack vector (callback from an external contract mid-execution) is more valuable, because it tests the scenario that actually happens in production.

**Trade-off**: These mocks take time to build and maintain. But for functions that hold user funds, the alternative is shipping untested security assumptions. Spend the hour on the mock.

---

### Final Thought

Reentrancy guards are cheap insurance. `ReentrancyGuardTransient` makes them cheaper still in 2025. But the pattern only pays off when applied systematically — to every external function that touches state, in the right modifier position, across every contract in the system, with a test that proves the guard fires under a realistic attack scenario.

A `nonReentrant` modifier in the wrong position, on only the obvious functions, never exercised by a reentrant mock, isn't a guard. It's a comment that says *we thought about this once*.

---

If you're building a DeFi protocol and navigating these decisions, I'm always open to exchanging ideas. Connect with me here on LinkedIn or reach out directly — there's usually something worth comparing notes on.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
