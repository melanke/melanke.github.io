---
social-post: |-
  💡 Your Solidity contract hit 24KB — and the Diamond pattern is not the answer.

  In my latest article, I walk through the structural moves I applied while building American Spend
  — a CLOB prediction market with ERC6909 positions and vault yield — to keep the size ceiling from
  coming back every time we added a feature.

  If you're working on a Solidity protocol that keeps bumping that limit, this one's for you.
  👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#EVM hashtag#DeFi hashtag#Web3 hashtag#SoftwareArchitecture hashtag#Blockchain hashtag#Foundry
---
# Past 24KB: How to Split a Solidity Contract Without Losing Your Mind

There is a moment every serious Solidity project hits. You run `forge build` and instead of green output you get something like:

```
Error: Contract bytecode size is 27,342 bytes, which exceeds EIP-170's limit of 24,576 bytes.
```

You stare at it. You know there is nothing wrong with the logic. The contract is just... big. And at that moment, most developers reach for the wrong tool.

The wrong tool is the Diamond pattern — four interconnected standards, a proxy dispatch table, and an upgrade mechanism you will spend three weeks understanding and two years explaining to auditors. In my experience, 90% of the contracts that hit the 24KB wall don't need a Diamond. They need a few targeted surgeries, applied in the right order.

I learned this while building American Spend — a prediction market protocol with a CLOB (central limit order book), a vault yield system, and ERC6909 multi-token positions. The main `Market.sol` kept creeping past the limit every time we added a feature. What follows is the architecture-first approach that actually worked.

> If you're looking for bytecode micro-optimizations — optimizer flags, error consolidation, modifier dedup — I covered those separately in [Solidity Contracts Are Getting Too Big — Here's How to Shrink Them](). This article is about the structural moves: how to split responsibilities across multiple contracts so the problem doesn't come back.

---

### The Lens Pattern: Move Your Views Out

The highest-ROI structural change is almost always the same: extract all `view` and `pure` read functions into a companion contract.

In American Spend, `Market.sol` had a growing collection of derived views — `getImpliedOdds`, `getUserTrades`, `calculatePotentialPayout`, aggregators that assembled state for the frontend. None of them touched write operations. We moved all of them to `MarketLens.sol`.

```solidity
contract MarketLens is IMarketLens {
    IMarket private immutable market;
    IMarketFactory private immutable factory;

    constructor(address _market, address _factory) {
        market = IMarket(_market);
        factory = IMarketFactory(_factory);
    }

    function getImpliedOdds(uint256 outcomeIndex)
        external
        view
        returns (uint256 priceBps)
    {
        return market.getOrderBook(outcomeIndex).bestAsk();
    }

    function calculatePotentialPayout(
        address user,
        uint256 outcomeIndex,
        uint256 amount
    ) external view returns (uint256) {
        // reads from market and factory, no writes
    }
}
```

The lens is deployed separately by the factory and stored as a known address. Frontends and integrators call the lens; the core contract stays lean.

That refactor reduced `Market.sol` by roughly 158 lines. There was a bonus: view logic is now independently testable without deploying the full market, and the lens can be upgraded or redeployed without touching the immutable market instance.

**But:** you now have two deployed contracts per market instead of one. Deployment scripts get slightly more complex. Auditors need to look at both. For a CLOB with dozens or hundreds of concurrent markets, that is real overhead — but it is manageable overhead, unlike trying to fit everything into one contract.

---

### Libraries: Where Pure Logic Belongs

If the Lens pattern handles read functions, **libraries** handle computation — fee calculations, rake, payout math, anything that is `pure` or `view` without protocol state.

```solidity
library MarketMath {
    uint16 internal constant BPS_DENOMINATOR = 10_000;

    function computeRakeAndNet(
        uint256 grossAmount,
        uint16 rakeBps
    ) internal pure returns (uint256 rake, uint256 net) {
        rake = (grossAmount * rakeBps) / BPS_DENOMINATOR;
        net = grossAmount - rake;
    }

    function computePayout(
        uint256 totalPool,
        uint256 userShares,
        uint256 totalShares
    ) internal pure returns (uint256) {
        if (totalShares == 0) return 0;
        return (totalPool * userShares) / totalShares;
    }
}
```

Internal library functions are inlined by the compiler when the library is in the same compilation unit, so the gas cost per call is unchanged. In American Spend, extracting `MarketMath` saved roughly 1.6KB. The bigger win was correctness: the same formula used in multiple places now has a single source of truth.

**But:** pure library logic is excellent. Stateful library logic — libraries that read or write storage — introduces complexity that often isn't worth it. If a fee calculation eventually needs a dynamic fee tier stored in contract state, it can no longer stay `pure`. Design for the 80% case; don't over-extract ahead of requirements.

---

### Factory + Clones: Keep Validation at the Gate

If your architecture uses a factory to create contract instances — markets, vaults, positions — here is a pattern I see violated constantly: **validation in the clone**.

Each clone pays bytecode rent for every line of code it carries. When you have hundreds of market clones, any code you can move to the factory pays off once and then essentially disappears from the per-clone cost.

```solidity
contract MarketFactory is UUPSUpgradeable, Ownable2StepUpgradeable {
    function createMarket(MarketParams calldata params) external returns (address) {
        // All validation lives HERE, not in the clone
        if (params.closeTime <= params.openTime) revert InvalidTradingWindow();
        if (params.outcomeCount < 2 || params.outcomeCount > MAX_OUTCOMES)
            revert InvalidOutcomeCount();
        if (params.rakeBps > MAX_RAKE_BPS) revert InvalidRake();

        address clone = Clones.clone(marketImplementation);
        IMarket(clone).initialize(params); // clone trusts inputs are valid
        return clone;
    }
}
```

