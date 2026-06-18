---
social-post: |-
  🤔 Your Foundry `broadcast/` folder is a transaction log — not a deployment registry.

  It took building American Spend — a protocol with a CLOB engine, a UUPS vault, and ERC6909 positions — to feel why that distinction matters in production.
  In my latest article, I walk through the gap between what `broadcast/` gives you and what a real deployment workflow actually needs.

  If you're working on multi-network Solidity deploys or UUPS upgrades, this one's for you.
  👇 Read the article below.

  hashtag#Solidity hashtag#Foundry hashtag#SmartContracts hashtag#Web3 hashtag#Ethereum hashtag#DeFi hashtag#SoftwareEngineering hashtag#BlockchainDevelopment
---
# Foundry's `broadcast/` Folder Is Not a Deployment Registry

Run `forge script` with `--broadcast` and Foundry writes a timestamped JSON log of every transaction it sent — nonces, calldata, receipts, gas used. It feels complete. It feels like a proper audit trail.

From my experience, it isn't. Not for production-grade deployment workflows.

That realization came while building American Spend — a prediction market protocol with a CLOB matching engine, a vault yield layer, and ERC6909 multi-token positions. A codebase complex enough that "just check broadcast/" stops being a real answer pretty quickly. This article lays out the specific failures of treating `broadcast/` as a deployment registry and what I did instead.

---

### What `broadcast/` Actually Is

Foundry's broadcast folder is a **transaction log**, not an address book.

The distinction matters. A transaction log answers: _what did I send, when, and what gas did it cost?_ An address book answers: _what is currently deployed at what address, on which network, as of which version?_

`broadcast/` is excellent at the first job. The files are machine-readable JSON with block numbers, calldata, and receipts — genuinely useful for post-mortems, reproducing transactions, and verifying a script ran exactly what you thought it ran.

But for the second job — answering "where is my `MarketFactory` on Sepolia right now?" — it falls short in three specific ways.

---

### Problem 1: Local-Chain Noise Makes the Folder Unreadable

Every time you run a local development script — spinning up a fresh Anvil instance, deploying mocks, seeding state — Foundry writes to `broadcast/`. If you're iterating quickly, that folder fills up with dozens of timestamped JSON files under chain ID `31337`.

In practice the folder ends up looking like this:

```
broadcast/
  Deploy.s.sol/
    31337/
      run-1714512000.json
      run-1714513456.json
      run-1714515891.json
      run-1714516200.json
      ...
    11155111/          ← Sepolia
      run-1714600000.json
    1/                 ← Mainnet
      run-1714700000.json
```

When something goes wrong at 2 AM, you do not want to be parsing timestamps to find the right file. You want a single source of truth.

The `.gitignore` question compounds this. Committing local-chain broadcasts is noise. Not committing any of it means losing the testnet and mainnet audit trail. The typical fix is a custom ignore pattern like `broadcast/**/31337/` — but now you're managing `.gitignore` complexity to paper over a structural problem.

---

### Problem 2: Upgradeable Contracts Break the Linear Assumption

`broadcast/` assumes deployment is a one-time event per script run. Upgradeable contracts are not one-time events — the proxy address stays constant while the implementation address changes on every upgrade.

If your `MarketFactory` is a UUPS proxy and you've upgraded it three times, `broadcast/` has three separate `run-*.json` files scattered across different script executions. None of them explicitly says "as of now, the live implementation is `0x...`." You have to find the most recent relevant run and hope no other script ran in between.

For American Spend this was a real problem. The factory is UUPS upgradeable; the `OutcomeToken` implementation is swappable via an admin setter without touching the proxy. `broadcast/` can tell you that `upgradeToAndCall` was called at block 5,832,444. It cannot tell you, at a glance, what the current implementation address is.

---

### Problem 3: Scripts Can't Read `broadcast/` at Runtime

The practical failure mode that pushed me to write a separate artifact format: deploy scripts that need to know what was previously deployed.

A Solidity script can read files at runtime via `vm.readFile`. What it cannot do is parse the structure of a `broadcast/` run file, which was designed for human inspection and Foundry internals, not as a contract-readable API. This means any deploy script that wants to be idempotent — deploy if not present, upgrade if already present — has to get the current deployment address from a file with a predictable, controlled shape.

