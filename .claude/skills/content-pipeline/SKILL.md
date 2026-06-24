---
name: content-pipeline
description: >
  Full publishing pipeline for Gil's blog and social media presence. Handles the complete journey from idea to published post: ideation (content matrix), drafting, hook refinement, LinkedIn and Twitter social content, per-community Reddit posts (community-tailored flair/title/body), OG image prompt, pre-publish scoring, and blog publishing with correct frontmatter. Also handles cross-linking to existing published articles.
  Trigger on: "escrever artigo", "novo post", "publicar", "draft", "hook", "social post", "twitter", "reddit", "conteúdo", "content matrix", "pipeline", "write post", "new article", "publish", "ideias de conteúdo".
---

# Content Pipeline

## CRITICAL: Auto-start on load

Jump directly to **Phase Detection** below. Do not summarize this skill. Do not explain what you're about to do. Detect the phase and begin immediately.

---

## Step 0: Read context files

Before anything else, read these files. They are the live source of truth — updated when the website is updated:

1. `.claude/skills/_shared/professional-background.md` — the index of where Gil's experience lives. Follow it to the portfolio source files and read them: `components/Timeline.tsx` is the **primary anchor source for every article** (employer, active and past projects, dates, tech), plus `components/Achievements.tsx` for scale numbers and `app/page.tsx` for skills/contacts.
2. `content/INDEX.md` — index of topics and lessons
3. `.claude/skills/_shared/author-voice.md` — Gil's base writing voice & mannerisms (always active; the Author Voice & Style section below only adds blog-specific rules on top)

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
| Frontmatter has `linkedin-post` but no `reddit-posts` | Phase 4: Reddit Communities |
| Frontmatter has `reddit-posts` but no `og-image-prompt` | Phase 5: OG Image Prompt |
| Frontmatter has `og-image-prompt` but no `status: ready` | Phase 6: Score |
| Frontmatter has `status: ready` | Phase 7: Publish |
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

> **Design rationale (from a real underperforming post):** a link-only single tweet with the blog URL *and* the install command in the primary tweet, an abstract hook, and no question got ~17 views and zero engagement. X suppresses reach on posts that carry an outbound link in the opener, and stops distributing posts that get no early replies. The rules below target exactly those two failures.

