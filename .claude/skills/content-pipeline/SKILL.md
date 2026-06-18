---
name: content-pipeline
description: >
  Full publishing pipeline for Gil's blog and social media presence. Handles the complete journey from idea to published post: ideation (content matrix), drafting, hook refinement, LinkedIn and Twitter social content, OG image prompt, pre-publish scoring, and blog publishing with correct frontmatter. Also handles cross-linking to existing published articles.
  Trigger on: "escrever artigo", "novo post", "publicar", "draft", "hook", "social post", "twitter", "conteúdo", "content matrix", "pipeline", "write post", "new article", "publish", "ideias de conteúdo".
---

# Content Pipeline

## CRITICAL: Auto-start on load

Jump directly to **Phase Detection** below. Do not summarize this skill. Do not explain what you're about to do. Detect the phase and begin immediately.

---

## Step 0: Read context files

Before anything else, read these files. They are the live source of truth — updated when the website is updated:

1. `components/Timeline.tsx` — current employer, active projects, all past projects with their descriptions, dates, and technologies. This is the primary anchor source for every article.
2. `components/Achievements.tsx` — scale numbers (Neon Wallet >$1B, iTrack 50M invoices, etc.)
3. `app/page.tsx` — skills by category, contact info
4. `content/INDEX.md` — index of topics and lessons

For Phase 0 only: also compare `content/INDEX.md` against actual files in `content/topics/` and `content/lessons/`. If files are present on disk but absent from the index, read those files and add them to `content/INDEX.md` before proceeding.

---

## Phase Detection

Determine entry point from context:

| Condition | Enter at |
|-----------|----------|
| No topic provided, or user says "give me ideas" | Phase 0: Ideation |
| Topic/headline provided but no draft file exists yet | Phase 1: Draft |
| Draft file exists in `content/drafts/` AND body contains `[HOOK — refinar]` | Phase 2: Hook Refinement |
| Draft body is complete (no `[HOOK — refinar]`), but no `linkedin-post` in frontmatter | Phase 3: Social Content |
| Frontmatter has `linkedin-post` but no `og-image-prompt` | Phase 4: OG Image Prompt |
| Frontmatter has `og-image-prompt` but no `status: ready` | Phase 5: Score |
| Frontmatter has `status: ready` | Phase 6: Publish |
| User explicitly names a phase | Jump to that phase |

**Edge case:** Draft file exists in `content/drafts/` with no frontmatter AND no `[HOOK — refinar]` in the body → ask the user: "Is this draft still in progress (continue from where it left off) or should I treat it as body-complete and move to hooks?"

**Migration note:** If an existing draft has `social-post:` in frontmatter instead of `linkedin-post:`, treat it as Phase 3 complete (the field exists under the old name). Rename the field to `linkedin-post:` before proceeding to Phase 4.

After completing any phase, always offer to continue to the next phase.

---

## Phase 0 — Ideation (Content Matrix)

**Goal:** Generate 40 concrete article headlines rooted in Gil's actual experience.

Read `content/INDEX.md` (update incrementally if new files exist as described in Step 0).

**Rule:** Every headline must be an angle that *only Gil* could write — anchored in his real projects (American Spend, 33Labs, Mosaic, Neon Wallet, iTrack, etc.) or derived from a real lesson he extracted from commits. Generic blockchain advice that any developer could write is not acceptable. If a cell can't be anchored to Gil's experience, skip it and generate a different one.

**Content Pillars (5):**
1. Smart Contract Architecture & Security (Solidity, audit, patterns, DeFi accounting)
2. DeFi Protocol Design (composability, capital efficiency, yield, market microstructure, CLOB, prediction markets)
3. Wallet / Multi-chain Infrastructure (onboarding, UX, abstraction, identity)
4. Full-Stack Web (React, TypeScript, Node, performance, forms, patterns)
5. Tech Leadership & Process (team management, product, requirements, AI-assisted dev, estimation)

