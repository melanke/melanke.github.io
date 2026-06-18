---
social-post: |-
  💡 Committed a private key to your repo once? Deployed to the wrong network because you sourced the wrong `.env`? Me too.

  In my latest article I walk through the deploy hygiene we settled on in American Spend — how we handle secrets, per-network configuration, and safety guardrails in Foundry scripts. The pattern is simple, but getting it wrong early is costly.

  If you write Foundry deploy scripts, this one's for you.

  👇 Read the article below

  hashtag#Solidity hashtag#Foundry hashtag#SmartContracts hashtag#Web3 hashtag#BlockchainDevelopment hashtag#DeFi hashtag#EVM hashtag#SoftwareEngineering
---

# Foundry Deployment Hygiene: A `ConfigHelper` for Multi-Chain Scripts and Keeping Private Keys Out of `.env`

If you've spent any real time writing Foundry deploy scripts, you've probably done this at least once: hardcoded an address for one network, forgotten to swap it before running the script on another, and watched your deploy half-succeed on the wrong chain. Or you've committed a `.env` file with a private key in it — then immediately panicked, revoked it, and spent an afternoon wondering if anyone snagged it in that window.

Both problems are fixable. They're also related. Both are about separating *what is secret* from *what is configuration* — and keeping configuration close to the logic that needs it, rather than scattered in environment files that grow without structure.

This is what we ended up doing in the American Spend codebase. I want to walk through the pattern concretely.

---

### The Two Problems, Stated Plainly

**Problem one: private keys in `.env` files.**

You create a `.env`, add `PRIVATE_KEY=0x...`, and source it before running forge. It works. But `.env` files get committed accidentally — especially when you're moving fast. They show up in backups. They get shared in Slack "just for today." They live in CI environments where they shouldn't. The attack surface is large and the blast radius is catastrophic.

**Problem two: per-network configuration scattered everywhere.**

You have three networks — local, testnet, mainnet. Each has different USDC addresses, different treasury addresses, different protocol parameters. The "solution" many projects reach for is a pile of environment variables: `USDC_MAINNET`, `USDC_TESTNET`, `TREASURY_MAINNET`... You end up sourcing the right `.env.mainnet` or `.env.testnet` file before every run and hoping you got it right.

This breaks down fast once you have more than two networks or more than one developer.

---

### The Fix for Keys: Use a Secret Manager

The core rule is simple: **private keys never live in committed files**. Not `.env`, not `.env.example` with a dummy key, not anywhere in the repo.

Instead, you load them from an external secret manager at runtime. AWS Secrets Manager, 1Password CLI, HashiCorp Vault — pick whatever your team already uses. The pattern looks like this:

```bash
# Before running any deploy script
export PRIVATE_KEY=$(aws secretsmanager get-secret-value \
  --secret-id deploy/mainnet-key \
  | jq -r '.SecretString')

forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Your `.env.example` documents *which* variables are expected — but contains no secrets:

```bash
# .env.example
RPC_URL=          # your network RPC endpoint
ETHERSCAN_API_KEY= # for verification
# PRIVATE_KEY is loaded from secret manager — see README
```

The private key only exists in memory during the forge invocation. It's never at rest in the filesystem, never in version control, never in a backup. When you rotate the key, you rotate it in one place and every CI job and developer machine picks up the change automatically.

**Key trade-off:** This adds a dependency on your secret manager being available when you need to deploy. If AWS is having a bad day, so are you. Mitigate this with a local fallback (`cast wallet` or a hardware wallet) documented in your runbook — but don't make the fallback the default.

---

### The Fix for Config: A Dedicated `DeployConfig.sol`

Network-specific configuration is *code*, not *environment*. It belongs in a Solidity file under version control, alongside the contracts it configures.

In American Spend, we pulled all per-network parameters into a `DeployConfig.sol` that the deploy script imports directly:

```solidity
// script/DeployConfig.sol
struct NetworkConfig {
    address usdc;
    address treasury;
    uint16  graduationThresholdBps;
    uint16  maxPositionShareBps;
}

function getConfig() internal view returns (NetworkConfig memory) {
    if (block.chainid == 1) {
        return NetworkConfig({
            usdc:                   0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
            treasury:               0xYourTreasuryAddress,
            graduationThresholdBps: 500,
            maxPositionShareBps:    2000
        });
    }
    if (block.chainid == 84532) {
        // Base Sepolia testnet
        return NetworkConfig({
            usdc:                   0x036CbD53842c5426634e7929541eC2318f3dCF7e,
            treasury:               0xYourTestTreasury,
            graduationThresholdBps: 200,
            maxPositionShareBps:    5000
        });
    }
    revert("DeployConfig: unsupported chain");
}
```

The deploy script imports the struct and function, then calls `getConfig()` and never touches `block.chainid` again:

```solidity
// script/Deploy.s.sol
import { NetworkConfig, getConfig } from "./DeployConfig.sol";

