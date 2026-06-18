---
social-post: |-
  🤔 What if the bug isn't in your logic — it's in the ceremony you skipped before the first deploy?

  While auditing the American Spend protocol at 33Labs, I ran into a category of vulnerabilities I hadn't thought about carefully enough: initialization. Not reentrancy, not arithmetic overflow — just the boilerplate you write once and trust forever.

  In this article I walk through what we found, why it matters for any UUPS upgradeable contract, and how a few lines of ceremony can be the difference between a recoverable mistake and a permanent lockout.

  If you're building with UUPS proxies, this one's for you. 👇 Read the article below.

  hashtag#Solidity hashtag#SmartContracts hashtag#Web3 hashtag#Blockchain hashtag#EthereumDev hashtag#DeFi hashtag#SmartContractSecurity hashtag#OpenZeppelin
---
# Upgradeable Contract Ceremony: Ownable2Step, Sentinel Values, and `_disableInitializers`

There's a category of bugs that don't come from clever attacks. They come from ceremony you forgot to do on the first deploy — and by the time you notice, it's too late to fix without a migration.

While building the American Spend prediction market protocol at 33Labs, we hit all three of these in a single audit cycle: a contract whose ownership could be fat-fingered to a dead address, an uninitialized field that defaulted to a meaningful value, and an idempotency check that broke the moment a legitimate zero result appeared. None of these were algorithmic. They were **initialization ceremony** — the boilerplate you write once and trust forever.

That trust is exactly the problem.

---

### The Ownership Transfer Problem

If you're using `OwnableUpgradeable` for your factory or registry contract, you're one mistyped address away from a permanent lockout. The owner can call `transferOwnership(newOwner)` and the transfer is immediate — the new owner doesn't need to do anything to accept.

That's fine in isolation. It becomes dangerous when you're migrating to a multisig, deploying across environments, or handing off to a DAO timelock. Fat-finger accidents happen. Clipboard hijacking happens. ENS resolution to a wrong address happens.

**`Ownable2StepUpgradeable`** solves this with a two-transaction protocol: the current owner calls `transferOwnership(newOwner)`, which records the *pending* owner. Then the new owner must explicitly call `acceptOwnership()`. If the address is wrong, the current owner still has control and can fix it.

We made this switch on `MarketFactory` — the contract that deploys all market clones, sets fee tiers, and controls the treasury receiver. It's the most admin-critical contract in the system. If it gets locked, no new markets can be created and no fees can be redirected.

```solidity
import {Ownable2StepUpgradeable} from
    "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract MarketFactory is
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable
{
    function initialize(address initialOwner) external initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        _transferOwnership(initialOwner);
    }
}
```

The pattern is almost identical to the standard `OwnableUpgradeable` usage — just swap the import and the `__init` call. The cost is a second transaction when transferring ownership. That's a trade-off I'll take every time on a contract that controls protocol economics.

**Key trade-off:** two-step adds latency to ownership transfers. In a time-sensitive migration (e.g., emergency admin rotation), you can't complete the handoff in a single block. Design your emergency procedures to account for this — the second transaction needs to come from an address that's already available.

---

### Default Values in `initialize()` and When Zero Lies

Upgradeable contracts using the `Initializable` pattern from OpenZeppelin don't have a traditional constructor. Everything happens in `initialize()`. That means if you forget to set a value there, it quietly stays at zero — and zero isn't always "unset."

Here's the one that bit us on American Spend. We store the winning outcome of each prediction market as a `uint8 correctOutcome`. After resolution, we need to distinguish three states:

1. The market hasn't resolved yet.
2. The market resolved — outcome 0 won (the "Yes" side in a binary market).
3. The market resolved — outcome 1 won.

If we initialize `correctOutcome = 0` and resolve with outcome 0, both states look identical. Any code that checks `if (correctOutcome == 0)` to detect "unresolved" will fire on a legitimately resolved market.

The fix is a **sentinel value** — a value that sits outside the valid domain. For `uint8`, `type(uint8).max` (255) works perfectly. A market can have at most a handful of outcomes, so 255 is unreachable in practice. We initialize there and check against it instead of zero:

```solidity
uint8 private constant UNRESOLVED = type(uint8).max;
uint8 public outcomeCount; // set in initialize() — e.g., 2 for a Yes/No market

function initialize(uint8 _outcomeCount /* other params */) external initializer {
    outcomeCount = _outcomeCount;
    correctOutcome = UNRESOLVED;
}

function isResolved() public view returns (bool) {
    return correctOutcome != UNRESOLVED;
}

function resolve(uint8 outcome) external onlyResolver {
    require(!isResolved(), "Already resolved");
    require(outcome < outcomeCount, "Invalid outcome");
    correctOutcome = outcome;
}
```

