---
name: ai-radar
description: >
  Surfaces genuinely fresh generative-AI *integration* topics — what's hot *right now* at
  the source (OpenAI/Gemini/Cursor dev forums, the MCP spec repo, agent-framework and
  coding-agent releases, HF Daily Papers, HN front page) — before the topic is chewed over
  by AI-media aggregators. Scope: agents, MCP, frameworks, and applied research devs can
  use; NOT the model-provider horse race. Ranks the hottest/newest topics by measured buzz
  and proposes content angles only Gil could write, bridging into /content-pipeline.
  Tier-1 / freshness-based: it catches new movement, it does not re-report finished stories.
  Trigger on: "ai radar", "ai news", "novidades ia", "o que tá quente em ia", "what's hot
  in ai", "ai dev news", "mcp news", "agent frameworks news", "notícias de ia",
  "o que escrever sobre ia", "what should I write about ai".
---

# AI Radar

## CRITICAL: Auto-start on load

Jump straight to **Step 0**, then run the pipeline. Do not summarize this skill or explain
what you're about to do — start gathering. Output language **mirrors the conversation's
language**; keep technical terms, spec/protocol names, and thread titles in English.

---

## Step 0 — Read the source catalog

Read `.claude/skills/_shared/ai-dev-news-sources.md` — it is the live source of truth for
**scope** (what counts as in-scope: agents/MCP/frameworks/applied research — and what is
deliberately OUT), **which** sources to hit, **how** to hit them (exact endpoints), the
**buzz formula**, and the **recency window**. Honor any updates in its "Source health log".

For the content-hook step later, you'll also need Gil's anchors — but **don't read them yet**
(only if the user wants hooks): `.claude/skills/_shared/professional-background.md` (→ portfolio
source) and `.claude/skills/_shared/author-voice.md`.

Establish the recency window from the catalog (default: 48h activity / 7d created). Note
today's date for all "age" math.

---

## Step 1 — Pull the sources (run in parallel)

Fire all source calls together; don't serialize. Prefer `curl -s '<url>' | jq` everywhere
(GitHub included — the catalog notes `gh` auth is broken; mind the 60 req/hr unauth limit,
the standard sweep costs ~16 calls). Fall back to `WebFetch` if a curl call is blocked.

**A. Discourse forums** — for each of community.openai.com, discuss.ai.google.dev, and
forum.cursor.com, pull `latest.json?order=activity` and `top.json?period=daily`/`weekly`.
Extract per thread: `title, slug, id, reply_count, views, like_count, created_at,
last_posted_at, tags`. Drop `pinned` threads and out-of-scope noise (billing, account
issues, plain support). Build URL `https://<site>/t/{slug}/{id}`.

**B. GitHub** — MCP spec repo open PRs + issues (sort updated desc) — treat like the EIP
pipeline; plus latest releases of the framework and coding-agent repos listed in the
catalog, kept only if `published_at` is within window **and** the notes carry a real
capability/breaking change (routine patch releases are not stories).

**C. HF Daily Papers** — pull today + the last 2–3 days. Apply the catalog's scope filter
(applicable-to-integrators only). Buzz = upvotes, velocity-adjusted.

**D. Hacker News (Algolia)** — front page now + `search_by_date` with points filter on a
few scoped queries (see catalog; adjust queries to the week's themes).

> If a source 404s, redirects, or rate-limits: note it, continue with the rest, and **update
> the catalog's Source health log** with today's date so the next run is smarter.

---

## Step 2 — Score, dedup, and rank

1. **Scope-check first.** Discard out-of-scope items (model drops, provider changelog
   chatter, billing noise) *before* scoring — a high-buzz off-scope story is still off-scope.
2. **Qualify** each item by recency: keep only NEW (created within window) or SURGING (older
   but active within the activity window). Discard stale items.
3. **Score** Discourse threads with the catalog's buzz formula (velocity-weighted, not raw
   totals). Papers by velocity-adjusted upvotes. GitHub items by recent comment/release
   activity. HN by points + comment velocity.
4. **Cluster the same story across sources.** A hot topic often appears as an MCP spec PR +
   a forum thread + an HN story + a framework release note. Merge those into **one topic**
   — cross-source presence is itself a strong signal (flag it as "multi-source").
5. Keep the **top ~7 topics** (adjust to what the user asked). Tag each `NEW` or `SURGING`.

---

## Step 3 — Report the ranking

Output a ranked list. For each topic:

- **Title** (plain-language, 1 line) + tags: `NEW`/`SURGING`, `multi-source` if applicable.
- **What it is** — 2–3 sentences a working dev can follow: what's being proposed/shipped/
  debated and why it matters for people integrating genAI.
- **Why it's hot now** — the concrete signal (e.g. "41 replies in 24h on the OpenAI forum",
  "MCP spec PR opened yesterday, 18 comments", "312 points on HN today", "top HF paper of
  the day, 190 upvotes").
- **Sources** — direct links (forum thread, PR/issue, release, paper page, HN discussion).

Order by buzz. Be honest when a week is quiet — a thin list of real signals beats padding.

---

## Step 4 — Content hooks (the bridge to /content-pipeline)

This is the payoff: turn the hottest topics into angles **only Gil could write**.

First read the anchors deferred in Step 0: `professional-background.md` → the portfolio
source files it points to (`components/Timeline.tsx` etc.), and `author-voice.md`.

For the **top 3–4 topics**, propose **2–3 hooks each**:

- Each hook must connect the hot topic to Gil's *real* experience (backend architecture,
  AI-assisted development workflows, American Spend, 33Labs, Mosaic, Neon Wallet, iTrack,
  wallet/multi-chain infra, tech leadership). Generic "here's what X does" explainers are
  **not** acceptable — anyone can write those. The angle must be one his background
  uniquely earns.
- Phrase each hook as a headline + one line on the experience it's anchored in.
- Never invent Gil's facts; anchor only in what the portfolio source actually says. If a hot
  topic has no honest connection to his experience, say so — don't force it.

End by offering to hand a chosen hook to **`/content-pipeline`** (Phase 1: Draft), optionally
saving it as a seed in `content/topics/` first.

---

## Notes

- **Freshness over completeness.** Missing a story is fine; reporting a stale one is the failure.
- **Scope over buzz.** The radar is about the integration layer; a viral model launch is
  someone else's story unless it ignites an in-scope debate.
- **No reverse media-filter.** Don't check whether outlets already covered it — not the goal.
- **Keep the catalog alive.** Dead endpoints, moved repos, or a consistently-useless source →
  update `.claude/skills/_shared/ai-dev-news-sources.md`.
