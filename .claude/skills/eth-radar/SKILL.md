---
name: eth-radar
description: >
  Surfaces genuinely fresh Ethereum protocol & dev topics — what's hot *right now* at the
  source (ethereum-magicians.org and ethresear.ch forums, ethereum/EIPs+ERCs+pm on GitHub,
  and execution/consensus client releases) — before the topic is chewed over by mainstream
  crypto media. Ranks the hottest/newest topics by measured buzz and proposes content angles
  only Gil could write, bridging into /content-pipeline. Tier-1 / freshness-based: it catches
  new movement, it does not re-report finished stories.
  Trigger on: "eth radar", "ethereum news", "notícias ethereum", "o que tá quente no ethereum",
  "what's hot in ethereum", "tá pegando no magicians", "ethereum magicians", "ethresear",
  "novidades ethereum", "ethereum dev news", " what should I write about ethereum".
---

# Eth Radar

## CRITICAL: Auto-start on load

Jump straight to **Step 0**, then run the pipeline. Do not summarize this skill or explain
what you're about to do — start gathering. Output language **mirrors the conversation's
language**; keep technical terms, EIP names, and thread titles in English.

---

## Step 0 — Read the source catalog

Read `.claude/skills/_shared/ethereum-news-sources.md` — it is the live source of truth for
**which** sources to hit, **how** to hit them (exact endpoints), the **buzz formula**, and
the **recency window**. Honor any updates in its "Source health log".

For the content-hook step later, you'll also need Gil's anchors — but **don't read them yet**
(only if the user wants hooks): `.claude/skills/_shared/professional-background.md` (→ portfolio
source) and `.claude/skills/_shared/author-voice.md`.

Establish the recency window from the catalog (default: 72h activity / 14d created). Note
today's date for all "age" math.

---

## Step 1 — Pull the sources (run in parallel)

Fire all source calls together; don't serialize. Prefer `curl -s '<url>' | jq` for Discourse
JSON and `gh api` for GitHub. Fall back to `WebFetch` if a curl call is blocked.

**A. Discourse forums** — for each of ethereum-magicians.org and ethresear.ch, pull both
`latest.json?order=activity` and `top.json?period=daily`/`weekly`. Extract per thread:
`title, slug, id, reply_count, views, like_count, created_at, last_posted_at, tags`. Drop
`pinned` housekeeping threads. Build URL `https://<site>/t/{slug}/{id}`.

**B. GitHub** — recent open PRs on `ethereum/EIPs` and `ethereum/ERCs` (sort updated desc),
plus recent `ethereum/pm` commits/issues (AllCoreDevs agendas & notes).

**C. Client releases** — latest releases for the execution + consensus clients listed in the
catalog; keep only those `published_at` within the window. Mine release `body` for EIP
numbers / fork names.

> If a source 404s, redirects, or rate-limits: note it, continue with the rest, and **update
> the catalog's Source health log** with today's date so the next run is smarter.

---

## Step 2 — Score, dedup, and rank

1. **Qualify** each item by recency: keep only NEW (created within window) or SURGING (older
   but active within the activity window). Discard stale items.
2. **Score** Discourse threads with the catalog's buzz formula (velocity-weighted, not raw
   totals). For GitHub items, rank by recent comment/commit activity within the window.
3. **Cluster the same story across sources.** An EIP often appears as a magicians thread +
   an EIPs PR + a line in a client release + an ACD agenda item. Merge those into **one
   topic** — cross-source presence is itself a strong signal (flag it as "multi-source").
4. Keep the **top ~7 topics** (adjust to what the user asked). Tag each `NEW` or `SURGING`.

---

## Step 3 — Report the ranking

Output a ranked list. For each topic:

- **Title** (plain-language, 1 line) + tags: `NEW`/`SURGING`, `multi-source` if applicable.
- **What it is** — 2–3 sentences a non-core-dev can follow: what's being proposed/decided
  and why it matters for Ethereum devs.
- **Why it's hot now** — the concrete signal (e.g. "32 replies in 48h", "PR opened today",
  "on this week's ACDE agenda", "shipped in Geth vX").
- **Sources** — direct links (forum thread, EIP PR, release, ACD notes).

Order by buzz. Be honest when a week is quiet — a thin list of real signals beats padding.

---

## Step 4 — Content hooks (the bridge to /content-pipeline)

This is the payoff: turn the hottest topics into angles **only Gil could write**.

First read the anchors deferred in Step 0: `professional-background.md` → the portfolio
source files it points to (`components/Timeline.tsx` etc.), and `author-voice.md`.

For the **top 3–4 topics**, propose **2–3 hooks each**:

- Each hook must connect the hot topic to Gil's *real* experience (American Spend, 33Labs,
  Mosaic, Neon Wallet, iTrack, wallet/multi-chain infra, smart-contract architecture, DeFi,
  tech leadership). Generic "here's what EIP-XXXX does" explainers are **not** acceptable —
  anyone can write those. The angle must be one his background uniquely earns.
- Phrase each hook as a headline + one line on the experience it's anchored in.
- Never invent Gil's facts; anchor only in what the portfolio source actually says. If a hot
  topic has no honest connection to his experience, say so — don't force it.

End by offering to hand a chosen hook to **`/content-pipeline`** (Phase 1: Draft), optionally
saving it as a seed in `content/topics/` first.

---

## Notes

- **Freshness over completeness.** Missing a story is fine; reporting a stale one is the failure.
- **No reverse media-filter.** Don't check whether outlets already covered it — not the goal.
- **Keep the catalog alive.** Dead endpoints, moved repos, or a consistently-useless source →
  update `.claude/skills/_shared/ethereum-news-sources.md`.
