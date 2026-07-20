---
published-at: '2026-07-11T19:34:08.000+00:00'
summary: >-
  MCP officially deprecates Sampling on July 28 — the feature that let a third-party app borrow a user's own AI subscription instead of paying for inference itself. A look at which clients ever actually implemented it (Claude Desktop and Claude Code never did), why the "low adoption" rationale is circular, and the one pattern for free AI in your app that survives the change.
og-image: /blog-images/anthropic-killed-the-cheapest-way-to-add-ai-to-your-app.png
linkedin-post: |-
  🤔 Anthropic killed MCP's most generous feature, citing low adoption. The catch? Anthropic never shipped it in its own clients.

  On July 28, Sampling gets deprecated: the feature that let any app borrow the user's own AI subscription instead of making everyone pay for inference twice.

  I dug into who actually implemented it, what the deprecation reveals about where AI platforms want users to live, and the one pattern that still works after July 28.

  If you're building products that need AI but can't afford an inference bill, this one's for you.

  Read it here 👇

  hashtag#MCP hashtag#AI hashtag#GenAI hashtag#SoftwareEngineering hashtag#DevTools hashtag#Anthropic hashtag#Claude hashtag#ChatGPT hashtag#APIs hashtag#ProductStrategy
twitter-post: |-
  Anthropic killed Sampling on July 28. Official reason: low adoption.

  Its own clients — Claude Desktop, Claude Code — never shipped it in the first place.

  Let's talk about that 🧵
  ---
  Sampling was MCP's most generous idea: your app could borrow the *user's* AI. Prompt goes to their Claude/ChatGPT, user approves, completion runs on the subscription they already pay for.

  No API key. No second bill for the dev.
  ---
  It solved the double payment problem. Users already pay for AI once. Without Sampling, an app that needs intelligence has 3 options: pay for inference itself, ask users to paste an API key, or drop the feature.

  All bad.
  ---
  Here's the circular part. Adoption required clients to implement it. VS Code did (experimental). Claude Desktop never did (❌ on the official feature matrix). Claude Code never did (there's still an open feature request).

  Then "low adoption" became the cause of death.
  ---
  Mobile taught every PM the commandment: never let the user leave the app. WebViews exist so links don't take you to the browser.

  AI platforms play the same game with inference. Your app inside their AI: SDK + app store. Their AI inside your app: deprecated.
  ---
  And when devs found a side door (subscription OAuth tokens powering external tools), it got shut down this year: ToS clarified in Feb, client-identity checks in April.

  Every surviving path to the AI your users already pay for runs through a platform's front door.
  ---
  If you build tools: how are you handling the double payment problem today? Your own inference bill, BYO API key, moving inside the host as a plugin/skill?

  And would you have used Sampling if Claude Desktop had shipped it?
  ---
  Full breakdown, including the one pattern that still gets you the user's AI for free (and its catch):

  https://gil.solutions/blog/anthropic-killed-the-cheapest-way-to-add-ai-to-your-app

  #MCP #AI #DevTools
twitter-image-prompt: "16:9 aspect ratio. Dark near-black background with a deep-navy vignette, minimal technical vector style, fully self-contained. Center composition: a tall glowing doorway rendered in electric blue light, but the doorway is welded shut — three solid emerald weld-seams cross its threshold. Warm purple light (representing AI capability) glows visibly behind the sealed door, clearly present but inaccessible. In the lower-left foreground, a small simple abstract package/box icon (a third-party app, thin white outline) sits outside on the cold dark ground, unable to reach the light. Short bold sans-serif text overlay at the top, on-brand electric blue: \"BUILT. NEVER OPENED.\" (≤6 words, clean and minimal, not shouty). Composition and focal metaphor deliberately different from a companion image that uses a severed-connection-inside-a-frame motif. No stock-photo people, no cyberpunk or meme styling. Palette: deep navy/near-black base, electric blue, purple, and emerald accents."
twitter-engagement-queries:
  - query: '"MCP" "sampling" (deprecat* OR removed OR killed) within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: devs reacting to the specific Sampling deprecation in the 2026-07-28 MCP spec
    why: direct overlap — this is the article's core news hook
    angle: point out the circularity Gil found researching it — Claude Desktop and Claude Code never shipped client-side support for the feature they're now deprecating for low adoption; link the official client feature matrix as receipts
  - query: ("MCP server" OR "MCP spec") (stateless OR sessions OR "July 28") min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: broader discussion of the July 28 MCP revision (sessions/stateless changes), not sampling-specific
    why: same news event, adjacent angle — a way in even when the tweet doesn't mention Sampling by name
    angle: note that the stateless changes get the most airtime but Sampling's death is the quieter, more revealing part of the same revision — the protocol admitting its two-way vision lost
  - query: ("pay for AI" OR "AI subscription") (twice OR "another AI" OR "pay again") min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: users or devs venting about being asked to pay for AI a second time inside an app they already use
    why: overlaps the article's "double payment problem" framing directly
    angle: name the problem the way the article does and note the one honest workaround that still exists post-MCP-revision — designing tool schemas so the model does the thinking and hands back a finished argument, no API key needed
  - query: ("API key" OR "bring your own key" OR BYOK) (paste OR "ask users" OR onboarding) min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: developers debating whether to make users paste their own API key for an AI feature
    why: the practical, builder-facing version of the double payment problem
    angle: share the trade-off from the article plainly — BYOK excludes non-technical users and turns your settings screen into a security liability, which is exactly the gap Sampling was built to close and just got deprecated
  - query: (ChatGPT OR Claude) ("apps inside" OR "app store" OR "inside the chat") (agents OR developers) min_faves:20 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: devs discussing the trend of AI platforms pulling third-party apps inside the chat surface (Apps SDK, MCP Apps, skills/plugins)
    why: overlaps the article's "every AI app wants to be the browser" section and the WebView/retention parallel
    angle: draw the mobile-era WebView parallel from the article — never let the user leave was the old commandment, and the same instinct now shapes which AI protocol features get built and which quietly die
  - query: (Anthropic OR "Claude Code" OR "Claude Max") (banned OR blocked OR "third-party" OR OAuth) tool min_faves:15 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: developers discussing Anthropic's restrictions on third-party tools using Claude subscription tokens
    why: overlaps the article's closing point — the April OAuth enforcement that closed the side-door workaround, and also connects to the agent-economy themes in "AI and Blockchain in 2026 - A Developers Map"
    angle: connect the dots plainly — the side door (subscription tokens powering external tools) got shut in the same year the sanctioned door (Sampling) got deprecated; both point the same direction
  - query: '"MCP server" (build OR building OR shipped) ("no API key" OR "without paying" OR free) min_faves:10 within_time:30d -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en'
    targets: developers showcasing or asking about MCP servers designed to avoid inference costs
    why: direct audience for the article's practical payoff — the surviving pattern of intelligence-as-arguments
    angle: ask whether their tool schema is designed so the model does the thinking and hands back a finished result, and mention that's the one pattern from Sampling's design that survives the deprecation intact
