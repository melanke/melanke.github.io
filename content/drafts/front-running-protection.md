---
social-post: |-
  🤔 What if the same mechanism that defends your users from front-running also powers your protocol's keeper network?

  In this article I explore how I approached both sides of that race while building American Spend at 33Labs — and why protecting users and incentivising liveness turn out to be two faces of the same design decision.

  If you're building a Solidity protocol with lifecycle state machines or permissionless keeper roles, this one's for you.
  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#MEV hashtag#BlockchainDevelopment hashtag#Web3 hashtag#PredictionMarkets hashtag#Ethereum
---
# Two Directions of the Same Race: Front-Running Defense and Permissionless Keeper Bounties in Solidity

The mempool is not a neutral waiting room. It's a competitive arena where bots watch every pending transaction and decide whether to race you, sandwich you, or simply outbid you. Most developers think about this from one direction: protecting users from being front-run. But there's a second direction that gets far less attention — using those same mempool dynamics *for* the protocol, as a liveness mechanism. This article covers both sides of the race, and the surprisingly similar toolkit that handles each.

---

### The Problem with "Resolve When Ready"

In American Spend, the prediction market platform I've been building at 33Labs, markets have a lifecycle: open, graduate to a CLOB, and eventually resolve. Resolution is the most consequential operation — it determines who gets paid and how much. It also reads from accumulated state: balances, pool sizes, liquidity positions.

The naive design is to let anyone call `resolve()` once the resolution time has passed. The problem is that every mutation operation — a buy, a sell, a minted position — changes the state that resolution reads from. An attacker with a flash loan can, in a single block, execute a large trade to distort prices, call `resolve()` to lock in the manipulated outcome, and unwind the trade — all before the next block.

The window is tiny, but on-chain it's plenty.

---

### The Activity Timestamp Pattern

The fix is to **force a minimum time gap between the last market activity and resolution**.

```solidity
// Record on every mutation
function _recordActivity() internal {
    lastActivityTimestamp = block.timestamp;
}

// Enforce in resolution guard
modifier onlyAfterInactivityDelay() {
    require(
        block.timestamp >= lastActivityTimestamp + resolutionDelay,
        "Market recently active"
    );
    _;
}
```

Every buy, sell, mint, or order placement calls `_recordActivity()`. Resolution requires that `resolutionDelay` seconds have elapsed since the last activity. An attacker can't manipulate state and resolve in the same block — or even the same `resolutionDelay` window.

**Key trade-off:** the delay applies to legitimate resolution too. If a market is actively traded right up to its resolution time, honest callers have to wait for the quiet period before they can finalize. For prediction markets with a defined resolution window, this is acceptable. For protocols that need immediate finalization — perpetuals with liquidations, for instance — you'd need a different approach, perhaps restricting resolution to trusted oracles or a DAO.

---

### Locking Parameters After First Trade

There's a related pattern that also showed up in American Spend: admin parameters that *look* safe to change post-deployment but actually aren't once trading starts.

The clearest example is `openTime` — the timestamp when a market accepts its first trade. Allowing an admin to push `openTime` forward after trades have already occurred means users who placed early bets are now in a different game than they signed up for.

The fix is a one-way lock:

```solidity
bool public tradedSinceLastOpenTimeChange;

function setOpenTime(uint256 newOpenTime) external onlyOwner {
    require(!tradedSinceLastOpenTimeChange, "Cannot change after first trade");
    openTime = newOpenTime;
}

function _recordFirstTrade() internal {
    tradedSinceLastOpenTimeChange = true;
}
```

Once a trade happens, `setOpenTime` is permanently locked — the require blocks execution for the lifetime of the market. The implicit contract with users is now enforced on-chain. The same principle applies to any parameter that users might rely on when making a trade decision: max position caps, fee tiers, timing windows.

**Key trade-off:** this makes the protocol less flexible post-launch. If `openTime` is set wrong and users have already traded, you're stuck. The right answer is front-loading validation — check everything feasible at creation time — and accepting that some parameters become immutable after the point of no return.

---

### Turning the Race Around: Permissionless Keepers

Some operations in a protocol are expensive but must happen eventually — graduating a market, settling a vault, triggering finalization. You could make them admin-only and rely on your team to monitor and call them. In practice, that means ops debt, monitoring infra, and a single point of failure if the team is unavailable.

The alternative is to make the operation **permissionless** and attach a bounty. Anyone who calls `graduate()` gets a percentage of the pool. Now the market does your monitoring for you.

Here's what a naive first implementation looks like in American Spend:

```solidity
// ❌ Naive: bounty available immediately
function graduate() external {
    require(totalPoolValue >= graduationThreshold, "Not ready");
    uint256 reward = (seedFund * graduateBountyBps) / BPS_DENOMINATOR;
    _doGraduation();
    collateral.safeTransfer(msg.sender, reward);
}
```

