---
social-post: |-
  🤔 Permissionless doesn't mean self-executing — and that gap will stall your protocol.

  In my work on American Spend I kept hitting the same problem: lifecycle functions that nobody calls. In this article I walk through how I approached that problem — the incentive design, the off-chain tooling, and the testing patterns that caught things Foundry tests never would.

  If you're building a smart contract protocol with lifecycle transitions, this one's for you. 👇 Read the article below.

  hashtag#SmartContracts hashtag#Solidity hashtag#DeFi hashtag#Web3 hashtag#Blockchain hashtag#PredictionMarkets hashtag#SoftwareEngineering hashtag#Web3Dev
---
# Maintenance Bots for Smart Contracts: When to Build Them and How to Do It Right

If you've shipped a smart contract protocol with any kind of lifecycle — markets that open, graduate, and resolve; positions that need to be settled; vaults that need to be swept — you've eventually hit the same question: *who is going to push the button?*

The contract can enforce every rule correctly and still get stuck because the on-chain function that moves things forward requires a caller. Nobody calls it. State hangs.

In my work on American Spend, a prediction market protocol, this came up repeatedly. Markets accumulate buys in a bonding-curve phase and need to **graduate** — transition from that early phase into a CLOB where real trading happens. The contract had a `graduate()` function available to anyone once the threshold was met. Correct and permissionless on paper. In practice, without a caller, markets just sat there past their graduation point. Users were waiting for liquidity that never came because no one happened to trigger the transition.

That's when we built the graduation bot. And along the way I learned a few things about when these bots are necessary, how to design them defensively, and what tends to go wrong when you don't think them through.

---

### The Problem: Permissionless Doesn't Mean Self-Executing

Permissionless is a design property, not an operational property. A function being `public` means *anyone can call it*. It does not mean *someone will*.

This distinction matters more than it sounds. Protocols often rely on the assumption that rational actors will call lifecycle functions when it's in their interest. And that assumption is usually correct — once there's enough economic incentive and the ecosystem is mature. Early on, or for lower-volume markets, it fails.

The canonical solution is a **bounty**: pay the caller for triggering the transition. In American Spend, `graduate()` mints a small reward to `msg.sender` — a percentage of the seed fund — for being the one who pushed the button. That changes the game theory. Now there's a reason to call.

But a bounty alone introduces another problem: if the reward is available the instant the threshold is crossed, you get a mempool race. Bots spam the transaction hoping to land it first. This is wasteful and can cause premature execution. The fix we landed on — pattern #18 in the security lessons — is a mandatory delay: record `thresholdReachedAt` when the threshold is crossed, and only make the bounty claimable after `block.timestamp >= thresholdReachedAt + overdueDelay`. The delay is clearable if the threshold is un-crossed (e.g., someone burns tokens back below the threshold).

```solidity
function graduate() external {
    require(
        block.timestamp >= thresholdReachedAt + overdueDelay,
        "GraduationNotOverdue"
    );
    uint256 bounty = (seedFund * graduateCallerRewardBps) / BPS_DENOMINATOR;
    _mint(msg.sender, bounty);
    _executeGraduation();
}
```

The delay eliminates the mempool race. The bounty makes the execution economically attractive. Together, they create a healthy equilibrium where a bot shows up sometime after the delay — not racing milliseconds after the threshold is crossed.

**Key trade-off:** The delay means graduation doesn't happen *instantly* when a market is ready. There's a window — say, an hour — where the market is technically eligible but hasn't graduated yet. For most prediction market designs, this is acceptable. If your protocol needs sub-minute transitions, you'll need a different approach (keeper network, native automation like Chainlink Automation, or a trusted oracle-driven trigger).

---

### What the Bot Actually Does

Once you have a bounty + delay, building the bot itself is straightforward — which is actually the right order of operations. **Design the on-chain incentive first, then build the off-chain caller around it.**

The American Spend graduation bot follows this pattern:

1. Poll the **Lens contract** at a fixed interval (every few seconds on testnet, longer on mainnet)
2. Query for markets in "ready to graduate" state — meaning threshold crossed and delay elapsed
3. If any markets qualify, call `graduate()` for each
4. Collect the bounty, log the transaction

The Lens contract deserves a separate mention. We built `MarketLens` as a read-only companion to `Market` specifically to make this kind of external query cheap and easy. Instead of a bot reconstructing state from raw storage reads or events, it calls `lens.getMarketsReadyToGraduate(offset, limit)` and gets back a clean paginated list. The alternative — iterating all markets and checking state inside the bot — is fragile and expensive in RPC calls.

```typescript
async function runGraduationCycle(lens: MarketLens, bot: Signer) {
  const addresses = await lens.getMarketsReadyToGraduate(0, 50);
  for (const addr of addresses) {
    const market = Market__factory.connect(addr, bot);
    const tx = await market.graduate();
    await tx.wait();
    console.log(`Graduated ${addr} — tx ${tx.hash}`);
  }
}
```

This is a reference implementation, and making it open-source matters. When a protocol has public permissionless functions with bounties, anyone can run a competing bot. Publishing the reference bot reduces the barrier for the community to participate, which is the whole point of the permissionless design.