The same principle applies to any field where zero is a valid domain value. If you're tracking a vault snapshot that could legitimately be zero (total loss scenario), using `snapshot > 0` as an idempotency check will fail on legitimate zero results. Use an explicit boolean flag instead:

```solidity
bool private vaultAccountingFinalized;
uint256 private resolvedVaultAssetsSnapshot;

function _finalizeVaultAccounting() internal {
    require(!vaultAccountingFinalized, "Already finalized");
    resolvedVaultAssetsSnapshot = vault.redeem(totalShares);
    vaultAccountingFinalized = true; // the flag, not the snapshot
}
```

We hit this exact scenario when building the vault yield integration on American Spend. The vault can take a total loss — `resolvedVaultAssetsSnapshot` is legitimately zero. Without the explicit flag, calling `_finalizeVaultAccounting` a second time would try to redeem again, double-counting a revert or silently corrupting accounting.

**Key trade-off:** sentinels work only as long as the sentinel value is actually unreachable. Document why — if `outcomeCount` ever grows past 254, `type(uint8).max` breaks silently. A `uint16` for `correctOutcome` with a `type(uint16).max` sentinel costs negligible extra storage and removes the implicit assumption. At minimum, add a `require(outcomeCount < type(uint8).max, ...)` guard in your factory so the assumption is enforced, not just trusted.

---

### Locking the Implementation Contract

This one is the easiest to forget and one of the most well-known UUPS footguns. When you deploy a UUPS proxy pattern, two contracts exist: the **proxy** and the **implementation**. The proxy holds state; the implementation holds logic. The proxy delegates all calls to the implementation.

The implementation contract itself has an `initialize()` function. And by default, nothing stops an attacker from calling that function directly on the implementation — not through the proxy, but on the implementation's own address. If they initialize it with themselves as owner and then call `upgradeToAndCall`, they can point every proxy that uses this implementation to malicious code.

The fix is one line in the constructor:

```solidity
contract MarketFactory is
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        _transferOwnership(initialOwner);
    }
}
```

`_disableInitializers()` sets the internal version counter to `type(uint64).max`, which makes any future call to `initialize()` or `reinitializer()` revert. The implementation contract is permanently bricked as a standalone contract — it can only be used through a proxy. The proxy's state is unaffected.

We caught this missing in one of our market contracts during audit prep. It wasn't being exploited — but it was a live vulnerability on an already-deployed implementation address.

**Key trade-off:** minimal — this has no downside for production code. The one friction point is testing: if you want to initialize the implementation directly in a test (to avoid standing up proxy infrastructure), `_disableInitializers()` will block that. The workaround is a test-only subclass that overrides the constructor, or just using a proxy even in tests. Either way, the production contract should always have it.

---

### The Architecture Question Underneath

There's a design decision that makes the sentinel and `_disableInitializers` patterns even more important: **not every contract should be upgradeable**.

On American Spend, we distinguish between the factory (UUPS upgradeable) and the individual market contracts (immutable after deploy). The factory is the long-lived admin surface — fee tiers, treasury, market logic upgrades. Markets are instances — each one is "a game" with fixed rules that participants locked in when they entered. Upgrading an in-progress market would be like changing the rules mid-play.

Making markets immutable removes ~200-300 bytes of proxy overhead and removes an entire attack surface (no upgrade path = no upgrade exploit). It also means the `_disableInitializers` pattern applies differently: the market's `initialize()` is called exactly once by the factory clone mechanism, and after that the parameters are permanent.

The lesson: evaluate each upgradeable contract individually. Does it need to evolve? Who benefits and who loses from that flexibility? The answer shapes which patterns you reach for.

---

### Final Thought

None of these patterns are clever. They're ceremony — and ceremony is exactly what gets deprioritized when you're shipping fast and your smart contract logic is finally working.

From my experience, the contracts that get this right aren't the ones with the most sophisticated logic. They're the ones where someone paused before the first deploy and asked: *what does every field mean when it's zero? Who can change ownership, and what happens if they get the address wrong? Is this implementation protected from direct initialization?*

Those questions take five minutes. The bugs they prevent can take weeks — or longer if you need a migration.

---

If you're building upgradeable contracts and have hit initialization footguns of your own, I'd love to hear about them. Feel free to connect or message me — I'm always open to exchanging notes with other builders working through the same problems.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