**Rules for both options:**
- **No link (or command that reads like one) in the primary tweet.** Outbound links cut X distribution hard. The blog URL + `/plugin marketplace add …` go in a **reply** (Option A) or the **last tweet** (Option B) — never the opener.
- **Hook = a tension the reader actually feels** in the first line — a relatable problem or a curiosity gap, not an abstract statement. Still tease (never reveal the article's conclusion), but make the reader feel the itch.
- **End with a genuine, specific question** that invites replies, in Gil's voice — curious, peer-to-peer, naming the concrete dimensions it's really asking about (e.g. "how much do you constrain the model before line 1 — prompts, specs, kill criteria?") rather than a vague "what do you think?". Never hype ("test it and tell me 🚀"). Early replies are what keep the algorithm distributing.
- **Prefer concrete numbers where they're real** — "six spec phases", "before line 1 of Solidity". They sharpen a technical claim and read as specific, not salesy.
- **Every tweet — each `---` segment — must be ≤280 characters. Count each before saving; if one is over, split it.** The classic failure is cramming the honest limitation + the question + the link into one closing tweet (a 600-char "tweet"). One idea per segment.
- **Generate a single-image prompt** for the thread and store it as `twitter-image-prompt` (see *Twitter image prompt* below). Text-only threads underperform on X. Keep it in its own frontmatter field — never paste the prompt into the `twitter-post` value.
- **Hashtags: default none.** At most one genuinely relevant tag, only if it reads naturally. Do not spray hashtags — it looks like marketing and X de-prioritizes it.

**Option A — Single tweet + link reply** (best for Type C/D shorter pieces):
- Tweet 1 (≤280 chars): felt-tension hook + the core idea + the question. No link.
- Reply: blog URL + install command.

**Option B — Thread** (default for Type A/B technical deep-dives — higher reach, fits dense content):
- Tweet 1: felt-tension hook (≤40 chars/line if 2-line) + 🧵. No link.
- Tweets 2–6: one concrete point per tweet, ≤280 chars each, a brief example from a real `Timeline.tsx` project. Optionally include one *why-now* beat — the scale/urgency of the problem (e.g. as agents ship code faster, the upstream gap bites harder) — kept matter-of-fact, not alarmist.
- Closing content tweet: the genuine question (≤280 chars), **no link**.
- Link tweet (a separate trailing `---` segment): blog URL (https://gil.solutions/blog/{slug}) + install command **only** — nothing else, so the link stays isolated and every segment stays ≤280.

Lean toward Option B for dense/technical articles; offer A for lighter pieces. Save the user's choice in `twitter-post`, tweets/reply separated by `---` (so the link tweet is always a distinct segment). Then surface the **operational reminder**: generate the image from `twitter-image-prompt` and attach it, and reply to / engage with others in the first 30–60 min after posting.

### Twitter image prompt (`twitter-image-prompt`)

After the thread, generate **one** image prompt — a single image, **not** a carousel — that the user pastes into an image model. Requirements:

- **16:9 and fully self-contained** (pasteable with no extra context).
- **Visualizes the thread's hook** — the specific contrast the opener sets up (what the reader's tooling *does* catch vs. what it *misses*), not a generic article illustration.
- **Deliberately different from the OG image** (`og-image-prompt`), so the thread doesn't reuse the blog thumbnail in-feed.
- **On-brand:** dark near-black / deep-navy background, electric-blue + purple + emerald accents, clean minimal vector, technical and precise — no stock-photo people, no cyberpunk/meme styling. A *short* bold text overlay of the core contrast (≤6 words) is allowed for feed-stopping power; keep it on-brand.
- Specify palette, the central contrast visual, and composition.

Store as `twitter-image-prompt` in frontmatter.

---

## Phase 4 — Reddit Communities

**Detected by:** has `linkedin-post`, no `reddit-posts` in frontmatter

**Goal:** For each Reddit community the article genuinely fits, produce a post shaped to *that* community's winning pattern — its own flair, title, and body. One size does **not** fit all subs; the whole point is to flex sub-to-sub.

**Read first:** `.claude/skills/_shared/reddit-communities.md` — the living pattern reference (universal principles, the fit-gate, the research procedure, the pillar→subreddit map, and seeded per-community entries). Professional background is already loaded from Step 0.

### Procedure

1. **Identify the hero asset.** What is the article actually offering a dev audience? Usually one of: an OSS repo/tool Gil built, a reusable concept/pattern, a hands-on walkthrough, or an opinion/experience. The hero asset drives flair and title choice. The blog article is almost always a *secondary* "full breakdown" link, not the hero.

2. **List candidate subreddits.** Map the article's content pillar(s) → candidate subs using the pillar map in the reference file, plus judgment about where this specific topic lives. Aim for 1–4 candidates, not a shotgun.

3. **Get each candidate's pattern.**
   - If the sub has a **fresh entry** (`Last reviewed` within ~6 months) in the reference file → use it.
   - If **missing or stale** → research it live using the reference file's "How to research a community" procedure (WebFetch/WebSearch on the sub's top/hot posts), then **append/update its entry** in `reddit-communities.md` with today's date. This is how the reference grows.
   - If a sub is missing/stale **and live research isn't available this run** (no web tools, or the user scoped the run to specific subs) → do **not** write a blind post for it. Fit-gate it on topic alone and mark it **`research deferred`** in your summary. Only ever write a post for a sub backed by a real entry.

4. **Apply the fit-gate** (defined in the reference file) to each candidate. Drop any sub where the post would read as spam or require a dishonest flair. Record *why* a sub was dropped (or deferred) — dropping is a good outcome.

