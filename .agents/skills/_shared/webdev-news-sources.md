# Web Dev News — Source Catalog (Tier 1 / freshness-based)

> **Living catalog of where JavaScript / TypeScript / Node / React / Next / Postgres / AWS
> and web-platform conversations start** — so the `web-radar` skill can surface genuinely
> fresh topics before they're chewed over by dev-media aggregators and newsletters,
> instead of re-reporting what everyone already posted.
> Companion to `author-voice.md` and `professional-background.md` (used when turning a hot
> topic into a content hook only Gil could write), `ai-dev-news-sources.md` and
> `ethereum-news-sources.md` (same philosophy, other domains).

## Scope (decided 2026-07-28)

The radar covers **things that change how a working web dev writes code**, not the
framework popularity contest:

- **IN:** language & runtime evolution (TC39 stage moves, TypeScript releases, Node LTS
  and new core APIs, Deno/Bun), React & meta-framework API changes (React RFCs, Next.js
  stable releases, Router/TanStack/Astro/Svelte/Nuxt), the build-tool shift
  (Vite/Rolldown/oxc/Biome/esbuild/pnpm/Turborepo), the data layer (Postgres major
  features and `pgsql-hackers` debates, Prisma/Drizzle/Supabase/pgvector), AWS launches
  that touch how web/serverless apps are built and paid for, browser-platform features
  reaching Baseline/shipping, and cross-cutting engineering debates that break out on
  HN/Lobsters.
- **OUT (deliberate):** patch releases, canaries and routine dependency bumps; listicles
  and "X vs Y in 2026" hot-take content; funding/acquisition/company news; AWS
  announcements aimed at enterprise ops, ML platform, or hardware (irrelevant to a web
  dev); CVEs with no design lesson; and framework-tribalism flamewars with no technical
  substance. If one of these *causes* an in-scope debate (e.g. a breaking release ignites
  an architecture argument), **the debate is the story, not the announcement**.

## Operating principle

- **Tier 1 only, freshness-first.** We track *where the topic is born* — spec repos,
  release notes, mailing lists, platform status, HN/Lobsters front pages. We do **not**
  run a reverse "did the newsletters already cover this?" filter.
- **"New" has two shapes** — both count:
  - **NEW** — proposal / PR / release / thread *created* within the recency window.
  - **SURGING** — an *older* item with a recent burst of activity (comments, a stage
    advancement, a sudden HN thread). A two-year-old TC39 proposal moving to Stage 3, or
    a dormant WHATWG issue waking up, is a real signal.
- **Buzz is measured, not guessed.** HN via Algolia, Lobsters via JSON, GitHub via REST
  (comment counts), mailing lists by message density. Rank by engagement *velocity*, not
  raw totals.
- **Releases have no engagement metric** — they qualify on *substance* (a named new
  capability or breaking change) plus **cross-source presence** (someone is discussing it
  on HN/Lobsters). A version bump alone is never a story.
- This is the noisiest of the three domains: dozens of repos cut releases daily. The
  scope filter and the "substance" rule do the heavy lifting — expect to discard most of
  what you pull.
- This file is a **living catalog**: when a source dies, moves, rate-limits, or a new one
  proves useful, update it here with today's date in the relevant entry.

## Default recency window

`72h` for "recent activity"; `7 days` for "newly created". Widen to 14d for spec/mailing-
list items on a quiet week; narrow during a big release cycle (React/Next/Node major,
Postgres beta, re:Invent) when everything moves at once.

---

## A. GitHub — releases, specs and RFCs

**Auth note (2026-07-28):** `gh` token invalid in this env → use unauthenticated public
REST (`curl -s https://api.github.com/...`), limited to **60 req/hr shared with everything
else**.

**⚠️ Key trick — release sweeps must use Atom, not REST.** `https://github.com/{owner}/{repo}/releases.atom`
is a public feed that **does not consume API quota** (verified 2026-07-28: rate limit
unchanged across a sweep). Use Atom for *all* release polling and reserve the ~60 REST
calls for PR/issue lists where comment counts are needed.

```bash
curl -s -L 'https://github.com/{owner}/{repo}/releases.atom'
# entry fields: title (tag), updated, link[@href], content (release notes HTML)
```