**Formats (8):**

| Code | Format | Description |
|------|--------|-------------|
| A | Actionable | How-to, step-by-step, pattern to apply right now |
| B | Analytical | Deep dive, mechanism explained, comparison with trade-offs |
| C | Contrarian | Popular belief challenged with evidence from real experience |
| D | Observation | Pattern noticed in production code, "I've been seeing X" |
| E | X vs Y | Explicit side-by-side comparison of two approaches |
| F | Present vs Future | Where things are vs. where they're going and why |
| G | Listicle | N concrete lessons/patterns, each backed by a real example |
| H | Personal Story | What happened on a real project, what I learned |

**Format → Article Type mapping** (use this in Phase 1):

| Phase 0 Format | Phase 1 Article Type |
|----------------|---------------------|
| A (Actionable) | D (Quick tip) or B (Deep-dive) depending on depth |
| B (Analytical) | B (Deep-dive) |
| C (Contrarian) | C (Opinion) |
| D (Observation) | C (Opinion) |
| E (X vs Y) | B (Deep-dive) |
| F (Present vs Future) | C (Opinion) |
| G (Listicle) | B (Deep-dive) with list structure |
| H (Personal Story) | C (Opinion) or B (Deep-dive) depending on takeaway |

**Output:** 5×8 table (40 cells). Every cell is a **specific, concrete headline** — not a vague theme.

Good: "I shipped a CLOB in Solidity and the accounting drift nearly broke it at launch — here's what I missed"
Bad: "write about CLOB accounting"

Present as a table. Ask user to pick a cell. Carry the chosen Format into Phase 1 to pre-select the article type.

---

## Phase 1 — Draft

**Inputs:** headline (from Phase 0 or direct user input) + article type

**If coming from Phase 0:** use the Format→Article Type mapping above to pre-select the type; only ask if it's ambiguous.
**If type is still unclear:** ask the user to confirm.

**Slug:** derive from the headline — lowercase, hyphens, no accents, no special characters. Numbers stay as digits (e.g., "5 patterns" → `5-patterns`, not `five-patterns`).

**Article types:**

| Type | Description | Target words |
|------|-------------|-------------|
| A | Series chapter: walkthrough step, H2 phases + H3 substeps, emoji section icons | 1,000–2,000 |
| B | Technical deep-dive: one concept, full treatment | 800–1,600 |
| C | Opinion/strategy: flowing argument, fewer headers | 600–1,000 |
| D | Quick technical tip | 350–700 |

**Before writing:**
1. Context is already loaded from Step 0 (Timeline.tsx, Achievements.tsx, app/page.tsx)
2. Scan the **Published Articles Cache** at the end of this file — note articles with genuine thematic overlap for potential cross-links
3. If a matching topic or lesson file exists in `content/INDEX.md`, read that full file and use it as base material

**Write the full article body.** No frontmatter yet.

**Mandatory structure:**
- Opening: placeholder `[HOOK — refinar]` + 2–3 short paragraphs around it that will be adjusted in Phase 2
- Body: `###` headers, `---` between major sections
- ≥1 concrete example anchored in a real project from Timeline.tsx
- Explicit trade-off paragraph ("Key trade-off:", "But:", "The catch?")
- Cross-links to published articles: only where the link adds genuine reader value — the reader should benefit from following the link, not just feel like Gil is promoting his other work. One forced link is worse than no link.
- Conclusion + CTA + italicized bio line

**Save to:** `content/drafts/{slug}.md`

---

## Phase 2 — Hook Refinement

**Detected by:** body contains `[HOOK — refinar]`

Generate **6 hook variations** for the article opening. Format: exactly 2 lines, each ≤40 characters.

**Before presenting:** count the characters in each line of text content (the display quote marks `"..."` are presentation formatting — do not count them). If either line exceeds 40 characters, trim it — shorten words, cut articles, rephrase — until it fits. Do not present a hook that exceeds the constraint.

