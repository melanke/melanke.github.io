# melanke.github.io

Personal blog and portfolio of Gil Lopes Bueno. Built with Next.js 15, static export.

## Stack

- **Framework:** Next.js 15 (App Router, `output: "export"`)
- **Markdown:** `gray-matter` (frontmatter) + `marked` (HTML)
- **Styles:** TailwindCSS
- **Build:** `npm run build` → `out/` (static)
- **Dev:** `npm run dev`

## Structure

```
posts/           # Published blog posts (markdown)
content/         # Content pipeline (not served)
  topics/        # Article topics/seeds
  lessons/       # Structured knowledge from real commits
  drafts/        # Work-in-progress articles
  ideas/         # Raw idea capture
  INDEX.md       # Cache of topics + lessons (auto-updated by skill)
public/
  blog-images/   # OG images — one PNG per post, named {slug}.png
```

## Resume versions

The site is the source of truth for Gil's CV. Each audience is a `ContentVersion`
(`app/contentVersion.ts`) rendered by the same `components/ResumePage.tsx`:

| Version | Route | Positioning |
|---------|-------|-------------|
| `general` | `/` | Principal Software Engineer — backend + AI first |
| `web3` | `/web3` | Senior Blockchain Engineer — protocol/DeFi first |
| `leader` | `/leader` | Tech Lead / Engineering Manager — leadership first |
| `enterprise` | `/enterprise` | Principal Software Engineer — Java/Kotlin, distributed systems; Web3 last, framed as integration work |
| `product` | `/product` | Technical Product Owner — discovery/requirements/roadmap first, engineering as the credibility behind it |

A version changes wording and ordering, never the facts. The pieces that vary:
`Bio.tsx` (summary), `ResumePage.tsx` (skill sections + order), `Timeline.tsx`
(per-item `role`, `description`, `technologies`, and the `print` flag that
decides which items reach the PDF), and `LeadershipSection.tsx` (role order +
blurb; it also prints only on `leader` and `product`). Adding a version means
touching those plus `app/<route>/page.tsx`, `app/sitemap.ts` and the `VERSIONS`
list in `scripts/print-cv.mjs`.

### CV PDFs are generated, not hand-exported

`scripts/print-cv.mjs` renders each route through the site's own print
stylesheet with Gil's exact print settings (Letter, 0 vertical margin, 0.31"
horizontal) and writes `public/documents/{title}.pdf`. It runs as `postbuild`,
so `npm run build` refreshes all four. CI calls `next build` directly, so it
never runs on deploy.

**Before committing any change that affects the resume or its print output
(`components/`, `app/globals.css`, timeline content), run `npm run build` so the
committed PDFs match the site.**

The script fails the build if any version exceeds **3 pages** — that budget is
the reason the print styles are tuned the way they are. To find space, look at
the print-only spacing first (`components/TimelineItem.tsx` `print:pt-*`, the
`@media print` block in `app/globals.css`, `print:min-h` in `Header.tsx`) before
cutting content. Useful env vars: `CV_MAX_PAGES` (test the guard),
`SKIP_CV_PDF=1` (skip generation), `CHROME_PATH` (non-standard Chrome).

Per-item CV content lives in `Timeline.tsx`: `technologies` renders as pills on
the site and as a plain `Tech: a, b, c` line in the PDF (recruiters asked for
running text, not tags), with links appended to that same line. `print={false}`
keeps an item off the PDF only; it can be version-aware, e.g.
`print={version === "web3" || version === "leader"}`.

The Download CV button only renders when the file exists, so a new version is
safe to ship before its PDF is generated.

## Post frontmatter schema