5. **For each surviving sub, write a tailored post** following *that sub's* entry:
   - **flair** — pick from the sub's actual flair list; one line of rationale.
   - **title** — follow the sub's winning title archetype (e.g. r/ethdev = problem/curiosity first, project name never). One idea, single clause. Lead with the concrete gap *and* name plainly what the thing is. **Then count the characters before shipping (mirror the Phase 2 hook discipline): target ≤65, hard ceiling 70. If it's over the ceiling, cut words until it fits — do not ship a title over 70 chars.** Two more hard checks: (a) **no `+`, `&`, or "and" joining two features** to cram more in — that reads as a feature list, not a hook; pick the single sharpest angle. (b) **no second sentence and no mid-title period** — if you need one, the angle isn't sharp enough yet, tighten it. The top posts in these subs are uniformly tight titles (the r/ethdev examples are 46/63/64 chars); match that.
   - **body** — follow the sub's winning body skeleton. Anchor every role/project/metric claim in Gil's real experience from `components/Timeline.tsx` specifically — never invent. Hero asset first, blog as a depth link (match the article's own URL domain), honest limitations, open question at the end. No marketing hashtags/emoji/hype.
   - **notes** — operational reminders for Gil *about this surviving sub only* (best posting window, "reply to all comments in the first 2–3 hours", cross-post caveats). Reasons for dropped/deferred subs belong in the user-facing summary (step 7), not in any sub's `notes`.

6. **If no sub passes the fit-gate:** write `reddit-posts: []` to the frontmatter with a YAML comment noting no strong fit and why, and tell the user. Don't force a bad post.

### Write to frontmatter

Add a `reddit-posts` YAML list to the draft, one entry per surviving sub:

The block below shows the **shape and field order only** — every angle bracket is a slot
you fill from *this* article and *this* sub's entry. Do **not** reuse any wording from it;
it is intentionally contentless so it can't bias the post you write.

```yaml
reddit-posts:
  - subreddit: <r/sub — only a sub backed by a real entry>
    flair: <flair from that sub's actual flair list>
    title: >-
      <title built from the sub's winning archetype; lead with the gap, hook in first ~75 chars>
    body: |-
      <Personal context — a real role/project from Timeline.tsx, never invented>

      <The concrete problem this audience actually feels>

      <What was built — short bullets>
      - <point>
      - <point>

      <Hero asset link first (repo), then blog as "full breakdown" — match the article's URL domain>

      <Honest limitation — what's early/untested>

      <Open question that invites this sub's expertise>
    notes: >-
      <operational reminders for THIS sub only: posting window, reply in first 2–3h, cross-post caveats>
```

7. **Summarize for the user:** which subs were chosen, which were dropped or `research deferred` (and why), and the flair/title for each chosen sub. Then offer Phase 5.

---

## Phase 5 — OG Image Prompt

**Detected by:** has `reddit-posts`, no `og-image-prompt` in frontmatter

Generate a prompt for DALL-E or Gemini. The prompt must:

- **Always include "16:9 aspect ratio"** — this is required
- Visual style consistent with the existing blog (dark background, near-black, technical aesthetic, minimal, slightly abstract, no stock-photo people or generic tech imagery)
- The central visual element should represent the article's core concept — not its title literally, but the underlying idea (e.g., an accounting invariant article → state diagram with a diverging path; a reentrancy article → circular loop with a cut)
- Specify: color palette (base + accent), mood (technical, serious, precise), key visual elements, composition

The prompt must be fully self-contained — paste it directly into DALL-E or Gemini with no extra context needed.

Add as `og-image-prompt` to the draft's frontmatter.

---

## Phase 6 — Score

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
| **Publish readiness** | CTA present and warm? Italicized bio line correct? `linkedin-post` filled? `twitter-post` filled? `twitter-image-prompt` present? `reddit-posts` resolved (a tailored list, or an explicit empty list with a no-fit note)? Opening has no placeholder? Score 5–6 if any of these fields are missing. |

For each dimension scored < 7: provide specific rewrite guidance and offer to apply it.
When **all dimensions ≥ 7**: add `status: ready` to the draft's frontmatter. Confirm to user.

---

## Phase 7 — Publish

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
twitter-image-prompt: "{from Phase 3 — single-image prompt for the thread, distinct from og-image-prompt}"
reddit-posts:
  {from Phase 4 — the full YAML list; omit the key entirely only if it was empty with no fit}
og-image-prompt: "{from Phase 5}"
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

> **Base voice & mannerisms live in `.claude/skills/_shared/author-voice.md` — read that file first; it is always active.**
> The sections below are the **blog-article-specific** additions on top of that shared base (opening patterns tied to article types, the mandatory closing stack with CTA + bio). When anything here conflicts with the shared base, these blog rules win for articles.
>
> In this skill, "anchored to a real project" means anchored to a project from `components/Timeline.tsx` specifically.

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

1. Synthesis paragraph — restates the core takeaway in genuinely fresh words, ideally with a concrete metaphor. This is a deliberate close, not the mechanical "bow-tie recap" flagged in `.claude/skills/_shared/author-voice.md` — don't just list back what the article said.
2. `---`
3. CTA paragraph — one of:
   - "If you're building a product or just interested in improving your process, feel free to connect or message me. I'm always open to exchanging ideas and learning from other builders."
   - "Have you used it in production? Let's connect and exchange ideas."
   - "If you're building a dapp and care about this challenge, let's talk."
4. `---`
5. Bio line (italicized) — choose by article type:
   - General/process: `_Written by Gil, a fullstack developer with 15+ years of experience, passionate about practical architecture, clean UX, and blockchain-powered applications._`
   - Technical/blockchain: `_Written by Gil, a fullstack developer with over 15 years of experience and a strong focus on practical software architecture and blockchain technology._`

### Blog-specific formatting & rules

These sit on top of the shared formatting conventions in `.claude/skills/_shared/author-voice.md`:

- `---` horizontal rule between **every** major section.
- `> 📝 _Note:_` style for side facts.
- **Anchor** every "real project" claim to a project from `components/Timeline.tsx` — never invent details not in it.
- **Vocabulary bank:** use 2–4 of the shared vocabulary terms per article — at moments that match Gil's natural rhythm, not as decoration.
- **Cross-links:** link to published articles only where the reader genuinely benefits from following the link. One forced link is worse than no link — never force a cross-link that feels like promotion rather than navigation.
- **Emoji:** series how-tos (Type A) may use emoji section icons; opinion (C) and technical (B/D) pieces should not. Don't over-emoji.
- **Close** every article with the mandatory closing stack above (synthesis → CTA → italic bio).

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