contract Deploy is BaseBroadcastScript {
    function run() external broadcast {
        NetworkConfig memory cfg = getConfig();

        address factory = deployFactory(cfg.usdc, cfg.treasury);
        configureFactory(factory, cfg.graduationThresholdBps, cfg.maxPositionShareBps);
    }
}
```

Everything that varies by network lives in one place. You change an address, you change it once, and the change is in the commit history with a meaningful message.

**Key trade-off:** Addresses are now in version control. For public repos, that's fine — contract addresses are public. But if your config contains sensitive operational parameters you'd prefer not to publicize, keep those as runtime inputs rather than hardcoding them here. In most DeFi setups this information is on-chain anyway, so the trade-off is usually worth it.

---

### Network-Specific Scripts: Gate by Chain ID

Some scripts only make sense on certain networks. In American Spend, `LocalCollateral.s.sol` deploys a mock USDC contract — that script has no business running on mainnet.

The pattern is to gate it at the top of `run()`:

```solidity
// script/LocalCollateral.s.sol
contract LocalCollateral is BaseBroadcastScript {
    function run() external broadcast {
        require(
            block.chainid == 31337 || block.chainid == 1337,
            "LocalCollateral: only for local networks"
        );
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6);
        // write to deployments/local.json ...
    }
}
```

This is a small thing, but it's saved me from embarrassing mistakes more than once. The script itself tells you if you're about to do something wrong — you don't rely on remembering which `.env` you sourced.

**Key trade-off:** You're encoding network logic directly in the script rather than relying on a caller convention. That's intentional — callers forget conventions; `require` statements don't.

---

### `BaseBroadcastScript`: Reuse Logging and Broadcast Logic

Once you have two or three deploy scripts, they all share the same boilerplate: set up the broadcaster, log what's happening, save the deployed address. Pull that into a base contract and inherit from it.

```solidity
// script/BaseBroadcastScript.sol
abstract contract BaseBroadcastScript is Script {
    modifier broadcast() {
        vm.startBroadcast();
        _;
        vm.stopBroadcast();
    }

    function logDeployed(string memory name, address addr) internal view {
        console2.log(string.concat("[deploy] ", name, ": "), addr);
    }
}
```

Individual scripts extend this and focus only on their specific logic. When you want to add step-numbering to all deploys (`[1/5] Deploying Market...`), you add it in one place and every script picks it up.

**Key trade-off:** You're introducing inheritance in your scripting layer. For a single script, this is overkill. The break-even is roughly two scripts — if you have more than two, the base pays for itself.

---

### How It All Fits Together

```
script/
  BaseBroadcastScript.sol     # broadcast modifier, logging helpers
  DeployConfig.sol            # NetworkConfig struct + getConfig()
  Deploy.s.sol                # main deploy — reads config, no hardcoded addrs
  CreateFirstMarket.s.sol     # post-deploy action — inherits base
  LocalCollateral.s.sol       # local-only — gated by chainid
```

Keys come in from outside (secret manager → shell variable → `--private-key` flag). Configuration comes from inside (Solidity file, committed, reviewed). Scripts are thin — they import config, call base helpers, and do one thing each.

When you onboard a new developer, you point them at `.env.example` and your secret manager docs. They're up and running without needing to know which combination of environment variables to source for which network.

When something goes wrong in a deploy, you look at one file — `DeployConfig.sol` — to verify the addresses, and one place in the commit history to see when they changed.

---

### Final Thought

Deploy scripts are often treated as throwaway code — written once, rarely reviewed, patched in place when something breaks. But they're the layer where the entire protocol goes live on a network with real assets. A key leak or a misconfigured address at this stage can be catastrophic in a way that a bug in a unit test never is.

The patterns here aren't clever. They're just disciplined: keep secrets out of the repo, keep configuration in the repo, and keep scripts small enough that you can read them end to end in two minutes. That's the sweet spot — just enough structure to prevent the obvious failure modes, without so much ceremony that people start bypassing the process.

---

If you're building a Foundry project and want to talk through your deploy setup, feel free to connect. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
