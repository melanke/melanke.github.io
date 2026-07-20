[HOOK — refinar]

ERC-8006 landed on Ethereum Magicians to solve one specific problem: how do you check a compliance rule before letting a transaction through, without hardcoding that rule into your contract. I want to walk through the actual design in real depth, because the standard is worth understanding on its own terms, and because underneath it is an architecture I've already shipped, under different names, on projects that have nothing to do with compliance.

---

### The problem ERC-8006 is solving

Every dapp that needs a rule ends up writing that rule twice: once as the business logic, and once as a `require` statement bolted onto it. Take a vault that caps withdrawal amounts, or a launchpad that checks a wallet cleared KYC before it can buy. Each starts as a simple `if`, and stays simple exactly until it doesn't.

The ERC-8006 spec lays out why that breaks down as rules grow. Audits get harder as conditions compound, and a poorly implemented check can silently let through exactly the transaction it was meant to block. Adding a new rule usually means touching the core contract, redeploy and all. Worse, the same compliance pattern gets rebuilt from scratch in the next project, because there was never a shared interface for it to begin with. None of that is hypothetical, it's the normal lifecycle of a `require` statement that started simple.

ERC-8006's answer is to stop writing rules as `require` statements at all. Instead, each rule is its own small contract, called an **artifact**, exposing a minimal shared interface:

```solidity
interface IArbitraryDataArtifact {
    // Runs the check and returns the result.
    function exec(bytes[] memory data) external returns (bytes memory);

    // Sets up a stateful artifact once. A stateless check, like "is this signature
    // valid," has nothing to set up and skips this.
    function init(bytes memory data) external;

    // Lets tooling generate forms and encode exec() arguments without a human
    // reading the source.
    function getExecDescriptor()
        external pure
        returns (string[] memory argsNames, string[] memory argsTypes, string memory returnType);

    // Same idea, for init() arguments.
    function getInitDescriptor()
        external pure
        returns (string[] memory argsNames, string[] memory argsTypes);

    // Human-readable summary of what the artifact checks.
    function description() external pure returns (string memory desc);
}
```

Everything moves as `bytes`, which is what lets wildly different rules share one interface.

