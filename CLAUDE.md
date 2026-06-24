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

## Slug convention

Slug = `slugify(filename)` — lowercase, non-alphanumeric → hyphens. Defined in `lib/posts.ts:slugify()`. Do not add a `slug` frontmatter field.

## OG images

Every post should have a corresponding PNG at `public/blog-images/{slug}.png` (16:9 aspect ratio). Generate using the `og-image-prompt` frontmatter field.

## Draft phases (content/drafts/)

Phase is inferred from file state — no explicit field except `status: ready`:

| State | Phase |
|-------|-------|
| No frontmatter, body has `[HOOK — refinar]` | Phase 1-2: drafting/hook |
| No `linkedin-post` in frontmatter | Phase 3: needs social content |
| Has `linkedin-post`, no `reddit-posts` | Phase 4: needs Reddit communities |
| Has `reddit-posts`, no `og-image-prompt` | Phase 5: needs OG prompt |
| Has `og-image-prompt`, no `status: ready` | Phase 6: needs scoring |
| Has `status: ready` | Phase 7: ready to publish |

## Skills

- `/content-pipeline` — Full publishing pipeline: ideation → draft → hooks → social → OG image → score → publish
- `/comment-writer` — Write comments on third-party posts that reflect Gil's voice and optionally reference his published articles