**`-L` is mandatory** — some repos (e.g. `facebook/react`) answer 301 and you get an empty
body without it, which looks exactly like "no releases in window". Don't misread it as quiet.

### A1. Release feeds — Core set (always sweep)

| Repo | Watch for | Noise note |
|---|---|---|
| `microsoft/TypeScript` | beta/RC/stable, new checker & syntax features | releases are rare = high signal |
| `nodejs/node` | LTS promotions, new core APIs, flag removals | many patch releases — filter by notes |
| `facebook/react` | stable + experimental capability notes | rare = high signal |
| `vercel/next.js` | **stable tags only** | `-canary.N` daily — always drop |
| `oven-sh/bun` / `denoland/deno` | Node-compat milestones, runtime APIs | minor releases carry real features |
| `postgres/postgres` | tags = beta/RC/GA of major versions | pair with `news.rss` below |
| `vitejs/vite` / `rolldown/rolldown` | the Rolldown migration, perf claims | very frequent — substance rule |
| `biomejs/biome` / `oxc-project/oxc` | the Rust-toolchain replacement of Prettier/ESLint/Babel; oxc is upstream of Rolldown | |
| `prisma/prisma` / `drizzle-team/drizzle-orm` | query-engine & typing changes | Prisma publishes `X.Y.Z-dev.N` **many times a day** with empty notes — drop all `-dev.` tags outright |
| `expressjs/express` / `honojs/hono` | the incumbent Node framework vs. the runtime-portable challenger — read them as one story | Express releases are rare |
| `TanStack/query` (**= react-query**, renamed when it went multi-framework; pkg is still `@tanstack/react-query`) / `TanStack/router` (also carries TanStack Start) | data-fetching & routing API shifts | per-package tags — keep `@tanstack/react-*`, drop `solid-*`/`vue-*`/`svelte-*`. Routine per-package betas are noise, **but a major-version beta/RC of react-query or Router is a story** (v6 is in beta as of 2026-07) |
| `tailwindlabs/tailwindcss` | engine rewrites, config/API breaking changes | |
| `pnpm/pnpm` / `vercel/turborepo` | workspace, install-strategy and monorepo-caching changes | Turborepo ships `-canary.N` — drop; pnpm alphas only matter at major boundaries |
| `aws/aws-cdk` | construct & deploy-model changes | ships constantly — substance rule |
| `web-platform-dx/web-features` | **Baseline promotions** — what became safe to ship without a polyfill | best single "web platform" signal; rare + high value |

### A2. Release feeds — Extended set (sweep when the user's focus calls for it)

`remix-run/react-router`, `withastro/astro`, `sveltejs/kit`, `nuxt/nuxt`,
`evanw/esbuild`, `nestjs/nest`, `fastify/fastify`, `sst/sst`, `supabase/supabase`,
`pgvector/pgvector`.

### A3. Specs & RFCs — the "EIP layer" of web dev *(REST, costs quota)*

```bash
# TC39 — stage advancements land as commits to the proposals README
curl -s 'https://api.github.com/repos/tc39/proposals/commits?per_page=20'
# TC39 spec text under debate
curl -s 'https://api.github.com/repos/tc39/ecma262/pulls?state=open&sort=updated&direction=desc&per_page=20'
# TC39 meeting notes (agenda + what actually advanced)
curl -s 'https://api.github.com/repos/tc39/notes/commits?per_page=10'
# WHATWG HTML — where browser-facing behavior is argued
curl -s 'https://api.github.com/repos/whatwg/html/issues?state=open&sort=updated&direction=desc&per_page=30'
# React RFCs
curl -s 'https://api.github.com/repos/reactjs/rfcs/pulls?state=open&sort=updated&direction=desc&per_page=15'
# Interop — what browser vendors committed to fix this year
curl -s 'https://api.github.com/repos/web-platform-tests/interop/issues?state=open&sort=updated&direction=desc&per_page=20'
```

Useful fields: `title`, `html_url`, `created_at`, `updated_at`, `comments`, `labels`,
`user.login`. Signal = opened in window, or dense recent comments (`comments` high +
`updated_at` fresh). A **stage advancement** in `tc39/proposals` is always a story.

Budget: the six calls above ≈ 6 requests. Keep the whole run under ~20 REST calls.

---

## B. Postgres — where features are actually decided

