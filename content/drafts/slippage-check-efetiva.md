---
social-post: |-
  💡 Writing a slippage check is easy. Writing one that actually protects users is harder than it looks.

  In my latest article I dig into where slippage checks quietly break down — and why the bugs that make it through code review are usually semantic, not syntactic. I explore this through two cases we hit building American Spend.

  If you're working on a DeFi protocol with fees, custom pricing curves, or prediction-market mechanics, this one's worth a read.
  👇 Article below.

  hashtag#Solidity hashtag#DeFi hashtag#SmartContracts hashtag#Web3 hashtag#PredictionMarkets hashtag#AMM hashtag#SecurityInDeFi hashtag#AmericanSpend
---
# Solidity Slippage Checks That Actually Protect Users: Fees, Direction, and Domain-Aware Bounds

If you've shipped a DeFi protocol, you've probably written a slippage check. The pattern looks obvious: compare what the user is spending — or receiving — against their stated limit, and revert if the fill is worse than they'd accept.

Two things can go wrong independently. First, "what the user is spending" is almost always more than the principal alone — fees belong in the aggregate. Second, in some protocols the quantity users care about isn't a token amount at all, and the bound direction that protects them is the opposite of what feels intuitive. In American Spend, we hit both bugs on separate commits. Neither required a redesign — both were one-line fixes once the semantic error was clear. But each lived undetected for a while because the code *did* perform a comparison, and the comparison *did* involve the right inputs. The error was in what was being compared, not in how.

---

### Failure Mode 1: The Check Excludes Fees

The first bug is common and easy to overlook. You have a market buy function. The user passes `maxCollateralIn` — the most collateral they're willing to spend. The check looks like this:

```solidity
(uint256 spentCollateral, uint256 paidTakerFee) = _matchOrders(amount_);

if (spentCollateral > maxCollateralIn_) revert SlippageExceeded();
```

This compiles, looks reasonable, and still lets users get rugged.

Why? Because the user doesn't think of `spentCollateral` and `paidTakerFee` as separate things. When they set `maxCollateralIn = 100 USDC`, they mean *total out of pocket* — principal plus fees, all of it. If `spentCollateral` is 98 USDC and the taker fee is 4 USDC, the check passes while the user spends 102 USDC — 2% more than their stated limit. On small trades it's annoying. On large fills, it's real money.

The fix is mechanical once you see it:

```solidity
(uint256 spentCollateral, uint256 paidTakerFee) = _matchOrders(amount_);

if (spentCollateral + paidTakerFee > maxCollateralIn_) revert SlippageExceeded();
```

The principle generalizes: **every outflow the user pays — principal, taker fee, rake, whatever — must be aggregated before comparing against their limit.** If you only check part of the spend, the bound is incomplete. The user set a ceiling. The check should enforce the ceiling on the real cost, not a proxy for it.

**Key trade-off:** aggregating fees into the check does mean more fills will revert. A user who sets a tight `maxCollateralIn` might get reverted even when the price moved only a little — because the total, including fees, exceeded their limit. That's correct behavior, not a bug. The alternative — silently collecting fees beyond the user's stated limit — is the actual problem.

---

### Failure Mode 2: The Bound Is Semantically Inverted

The second bug is subtler and more interesting. It shows up when slippage isn't measured in token amounts at all — which is the case in prediction markets.

In American Spend, Phase 1 markets use an AMM-style pricing curve. The price is expressed as **implied odds in basis points** — not as a token-per-token exchange rate. When you buy on that curve, you specify `collateralAmount` (how much USDC to spend) and get outcome tokens at whatever odds the curve gives you.

Now: what does slippage protection look like here?

The naive answer is "min acceptable odds" — you want at least X odds, so revert if the fill gives you less. This seems right. Higher odds = better for the buyer, right?

Not exactly. The problem is that in a buy, **worse execution means higher odds** — the curve has moved against you, and you receive fewer tokens per dollar. Worse execution = higher implied odds on the token you bought. If someone front-runs your buy, the odds go up. That's the bad scenario.

So "min acceptable odds" is the wrong bound for a buy. It would let the bad scenario through (high odds) and block fills in favorable conditions (low odds). The guard is upside-down.

The correct bound is `maxAcceptableOddsBps` — a ceiling on odds. You revert if the odds *exceeded* your limit:

```solidity
function buyOnPhase1(
    uint256 collateralAmount_,
    uint256 maxAcceptableOddsBps_
) external nonReentrant {
    uint256 impliedOddsBps = _getBuyImpliedOdds(collateralAmount_);

    if (impliedOddsBps > maxAcceptableOddsBps_) revert SlippageExceeded();

    _executeBuy(collateralAmount_, impliedOddsBps);
}
```

Higher odds = worse fill for the buyer = revert. That's the protection users actually need. In our codebase the original parameter was named `minAcceptableOdds_`, which made the semantic confusion almost invisible — the name suggested a floor, but the behavior needed a ceiling.

Renaming to `maxAcceptableOddsBps` resolved the ambiguity at the interface level. The bound direction became part of the function signature.

**Key trade-off:** "max acceptable odds" semantics feel less intuitive than "min acceptable." Buyers think of themselves as wanting *at least* some return. You'll need to document this clearly — in NatSpec, in the SDK, and in the frontend. The alternative is to map the bound to something users do think in floors about (token output), but that introduces its own conversion complexity and the same inversion risk if done wrong.

---

### The General Rule

When you write a slippage check, ask these two questions:

**1. Am I comparing the complete user outflow (or inflow)?**
List every component that changes hands: principal, fee, rake, rebate. If any outflow is missing from the comparison, the bound is incomplete. The same applies to inflows — if you're protecting a minimum receive, aggregate all credits.

**2. Is the bound direction protecting the user from their actual worst case?**
In token-for-token swaps, the worst case for a buyer is paying too many tokens, so `maxTokensIn` is a ceiling — and the comparison is natural. In systems priced in odds, rates, or other derived quantities, map out which direction of that quantity signals a worse fill, then set the bound to block that direction. The name of the parameter should communicate its direction unambiguously.

**Key trade-off on the general rule:** applying this rigorously does add complexity to the check — you need to reason about every component and every direction. On simpler protocols, the complexity is low. On multi-phase protocols with multiple fee types (taker fee, maker rebate, rake, graduated fees), the aggregation logic can become non-trivial, and it needs to be tested explicitly.

> 📝 _A useful fuzz invariant: for any valid fill, the user's total outflow must never exceed `maxCollateralIn`. Write it that way and let the fuzzer find the counterexamples._

---

### Final Thought

A slippage check that only checks part of what the user pays is not a slippage check — it's a false sense of security. And a bound that's semantically inverted actively makes things worse than no bound at all, because it blocks good fills and allows bad ones.

The fix in both cases is cheap. The cost of the bug isn't.

Before shipping any function with user-specified limits, read the check out loud from the user's perspective: "I will spend at most X in total, including fees. If the fill would cost me more than X, revert." If your code doesn't enforce exactly that sentence, it's not done yet.

---

If you're building a DeFi protocol and wrestling with slippage logic, fee aggregation, or AMM-style pricing semantics, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*

