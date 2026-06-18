---
social-post: |-
  💡 That bare `10000` in your fee calculation — do you actually know what it means?

  In my latest article, I walk through how I solved this in American Spend by moving scattered magic numbers into a single `MarketConstants` library.

  In this article I walk through what I ran into while building American Spend and how I approached it — using a real commit from the codebase.

  If you're building in Solidity and constants are still living in each contract individually, this one's for you. 👇 Read the article below

  hashtag#Solidity hashtag#SmartContracts hashtag#DeFi hashtag#EVM hashtag#SoftwareArchitecture hashtag#Web3 hashtag#Blockchain hashtag#AmericanSpend
---
# Kill the Magic Numbers: Why Your Constants Belong in a Shared Library

If you've spent enough time reading Solidity code — your own or someone else's — you've
probably seen something like this buried deep in a transfer calculation:

```solidity
uint256 fee = (amount * 250) / 10000;
```

What's 250? What's 10000? You have to go read the whitepaper, or ask someone, or grep
the codebase and hope the same pair of numbers appears together somewhere with a comment.
This is the **magic number problem**, and it's more dangerous in smart contracts than in
most software. Contracts are immutable. They handle real money. And the reader who
misunderstands that 10000 is the BPS denominator — not some arbitrary scale factor — might
be you at 2am chasing a precision bug.

From my work on American Spend — a prediction market protocol with a CLOB, vault yield,
and ERC6909 outcome tokens — I kept running into this same issue as the codebase grew.
Constants were scattered. The same 10000 appeared in the market contract, the order book,
the fee calculator, and the lens. Individually, each usage was fine. Collectively, they
were a drift waiting to happen.

---

### The Problem With `public constant` in Each Contract

The naive refactor is to add a constant at the top of each contract:

```solidity
uint16 public constant BPS_DENOMINATOR = 10_000;
uint16 public constant MAX_RAKE_BPS = 1_000;
```

This is better than a bare 10000, but it's not good enough. Two issues compound each other.

First, duplication drift. When `BPS_DENOMINATOR` exists in `Market.sol`, `MarketFactory.sol`,
and `CLOB.sol`, all three look identical — until one day they don't. A developer adds a
constant to `Market.sol`, forgets to add it to the others, and now you have fragmentation.
The build doesn't catch it. The tests might not either.

Second, the `public` modifier generates a getter function. Each getter costs bytecode.
In a protocol fighting EIP-170's 24KB runtime limit, you're paying for something you don't
need. A constant's value is baked in at compile time — there's no runtime state to fetch.

Both problems have the same solution: a **constants library**.

---

### The Pattern: `MarketConstants.sol`

In American Spend, after commit `df45bf6` ("Cap graduate caller reward, dedupe constants"),
the shared constants live in a single library:

```solidity
// src/libraries/MarketConstants.sol

library MarketConstants {
    /// @dev BPS denominator: 10_000 = 100%.
    uint16 internal constant BPS_DENOMINATOR = 10_000;

    /// @dev Maximum rake fee in basis points (10%).
    uint16 internal constant MAX_RAKE_BPS = 1_000;

    /// @dev Maximum number of outcomes per market.
    uint8 internal constant MAX_OUTCOMES = 8;

    /// @dev Caller reward for graduating a market (basis points).
    uint16 internal constant GRADUATE_CALLER_REWARD_BPS = 50;
}
```

Any contract that needs these values imports the library and references the constants
directly — no getter, no magic number, no duplication:

```solidity
import { MarketConstants } from "./libraries/MarketConstants.sol";

uint256 fee = (amount * rakeBps) / MarketConstants.BPS_DENOMINATOR;
require(rakeBps <= MarketConstants.MAX_RAKE_BPS, InvalidRake());
```

Because the constants are `internal`, the compiler inlines them at every usage site. Zero
runtime overhead. Zero bytecode for a getter. One source of truth.

---

### SCREAMING_SNAKE_CASE Is Not Optional

