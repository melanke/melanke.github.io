# GenAI Dev News — Source Catalog (Tier 1 / freshness-based)

> **Living catalog of where generative-AI *integration* conversations start** — so the
> `ai-radar` skill can surface genuinely fresh topics before they're chewed over by
> AI-media aggregators, instead of re-reporting what everyone already posted.
> Companion to `author-voice.md` and `professional-background.md` (used when turning a
> hot topic into a content hook only Gil could write) and `ethereum-news-sources.md`
> (same philosophy, Ethereum edition).

## Scope (decided 2026-07-11)

The radar covers the **integration layer**, not the model-provider horse race:

- **IN:** agents & agent frameworks, MCP (spec + ecosystem), orchestration/framework
  releases (LangChain/LangGraph, Vercel AI SDK, Pydantic AI, LlamaIndex, OpenAI Agents
  SDK, CrewAI, Mastra), coding agents (Claude Code, Codex, Gemini CLI), and **applied
  research** that changes how devs build (RAG, tool use, context engineering, evals,
  fine-tuning, inference techniques).
- **OUT (deliberate):** raw model drops / benchmark races, provider API changelogs &
  SDK releases, local-inference stacks (llama.cpp/vLLM/Ollama), billing/account noise,
  pure-theory or vision-only papers. If one of these *causes* an in-scope story (e.g.
  a new API feature ignites an agents debate on HN), the debate is the story, not the
  announcement.

## Operating principle

- **Tier 1 only, freshness-first.** We track *where the topic is born* — dev forums,
  the MCP spec repo, framework releases, HF daily papers, HN front page. We do **not**
  run a reverse "did the media already cover this?" filter.
- **"New" has two shapes** — both count:
  - **NEW** — thread / PR / release / paper *created* within the recency window.
  - **SURGING** — an *older* item with a recent burst of activity (replies/commits/
    upvotes in the last 24–48h). A dormant MCP spec issue suddenly waking up is a
    real signal.
- **Buzz is measured, not guessed.** Discourse forums expose public JSON; GitHub via
  REST; HN via Algolia; HF papers carry upvotes. Rank by engagement *velocity*, not
  raw totals.
