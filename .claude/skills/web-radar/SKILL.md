---
name: web-radar
description: >
  Surfaces genuinely fresh web-development topics — JavaScript/TypeScript, Node.js, React,
  Next.js, Postgres, AWS and the web platform — straight from the source (TC39 & WHATWG
  spec repos, React RFCs, release feeds of the runtimes/frameworks/tooling, the
  pgsql-hackers mailing list, AWS launch feeds, Chrome Platform Status/Baseline, HN and
  Lobsters) before the topic is chewed over by newsletters and dev-media aggregators.
  Scope: things that change how a working dev writes code; NOT the framework popularity
  contest. Ranks the hottest/newest topics by measured buzz and proposes content angles
  only Gil could write, bridging into /content-pipeline. Tier-1 / freshness-based: it
  catches new movement, it does not re-report finished stories.
  Trigger on: "web radar", "webdev radar", "novidades javascript", "novidades js",
  "novidades typescript", "novidades node", "novidades react", "novidades next",
  "novidades postgres", "novidades aws", "o que tá quente no front", "o que tá quente em
  web", "what's hot in web dev", "js news", "typescript news", "node news", "react news",
  "frontend news", "web dev news", "o que escrever sobre javascript", "what should I
  write about web dev".
---

# Web Radar

## CRITICAL: Auto-start on load

Jump straight to **Step 0**, then run the pipeline. Do not summarize this skill or explain
what you're about to do — start gathering. Output language **mirrors the conversation's
language**; keep technical terms, proposal/spec names, release tags, and thread titles in
English.

If the user named a **focus** (e.g. "web radar react", "novidades de postgres"), narrow the
sweep to that slice plus anything cross-cutting; otherwise sweep the core set across all
areas.

---

## Step 0 — Read the source catalog

Read `.claude/skills/_shared/webdev-news-sources.md` — it is the live source of truth for
**scope** (what counts as in-scope — and what is deliberately OUT), **which** sources to
hit, **how** to hit them (exact endpoints and their quirks), the **buzz formula**, and the
**recency window**. Honor any updates in its "Source health log".

For the content-hook step later, you'll also need Gil's anchors — but **don't read them yet**
(only if the user wants hooks): `.claude/skills/_shared/professional-background.md` (→ portfolio
source) and `.claude/skills/_shared/author-voice.md`.

Establish the recency window from the catalog (default: 72h activity / 7d created). Note
today's date for all "age" math.

---

## Step 1 — Pull the sources (run in parallel)

Fire all source calls together; don't serialize. Prefer `curl -s '<url>' | jq` for JSON and
a small `python3` snippet for RSS/Atom. Fall back to `WebFetch` if a call is blocked.

**Budget rule:** GitHub REST is capped at 60 req/hr unauthenticated and shared with
everything else in the session. Sweep **releases via `releases.atom`** (quota-free — see
catalog) and spend REST calls only on the spec/RFC PR-and-issue lists (~6 calls). Check
`curl -s https://api.github.com/rate_limit | jq .rate.remaining` first if a run feels heavy.

**A. Release feeds** — the core repo set in the catalog (§A1), plus the extended set (§A2)
if the user's focus calls for it. Keep a release only if `updated` is within window **and**
the notes name a real capability, breaking change, or migration. Drop canaries, patch
bumps, and dependency-only releases.

**B. Specs & RFCs** — TC39 (`proposals` commits for **stage advancements**, `ecma262` PRs,
`notes` commits), WHATWG HTML issues, React RFCs, Interop issues. A stage advancement is
always a story; otherwise rank by comment velocity.

**C. Postgres** — the current month's `pgsql-hackers` archive (group subjects, strip `Re: `,
count messages in window) + `news.rss`. Pull the Commitfest page only if a thread looks
story-worthy.

**D. AWS** — what's-new RSS + News Blog RSS, then apply the catalog's hard scope filter.
Most items are out; expect to keep a handful at most.

**E. Browser platform** — `web-features` releases (Baseline promotions), Chrome Platform
Status for the beta/dev milestones, and the Chrome/WebKit/MDN feeds.

**F. Discussion layer** — HN front page + a few scoped `search_by_date` queries, and the
Lobsters multi-tag JSON. Use only the tags the catalog verified as valid.

