---
social-post: |-
  💡 Your algorithm is correct. Your math is right. But the gas meter runs out before the loop does — and your contract is stuck.

  In my latest article I walk through how we tackled this in American Spend — a prediction-market protocol where finalization can touch hundreds of open orders at once. The design questions are harder than they look, and a few of them have non-obvious answers.

  If you're building a protocol where settlement or finalization can touch large datasets, this one's for you. 👇 Read the article below.

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#EVM hashtag#BlockchainDevelopment hashtag#Web3 hashtag#SoftwareEngineering hashtag#PredictionMarkets
---
# When One Transaction Is Not Enough: Cursor-Based Batching in Smart Contracts

If you've worked on any production DeFi protocol long enough, you've hit this wall: a perfectly correct algorithm that simply cannot finish inside a single transaction.

It's not a logic bug. The math is right. The state machine is sound. But the operation touches too many entries — orders, positions, claims — and the gas meter runs out before the loop does. You're left with a stuck contract, users with locked funds, and no clean way out.

This is not a theoretical concern. It's a design problem you have to solve *before* it bites you in production — and it took a few real scares in American Spend to get the patterns right.

---

### The Unbounded Loop Problem

A prediction market can accumulate hundreds or thousands of open orders on a CLOB before a market resolves. When resolution comes, all those orders need to be cancelled — collateral returned, state cleaned up — before payouts can proceed.

The naive implementation writes itself:

```solidity
function cancelAllOrders() internal {
    uint256 count = ordersById.length();
    for (uint256 i = 0; i < count; i++) {
        _cancelOrder(ordersById.at(i));
    }
}
```

This is fine in a test with ten orders. Against a live market with a few hundred, the transaction runs out of gas. The market can never finalize. Users cannot redeem. The protocol is stuck.

This is a **DoS via gas limit** — and unlike most DoS vectors, you built it yourself. Auditors will flag every unbounded loop in a critical path. More importantly, your users will suffer for it.

**But wait — why not just cap the number of orders at creation?** That works if you control the structure from the start. In a live CLOB, you don't. Users place orders; you can't predict how many will be open at resolution time. Any hard cap either blocks legitimate usage or is set so high it doesn't actually prevent the gas problem.

---

### The Pattern: Cursor-Based Batching

The fix is to break the operation into arbitrarily small pieces that can each fit inside a block, and connect them with a **cursor** — a pointer that records where the last call left off.

In American Spend, the finalization loop became:

```solidity
function processFinalizationBatch(
    uint256 maxOrdersPerBatch
) external nonReentrant returns (uint256 newCursor, bool done) {
    uint256 cursor = finalizationCursor;
    uint256 total  = ordersById.length();

    uint256 end = cursor + maxOrdersPerBatch;
    if (end >= total) {
        end  = total;
        done = true;
    }

    for (uint256 i = cursor; i < end; i++) {
        _cancelOrder(ordersById.at(i));
    }

    finalizationCursor = end;
    newCursor = end;
}
```

The caller — a bot, a keeper, or the user themselves — calls this in a loop until `done` is `true`. Each call processes a bounded slice. The gas cost per call is predictable. No single transaction can exceed the block gas limit.

The return value `(newCursor, done)` is the interface contract: "you can always make progress, and you'll know when you're finished."

**Key trade-off:** the protocol now depends on someone actually calling these batches. In practice this means running a keeper bot — monitoring markets that have resolved and driving the finalization loop to completion. That's operational overhead that didn't exist with a single-tx approach. You're shifting risk from "transaction fails" to "keeper goes down." Budget for it.

---

### Permissionless Retry and External Failures

The cursor pattern handles the gas problem. But there's a second failure mode that's subtler — and nastier: your finalization depends on an *external* contract that might revert.

American Spend markets deposit collateral into a yield vault during their lifetime. At resolution, the protocol redeems that vault to fund payouts. The vault redemption is an external call. If the vault is paused, or an oracle inside it is down, that call reverts.

Without careful design, this deadlocks the lifecycle. The market cannot resolve because the vault call fails. Emergency withdraw requires the market to be resolved or cancelled first. You've created a circular dependency with no exit.

The solution is a **tolerateFailure flag** paired with a **permissionless retry**:

```solidity
function _finalizeVaultAccounting(bool tolerateFailure) internal {
    if (vaultAccountingFinalized) return;

    try vault.redeem(vaultShares, address(this)) returns (uint256 assets) {
        resolvedVaultAssetsSnapshot = assets;
        vaultAccountingFinalized    = true;
    } catch {
        if (!tolerateFailure) revert VaultRedemptionFailed();
        vaultSettlementPending = true;
        // state flips proceed; emergency withdraw becomes available
    }
}

function settleVault() external nonReentrant {
    require(vaultSettlementPending, "No pending settlement");
    uint256 assets = vault.redeem(vaultShares, address(this));
    resolvedVaultAssetsSnapshot = assets;
    vaultAccountingFinalized    = true;
    vaultSettlementPending      = false;
}
```

Inside `resolve()` and `cancel()`, we call `_finalizeVaultAccounting(true)`. If the vault is down, we catch the revert, mark the settlement as pending, and let the lifecycle continue — the terminal state flips, emergency withdraw unlocks. When the vault recovers, anyone can call `settleVault()` to complete the accounting.

Making it **permissionless** is intentional. You don't want the protocol team to be the single point of recovery. Any keeper, any monitoring bot, any user can trigger the retry. The contract can't be held hostage waiting for admin action.