A **Policy Handler** is what wires artifacts together, as a [Directed Acyclic Graph (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph) by default. The spec's own worked example is "be over 21 years old and a citizen": an `AND` artifact sits at the root, with a `GreaterThan` artifact checking age and an `IsCitizen` artifact feeding into it as children. The handler walks the graph, calls each artifact through the same interface, passes child outputs up to their parents, and the root's output is the policy's final answer.

Here's what the age check looks like as a standalone contract:

```solidity
contract MinAgeArtifact is IArbitraryDataArtifact {
    // Set once at deploy time. This instance enforces one minimum age
    // against one attestation source — a different minimum (18 instead
    // of 21, say) means deploying a second instance, not a config change.
    IAgeRegistry public immutable registry;
    uint8 public immutable minAge;

    constructor(IAgeRegistry _registry, uint8 _minAge) {
        registry = _registry;
        minAge = _minAge;
    }

    // The Policy Handler calls this every time the policy runs.
    // `data` is an array because some artifacts need several inputs;
    // this one only needs the wallet address, so it only reads data[0].
    function exec(bytes[] memory data) external view returns (bytes memory) {
        address wallet = abi.decode(data[0], (address));
        bool passes = registry.ageOf(wallet) >= minAge;
        // The interface requires bytes back, even for a plain true/false.
        return abi.encode(passes);
    }

    // Nothing to initialize: this artifact keeps no state of its own,
    // it just reads the registry fresh on every exec() call.
    function init(bytes memory) external {}

    function description() external pure returns (string memory) {
        return "Checks that a wallet's attested age meets the configured minimum.";
    }

    // getExecDescriptor / getInitDescriptor omitted here for space —
    // in a full implementation, they'd describe exec()'s inputs and
    // output above so tooling can build a form without reading this code.
}
```

The citizenship check, `IsCitizenArtifact`, is built the same way against a citizenship registry instead of an age one, so it's not worth repeating in full.

Take a prediction market that only wants "over 21, and a citizen" to place a bet. Instead of writing that logic into its `bet` function, it deploys both artifacts and wires them into a Policy Handler:

```solidity
// NodeInitData also has initData, needsInitialization, constantExecArgs,
// and injections — omitted below for space since none apply to this case.

MinAgeArtifact ageCheck = new MinAgeArtifact(ageRegistry, 21);
IsCitizenArtifact citizen = new IsCitizenArtifact(citizenRegistry);
AndArtifact and = new AndArtifact();

// PolicyHandler's owner-check is a plain msg.sender == adminUser match
// (OwnerBase.sol), so the market passes its own address here — it's the
// only account later allowed to call evaluate() below.
PolicyHandler handler = new PolicyHandler(address(this));
handler.set(InitParams({
    rootNode: "and-root",
    nodes: [
        // Leaves: no dependency on another node, so substitutedExecArgs is
        // empty. Each takes the wallet address as a runtime variable
        // instead — argsCount: 1, variableExecArgs: [0].
        NodeInitData({ id: "age-check", artifactAddress: address(ageCheck), argsCount: 1, variableExecArgs: [0], substitutedExecArgs: [] }),
        NodeInitData({ id: "citizen",   artifactAddress: address(citizen),  argsCount: 1, variableExecArgs: [0], substitutedExecArgs: [] }),

        // AND takes no runtime variables of its own — both its arguments
        // are pulled from other nodes' results, wired by id through
        // SubstitutionArgument{supplierNodeId, index}, not a `children` list.
        NodeInitData({
            id: "and-root",
            artifactAddress: address(and),
            argsCount: 2,
            variableExecArgs: [],
            substitutedExecArgs: [
                SubstitutionArgument({ supplierNodeId: "age-check", index: 0 }),
                SubstitutionArgument({ supplierNodeId: "citizen",   index: 1 })
            ]
        })
    ]
}));
```

At bet time, the market supplies the wallet address to each node that needs it, then evaluates:

```solidity
bytes[] memory walletArg = new bytes[](1);
walletArg[0] = abi.encode(wallet);

ExecVariables[] memory vars = new ExecVariables[](2);
vars[0] = ExecVariables({ nodeId: "age-check", values: walletArg });
vars[1] = ExecVariables({ nodeId: "citizen",   values: walletArg });
bool allowed = handler.evaluate(vars);
```

It returns true only if both artifacts pass. When the jurisdiction rules change next quarter, the market contract never gets touched. Only the artifact does, or a new one gets swapped into the graph.

> 📝 _Note:_ Only one root node per policy, but that's not a real limit — a compound rule like `A AND (B OR NOT C)` is still one tree, built by nesting `AND`/`OR`/`NOT` artifacts the same way `AND` combines `age-check` and `citizen` above. The actual ceiling is gas: each node is a separate call, so the reference implementation caps total nodes (`MAX_NODES_LENGTH`) well before any limit on the logic itself.

---

### The shape underneath

Strip away what ERC-8006 is actually for, and it's making one architectural move: the contract that adopts it, say a vault, stays fixed, and the artifacts wired into its Policy Handler are what's swappable. A narrow, stable interface sits between something that rarely changes and something that's meant to change often, and the thing behind the interface owns the actual decision.

I'd met this shape before ERC-8006 existed.

On Mosaic, a protocol I worked on at 33Labs, composability wasn't a one-off trick, it was the whole premise of the product. You'd describe what you wanted in plain language, and the tooling assembled it from pre-audited, reusable modules instead of writing bespoke logic from scratch, the same idea ERC-8006 applies specifically to compliance. Permission and access checks were one of those module types like any other: a narrow interface behind which you could plug in an allowlist or a role check, whatever the workflow needed, without touching the modules around it.

That's the actual pitch for ERC-8006, beyond compliance specifically. A stable interface plus a swappable module behind it means you can evolve behavior without redeploying the thing that holds state, and reuse an audited component across every contract that needs the same check. The surface you actually have to reason about at review time stays small and fixed, even as what's plugged into it keeps changing.

---

### The catch

That surface staying small doesn't mean the risk went away, it means the risk moved. The ERC-8006 authors name where it goes, directly, in the spec's own trade-offs section: overall safety depends on the quality and audit status of third-party artifacts, and policy owners are told to curate their artifact supply chain and prefer pinned, audited implementations. A narrow interface hides what's behind it from complexity, but it hides it just as well from an attacker. An attacker who swaps a legitimate artifact for a malicious one leaves nothing at the target contract's level to reveal the difference.

The spec names two smaller costs too, and both are real. Everything moving as `bytes` is what makes the interface universal, and it's also encode and decode overhead paid on every single evaluation, not just once. The acyclicity requirement, no artifact can reference itself directly or transitively, also rules out a few legitimate designs (a rule that depends on its own prior evaluation, say) along with the runaway ones it's actually meant to prevent.

There's a third cost, and I went to make sure of its sharp edge by reading the reference implementation directly. That artifact calls are external `CALL`s isn't a surprise on its own, an interface-typed call to a separately deployed contract is always going to be one, and the spec's own trade-offs section already gestures at this in general terms: "practical policy size is bounded by gas budgets." What that sentence doesn't say, and what I went to confirm in `DAGWithPolicyMetadata.sol`, is whether a shared node gets evaluated once or once per reference. It's the latter. `fillSubstitutedArguments` recursively calls `evaluateRecursively` for every `SubstitutionArgument` it finds, with no memoization. Reference the same check from two different branches, something the pattern actively invites you to do, and that check runs twice: two external calls, two gas bills, not one cached result reused across both.

Is that a gap the spec should have called out by name? Some, "reuse" is the standard's actual headline pitch, and the reference implementation is what most people building against ERC-8006 will read first. But it's not quite the smoking gun it sounds like. The standard is still Draft status, and it explicitly leaves traversal and caching strategy "at the discretion of the handler developer," so a different Policy Handler could memoize within a single evaluation without breaking the standard at all. What's here is a property of this one reference implementation, not something ERC-8006 itself mandates or forbids. Still worth knowing before you copy the reference code as-is, just not evidence the standard missed something structural.

None of that makes the design wrong. It's the same trade-off I already reached for with pre-audited modules on Mosaic: you don't eliminate risk by composing from smaller pieces, you relocate it to the boundary between pieces, and bet that a narrow, well-audited boundary is easier to reason about than one giant bespoke contract. My own experience says that bet is usually right. It's still a bet, though, and ERC-8006 makes you place it explicitly instead of hiding it inside a monolith you never had to think of as a supply chain.

---

ERC-8006 didn't need a new architectural idea. It needed the one already proven in AMMs and account abstraction, applied to compliance: hardcode the parts that don't change, and put a narrow door in front of the part that does. That's usually how the good patterns spread, not from a whitepaper, but from enough people hitting the same wall in different rooms and reaching for the same door.

---

If you're building a dapp and care about this challenge, let's talk.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
