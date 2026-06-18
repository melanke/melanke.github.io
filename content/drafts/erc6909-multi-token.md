---
social-post: |-
  💡 Every cross-contract hop in a multi-token protocol costs gas you're not getting back.

  I refactored the entire token layer of American Spend — our prediction market at 33Labs — from N ERC20 clones to ERC6909, and I write about what that decision actually looks like in practice: the trade-offs it forced, the surprises it surfaced, and the point where it stops making sense.

  If you're building anything with correlated token families, worth reading before you commit to the clone-per-token approach.

  👇 Read the article below

  hashtag#Solidity hashtag#EVM hashtag#DeFi hashtag#SmartContracts hashtag#PredictionMarkets hashtag#Web3 hashtag#ERC6909 hashtag#GasOptimization hashtag#Blockchain hashtag#SoftwareEngineering
---
# ERC6909: Why I Stopped Deploying N ERC20 Clones for Multi-Token Protocols

If you're building a prediction market, a multi-leg options protocol, or anything where a single contract needs to mint a family of correlated tokens, you've probably reached for the obvious pattern: deploy one ERC20 per token type. It feels clean. Each outcome gets its own contract. Balances, transfers, and approvals all behave exactly like every other ERC20 in the ecosystem.

The problem is that each cross-contract hop costs gas — hundreds for a warm call, over two thousand for a cold one. Multiply that by every mint, every transfer, every balance check in a matching cycle, and you're paying for contract boundaries that add no business value.

I refactored the entire token layer of American Spend — our prediction market protocol at 33Labs — to **ERC6909**, and it cut mint and transfer costs by roughly **30–50%**. Here's what that looks like in practice and where it stops making sense.

---

### What ERC6909 Actually Is

A minimal multi-token standard in a single contract. Instead of deploying one contract per token, you deploy one and distinguish tokens by a `uint256 tokenId`. Balances live in a `mapping(address owner => mapping(uint256 id => uint256 amount))`. Transfers and approvals work per-id. No metadata bloat, no hooks, no transfer callbacks by default.

The closest analogy is ERC1155, but ERC6909 is intentionally simpler. ERC1155 requires batch-transfer support, emits `TransferBatch`/`TransferSingle` events, and imposes the `onERC1155Received` callback on receivers. ERC6909 drops all of that. One standard, one contract, minimal surface area.

The EIP was authored by jtriley.eth and reached final status in late 2024. Solady ships a gas-optimized implementation — that's the one I used.

---

### The Problem It Solves in Prediction Markets

In American Spend, every market has between two and six outcome tokens — "Yes", "No", or multiple competing candidates. Under the original architecture, each market deployment triggered N ERC20 clone deploys, one per outcome.

Every mint had to cross a contract boundary. Every transfer too. External calls are not free — even warm ones cost hundreds of gas, cold ones cost over two thousand. Multiply that by the operations in a matching cycle, a seed operation, or a full redemption sweep, and you're burning gas on infrastructure, not logic.

The refactor in commit `e15aa228` replaced all of that with a single ERC6909 contract shared across all outcomes of a given market. The `tokenId` maps directly to `outcomeIndex`. No clone deploy per outcome. No inter-contract jumps to check balances during resolution.

The result: mint and transfer operations came in roughly **30–50% cheaper**.

---

### What the Code Looks Like

The core pattern is straightforward. Instead of calling `outcomeTokenContracts[i].mint(user, amount)`, you call one contract with the id:

```solidity
// Before: external call to the i-th ERC20 clone
// After: one contract, token distinguished by id
function mintOutcome(
    address to,
    uint256 outcomeId,
    uint256 amount
) internal {
    outcomeToken.mint(to, outcomeId, amount);
}

function outcomeBalanceOf(
    address account,
    uint256 outcomeId
) internal view returns (uint256) {
    return outcomeToken.balanceOf(account, outcomeId);
}
```

Balance checks in resolution and redemption loops now read from the same contract's storage — cheaper, and a smaller attack surface.