> If a source 404s, redirects, or rate-limits: note it, continue with the rest, and **update
> the catalog's Source health log** with today's date so the next run is smarter.

---

## Step 2 — Score, dedup, and rank

1. **Scope-check first.** Discard out-of-scope items *before* scoring — a viral listicle,
   a funding round, or an AWS enterprise-governance launch is still off-scope no matter how
   much buzz it has. This domain is a firehose; expect to discard most of what you pulled.
2. **Apply the substance rule to releases.** No engagement metric exists for a release, so
   it qualifies only if the notes carry a named capability, breaking change, or migration
   path. "v5.4.2 — bug fixes" is never a story.
3. **Qualify** each remaining item by recency: keep only NEW (created within window) or
   SURGING (older but active within the activity window). Discard stale items.
4. **Score** HN/Lobsters/GitHub threads with the catalog's buzz formula (velocity-weighted,
   not raw totals); mailing-list threads by message density in the window; releases by
   substance + cross-source presence.
5. **Cluster the same story across sources.** A hot topic usually appears in several places
   at once: a TC39 stage move + an HN thread; a Next.js stable release + a Lobsters
   argument about it; a `pgsql-hackers` fight + a Postgres beta note; a Baseline promotion
   + an MDN post. Merge those into **one topic** — cross-source presence is itself a strong
   signal (flag it as "multi-source").
6. Keep the **top ~7 topics** (adjust to what the user asked). Tag each `NEW` or `SURGING`,
   and tag its area (`JS/TS`, `Node`, `React/Next`, `Postgres`, `AWS`, `Web platform`,
   `Tooling`) so the list is scannable.

---

## Step 3 — Report the ranking

Output a ranked list. For each topic:

- **Title** (plain-language, 1 line) + tags: `NEW`/`SURGING`, area, `multi-source` if
  applicable.
- **What it is** — 2–3 sentences a working dev can follow: what shipped/was proposed/is
  being argued, and what it changes in day-to-day code.
- **Why it's hot now** — the concrete signal (e.g. "advanced to Stage 3 at last week's TC39
  meeting", "412 points / 260 comments on HN today", "38 messages on pgsql-hackers in 48h",
  "shipped stable in Next.js 16.2 with a codemod", "reached Baseline Newly Available").
- **Sources** — direct links (proposal, PR/issue, release, message-id, HN/Lobsters thread).

Order by buzz. Be honest when a week is quiet — a thin list of real signals beats padding.

---

## Step 4 — Content hooks (the bridge to /content-pipeline)

This is the payoff: turn the hottest topics into angles **only Gil could write**.

First read the anchors deferred in Step 0: `professional-background.md` → the portfolio
source files it points to (`content/timeline-items.ts` etc.), and `author-voice.md`.

For the **top 3–4 topics**, propose **2–3 hooks each**:

- Each hook must connect the hot topic to Gil's *real* experience (backend and frontend
  architecture, TypeScript/Node/React at scale, Postgres and data modeling, AWS
  infrastructure, AI-assisted development workflows, tech leadership, and the specific
  products in his portfolio). Generic "here's what feature X does" explainers are **not**
  acceptable — anyone can write those. The angle must be one his background uniquely earns.
- Phrase each hook as a headline + one line on the experience it's anchored in.
- Never invent Gil's facts; anchor only in what the portfolio source actually says. If a hot
  topic has no honest connection to his experience, say so — don't force it.

End by offering to hand a chosen hook to **`/content-pipeline`** (Phase 1: Draft), optionally
saving it as a seed in `content/topics/` first.

---

## Notes

- **Freshness over completeness.** Missing a story is fine; reporting a stale one is the failure.
- **Scope over buzz.** A framework flamewar with big numbers and no technical substance is
  not a topic. A quiet TC39 stage advancement usually is.
- **Substance over version numbers.** Most releases in this ecosystem are noise by design.
- **No reverse media-filter.** Don't check whether newsletters already covered it — not the goal.
- **Keep the catalog alive.** Dead endpoints, moved repos, invalid tags, or a consistently-
  useless source → update `.claude/skills/_shared/webdev-news-sources.md`.
