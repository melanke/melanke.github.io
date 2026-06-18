---
linkedin-post: "Reentrancy isn’t just a thing of the past — it’s still one of the most dangerous bugs in smart contracts today.\nIn this article, I explain how it works, how to prevent it, and why design still matters.\n\U0001F447 If you write Solidity, this is for you:\nhashtag#Solidity hashtag#SmartContractSecurity hashtag#Ethereum hashtag#Web3Dev hashtag#Reentrancy hashtag#EVM hashtag#DeFi hashtag#BlockchainDevelopment"
linkedin-url: >-
  https://www.linkedin.com/pulse/reentrancy-art-defensive-programming-smart-contracts-gil-lopes-bueno-zlz7f
summary: >-
  Why reentrancy still matters years after the DAO hack — and how
  Checks-Effects-Interactions, ReentrancyGuard, and pull-over-push design work
  together as defense in depth. Real-world rules for keeping state integrity
  under EVM's synchronous calls.
og-image: >-
  /blog-images/reentrancy-and-the-art-of-defensive-programming-in-smart-contracts.png
published-at: '2025-07-22T15:52:08.000+00:00'
---
If you've been around smart contract development for a while, you've probably come across the term _Reentrancy_. It's one of those classic vulnerabilities — like buffer overflows in C or SQL injections in web apps — that has shaped entire paradigms of how we think about security.

And yet, reentrancy is not just an "old" problem from the DAO days. It's a living concern, deeply rooted in how smart contracts operate on the EVM. In fact, it’s one of the rare bugs that can take down even the most elegant codebases if developers neglect a single fundamental principle: **state integrity**.

---

### A Quick Recap: What Is Reentrancy?

In simple terms, reentrancy happens when an external call (to another contract or wallet) ends up calling back into the original contract before the first execution finishes. If your contract hasn’t updated its internal state before that external call, the reentrant call might exploit that stale state to drain funds or bypass restrictions.

This is exactly what happened in the [DAO hack of 2016](https://blog.ethereum.org/2016/06/17/critical-update-re-dao-vulnerability/) — over $60 million worth of ETH was drained due to a reentrancy vulnerability. It didn’t just cost money. It split the Ethereum ecosystem in two.

---

### Understanding the Flow: Why It Happens

The EVM is _synchronous_. When you call another contract, its code executes immediately and can do anything — including calling you back. That's powerful, but dangerous. In traditional backend engineering, this would be like sending an HTTP request to a third-party service, and that service being able to call one of your internal endpoints and mess with your state mid-request.

The difference is: in Solidity, _that’s not a bug, that’s a feature_. Which is why developers have to account for it explicitly.

---

### Checks-Effects-Interactions: The Golden Rule

To prevent reentrancy, developers follow a simple but critical pattern:

1. **Checks**: Validate all preconditions (e.g. require statements).
    
2. **Effects**: Update your internal contract state.
    
3. **Interactions**: Finally, perform any external calls (e.g. call, transfer, send).
    

By reordering your logic this way, you ensure that any external party interacting with you cannot exploit outdated internal state.

Here’s a trivial example:

```
function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount, "Not enough balance");
    balances[msg.sender] -= amount; // Effects
    (bool success, ) = msg.sender.call{value: amount}(""); // Interaction
    require(success, "Transfer failed");
}
```

If you were to place the external call **before** updating the balance, a malicious contract could call withdraw() again in the callback and drain the account multiple times before the state is ever updated.

---

### Why Reentrancy Keeps Happening

The pattern above is easy to explain but easy to forget. When you're writing complex smart contracts — say, for DeFi protocols, DAOs, or games — it's not always obvious where you're making external calls. Even calling an ERC721 transferFrom() can trigger arbitrary logic if the recipient is a contract with onERC721Received.

Reentrancy isn't always obvious. It lurks in the interfaces.

It’s not just about ether transfers anymore — _it’s about trusting too much in external code_.

---

### Enter ReentrancyGuard

To make things safer, OpenZeppelin introduced ReentrancyGuard. It’s a simple modifier (`nonReentrant`) that uses a mutex pattern to ensure that no function marked with it can be re-entered during its execution.

```
function withdraw(uint256 amount) public nonReentrant {
    // Same logic as before
}
```

Behind the scenes, it sets a status flag before entering the function and resets it when the function exits. If a reentrant call is attempted, it fails early.

> 📝 _Note: It adds a small gas overhead — typically a few hundred gas per call — due to extra storage reads and writes. In most cases, the trade-off is well worth it._

It’s not magic. It’s not a replacement for sound logic. But it’s a seatbelt — and every production contract should wear one unless you have a very good reason not to.

---

### Defense in Depth: Best Practices

Relying solely on ReentrancyGuard is like putting a firewall around an app with SQL injection — it helps, but the real fix is in _design_. Use:

- **Pull over push**: Let users withdraw funds instead of automatically sending them.
    
- **Minimal external calls**: Isolate and control where interactions happen.
    
- **Custom reentrancy flags**: For multi-function flows with complex state dependencies.
    
- **Audits and fuzzing**: Most reentrancy attacks are discovered only under edge conditions. Use tools like Echidna, Foundry, or Slither to hunt them down.
    

---

### Final Thought

Reentrancy taught the Ethereum community one of its first and hardest lessons. And we’re still learning. As developers, we need to keep these scars visible — not just for nostalgia, but because they shape the architecture of every secure contract we write today.

---

_Written by Gil, a fullstack developer with 15+ years of experience, passionate about practical architecture, clean UX, and blockchain-powered applications._