```yaml
---
published-at: '2026-06-17T12:00:00.000+00:00'  # required; drives sort order
summary: >-                                       # required; shown in listing
  2-3 sentence description.
og-image: /blog-images/{slug}.png               # recommended
linkedin-url: https://www.linkedin.com/pulse/... # enables link rewriting in content
linkedin-post: |-                                # LinkedIn teaser (70-150 words)
  Hook line with emoji...
  hashtag#Topic1 hashtag#Topic2
twitter-post: |-                                 # Twitter/X content
  Single tweet or thread text
twitter-image-prompt: "prompt for a single 16:9 image reinforcing the thread hook; distinct from og-image"
twitter-engagement-queries:                       # X search queries to find fresh, easy-to-comment tweets that drive traffic back to the article
  - query: ethereum onboarding gas min_faves:20 -filter:replies -is:quote -filter:links -filter:mentions -min_replies:10 -has:cashtags lang:en
    targets: people venting about Web3 onboarding/gas friction
    why: overlaps "We Can't Scale Web3 Until We Nail Onboarding"
    angle: one-line comment angle to hand to /comment-writer
reddit-posts:                                     # per-community Reddit posts (list; one entry per fitting sub)
  - subreddit: r/ethdev
    flair: My Project
    title: >-
      Problem-first title shaped to the sub
    body: |-
      Self-post body following the sub's winning structure
    notes: >-                                      # operational reminders (timing, first-hours engagement)
      Reply to comments in the first 2-3h.
og-image-prompt: "DALL-E prompt used to generate the OG image"
---
```

## Title & slug convention

The **filename is the post title**, used verbatim (`title = filename without .md`), so name post files with the human-readable title (spaces, capitals, punctuation) — never a slug, or the title renders as the slug. Slug = `slugify(filename)` — lowercase, non-alphanumeric → hyphens. Defined in `lib/posts.ts:slugify()`. Do not add `slug` or `title` frontmatter fields. Note: `slugify` turns every non-alphanumeric char into a hyphen, so "Developer's" → `developer-s`; prefer a title that slugifies cleanly.

## OG images

Every post should have a corresponding PNG at `public/blog-images/{slug}.png` (16:9 aspect ratio). Generate using the `og-image-prompt` frontmatter field.

## Draft phases (content/drafts/)

Phase is inferred from file state — no explicit field except `status: ready`:

| State | Phase |
|-------|-------|
| No frontmatter, body has `[HOOK — refinar]` | Phase 1-2: drafting/hook |
| No `linkedin-post` in frontmatter | Phase 3: needs social content |
| Has `linkedin-post`, no `reddit-posts` | Phase 4: needs Reddit communities |
| Has `reddit-posts`, missing `og-image-prompt` or `twitter-image-prompt` | Phase 5: needs image prompts (OG + Twitter) |
| Has both `og-image-prompt` and `twitter-image-prompt`, no `twitter-engagement-queries` | Phase 6: needs X engagement targets |
| Has `twitter-engagement-queries`, no `status: ready` | Phase 7: needs scoring |
| Has `status: ready` | Phase 8: ready to publish |

## Skills

- `/content-pipeline` — Full publishing pipeline: ideation → draft → hooks → social → OG image → score → publish
- `/comment-writer` — Write comments on third-party posts that reflect Gil's voice and optionally reference his published articles
- `/eth-radar` — Fresh Ethereum protocol/dev topics from tier-1 sources → content hooks (catalog: `_shared/ethereum-news-sources.md`)
- `/ai-radar` — Fresh genAI *integration* topics (agents, MCP, frameworks) from tier-1 sources → content hooks (catalog: `_shared/ai-dev-news-sources.md`)
- `/web-radar` — Fresh JS/TS, Node, React/Next, Postgres, AWS and web-platform topics from tier-1 sources → content hooks (catalog: `_shared/webdev-news-sources.md`)
- `/linkedin-carousel` — Single humorous LinkedIn carousel post (not a blog article): funny caption + one self-contained image prompt per slide, all in Gil's recognizable carousel house style (see `.claude/skills/_shared/carousel-visual-identity.md`)
- `/linkedin-post` — One idea or rough draft → a finished, ready-to-paste LinkedIn **text** post (60–150 words, funny, plain text), in a single run with no questions asked. Built for volume; accepts several ideas at once. Output lands in `content/linkedin-posts/`