### `pgsql-hackers` mailing list *(the pgsql equivalent of ethereum-magicians)*
Every Postgres feature is argued here months before release notes exist.

- Month archive: `https://www.postgresql.org/list/pgsql-hackers/YYYY-MM/` (HTML — parse
  `<a href="/message-id/...">Subject</a>` links; strip `Re: ` to group by thread)
- **Buzz = message count for a subject within the window**, plus recency of the latest
  message. A subject with 20+ messages in 72h is a live fight worth a story.
- Thread URL = `https://www.postgresql.org/message-id/{id}`.

### Announcements
- `https://www.postgresql.org/news.rss` — releases, betas, ecosystem tool releases.
  Low volume, high signal. Fields: `title`, `link`, `pubDate`.

### Commitfest
- `https://commitfest.postgresql.org/current/` (HTML; redirects to the numbered CF, e.g.
  `/59/`). No JSON API (`/api/` → 404, 2026-07-28). Use to see which patches are moving
  toward commit. Fetch only when a hackers thread looks story-worthy.

---

## C. AWS — filter hard, it's a firehose

- `https://aws.amazon.com/about-aws/whats-new/recent/feed/` — RSS of *all* announcements
  (dozens/day). Fields: `title`, `link`, `pubDate`, `description`.
- `https://aws.amazon.com/blogs/aws/feed/` — the AWS News Blog: fewer items, more depth,
  usually the launches that matter.

**Scope filter (mandatory — most items are out):** keep only announcements a web/backend
dev would act on — Lambda, API Gateway, Amplify, App Runner, ECS/Fargate, CloudFront,
S3, DynamoDB, **RDS/Aurora Postgres**, Cognito, EventBridge, SQS/SNS, Step Functions,
CDK, and pricing/limit changes that alter architecture decisions. **Drop** enterprise
governance, SageMaker/ML-platform, networking hardware, region expansions, compliance
certifications, and "now available in region X" items.

---

## D. Browser platform — what becomes safe to ship

### Chrome Platform Status *(JSON API — responses are prefixed with `)]}'`, strip line 1)*

```bash
curl -s 'https://chromestatus.com/api/v0/channels' | sed "1s/^)]}'//" | jq '.stable.version'
# features landing in a given milestone (use stable, stable+1 = beta, stable+2 = dev)
curl -s 'https://chromestatus.com/api/v0/features?milestone=152' | sed "1s/^)]}'//"
curl -s 'https://chromestatus.com/api/v0/features?q=browsers.chrome.desktop%3D152' | sed "1s/^)]}'//"
```

Fields: `name`, `summary`, `browsers.chrome.status.text`, `id`
(page = `https://chromestatus.com/feature/{id}`).

**Two response shapes — don't mix them up (2026-07-28):**
- `?milestone=N` → `{total_count, features_by_type:{…}}` — features nested **by status
  group**, so `.features[]` is empty. Iterate `.features_by_type[][]`.
- `?q=browsers.chrome.desktop=N` → flat `{total_count, features:[…]}` — use this one when
  you just want a list.

**Note (2026-07-28):** date-range queries (`q=updated>...`, `q=updated:A..B`) return 0 —
only milestone-based queries work. Don't waste calls on other syntaxes.

### Vendor feeds
- `https://developer.chrome.com/static/blog/feed.xml` — Chrome dev blog
- `https://webkit.org/feed/atom/` — WebKit/Safari (releases + feature deep dives)
- `https://developer.mozilla.org/en-US/blog/rss.xml` — MDN blog
- `web-platform-dx/web-features` releases (§A1) — **Baseline** promotions

---

## E. Discussion layer — did it break out?

### Hacker News *(Algolia API)*
- Front page now: `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30`
- Recent high-signal by topic:
  `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=<q>&numericFilters=points>50&hitsPerPage=20`
  Queries to rotate: `TypeScript`, `Node.js`, `React`, `Next.js`, `PostgreSQL`,
  `serverless`, `bundler`, `web performance`. Adjust to the week.
- Fields: `title`, `url`, `points`, `num_comments`, `created_at`, `objectID`
  (discussion = `https://news.ycombinator.com/item?id={objectID}`).
- **Algolia matches fuzzily** — always judge titles manually; short/ambiguous queries
  return junk.