We also extracted `_outcomeBalanceOf()`, `_outcomeTotalSupply()`, and `_externalOutcomeSupply()` as internal helpers on the Market contract. They centralize the accounting invariant in one place: one change propagates everywhere. That matters more than it sounds, which brings me to the thing that surprised me most.

---

### The Accounting Subtlety You Can't Ignore

ERC6909 consolidates your token layer — but the correctness problems don't vanish, they centralize.

When our CLOB seeds liquidity, the Market contract itself mints outcome tokens and places ask orders. Those tokens live in the ERC6909 contract, attributed to the Market's own address. When the market resolves and users redeem, the payout is pro-rata over the winning token supply.

If you naively divide by `totalSupply(outcomeId)`, you're including the protocol's own position in the denominator — which silently dilutes user payouts. The fix:

```solidity
function _externalOutcomeSupply(
    uint256 outcomeId
) internal view returns (uint256) {
    uint256 total = outcomeToken.totalSupply(outcomeId);
    uint256 selfHeld = outcomeToken.balanceOf(address(this), outcomeId);
    return total - selfHeld;
}
```

Use `_externalOutcomeSupply()` as your payout denominator — it's the supply actually held by users. With N separate ERC20 contracts this kind of helper has to be wired up per-token and across multiple contracts. With ERC6909, one function, every calculation flows through it.

There's a related trap: when the CLOB cancels a seeded order and those outcome tokens would "return" to the Market, don't transfer them — **burn them**. Returning them re-inflates `balanceOf(address(this))`, which then has to be subtracted again downstream. Burn at source keeps `totalSupply` clean as a single source of truth, and the subtraction logic stays simple.

---

### Trade-offs Worth Naming

ERC6909 is not a free upgrade.

**ERC20 composability.** Every DeFi primitive — DEXes, lending protocols, yield aggregators — expects ERC20. If your outcome tokens need to be tradeable on Uniswap or usable as collateral on Aave, ERC6909 doesn't fit without a wrapper. For American Spend, outcome tokens are protocol-internal — minted, matched, and redeemed within our own contracts — so this tradeoff doesn't hurt us. But if your tokens need to escape the protocol, ERC20 is still the only answer.

**Tooling maturity.** Block explorers, wallet UIs, and subgraph templates have better ERC20 support. Etherscan will show ERC6909 balances, but the UX isn't as polished. If users interact directly with the token contract through standard wallet interfaces, ERC20 is smoother.

**Auditability assumptions.** ERC1155 and ERC20 are battle-tested patterns that auditors know deeply. ERC6909 is newer. The Solady implementation is well-reviewed, but budget a little extra audit time for reviewers to orient.

**Key trade-off:** ERC6909 pays off when your tokens are protocol-internal, when you have two or more tokens per deployment unit, and when mint/transfer frequency is high enough that cross-contract overhead accumulates. If any of those conditions don't hold, ERC20 is probably fine.

---

### When to Use It

✅ Use ERC6909 when:
- You have N correlated tokens with the same lifecycle (outcomes, positions, legs)
- Tokens are primarily consumed within your own protocol logic
- Mint and transfer frequency is high enough that inter-contract gas adds up
- You want a single audit surface for the entire token layer

❌ Avoid ERC6909 when:
- Your tokens need to integrate with ERC20-only DeFi primitives without a wrapper
- You're shipping one token per protocol — just use ERC20
- Your team isn't comfortable with a newer, less-documented standard

---

### Final Thought

Switching from N ERC20 clones to ERC6909 felt like removing scaffolding — the structure got simpler, the gas got cheaper, and the accounting had fewer moving parts to audit. The consolidation also surfaced an invariant (protocol-held supply must be excluded from the denominator) that was harder to enforce consistently when the token logic was spread across N contracts.

Not every protocol needs it. But if you're building anything with multiple correlated token types, it's worth understanding before you commit to the clone-per-token approach. The 30–50% savings on mint and transfer paths compound across every user interaction.

---

If you're working through a similar design decision — whether for a prediction market, a structured product, or any multi-token protocol — feel free to connect. I'm always open to exchanging ideas and learning from other builders.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