**Key trade-off:** `settleVault()` retries strictly — no `tolerateFailure` — so if the vault is permanently broken, this function will keep reverting and the assets will remain stranded. That's a conscious decision: a fully broken vault is a catastrophic event that needs governance intervention, not something a permissionless function should silently absorb. But it means your monitoring needs to distinguish "vault temporarily paused" from "vault unrecoverable."

---

### Idempotency: The Flag You Always Need

Both patterns above — cursor batching and permissionless retry — share a common requirement: each step must be **idempotent**. Calling it twice must produce the same result as calling it once.

In American Spend, we learned this the hard way. The first version of vault finalization checked `if (resolvedVaultAssetsSnapshot > 0)` to guard against double execution. That fails silently when the vault returns zero — a legitimate result in a total-loss scenario.

The fix is to use an explicit boolean flag:

```solidity
bool public vaultAccountingFinalized;

function _finalizeVaultAccounting(bool tolerateFailure) internal {
    if (vaultAccountingFinalized) return; // idempotent
    // ...
    vaultAccountingFinalized = true;
}
```

The flag separates "did we execute this?" from "what was the result?". Zero is a valid result. Never use a numeric value as a sentinel for a one-shot operation.

**Key trade-off:** you're spending a storage slot on state that could feel redundant — "obviously we called this once." But the alternative is a subtle bug that only appears in a total-loss scenario, at exactly the moment your users are most vulnerable. The storage slot is cheap. The bug is not.

---

### Reentrancy Guards on Every Step-Handler

Multi-step async flows introduce a subtle reentrancy surface that single-transaction operations don't have.

Consider `processFinalizationBatch`: it transfers collateral back to users as it cancels orders. Each transfer is a potential reentrancy point. If the callback re-enters the contract and advances the cursor, you can process the same order twice — or skip orders entirely.

Every public step-handler in the finalization flow needs `nonReentrant`:

```solidity
function processFinalizationBatch(uint256 maxOrdersPerBatch)
    external
    nonReentrant
    returns (uint256 newCursor, bool done)
{ ... }

function settleVault()
    external
    nonReentrant
{ ... }
```

In American Spend we use `ReentrancyGuardTransient` — the EIP-1153 transient-storage variant — because it costs zero gas across separate transactions. The guard resets automatically between blocks, so the persistent storage slot isn't touched on normal execution.

The ordering matters too: `nonReentrant` before any other modifier. Auth modifiers like `onlyOwner` can themselves make external calls in edge cases. You want the reentrancy lock to be already set before anything else runs.

**Key trade-off:** `ReentrancyGuardTransient` requires EIP-1153, which is only available on networks that have activated Cancun (mainnet: March 2024). If you need to deploy on chains that haven't upgraded, fall back to the classic persistent-storage guard — the gas overhead is a few hundred units per call, not per batch, so it's small but worth knowing.

---

### Recovering From Recipient Failures

One last piece of the puzzle: what happens when you're processing a batch and one of the transfers fails?

In USDC-collateralized markets, USDC has a blacklist. If a user's address is blacklisted, the `safeTransfer` to them reverts. Without defensive handling, that single user freezes the entire batch — every other user's refund is blocked too.

The fix is the **escrow-and-pull pattern**:

```solidity
for (uint256 i = cursor; i < end; i++) {
    address user   = ordersById.at(i).owner;
    uint256 refund = _cancelOrder(ordersById.at(i));

    (bool ok, ) = address(collateral).call(
        abi.encodeCall(IERC20.transfer, (user, refund))
    );
    if (!ok) {
        failedRefunds[user] += refund;
    }
}
```

A separate `claimFailedRefund(address to_)` lets the affected user specify an alternative address and pull the funds themselves. The batch continues regardless.

**Key trade-off:** this adds complexity and state. You need to test the escrow path, monitor for unclaimed balances, and communicate the fallback to users. But the alternative — a finalization loop that can be frozen forever by a single blacklisted address — is far worse in production. One hostile or accidentally blacklisted account should never hold an entire market hostage.

---

### When to Apply This Pattern

These patterns are not cheap to implement. They add state variables, step-handlers, monitoring requirements, and test surface. Use them when:

- A loop has no practical upper bound — orders on a CLOB, positions across users, claims in a distribution
- A critical path depends on an external contract you don't control (vault, oracle, DEX router)
- A state transition must be irreversible even if a sub-step fails
- Recovering from a stuck state would otherwise require emergency admin action

Conversely: if your loop is over a fixed-size structure with a hard cap enforced at creation — say, a fee tier table with a max of 10 entries — a cursor and async batching are overkill. Keep it simple where the bounds are known.

The signal is this: **if an unbounded dataset can enter your loop, batch it**. If an external call sits on the critical path to a terminal state, give it a `tolerateFailure` flag and a permissionless retry.

---

### Final Thought

The EVM's gas limit is not a constraint you can engineer away. It's the environment. The protocols that stay live under load are the ones that design for bounded progress from the start — where every critical operation can make *some* progress in *any* transaction, and where no single user or external system can freeze the rest.

Cursor batching, permissionless retries, and escrow-on-failure are not exotic patterns. They're the seatbelt you add when the car is capable of going 200 km/h. The happy path never needs them — until it does.

---

If you're building a protocol where finalization or settlement can touch large datasets, I'd be glad to talk through the design. Feel free to connect or message me — I'm always open to exchanging ideas with other builders working on the same problems.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
