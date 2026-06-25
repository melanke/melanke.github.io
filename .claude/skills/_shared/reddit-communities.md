# Reddit Communities — Pattern Reference

> **Living knowledge base of how each subreddit actually rewards posts** — so the
> `content-pipeline` Reddit phase can shape a post to the community it's going into,
> instead of pasting the same thing everywhere.
> Companion to `professional-background.md` (the real experience a post is anchored in)
> and `author-voice.md` (how Gil writes).

## How this file works

- The Reddit phase **reads this file first**. If a candidate subreddit already has a
  **fresh entry** (reviewed within ~6 months, see `Last reviewed` in the entry), it uses it.
- If a candidate sub is **missing** or its entry is **stale**, the phase **researches it
  live** (procedure below) and **appends/updates the entry here**, with today's date in
  `Last reviewed`. Over time this file accumulates real, current pattern knowledge.
- Entries describe *what wins in that sub* — they are observations, not rules carved in
  stone. Reddit shifts with its market cycle; a stale entry is a hint, not a fact.

This file holds patterns, not Gil's facts. Never recite project names, metrics, or roles
from here — always anchor those in the live portfolio source (`professional-background.md`).

---

## Universal principles (true across dev/builder subs)

These hold in almost every technical community. Per-sub entries override them when they conflict.

1. **Self-post with a substantial body beats a bare link.** A link drop reads as promo;
   a self-post that delivers value in the post itself is what gets upvoted and discussed.
   The repo/blog becomes a "read more / full breakdown" link inside the body.
2. **Title leads with the problem, gap, or curiosity — never the project name.**
   "Introducing X" is the weakest possible opening. The winning shape is
   `[concrete problem or experience] → [what you did]`, or an honest/curious angle.
   **Keep it short and concrete: one idea, single clause.** Name plainly *what the thing is*
   right alongside the gap, inside the first ~75 chars (mobile truncates there). The top
   posts in dev subs are uniformly tight — not two sentences, not a thesis, no period
   mid-title. **Count the characters before shipping: target ≤65, hard ceiling 70 — if
   you're over, cut words until it fits.** A `+`, `&`, or "and" stapling two features
   together is the tell of a title trying to do too much: drop one, keep the sharpest hook.
   If you're writing a second sentence, the angle isn't sharp enough — cut it down.
3. **Anchor in real practitioner experience.** "While doing X at [real role], I kept
   hitting…" earns credibility. Generic advice anyone could write does not.
4. **Be honest about limitations.** "Early, feedback welcome", "probably not stable yet",
   "unprofitable" in a title — admitted weakness builds trust and curiosity.
5. **End with an open question** that invites the sub's expertise. It drives comments
   (the real engagement signal in small subs) and positions Gil as a peer, not a marketer.
6. **No marketing hashtags, no marketing emoji, no hype words** ("game-changing",
   "revolutionary", "early access"). This is LinkedIn behavior; it gets punished on Reddit.