**Key trade-off:** A polling bot is simple but not guaranteed to fire immediately. If your graduation delay is one hour, polling every 60 seconds is fine. If the delay is 10 seconds, you need event-driven triggering — subscribe to the `ThresholdCrossed` event and start a timer, rather than polling blindly. Polling costs RPC calls; event-driven requires more infrastructure. Pick based on your latency requirements.

---

### The Continuous Replay Script: A Different Kind of Bot

Not all maintenance bots are about lifecycle transitions. Some exist to generate realistic load and catch integration bugs.

Early in development on American Spend, we built a **continuous replay script** — a TypeScript process that runs indefinitely on testnet, creating markets and placing trades in real time. It's not a production bot. It's an integration stress tester that lives in the tooling folder.

The motivation: unit tests catch Solidity logic bugs. They don't catch RPC timeout behavior, indexer drift when blocks come in bursts, or race conditions between the frontend and the event listener. The continuous replay script catches all of those because it actually hits the full stack — contract, RPC node, indexer, and frontend — under sustained load.

```typescript
async function continuousReplay(factory: MarketFactory, traders: Signer[]) {
  while (true) {
    const market = await createRandomMarket(factory);
    await Promise.all(traders.map(t => placeRandomTrade(market, t)));
    await sleep(2000);
  }
}
```

It found real bugs. The indexer was occasionally missing events when blocks arrived faster than expected. The frontend had a stale-state issue during quick successive trades. Neither of these would have appeared in Foundry tests.

**Key trade-off:** A continuous replay script consumes testnet funds and RPC quota. It's not free to run indefinitely. In practice, we run it for a few hours before a release candidate, not 24/7. It's also non-deterministic — it can't produce a reproducible bug report, just evidence that something went wrong. For reproducible regression testing, you need the replay pipeline.

---

### The Replay Pipeline: Deterministic Validation

The third bot pattern is more of a tooling pipeline than a running bot: scrape real data from a production protocol, serialize it to JSON, and replay it deterministically in Foundry.

For American Spend, we scraped trade history from Polymarket and The Graph, serialized it into snapshot JSON, and wrote a Foundry test (`ReplayComparison.t.sol`) that hydrates the snapshots and replays every trade against our implementation. If our CLOB produces different fills than the reference, the test fails.

```
tools/replay-pipeline/
  scrapers/          # TypeScript: fetch from Polymarket / The Graph
  snapshots/         # JSON: serialized trade sequences
  format-spec.md     # schema definition
```

This is valuable for a protocol that's implementing a known design — you can validate correctness against a production reference rather than just against your own test cases. Bugs like off-by-one rounding in lot size calculations showed up here that passed all unit tests.

**Key trade-off:** Building and maintaining the scraper is non-trivial engineering. The external protocol's API can change. The format-spec needs to be kept in sync with both the scraper output and the Foundry hydration library. It's worth it when you're implementing a well-known design (CLOB mechanics, AMM pricing, yield vaults). Less worth it when your protocol's logic is novel enough that there's no good reference to compare against.

---

### The Bounty Cap Problem: Technical Valid vs Economically Safe

One pattern that burned us — and is easy to miss — is the difference between a technically valid parameter and an economically safe one.

The graduation bounty is expressed in basis points (`graduateCallerRewardBps`). We validated that `rewardBps <= BPS_DENOMINATOR` — can't exceed 100%. Technically correct. But 100% of the seed fund going to a caller would drain the market before it starts trading. The real economic cap was 10%.

The fix was a dedicated constant: `MAX_GRADUATE_CALLER_REWARD_BPS = 1000`. Validated in the factory at creation time and in the admin setter. Technical bounds are necessary; they're not sufficient.

This matters for bot design because bots optimize for bounty size. A generous `rewardBps` will attract sophisticated bots targeting your markets specifically — fine when the bounty is reasonable and the delay prevents front-running, but a quiet drain if the cap is set carelessly.

---

### When to Build a Maintenance Bot

From my experience, the answer is: **whenever you have a permissionless function with a meaningful bounty and a lifecycle that can stall.**

A few heuristics:

- Callable by anyone but only *some* users benefit from it being called (graduation, settlement, vault rebalance) → bot territory
- Function has a bounty → build the reference bot and open-source it
- Delay is longer than a few minutes → simple polling is fine
- Delay is under a minute or timing is critical → event-driven or keeper network

The **continuous replay script** is a development tool, not a production bot. Build it early, run it before releases — especially before any release that touches the event pipeline or indexer.

The **replay pipeline** is a validation tool. Build it if you're implementing a known design (CLOB mechanics, AMM pricing, vault accounting) and there's a production reference to compare against. Skip it if your protocol's logic is novel enough that no reference exists.

---

### Final Thought

Smart contracts enforce the rules but don't enforce participation. When you design a permissionless transition with a bounty, you're really designing a small economic game: who benefits, when, and how much. The bot is just the rational player that shows up to collect.

Get the on-chain economics right first — the delay, the cap, the idempotency — and the bot becomes a thin wrapper around a well-designed call. Skip that step and you'll spend your time maintaining a bot that's fighting its own incentive structure instead of riding it.

---

If you're building a smart contract protocol with lifecycle transitions and thinking through the operations side, I'd love to compare notes. Feel free to connect or message me — I'm always open to exchanging ideas with other builders working through these same problems.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