That file cannot be `broadcast/`.

---

### The Alternative: A Curated `deployments/` Artifact

The pattern is simple. After every deploy, the script writes (or overwrites) a JSON file in a `deployments/` folder:

```json
{
  "MarketFactory": "0x1234...abcd",
  "MarketLens": "0x5678...ef01",
  "OutcomeTokenImpl": "0x9abc...2345",
  "blockNumber": 5832444,
  "timestamp": "2026-04-21T20:31:46Z",
  "version": "1.0.0"
}
```

One file per network. Named by network: `local.json`, `sepolia.json`, `mainnet.json`. Committed to the repo. Overwritten on every deploy or upgrade — the current state is always the latest version in git.

The deploy script reads this file via `vm.readFile` before doing anything:

```solidity
contract Deploy is BaseBroadcastScript {
    function run() external {
        DeploymentArtifact memory existing = readArtifact(block.chainid);

        if (existing.marketFactory == address(0)) {
            _deployFresh();
        } else {
            _upgradeExisting(existing.marketFactory);
        }

        writeArtifact(block.chainid, artifact);
    }
}
```

`BaseBroadcastScript` wraps `vm.readFile` and `vm.writeFile` with file-path logic, JSON parsing, and error handling for the case where the file doesn't exist yet. Specific scripts inherit and get this behavior for free.

The numbered-step logging pairs naturally with this:

```
[1/4] Reading existing deployment from deployments/sepolia.json...
[2/4] MarketFactory already at 0x1234. Upgrading implementation...
[3/4] Deploying new OutcomeToken impl... 0x9abc
[4/4] Calling setOutcomeTokenImplementation on factory...
Done. Artifact written to deployments/sepolia.json.
```

When something breaks mid-script, you know exactly which step failed and what was already written.

---

### What You Keep From `broadcast/`

This is not an either/or. The curated `deployments/` artifact and the `broadcast/` folder serve different purposes, and you want both.

Keep `broadcast/` for:
- **Transaction-level audit trail** — calldata, gas, nonces, receipts. If you ever need to replay a deployment or prove what was executed, `broadcast/` is the ground truth.
- **Post-mortem debugging** — something went wrong on mainnet; you want the exact transaction sequence.

Use `deployments/` for:
- **Current state** — what is alive right now, on which network, at what address.
- **Script inputs** — idempotent deploy scripts read this file before deciding what to do.
- **Frontend and indexer configuration** — your TypeScript frontend reads `deployments/mainnet.json` to know which factory to call.
- **Version tracking** — the `version` field lets you detect stale frontends.

The `.gitignore` policy becomes clean: ignore `broadcast/**/31337/` (local noise), commit everything else in `broadcast/`, commit all of `deployments/`.

---

### The Trade-off

The honest downside of this approach is **more surface area to maintain**. You now have two sources of deployment truth — `broadcast/` and `deployments/` — and a script responsible for keeping them in sync. If the script crashes after broadcasting but before writing the artifact, they diverge.

The mitigation: write the artifact last, after all transactions have confirmed. If the artifact was never written, the next run will re-read the previous artifact (or an empty file) and may attempt a fresh deploy when it should be upgrading. To guard against this, the script should also validate that any address it reads from the artifact actually has contract code at it — `address(existing.marketFactory).code.length > 0` — rather than trusting the JSON blindly.

It's more code. It's worth it.

For a protocol like American Spend — where the factory, lens, implementation, and collateral contracts are all at different addresses per network, where the implementation evolves independently of the proxy, and where the frontend and a graduation bot both need to know current addresses — the alternative is worse. Reliable deployment state is not a nice-to-have; it's load-bearing infrastructure.

---

### Final Thought

`broadcast/` is Foundry's gift to you. It logs everything automatically, it's timestamped, it's machine-readable, and it costs you nothing to enable. Use it as your transaction archive.

But a transaction archive is a ledger, not a map. A team maintaining a live protocol needs a map — a single file that says, without ambiguity, where things live right now. Writing that yourself, in a `deployments/` folder your scripts maintain, is an afternoon of work that pays back every time someone asks "wait, which address are we on Sepolia?"

---

If you're working through deploy infrastructure questions on a Solidity project — UUPS upgrades, multi-network artifacts, idempotent scripts — feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