The clone's `initialize()` is lean. It trusts the factory. The factory validates against current global state — treasury address, allowed outcome token implementations — something the clone cannot do anyway.

**But:** the factory must be trustworthy. In an upgradeable setup, `Ownable2StepUpgradeable` prevents accidental ownership transfers, but it also means the factory deserves more scrutiny in audits. You are trading distributed validation for centralized validation — which is actually a security improvement, not just a size one. Just be deliberate about it.

---

### Instances Don't Need Upgradability

This one is easy to miss because it feels like a security decision, not a size one — but it is both.

In American Spend, each market is "a game" — once created, the rules should be immutable. A player shouldn't have to worry that the payout formula will change after they've placed a position. So we removed `UUPSUpgradeable` from `Market.sol` and kept it only on the factory.

That removal saves roughly 200–300 bytes per contract — the proxy slot logic and `_authorizeUpgrade`. Across hundreds of clone instances, that is real space recovered. And it makes each market simpler to audit: no upgrade path means no upgrade attack surface.

**But:** this only works if you genuinely don't need instance upgrades. If your market logic will evolve — new settlement mechanisms, updated fee structures — you need either upgradeable instances or a migration path. The question to ask is: *does the upgrade path solve a real product requirement, or is it just defensive "in case we need it"?* In my experience, "in case we need it" is usually the wrong reason to carry the complexity.

---

### Move Functions to Their Correct Home

Sometimes a function lives in the wrong contract not because of a design mistake, but because of how the code evolved. In American Spend, seed ladder methods — logic that governs how liquidity seeds are structured for the CLOB — started out in `Market.sol` because that's where they were needed first. But semantically, they belong in the CLOB layer.

Moving them there had two effects: `Market.sol` shrank, and the CLOB code became more self-contained and readable. The test for where a function belongs is simple: if someone were reading only the CLOB contracts, would they expect to find this function there? If yes, move it.

This isn't about arbitrary reorganization — it's about making domain boundaries honest. When functions live in the right place, the contract that loses them gets smaller, and the contract that gains them becomes more coherent.

**But:** moving functions between contracts in a live system means updating all callers, redeploying, and updating tests. On a protocol with existing users, do this in a deliberate refactoring sprint, not as a side effect of a feature branch.

---

### Shared Constants: One Library, No Drift

This is a small one, but I have seen it bite teams repeatedly. Two contracts define `uint16 BPS_DENOMINATOR = 10_000`. Someone updates one and forgets the other. Or they copy-paste and introduce `uint256` vs `uint16` type drift.

```solidity
library MarketConstants {
    uint16 internal constant BPS_DENOMINATOR = 10_000;
    uint16 internal constant MAX_RAKE_BPS = 1_000;      // 10%
    uint16 internal constant MAX_PROTOCOL_FEE_BPS = 500; // 5%
    uint256 internal constant SEED_PRECISION = 1e18;
}
```

Every contract imports `MarketConstants`. The constant changes in one place, propagates everywhere, no drift. Bytecode savings are modest — you eliminate the getter functions that `public constant` emits — but the correctness argument is the real win.

---

### The Right Order Matters

Every tactic above works independently, but applied in the wrong order you waste effort. The sequence I use:

1. `optimizer_runs = 1` — free win, try it first (covered in detail in the sibling article)
2. **Lens** for all derived views — usually the biggest structural cut
3. **Math/pure logic** into libraries — improves testability, saves ~1–2KB
4. **Validations** to the factory — cascade effect on all clones
5. **Remove upgradability** from instances that don't need it
6. **Move functions** to their correct domain home
7. Constants into shared libraries — prevents drift, small size win
8. Delete alternative implementations after benchmarking

That last one deserves emphasis. During American Spend's CLOB development, I implemented four different order book backends — bitmap, linked list, red-black tree, and a linear array baseline — to benchmark them rigorously. The benchmarks showed the red-black tree won decisively (145K gas for a sparse match vs 56M for the baseline). After choosing the winner, I deleted ~3,489 lines of alternative implementations in a single commit.

Dead code is not neutral. It inflates your artifact, confuses auditors, and creates a maintenance surface for bugs that will never get fixed because nobody thinks the code is active. Kill it.

---

### When to Reach for Something Bigger

Everything above handles contracts in the 24–30KB range that grew organically. If you have a contract that is architecturally doing too many things — trading engine plus vault plus governance plus oracle plus admin — the right answer might be to decompose responsibilities, not just compress code.

The signals: your Lens is itself approaching 24KB. Your library extracted everything extractable and the core is still over the limit. Your factory validation is a contract unto itself. At that point, the question isn't compression — it's whether one contract is carrying responsibilities that belong in separate contracts with clear ownership.

In American Spend, the answer was: separate the CLOB (via `IOrderBook` interface and a pluggable deployer), the vault yield logic, and the market lifecycle into distinct contracts with defined interaction points. The core `Market.sol` became a coordinator, not an everything-box.

---

### Final Thought

The 24KB limit is not a bug. It is a forcing function — it penalizes contracts that try to be everything. The tactics above are not workarounds; they are the way large Solidity systems should be structured anyway. Smaller contracts. Clearer responsibilities. Pure logic in libraries. Read logic in lenses. Validation at the gate. Upgradability only where it earns its complexity.

Apply them in ROI order, benchmark before committing, and delete what you don't ship.

---

If you're working on a Solidity protocol that's hitting the size wall — or designing a new one and want to avoid it — feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
