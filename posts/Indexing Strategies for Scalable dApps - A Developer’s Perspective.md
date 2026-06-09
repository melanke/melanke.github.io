---
social-post: "\U0001F4A1 On-chain storage is expensive. And if you don’t plan for that, your dApp might become unusable.\nIndexing is a core part of scalable dApp architecture — yet it’s often overlooked until it’s too late. In my latest article, I share a technical breakdown of indexing strategies, based on real-world challenges I faced building projects like Enclave Wallet, Jodobix, and NDapp.\n\U0001F50D When should you externalize data?\n \U0001F527 What trade-offs are involved in free vs paid indexers?\n \U0001F4C8 How do you keep your app fast and usable long-term?\n\U0001F680 Read the full article:\n\nhashtag#web3 hashtag#blockchain hashtag#dapps hashtag#indexers hashtag#decentralization hashtag#engineering hashtag#development hashtag#scalability"
linkedin-url: >-
  https://www.linkedin.com/pulse/indexing-strategies-scalable-dapps-developers-gil-lopes-bueno-6fxdf
summary: >-
  On-chain storage is expensive and most data doesn't need to live there. A
  comparison of Alchemy, The Graph, and Subsquid based on real projects (Enclave
  Wallet, Jodobix, Dora) — including when paid indexers are worth it and when
  they go against the spirit of a public-good dApp.
og-image: >-
  /blog-images/indexing-strategies-for-scalable-dapps-a-developer-s-perspective.png
published-at: '2025-06-11T14:39:43.000+00:00'
---
One of the most expensive operations when building smart contracts is storing and updating on-chain data. Every write to the contract’s storage has a direct impact on how much a user will pay in gas fees. Worse yet, transactions have a gas limit—so if you don't pay attention to how your contract handles data, you risk making your dApp unusable in the medium or long term, especially when dealing with large volumes of data.

Fortunately, not all information needs to live on-chain. If a piece of data doesn’t need to be read _from within the contract_, chances are you can externalize it. Emitting events is an excellent pattern here—they’re cheap, they don’t bloat contract storage, and they can be consumed both in real time and retrospectively. This is especially powerful when you need to query long lists of past interactions. For example, in Jodobix, I needed to show all the bets a user had placed or all bets tied to a specific game. Indexing this within the contract would be extremely costly. Instead, I emit events with detailed metadata that can be filtered off-chain later.

There are multiple indexing solutions available, each with its pros and cons. In the next sections, I’ll compare some of the most used tools and share my experience using them in real-world projects. I’ll also briefly touch on free vs. paid solutions. If you're building a business around blockchain, something that’s expected to be profitable, using a paid solution can absolutely make sense due to its reliability and ease of use. But if you're contributing to the ecosystem, building a "public good" dApp that aims to be truly unstoppable and ownerless, relying on paid services may go against the grain.

### Alchemy

Alchemy offers highly up-to-date data with zero setup. If your goal is to consume recent events or query data within a specific block range, it’s probably the easiest and best option—just create an account and plug it into your app. In fact, if you're using ScaffoldEth, Alchemy is already pre-integrated, which makes it even simpler. However, the free tier has notable limits: 500 blocks per request and rate-limited queries. This makes it problematic when you need to fetch _all_ events of a given type, regardless of when they occurred. In my research, I found other services similar to Alchemy, like Ankr and Moralis, with slightly more generous free tiers—but they all fall into the same trap of block-range limitations for historical queries.

### The Graph

The Graph uses GraphQL, which may be unfamiliar to some developers, but in my opinion it’s one of the best ways to define exactly what you want from your backend. Unlike Alchemy, it doesn’t limit you by block ranges. Its subgraph mechanism allows for impressively fast querying of all events emitted by a contract. That said, it’s not as plug-and-play as Alchemy. You’ll need to go through a multi-step setup process—but the official documentation and tooling are excellent. Deploying your subgraph to the decentralized network requires a one-time transaction fee. The free tier includes 100k queries per month, which is quite generous. For Jodobix, this was the perfect fit—it matched my use case precisely.

### Subsquid

Subsquid takes a different approach. It’s a free, open-source framework that lets you build your own indexer. You can host it yourself or use their managed hosting. This is especially useful when you need something customized, beyond what Alchemy or The Graph can offer. In my case, I’ve built custom indexers when working on wallet-related projects like Enclave Wallet and Neon Wallet, as well as on Dora, a blockchain explorer. Looking back, a custom indexer could’ve saved me time and complexity when building NDapp, a tool that displays network analytics. One thing to note: Subsquid doesn't run natively on Windows, so if that’s your environment, you’ll need to use WSL.

### Conclusion

There’s no one-size-fits-all solution—each indexing strategy has its place, depending on your project’s architecture and goals. Whether you prioritize speed, customization, decentralization, or ease of use, there’s a tool out there for you. I hope this breakdown helped clarify the landscape. Let me know your thoughts or share how you're handling indexing in your own dApps.

---

_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._