### Lobsters *(JSON, cleaner signal-to-noise than HN for tooling)*
- `https://lobste.rs/t/javascript,web,nodejs,browsers,databases,performance.json`
  (multi-tag works; also `programming`)
- **Valid tags verified 2026-07-28:** `javascript`, `web`, `nodejs`, `browsers`,
  `databases`, `performance`, `programming`. **Invalid (404):** `react`, `typescript`,
  `postgres`, `postgresql`, `aws` — don't use them.
- Fields: `title`, `url`, `score`, `comment_count`, `created_at`, `comments_url`, `tags`.

**Buzz score (HN / Lobsters / GitHub threads)** — adjust by judgment, not dogma:

```
age_days   = now - created_at              (in days, min 0.5)
recent     = last activity within window?  (yes/no)
velocity   = (comments or replies) / age_days
buzz       = velocity * 2 + (points or score) / 5
             ; require `recent == yes` to qualify at all
shape      = NEW      if age_days <= 7
             SURGING  if age_days  > 7 AND recent == yes
```

---

## Deliberately excluded

- **Reddit (r/javascript, r/node, r/webdev, r/PostgreSQL)** — blocked from this env
  (403 on `.json`/`.rss`; WebFetch refuses the domain). HN + Lobsters cover the breakout
  signal. (2026-07-28, inherited from the AI catalog's finding)
- **X/Twitter, Bluesky** — where much of the discourse lives, but not scriptable here.
- **Newsletters & aggregators** (JavaScript Weekly, Node Weekly, React Status, Postgres
  Weekly, Bytes, TLDR, Frontend Focus) — tier-2 by definition; being ahead of them is the
  whole point.
- **Stack Overflow / dev.to / Medium** — consumption layer, not origination layer.
- **npm download-count trackers, "State of JS"-style surveys** — lagging indicators.

## Source health log

Append a dated line when something changes (moved repo, dead endpoint, rate-limit, new
source worth adding, source that consistently produces nothing useful).

- `2026-07-28` — Catalog seeded; every endpoint above verified live today (HTTP 200 +
  parsed payload): GitHub REST unauth OK (`gh` token invalid in this env), GitHub
  `releases.atom` OK **and quota-free**, chromestatus API OK (needs `)]}'`  strip;
  milestone queries only), Lobsters JSON OK, HN Algolia OK, AWS what's-new + News Blog
  RSS OK, postgresql.org `news.rss` + `pgsql-hackers` month archive OK, Chrome/WebKit/MDN
  feeds OK. `commitfest.postgresql.org/api/` → 404 (HTML only).
- `2026-07-28` — Core/extended rebalanced per Gil: promoted `expressjs/express`,
  `TanStack/query`+`router`, `tailwindlabs/tailwindcss`, `vercel/turborepo`, `pnpm/pnpm`
  to core; demoted `sst/sst` to extended (niche + changed foundations). Express is now
  paired with Hono so the "incumbent vs. runtime-portable challenger" story reads as one
  topic. All promoted feeds verified live today. New noise findings: TanStack tags one
  release *per package* (`solid-*`, `vue-*` — filter to `react-*`) and Turborepo
  publishes `-canary.N` like Next.js. Corrected same day: the blanket "drop betas" rule
  was too aggressive for TanStack — react-query v6 is in beta now, and a major-version
  beta/RC there is a real story for a React audience.
- `2026-07-28` — **First live run.** Learnings: (1) `releases.atom` needs `-L` —
  `facebook/react` 301s and returns an empty body otherwise, which mimics "quiet week".
  (2) chromestatus `?milestone=N` nests results under `features_by_type`, not `features`
  — both forms documented in §D now. (3) Prisma `-dev.N` tags are a firehose of empty
  notes. (4) HN Algolia fuzzy matching is worse than expected: `bundler`, `web
  performance` and `React` returned almost entirely unrelated stories — the front-page
  pull and Lobsters carried the real signal; prefer multi-word phrases and always judge
  titles. (5) `developer.chrome.com` and MDN blog feeds were both ~5 weeks stale — poll
  them, but don't expect weekly signal; WebKit's feed was the live one. (6) The
  `pgsql-hackers` month page returns only the ~200 most recent messages (paginated), so
  message counts are a floor, not a total. (7) AWS what's-new is ~95% out of scope for a
  TS web dev even after the keyword prefilter — the filter is doing its job.