This works — right up until MEV bots notice that `totalPoolValue` is about to cross `graduationThreshold`. They frontrun every trade that gets close, and the moment the threshold is hit, there's a mempool race among bots to be first to call `graduate()`. You've replaced operational toil with a mempool spam problem.

---

### The Delay Gate: Anti-Griefing for Permissionless Incentives

The fix, drawn directly from what we shipped in American Spend:

```solidity
uint256 public thresholdReachedAt;
uint256 public constant OVERDUE_DELAY = 1 hours;

function _onThresholdCrossed() internal {
    if (thresholdReachedAt == 0) {
        thresholdReachedAt = block.timestamp;
    }
}

function _onThresholdUncrossed() internal {
    thresholdReachedAt = 0; // e.g., after burnCompleteSet drops pool
}

function graduate() external {
    require(totalPoolValue >= graduationThreshold, "Not ready");
    require(
        block.timestamp >= thresholdReachedAt + OVERDUE_DELAY,
        "Still within grace period"
    );
    uint256 reward = (seedFund * graduateBountyBps) / BPS_DENOMINATOR;
    _doGraduation();
    collateral.safeTransfer(msg.sender, reward);
}
```

**Key trade-off:** the delay means legitimate graduation is also delayed by `OVERDUE_DELAY` past threshold. For a prediction market with a graduation event that's clearly "ready", one hour is a reasonable patience tax. It also gives the protocol a self-correction window — if the threshold is crossed but then uncrossed (a large position burns their tokens), the timestamp resets and the clock starts over.

The `thresholdReachedAt` flag must be clearable. Without this, a momentary crossing followed by an uncrossing leaves a stale timestamp, and graduation can be triggered too early.

---

### Capping the Bounty Economically, Not Just Technically

There's a second bug we caught during internal review, and it's a subtle one. BPS-denominated bounties have an obvious technical cap: `bps ≤ 10000` (100%). That's the first validation you'd add. But economic soundness requires a tighter cap.

In American Spend, the graduation bounty is a percentage of `seedFund`. A 100% bounty is technically valid BPS but drains the entire seed fund — the liquidity seeded by the market creator. That's not what anyone intended.

```solidity
uint256 public constant MAX_GRADUATE_CALLER_REWARD_BPS = 1000; // 10%

function setGraduateBountyBps(uint256 bps) external onlyOwner {
    require(bps <= MAX_GRADUATE_CALLER_REWARD_BPS, "Exceeds economic cap");
    graduateBountyBps = bps;
}
```

The lesson generalizes: when you validate a BPS parameter, ask two questions. First, is it technically valid (≤ 10000)? Second, is it economically safe given what the percentage is *applied to*? These are different questions with different answers.

**Key trade-off:** the economic cap is a judgment call baked into the contract. If 10% turns out to be insufficient incentive for keepers during high-gas conditions, you'd need to upgrade or redeploy. Starting conservative and watching keeper participation data is the pragmatic approach — set it too tight and keepers don't show up; set it too loose and you hemorrhage funds.

---

### The Toolkit Is the Same

Step back and both problems — protecting users from being raced, and protecting protocol liveness via keeper races — use the same set of primitives:

| Primitive | Protects Users | Enables Keepers |
|---|---|---|
| Activity timestamp | Last-activity delay before resolution | Threshold-reached timestamp for bounty gate |
| Post-trigger delay | Manipulation window closes before finalization | Grace period before bounty becomes claimable |
| Clearable flags | Parameter lock resets on new value | Threshold timestamp resets if uncrossed |
| Capped incentives | — | Economic cap on bounty BPS |

What's different is the *direction* of the incentive. In front-running defense, you're fighting actors who want to race *before* the protocol acts. In keeper bounties, you're inviting actors to race *so that* the protocol acts. The mechanisms rhyme because they're both managing the same underlying game: who wins a race in the mempool, and what happens if they do.

---

### Final Thought

The mempool race isn't something you can opt out of. Every smart contract that makes a state change visible before settlement is a target for reordering. The best you can do is design with that reality in mind — make intra-block manipulation unprofitable by forcing delays, and make the races you *do* want to happen safe by capping their consequences.

From my experience shipping prediction markets: it's not about making the system MEV-proof. That's not achievable. It's about making the system MEV-*tolerant* — so that the worst a bot can do is trigger a legitimate operation slightly early and take a bounded fee for the service.

---

If you're building a protocol with lifecycle state machines and permissionless keeper roles, I'd be glad to compare notes. Feel free to connect or message me — I'm always open to exchanging ideas with other builders working on the same problems.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