The naming convention matters more than it looks. `BPS_DENOMINATOR` — all caps, underscores
between words — is the universal signal that a value is a compile-time constant. It tells
the reader immediately: this doesn't change, this isn't a parameter, this is a fact about
the protocol.

In American Spend every constant follows this convention — `MAX_OUTCOMES`, `MIN_TRADING_WINDOW`,
`GRADUATE_CALLER_REWARD_BPS`. When you're reading a formula and you see a SCREAMING_SNAKE_CASE
identifier, you know what you're dealing with. The contrast with a regular variable —
`rakeBps`, `totalPool`, `outcomeIndex` — is immediate and cheap to read.

**But**: Foundry's formatter (`forge fmt`) won't enforce naming convention for you, and
neither will the Solidity compiler. It's a social contract enforced at code review. If
you're on a team that moves fast, bake this into your style guide explicitly — otherwise
you'll notice the first violation three weeks after it lands.

---

### The Bytecode Argument (It's Real)

A `public constant` in a Solidity contract generates an ABI-visible getter: a selector
(4 bytes), a return-value decode path, and runtime bytecode. It runs roughly 50 bytes per
constant — small alone, meaningful in aggregate. Ten shared constants duplicated across
three contracts with `public` modifiers means 30 unnecessary getters.

In American Spend, `Market.sol` grew large enough that we had to fight EIP-170 on multiple
fronts simultaneously — lens pattern, math library extraction, semantic error consolidation,
optimizer settings. A shared constants library was one tactic in that playbook, not the
only one, but it contributed. Every byte saved in a constrained contract is worth saving.

**Key trade-off**: `internal` means the constants are invisible to external callers and to
tools that depend on the ABI — Etherscan's contract reader, generated SDKs, subgraph
handlers. If a constant genuinely needs to be externally readable (a protocol-wide cap
that integrators need to display or validate against without hardcoding), then `public
constant` is fine. Put it in the factory or a registry, not in every contract that uses it.

---

### One File, Not One Per Domain

There's a temptation to split constants by domain — `FeeConstants.sol`, `TimingConstants.sol`,
`OrderBookConstants.sol`. I'd push back on that for most protocols.

The practical rule: use one file until you feel the friction of one file. Unless your
codebase spans 20+ contracts across multiple sub-domains with separate teams owning each,
a single `ProtocolConstants.sol` is easier to maintain. Developers find constants without
navigating a tree. You have exactly one import to add. You can still group constants within
the file using comment blocks.

The argument for splitting is "different teams own different subsystems." In my experience
that ownership boundary usually arrives later than developers expect — and until it actually
creates friction, the extra files are organizational debt, not organization.

---

### When This Pattern Matters Most

✅ Use a shared constants library when:
- Two or more contracts share a value (BPS denominator, max bounds, protocol-specific limits)
- You're fighting EIP-170 and need to reclaim bytecode from unnecessary getters
- The value has semantic meaning that a bare literal obscures — `10_000` means nothing; `BPS_DENOMINATOR` means everything

❌ Keep it local (or skip the library) when:
- A constant is genuinely only meaningful inside one contract — a private implementation detail with no business being shared
- You're prototyping — don't over-engineer early, but plan to refactor before audit
- The value isn't really a constant at all: if it's a configuration value that admins should be able to adjust, it belongs in a constructor parameter or a storage variable, not hardcoded

---

### Final Thought

Magic numbers are quiet. They don't throw errors. They don't fail tests. They just sit
there, accumulating ambiguity, until someone misreads one and sends the wrong amount
to the wrong address — or until a copy-paste duplicates the wrong value and you spend an
afternoon tracing a precision bug back to a 10000 that should have been 1000.

A constants library costs almost nothing: one file, a few imports, a naming convention.
What it returns is a codebase where every numeric fact about the protocol has a name, a
home, and a single source of truth. For the amount of effort involved, it's one of the
better trades in Solidity architecture.

---

If you're working on a Solidity protocol and thinking through this kind of architecture —
or if you've run into the EIP-170 limit and are looking for tactics — feel free to connect
or message me. I'm always open to exchanging ideas and learning from other builders.

---

*Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology.*