| # | Angle | What it does |
|---|-------|--------------|
| 1 | Number-led | Opens with a specific number + implied revelation |
| 2 | Contrarian | States a common belief then signals it's wrong |
| 3 | Personal transformation | "I used to X. Now Y." — before/after |
| 4 | Authority steal | References a known case/project then adds a twist |
| 5 | Admission | Vulnerability + earned insight |
| 6 | Future shock | Time-bound prediction about where the field is going |

Present each as labeled, 2-line format:
```
1. [Number-led]
   "Line one here — ≤40 chars"
   "Line two here — ≤40 chars"
```

**If the user picks one:** integrate it into a full 2–3 paragraph opening built around that hook, then replace `[HOOK — refinar]` in the draft file.

**If the user defers ("pick the best one"):** choose the angle that most naturally matches the article type (Type C/H → personal transformation or admission; Type B → authority steal or number-led; Type D → number-led or contrarian) and explain the choice in one sentence.

---

## Phase 3 — Social Content

**Detected by:** body complete (no `[HOOK — refinar]`), no `linkedin-post` in frontmatter

Generate both LinkedIn and Twitter content, then add both to the draft's frontmatter.

### LinkedIn (`linkedin-post`)

Rules:
- 70–150 words total
- Opening hook: ≤20 words with 1 emoji (🚀 💡 🤔 ✅ 🧠)
- 1–2 lines describing what the article *covers* — tease the question, **never** the answer or conclusions
- Optional audience call-out ("If you're building a DeFi protocol…")
- CTA line with 👇
- Blank line before hashtags
- Hashtags: **`hashtag#Word` format is mandatory** — NOT `#Word`. LinkedIn renders `hashtag#` as a clickable hashtag when copy-pasted. Use 6–12 tags, mix broad (`hashtag#SoftwareEngineering`) with specific (`hashtag#Solidity`, `hashtag#DeFi`).

Do not: enumerate article sections, reveal conclusions, use marketing language ("game-changing", "revolutionary").

### Twitter/X (`twitter-post`)

Generate both options, ask user to choose:

**Option A — Single tweet (≤280 characters total):**
- Same hook angle as Phase 2 choice
- No hashtags in the tweet
- Implicit pull toward the article, not "click here"