- **GenAI moves faster than Ethereum** — default window is tighter (48h / 7d vs the
  eth catalog's 72h / 14d).
- This file is a **living catalog**: when a source dies, moves, rate-limits, or a new
  one proves useful, update it here with today's date in the relevant entry.

## Default recency window

`48h` for "recent activity"; `7 days` for "newly created". Widen if a quiet week
returns too little; narrow when a major release cycle makes everything move at once.

---

## A. Discourse forums — where integration pain & debate surface

All standard Discourse installs → public JSON. **Prefer `curl -s '<url>' | jq`**;
fall back to `WebFetch` if curl is blocked.

### community.openai.com  *(OpenAI dev forum)*
Where devs react to API/agent changes, deprecations, SDK behavior. Noisy with support
threads — apply the scope filter hard (keep agents/tools/MCP/framework debate; drop
billing, account, "my key doesn't work").

- `https://community.openai.com/latest.json?order=activity`
- `https://community.openai.com/top.json?period=daily` / `?period=weekly`
- `https://community.openai.com/categories.json` — to map category IDs if needed

### discuss.ai.google.dev  *(Gemini API dev forum)*
Same role, Google side. Smaller volume, same filtering.

- `https://discuss.ai.google.dev/latest.json?order=activity`
- `https://discuss.ai.google.dev/top.json?period=weekly`

### forum.cursor.com  *(Cursor forum)*
Thermometer for AI-coding-tooling: what agent-workflow features/breakages devs are
loudly discussing. Product-specific — keep threads that generalize beyond "Cursor bug".

- `https://forum.cursor.com/latest.json?order=activity`
- `https://forum.cursor.com/top.json?period=weekly`

**Useful Discourse topic fields** (inside `topic_list.topics[]`):
`id`, `title`, `slug`, `posts_count`, `reply_count`, `views`, `like_count`,
`created_at`, `last_posted_at`, `category_id`, `tags`, `pinned`.

- Thread URL = `https://<site>/t/{slug}/{id}`
- Skip `pinned: true` housekeeping threads.

**Buzz score (per thread)** — same default formula as the eth catalog; adjust by
judgment, not dogma:

```
age_days        = now - created_at            (in days, min 0.5)
recent          = last_posted_at within window?  (yes/no)
velocity        = reply_count / age_days
buzz            = velocity * 2 + (views / 200) + like_count
                  ; require `recent == yes` to qualify at all
shape           = NEW      if age_days <= 7
                  SURGING  if age_days  > 7 AND recent == yes
```

---

## B. GitHub — the MCP spec + framework/agent-CLI pipeline

**Auth note (2026-07-11):** `gh` token invalid in this env → use the unauthenticated
public REST API (`curl -s https://api.github.com/...`). Limit is 60 req/hr — batch
the calls; the full sweep below costs ~16 requests, leave headroom.

### MCP spec — the closest thing genAI has to "EIPs"
`modelcontextprotocol/modelcontextprotocol` — protocol changes are proposed and
debated here (incl. SEP-labeled issues).

- `curl -s 'https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls?state=open&sort=updated&direction=desc&per_page=30'`
- `curl -s 'https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/issues?state=open&sort=updated&direction=desc&per_page=30'`
- Signal: PR/issue opened in window, or dense recent comments. Useful fields:
  `title`, `html_url`, `created_at`, `updated_at`, `comments`, `labels`, `user.login`.

### Framework & agent-CLI releases  *(1 call per repo)*

```
curl -s 'https://api.github.com/repos/{owner}/{repo}/releases?per_page=3'
# filter published_at within window; mine `body` for feature names
```

**Agent/orchestration frameworks:**
- `langchain-ai/langchain`
- `langchain-ai/langgraph`
- `vercel/ai` (Vercel AI SDK)
- `pydantic/pydantic-ai`
- `run-llama/llama_index`
- `openai/openai-agents-python`
- `crewAIInc/crewAI`
- `mastra-ai/mastra`

**Coding agents / CLIs:**
- `anthropics/claude-code`
- `openai/codex`
- `google-gemini/gemini-cli`

Useful fields: `name`, `tag_name`, `html_url`, `published_at`, `body`.
A patch-version release with routine fixes is **not** a story; a release whose notes
introduce a new capability, breaking change, or protocol support is.

---

## C. Applied research — HF Daily Papers

The community-curated daily paper list; substitutes mining raw arXiv.

- `https://huggingface.co/api/daily_papers` — today's list
- `https://huggingface.co/api/daily_papers?date=YYYY-MM-DD` — specific day (pull the
  last 2–3 days within the window)
- Useful fields: `paper.id` (arXiv id), `paper.title`, `paper.summary`,
  `paper.upvotes`, `publishedAt`. Page URL = `https://huggingface.co/papers/{paper.id}`.
- **Scope filter:** keep papers a working integrator can *apply* — RAG, agents, tool
  use, context/memory, evals, fine-tuning, inference cost/latency. Drop pure theory,
  vision/robotics-only, benchmark-only.
- Buzz = `paper.upvotes` (velocity-adjust by age like the forum formula).

---

## D. Hacker News — cross-cutting buzz meter  *(Algolia API)*

The best public proxy for "this broke out of the niche". Two complementary pulls:

- **Front page now:** `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30`
  → keep AI-integration stories (judge by title; don't keyword-match blindly).
- **Recent high-signal by topic:**
  `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=<q>&numericFilters=points>50&hitsPerPage=20`
  with a few scoped queries, e.g. `MCP`, `agents`, `LangChain`, `RAG`,
  `context engineering`, `Claude Code`, `Codex`. Adjust queries to the week.
- Useful fields: `title`, `url`, `points`, `num_comments`, `created_at`, `objectID`
  (discussion = `https://news.ycombinator.com/item?id={objectID}`).
- Signal: points + comment velocity within window. An HN thread **about** an item
  already found elsewhere = merge as multi-source, don't double-count.

---

## Deliberately excluded

- **Reddit (r/LocalLLaMA etc.)** — blocked from this env (curl/RSS 403, WebFetch
  refuses domain). HN + forums cover most of the breakout signal. (2026-07-11)
- **X/Twitter** — where much discourse is born, but not scriptable without paid API.
- **Aggregators/newsletters** (llm-stats, pricepertoken, smol.ai AI News, Latent
  Space) — tier-2 by definition; being ahead of them is the point.
- **Provider changelogs & SDK repos, model-drop trackers (OpenRouter/HF trending),
  local-inference stacks** — out of scope by decision (see Scope above). Revisit if
  the scope widens.

## Source health log

Append a dated line when something changes (moved repo, dead endpoint, rate-limit,
new source worth adding, source that consistently produces nothing useful).

- `2026-07-11` — Catalog seeded; every endpoint above verified live today: all three
  Discourse forums return clean JSON; HF `daily_papers` + Algolia HN OK; GitHub
  unauthenticated REST OK (`gh` token invalid in this env — HTTP 401). Reddit fully
  blocked (403 on .json and .rss; WebFetch refuses) → excluded.
- `2026-07-11` — First live run, all sources returned data. Learnings: (1) Algolia HN
  matches queries fuzzily — short queries like `RAG` return unrelated stories (matched
  "Farage"); prefer multi-word quoted phrases and always judge titles manually, or lean
  on the front-page pull. (2) `daily_papers` for the *current* date can be empty early
  in the day — always pull the 2 previous days too. (3) Framework repos that cut
  releases many times a day (vercel/ai, langchain) are pure noise at the release level;
  only report them when a release note names a real capability/breaking change.