reddit-posts:
  - subreddit: r/mcp
    title: >-
      Anthropic killed Sampling for low adoption it never shipped
    body: |-
      Sampling gets officially deprecated on July 28. The stated reason is "low adoption relative to implementation complexity." I went and checked who actually implemented it, and the story is more circular than the changelog admits.

      Sampling let a server borrow the *host's* model for a completion, no API key of its own, running on whatever subscription the user already had. For a server dev, that's the only way to add an AI feature without either eating an inference bill or asking users to paste a key.

      For that to work, the client had to implement the other half. So who did?

      - VS Code: yes, experimental.
      - Claude Desktop: never. Still a ❌ on the [official client feature matrix](https://github.com/modelcontextprotocol/docs/blob/main/clients.mdx).
      - Claude Code: never. There's [still an open feature request](https://github.com/anthropics/claude-code/issues/1785) for it, asking for exactly this: let servers use the Claude subscription the user already pays for.
      - Copilot outside VS Code: never went past plain tool calls.

      Server devs couldn't rely on the feature existing on the other side, so usage stayed low. Eighteen months later, that silence becomes the official cause of death.

      I don't think this needs a conspiracy theory. A human-in-the-loop approval UI is genuinely hard to build well, and a server injecting prompts into the user's model is a real prompt-injection surface. Those are honest reasons for a client team to deprioritize it. But they explain caution, not eighteen months of nothing from the protocol's own creator, in its own flagship clients, followed by a deprecation that cites the resulting silence as the reason.

      There's still one pattern that survives: design your tool schema so the model does the thinking and hands your server the finished argument (`save_summary(summary)` instead of asking the host for a completion directly). It works, but it only fires when the user starts inside the host's chat, not on your own app's terms.

      Full write-up, with the mobile-retention parallel and the April OAuth-token enforcement that closed the other workaround: https://gil.solutions/blog/anthropic-killed-the-cheapest-way-to-add-ai-to-your-app

      Curious whether other server devs here ever got Sampling working in production, and on which client, if any actually did.
    notes: >-
      No flair — the sub's strongest discussion posts on protocol critique run flairless; forcing `discussion` or `article` risks reading as self-promo tagging. Reply to every comment in the first 2–3 hours. Post body already carries the full argument so it survives even if the link goes unclicked.
og-image-prompt: "16:9 aspect ratio. Dark near-black, deep-navy background, minimal technical vector style, clean flat geometric illustration. A single scene: two parallel bridges cross a dark chasm. The upper bridge is short and direct, but its middle span is retracted like a drawbridge, leaving a clear open gap; a small emerald platform waits on the far side, dim and unreached. The lower bridge is longer and curves further across the chasm, with a simple turnstile/toll-gate structure standing partway along it — this bridge is fully intact, glowing electric blue, with a few small bright dots (abstract travelers) crossing it toward a larger, brighter platform on the far side. No text, no logos, no stock-photo people. Serious, precise, slightly abstract, plenty of negative space, calm and uncluttered. Palette: deep navy base, electric blue for the intact tolled bridge, emerald for the broken free bridge and its dim platform, faint purple ambient glow rising from the chasm."
---

On July 28, the Model Context Protocol officially deprecates Sampling, and the stated reason is "low adoption relative to implementation complexity". Fair enough, except for one detail the changelog leaves out. Adopting Sampling depended entirely on AI clients implementing it, and the company that designed the feature never shipped it in its own clients. Claude Desktop has never supported Sampling. Claude Code [still has an open feature request](https://github.com/anthropics/claude-code/issues/1785) asking for it. You can't adopt what the front door keeps locked.

Some context if you don't live inside this ecosystem. MCP is the open standard, created by Anthropic and adopted by OpenAI and Google through 2025, that lets AI applications connect to external tools. Sampling was one of its founding features, and by far the most generous one. It let any tool server borrow the *user's* AI: send a prompt back to the user's Claude or ChatGPT, let the user approve it, and run the completion on the model and subscription they already pay for. No API key changing hands, no bill for the developer.

That was the standard's answer to a problem every developer building on AI eventually hits. Call it the **double payment problem**. Your users already pay for AI somewhere. If your app needs a bit of intelligence, summarizing notes, labeling issues, you have three options, all bad. Pay for inference yourself and watch the bill scale with adoption. Ask users to paste an API key, a UX wall for normal people and a security liability for you. Or drop the feature. Sampling was the fourth option, the civilized one. It's the one that dies on July 28.

---

### "Low adoption" was a locked door

The arithmetic of the deprecation deserves a closer look. For server developers to adopt Sampling, the clients their users run had to implement it first. So who did?

VS Code shipped support, experimentally. Claude Desktop never did, across the entire life of the protocol; the [official client feature matrix](https://github.com/modelcontextprotocol/docs/blob/main/clients.mdx) marks it with a plain ❌. Claude Code never did, and the open feature request asks for it in the most practical terms imaginable, letting servers use the Claude subscription the user already pays for. Copilot on [every IDE besides VS Code](https://github.com/orgs/community/discussions/160291) never went past plain tool calls. Server developers could not rely on the feature existing on the other side, so they shipped their own keys or skipped AI features. Usage stayed low. Eighteen months of that, and "low adoption" becomes the official cause of death.

The egg was declared unviable by the hen that refused to sit on it.

---

### Every AI app wants to be the browser

I spent years building mobile apps, and back then one commandment was drilled into every product decision. Never let the user leave. It's why every social app opens links in an embedded WebView instead of handing you to your browser. The moment the user exits your surface, you've lost the session, and eventually the habit. Retention 101.

AI platforms are playing the exact same game, with inference as the currency. The chat window wants to be the home screen. Watch the direction of every recent move. ChatGPT's Apps SDK, built on top of MCP, puts entire applications *inside* the conversation. The MCP Apps extension renders third-party UI *inside* the host. Skills and plugins pull developer functionality *inside* Claude Code. Your app inside their AI is encouraged, with an SDK and a store waiting for you. Their AI inside your app was Sampling, and it's being buried.

And when developers found a side door, using the subscription's OAuth token to power external tools, Anthropic shut it down in stages this year: a [legal clarification in February](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/) stating that consumer OAuth tokens in any third-party product, including via the Agent SDK, violate the terms (the day [OpenCode dropped Claude subscriptions](https://www.zbuild.io/resources/news/opencode-blocked-anthropic-2026)), then technical enforcement in April, with client-identity checks so that only the official binary passes.

One direction is an ecosystem. The other direction is churn.

---

### The honest counterargument

I don't think this requires a conspiracy. A human-in-the-loop approval UI, the spec called for one, is hard to build well. A tool server injecting prompts into the user's model is a real prompt-injection surface. And flat-rate subscriptions subsidizing unlimited third-party inference is an abuse-economics nightmare, which is the defensible half of the April ban. Any client team could look at that pile of work and risk and deprioritize it honestly.

But those reasons justify caution. They don't explain eighteen months of nothing from the protocol's own creator, followed by a deprecation that cites the resulting silence as its cause. And intent doesn't really change the outcome. Whether by strategy or by neglect, every surviving path to the AI your users already pay for now runs through a platform's front door.

---

### What survives, and its shape

There is still one honest way to get the user's AI working for your app without paying for inference. Design your MCP tools so the intelligence arrives as arguments. Expose `save_summary(summary)` with a well-written description, and when the user asks Claude to summarize their week and save it, the model does the thinking on the user's subscription and hands your server the finished product. Your app pays nothing. I expect this pattern to quietly power a lot of small tools.

But notice its shape. The user has to start inside Claude. Your app cannot initiate anything; it can only receive what the model decides to send, when the user happens to be in the conversation. That's not a two-way protocol between equals anymore. That's the WebView bargain: you get to exist, in their window, on their terms.

---

Sampling was the one clause in the modern AI stack that pointed outward, that treated the model as a utility your own software could draw on, the way any app draws electricity. The deprecation makes the actual architecture official. The model is not the utility. The model is the venue, and everyone else sells popcorn inside it.

---

If you're building tools that needed exactly this, or you've found other ways around the double payment problem, I'd like to compare notes. Let's connect and exchange ideas.

---

_Written by Gil, a Principal Software Engineer with 19+ years of experience, focused on shipping AI-driven backends that hold up in production._