7. **The first 2–3 hours decide the post.** Early upvotes + the author replying to every
   comment fast is what carries a post in a small sub. (This is an operational note for
   Gil, surfaced in the post's `notes`, not part of the body text.)
8. **In 2025–2026 most dev subs are quiet.** A genuinely good post lands ~8–30 upvotes and
   a handful of comments — not viral. Set expectations accordingly; a new account can still
   reach the weekly top because **format + topic + first-hours beat karma/reputation.**

---

## The fit-gate (decide BEFORE writing anything)

For each candidate sub, answer honestly: **would this post add real value to that
audience, or would it read as spam?** Drop the sub if any of these are true:

- The article/asset isn't genuinely relevant to that sub's core topic.
- The only realistic flair would misrepresent intent (e.g. tagging promo as "Information"
  or asking a "Question" you already know the answer to, just to get reach — dishonest).
- The sub's promo tolerance is low and there's no free, substantial dev value to offer.
- Posting would be a near-duplicate of another sub on the same day with the same audience
  (cross-post sparingly; prefer one strong post over several thin ones).

A dropped sub is a **good** outcome — record *why* it was dropped. Better no post than spam.

---

## How to research a community (when missing or stale)

Goal: extract the sub's *winning pattern* from its actual recent top posts, not from
assumptions. Use `WebFetch` / `WebSearch`.

1. **Pull recent top + hot posts.** Try `https://www.reddit.com/r/<sub>/top/.json?t=year&limit=50`
   and `.../hot/.json?limit=50`. If blocked/rate-limited, fall back to a `WebSearch` for
   `site:reddit.com/r/<sub> top posts <topic>` and read individual threads via `WebFetch`,
   or use old.reddit.com. Note in the entry if data was thin.
2. **List the available flairs** and infer what each one is *actually* used for from the
   posts carrying it (not just the label).
3. **Find the realistic score range** of the monthly/weekly top — calibrates expectations.
4. **Extract the winning title archetype** — read the 10–15 highest-scoring titles and
   describe their shared shape (problem-first? question? honesty hook? number-led?),
   plus length behavior (mobile truncates ~60–80 chars).
5. **Extract the winning body structure** — for self-posts that got discussion, note the
   recurring skeleton (context → problem → what you built → links → ask).
6. **Gauge promo tolerance** — what self-promotion got upvoted vs. removed/ignored.
7. **Note format preference** — self-post vs link, whether media (image/video/GIF) helps.
8. **Write/update the entry** using the schema below, set `Last reviewed: <today>`.

---

## Community entry schema

When adding or updating a sub, fill every field:

```
### r/<sub>
**Last reviewed:** YYYY-MM-DD · **Realistic top score:** <range>
**Audience / vibe:** <who's there, how promo-tolerant, market-cycle state>
**Fits these pillars:** <which of Gil's content pillars land here>
**Flairs:** <flair — when to use it> (one line each)
**Winning title archetype:** <shape + 2–3 real example titles with scores>
**Winning body structure:** <the recurring self-post skeleton>
**Promo tolerance:** works: <…> / fails: <…>
**Format & media:** <self-post vs link; does media help>
**Anti-patterns:** <what flops or gets removed>
**Notes:** <timing, cross-post advice, anything operational>
```

---

## Pillar → candidate subreddit map (seed — extend as you research)

Starting points for "where could this article go?". Always fit-gate each one.

| Content pillar | Candidate subs |
|----------------|----------------|
| Smart Contract Architecture & Security | r/ethdev, r/solidity, r/ethereum, r/CryptoTechnology |
| DeFi Protocol Design | r/ethdev, r/defi, r/ethfinance, r/CryptoTechnology |
| Wallet / Multi-chain Infrastructure | r/ethdev, r/ethereum, r/CryptoTechnology, r/web3 |
| Full-Stack Web (React/TS/Node) | r/reactjs, r/webdev, r/javascript, r/typescript, r/Frontend |
| Tech Leadership & Process | r/ExperiencedDevs, r/programming, r/cscareerquestions (rarely), r/agile |
| AI-assisted development | r/ChatGPTCoding, r/ClaudeAI, r/ExperiencedDevs, r/programming |

> ⚠️ Many of these are **unresearched**. The first time a post targets one, research it and
> write its entry. Only r/ethdev below is a seeded, reviewed entry.

---

## Seeded entries

### r/ethdev
**Last reviewed:** 2026-06-23 (seeded from a ~70-post analysis of 2024–2026 top/hot) · **Realistic top score:** ~20–35 upvotes for the monthly top; a good post lands ~8–25 upvotes, 4–15 comments. Much quieter than the bull-market era.
**Audience / vibe:** Practicing Ethereum/Solidity devs. Tolerates promo **if it carries real dev value** (free OSS, Foundry/Solidity/EVM at the center, real builder experience). Allergic to token shills and contentless link drops.
**Fits these pillars:** Smart Contract Architecture & Security, DeFi Protocol Design, Wallet/Multi-chain Infra, AI-assisted dev (when the output is Solidity/EVM tooling).
**Flairs:**
- `Question` — questions, debates, career. Drives the most *comments* (e.g. "Is it worth it?" 22 pts / 26 comments). **Don't use as a disguised promo channel — that's dishonest.**
- `Information` — ecosystem news, releases, external links (Vitalik/privacy 32 pts, Solidity release 16). **Trap for self-promo** — posting your own repo/blog here reads as editorial spam and gets ignored/removed.
- `My Project` — a tool/repo/dApp/OSS you built. The right flair for shipping your own work (CodeQL analyzers 20, faucet tool 9, Loop Decoder 5).
- `Tutorial` — step-by-step how-to (JSON-RPC in Go 10). Use only if the post is genuinely reframed as a hands-on guide (install → run → output).
- `Code assistance` — a specific bug/snippet asking for help (reentrancy in ERC-777, 5).
**Winning title archetype:** Problem/experience first, project name **never**. Honesty and curiosity hooks outperform. **The winners are short — ~45–65 chars, one idea, a single clause** (the three examples below are 63 / 46 / 64 chars; none has two sentences or a mid-title period). Keep it punchy; mobile truncates around ~75. **Hard ceiling 70 chars — count and cut if over.** No `+`/`&`/"and" stapling two features together (that reads as a feature list, not a hook — pick one). If your title needs a second sentence to make sense, the angle isn't sharp enough yet — tighten it. Examples that won:
- "Solidity Static Analyzers: Reducing False Positives with CodeQL" (20) — specific technical problem.
- "How I've built an unprofitable MEV Bot in Rust" (9) — honesty → curiosity + credibility.
- "I Created an Easy Tool to Access All Blockchain Testnet Faucets!" (9) — universal pain, casual.
Flops: "Introducing ChainSeal" (5), anything token/shill-flavored.
**Winning body structure** (self-post, the `My Project` model — Loop Decoder / Foundry Dashboard):
1. Personal context — "I kept hitting this gap while [real role]…"
2. The concrete problem.
3. What you built — bullets.
4. Links — **GitHub first, blog second** (devs click repos; blog is "read more").
5. Honest limitations — "early, feedback welcome" builds trust.
6. Open question to the sub.
7. *(optional)* 30–60s screen-recording / GIF — media historically over-performs link-only.
**Promo tolerance:** works: free OSS, Foundry/Solidity/EVM-centered, real builder experience, invitation to technical feedback. fails: token launches, "early access" with no substance, contentless link drops, marketing tone.
**Format & media:** Self-post with a real body > bare link (the one link-only top, CodeQL 20, is the exception not the rule). Demo video/GIF helps.
**Anti-patterns:** "Introducing X", project-name-first titles, `Information` flair on your own work, empty body, hashtags/marketing emoji, posting and disappearing.
**Notes:** Reply to **every** comment in the first 2–3 hours — critical in a small sub. New/low-karma accounts still reach the top; format + topic + first hours matter, not warmup. For Solidity/security-narrow pieces, a same-format cross-post to **r/solidity** can work (research that sub first) — but never two simultaneous posts in the same sub.

### r/aws
**Last reviewed:** 2026-06-25 (thin data — Reddit JSON blocked this run; entry built from secondary marketing/rules write-ups, not a direct top-post scrape. Re-research when possible.) · **Realistic top score:** unknown precisely; treat like other large technical subs (a good discussion post ~30–150 upvotes, news/announcements higher).
**Audience / vibe:** Cloud engineers, solutions architects, DevOps practitioners, many AWS-certified. **Highly technical and openly skeptical of vendor pitches** — but they reward substance: architecture case studies, cost breakdowns, real trade-off analysis. Shallow or promo-flavored posts get dismissed fast.
**Fits these pillars:** Full-Stack Web (backend/infra), Tech Leadership & Process, AI-assisted dev (when the output touches AWS services). Anything AWS-product-specific lands here naturally.
**Flairs:** (typical set) `discussion` — opinion/debate/trade-off threads, the honest choice when the post body carries the substance and asks a question. `article` — sharing a written piece (reads more promo; use only for a genuine link-share). `technical question` — a real problem you need help with. `general aws`, plus service-specific tags (`serverless`, `containers`, `database`, `security`, `storage`).
**Winning title archetype:** Problem/curiosity/trade-off first, never "Introducing X". A skeptical-but-fair angle on an AWS product fits the sub's own temperament. Keep one clause, ≤65 chars, name the AWS thing plainly. (Calibrated from the universal principles + sub temperament, not a direct scrape this run.)
**Winning body structure** (discussion post): 1) real context ("running a software house, AWS was daily"), 2) the concrete tension, 3) short bullets of what's good / what worries you, 4) blog as "wrote up my full take" depth link (match the article's domain), 5) honest limitation (it's preview; the limit may be temporary), 6) open question that invites the sub's production experience.
**Promo tolerance:** works: substantive trade-off/architecture analysis where the blog is secondary to an in-thread discussion. fails: bare blog link, marketing tone, "check out my post", anything that reads as a vendor or self pitch.
**Format & media:** Self-post with a real body and a genuine question > link drop. Architecture diagrams can help; not required for an opinion piece.
**Anti-patterns:** "Introducing", title-as-headline-with-no-tension, `article` flair on a thin promo, dropping the link and leaving, hype words.
**Notes:** Reply to every comment in the first 2–3 hours. Lead with the skeptical/trade-off framing — this sub distrusts anything that sounds like the AWS announcement itself. Entry is thin-data; re-research with a real top-post scrape before relying on score expectations.