**Option B — Thread (5–8 tweets):**
- Tweet 1: 2-line hook (≤40 chars/line) + 🧵
- Tweets 2–6: one concrete point per tweet, ≤280 characters each, brief example from real project
- Final tweet: CTA + blog URL (https://melanke.github.io/blog/{slug})

Save the user's choice in `twitter-post`. If the user picks Option B, save the full thread with tweets separated by `---`.

---

## Phase 4 — OG Image Prompt

**Detected by:** has `linkedin-post`, no `og-image-prompt` in frontmatter

Generate a prompt for DALL-E or Gemini. The prompt must:

- **Always include "16:9 aspect ratio"** — this is required
- Visual style consistent with the existing blog (dark background, near-black, technical aesthetic, minimal, slightly abstract, no stock-photo people or generic tech imagery)
- The central visual element should represent the article's core concept — not its title literally, but the underlying idea (e.g., an accounting invariant article → state diagram with a diverging path; a reentrancy article → circular loop with a cut)
- Specify: color palette (base + accent), mood (technical, serious, precise), key visual elements, composition

The prompt must be fully self-contained — paste it directly into DALL-E or Gemini with no extra context needed.

Add as `og-image-prompt` to the draft's frontmatter.

---

## Phase 5 — Score

**Detected by:** has `og-image-prompt`, no `status: ready` in frontmatter

Evaluate the draft on 5 dimensions. Score each 1–10.

### Scoring anchors

**5–6 (needs work):** The dimension has a clear gap — something is literally missing or the criterion is plainly not met.
**7–8 (good):** The criterion is met; a real reader would not notice a problem.
**9–10 (excellent):** The criterion is met in a way that elevates the piece — hard to improve without changing the core thesis.

| Dimension | Criterion |
|-----------|-----------|
| **Hook strength** | Do the first 2 sentences earn attention without throat-clearing? Does the opening follow one of the 6 angles (no "In this article…", no "In today's fast-paced world…")? Score 5–6 if the hook is generic or could belong to any developer's blog. |
| **Voice match** | Practitioner voice (not theorist)? Every claim grounded in something Gil actually built (projects from Timeline.tsx)? Score 5–6 if the article sounds like it could have been written by anyone. |
| **Value density** | ≥1 concrete example from a real project? Trade-off explicitly named (not implied)? Does the reader leave with something actionable? Score 5–6 if there are no real examples or the trade-off is vague. |
| **Structure** | Paragraphs 2–4 sentences? `---` between all major sections? Bold used only on key terms, not whole sentences? No padding/summary paragraphs? Score 5–6 if paragraphs are long walls or structure is missing. |
| **Publish readiness** | CTA present and warm? Italicized bio line correct? `linkedin-post` filled? `twitter-post` filled? Opening has no placeholder? Score 5–6 if any of these fields are missing. |

For each dimension scored < 7: provide specific rewrite guidance and offer to apply it.
When **all dimensions ≥ 7**: add `status: ready` to the draft's frontmatter. Confirm to user.

---

## Phase 6 — Publish

**Detected by:** `status: ready` present in `content/drafts/`

1. Generate complete frontmatter for the published version. **Remove `status: ready`** — it is a pipeline field, not a published post field.

```yaml
---
published-at: '{current ISO 8601 datetime, e.g. 2026-06-17T12:00:00.000+00:00}'
summary: >-
  {2-3 sentence factual description of the article — different from linkedin-post; informational, not a hook}
og-image: /blog-images/{slug}.png
linkedin-url: ''
linkedin-post: |-
  {from Phase 3}
twitter-post: |-
  {from Phase 3}
og-image-prompt: "{from Phase 4}"
---
```

2. Move file: `content/drafts/{slug}.md` → `posts/{slug}.md`

3. **Update Published Articles Cache** (the table at the bottom of this file). Add one new row matching the exact column format of the existing table: `| {slug} | {title} | {1-sentence summary} | {comma-separated tags} |`

4. Remind user:
   - Generate OG image using `og-image-prompt`, save to `public/blog-images/{slug}.png` (16:9, PNG)
   - Fill in `linkedin-url` after posting on LinkedIn
   - Run `npm run build` to verify no errors before pushing

---

## Author Voice & Style

> These rules are always active — apply throughout all phases.

### Voice markers

- **First person, practitioner.** "From my experience…", "In my work…", "In Jodobix, I needed to…", "On American Spend, we…"
- **Confident but humble.** Share opinions plainly; admit limits and past mistakes.
- **Concrete over abstract.** Every principle is anchored to a real project or decision from Timeline.tsx. Never invent project names, metrics, or quotes.
- **Honest about trade-offs.** Recommendations always name a downside ("Key trade-off:", "But:", "The catch?").
- **Generous, not preachy.** Closes warmly with an invitation, not a lecture.

Recurring phrases (rhythm cues, not catchphrases — use sparingly):
"From my experience…" / "In my work…" / "What I suggest instead…" / "Key trade-off:" / "Why? Because…"

### Opening patterns — and when to use each

| Pattern | Best for |
|---------|----------|
| Definition contrast: "In Web3, X and Y are often confused…" | Type B deep-dives on conceptual distinctions |
| Practitioner thesis: "If you've been around X for a while, you've probably…" | Type B technical, builds reader's existing awareness |
| Series anchor: "This article is part of an ongoing series…" | Type A series chapters only |
| Stage-setting question: "You know what you're building. Time to code, right? Almost—" | Type A or B, pre-action checkpoint articles |
| Story open: "A few years ago, working on [project]…" | Type C opinion or H personal story |
| Manifesto open: "The future is decentralized. It's a future where…" | Type C opinion pieces with a strong thesis |

Avoid: "In this article we will discuss…" / "In today's fast-paced world…" / AI-flavored openers.

### Closing pattern (mandatory stack, in order)

1. Synthesis paragraph — restates core takeaway in fresh words, often with a metaphor
2. `---`
3. CTA paragraph — one of:
   - "If you're building a product or just interested in improving your process, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders."
   - "Have you used it in production? Let's connect and exchange ideas."
   - "If you're building a dapp and care about this challenge, let's talk."
4. `---`
5. Bio line (italicized) — choose by article type:
   - General/process: `_Written by Gil, a fullstack developer with 15+ years of experience, passionate about practical architecture, clean UX, and blockchain-powered applications._`
   - Technical/blockchain: `_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._`

### Formatting conventions

- **Em dashes** (—) for asides and emphasis. Never hyphens in place of dashes.
- **Bold** for the key term being introduced — one bold per concept; never bold whole sentences.
- *Italics* for definitions, asides, soft emphasis.
- `inline code` for variable names, hooks, function names, file paths, CLI commands.
- Code blocks: fenced, language tag optional; 5–20 lines max; always followed by a brief explanation.
- Lists: bulleted for unordered, numbered for sequential steps.
- Tables for side-by-side comparisons.
- `> 📝 _Note:_` style for side facts.
- `---` horizontal rule between every major section.

### Argumentation arc

1. Name the problem in plain language (often by contrast)
2. Define terms with crisp 1-sentence definitions
3. Give a real example from Gil's projects (from Timeline.tsx)
4. Spell out the trade-off explicitly
5. Land on a pragmatic recommendation ("use X when…, avoid when…")
6. Tie back to the reader's situation

### Vocabulary bank

Use 2–4 of these per article at moments that match Gil's natural rhythm — not as decoration:
practical · pragmatic · real-world · hands-on · lived · iterative and incremental · trade-off · sweet spot · breathing room · minimum viable · lean · shipping · momentum · handoff · rhythm · cadence · friction · onboarding · mainstream · adoption · defensive programming · state integrity · seatbelt · "just enough process to stay focused" · "from the very first interaction" · "without forcing them to…"

### Do / Don't

**Do:**
- Open with thesis, story, or contrast — never "in this article"
- Anchor ≥1 section to a real project from Timeline.tsx
- Name the trade-off explicitly
- Use `---` between major sections
- Keep paragraphs short (2–4 sentences)
- Close with CTA + italic bio
- Cross-link to published articles only where the reader genuinely benefits from following the link

**Don't:**
- Use marketing language ("game-changing", "revolutionary", "leverage synergies")
- Write throat-clearing intros
- Make claims without grounding in real experience
- Bold whole sentences — bold the term, not the line
- End with "I hope you enjoyed this article"
- Invent project names, quotes, or biographical details not in Timeline.tsx
- Over-emoji (series how-tos can use emoji section icons; opinion and technical pieces should not)
- Force cross-links where they feel like promotion rather than navigation

---

## Published Articles Cache

<!-- auto-updated by content-pipeline on each publish -->
<!-- Used for cross-linking in new articles and by comment-writer skill -->
<!-- When adding a row: match column format exactly | slug | title | 1-sentence summary | tags | -->

| Slug | Title | Summary | Tags |
|------|-------|---------|------|
| cross-chain-vs-multi-chain-how-to-choose-the-right-approach-for-your-web3-product | Cross-chain vs Multi-chain - How to Choose the Right Approach for Your Web3 Product | Cross-chain and multi-chain lead to very different architectures; a practical guide to choosing based on your product's actual needs. | Web3, Architecture, Multi-chain, DeFi |
| discovery-and-spec-the-missing-harness-in-ai-assisted-defi-development | Discovery and Spec: The Missing Harness in AI-Assisted DeFi Development | The CI pipeline is one harness layer; structured discovery and spec workflow that constrains AI before it writes a single line of Solidity is the other. | DeFi, AI-Assisted Dev, Smart Contracts, Spec |
| from-idea-to-delivery-practical-development-rituals-for-small-digital-startups | From Idea to Delivery - Practical Development Rituals for Small Digital Startups | Scrum without the ceremony tax: which rituals actually keep small teams shipping and which ones just slow them down. | Product Process, Team Rituals, Agile |
| from-structure-to-simulation-creating-an-interactive-prototype | From Structure to Simulation - Creating an Interactive Prototype | From information architecture to wireframes to atomic-design components — the order that saves you from rebuilding. | Product Process, Prototyping, UX |
| from-vision-to-structure-writing-functional-requirements-with-method | From Vision to Structure - Writing Functional Requirements with Method | How to write functional requirements that don't rot: user stories with acceptance criteria that teams can actually build from. | Product Process, Requirements, User Stories |
| how-ai-can-enhance-your-learning-in-new-technologies-my-experience-with-solana-development | How AI Can Enhance Your Learning in New Technologies - My Experience with Solana Development | A real account of ramping up on Solana and Rust with Claude and Cursor as study partners — what worked, what didn't. | AI, Learning, Solana, Rust |
| how-small-businesses-should-approach-product-releases | How Small Businesses Should Approach Product Releases | Frequent, incremental releases beat big launches every time — a practical playbook for small teams. | Product Process, Releases, MVP |
| how-usedeferredvalue-can-improve-react-app-responsiveness | How useDeferredValue Can Improve React App Responsiveness | The lesser-known React 18 hook that improves perceived performance by marking value updates as non-urgent. | React, Frontend, Performance |
| indexing-strategies-for-scalable-dapps-a-developer-s-perspective | Indexing Strategies for Scalable dApps - A Developer's Perspective | On-chain storage is expensive; a comparison of indexing approaches (The Graph, custom indexers, hybrid) with real trade-offs. | DeFi, Blockchain, Indexing, Scalability |
| reentrancy-and-the-art-of-defensive-programming-in-smart-contracts | Reentrancy and the Art of Defensive Programming in Smart Contracts | Why reentrancy still matters years after the DAO hack — and how Checks-Effects-Interactions and ReentrancyGuard work together. | Smart Contracts, Security, Solidity, Defensive Programming |
| reusable-field-definitions-a-pattern-for-scalable-forms-in-react | Reusable Field Definitions - A Pattern for Scalable Forms in React | A pattern born from code-generated CRUD platforms: declarative field definitions that keep form logic DRY across a large app. | React, Frontend, Patterns, Forms |
| the-first-steps-in-creating-a-digital-product | The First Steps in Creating a Digital Product | Fifteen exercises to pressure-test a product idea before writing any code: unmet need, target user, and competitive landscape. | Product Process, MVP, Ideation |
| the-solidity-ci-pipeline-you-should-have-set-up-on-day-one | The Solidity CI Pipeline You Should Have Set Up on Day One | Ten CI gates built before writing the first contract — from formatter enforcement to slither, size caps, and optimizer pinning. | Solidity, CI/CD, Smart Contracts, Tooling |
| turning-feature-plans-into-a-technical-execution-strategy | Turning Feature Plans Into a Technical Execution Strategy | How to go from MVP feature list to something a team can actually start building: tasks, dependencies, and effort estimation. | Product Process, Technical Execution, Planning |
| we-can-t-scale-web3-until-we-nail-onboarding | We Can't Scale Web3 Until We Nail Onboarding | Private keys and gas tokens are still the wall keeping mainstream users out of Web3 — and what builders can actually do about it. | Web3, Onboarding, UX, Mainstream Adoption |
| when-dependency-injection-goes-too-far | When Dependency Injection Goes Too Far | DIP is a tool, not a rule. Two real projects where every class had an interface — and why that made the code worse. | Architecture, SOLID, DIP, Overengineering |
