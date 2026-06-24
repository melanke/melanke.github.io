# Ethereum Dev News — Source Catalog (Tier 1 / freshness-based)

> **Living catalog of where Ethereum protocol & dev conversations *start*** — so the
> `eth-radar` skill can surface genuinely fresh topics before they're chewed over by
> mainstream crypto media, instead of re-reporting what everyone already posted.
> Companion to `author-voice.md` and `professional-background.md` (used when turning a
> hot topic into a content hook only Gil could write) and `reddit-communities.md`.

## Operating principle

- **Tier 1 only, freshness-first.** We track *where the topic is born* — forums, GitHub
  EIP/spec discussion, AllCoreDevs, client releases. We do **not** run a reverse "did
  the media already cover this?" filter. The goal is to catch genuinely *new* movement;
  it's fine if others also talk about it, we just don't intentionally copy a finished story.
- **"New" has two shapes** — both count:
  - **NEW** — thread / PR / EIP / release *created* within the recency window.
  - **SURGING** — an *older* item with a recent burst of activity (replies/commits in the
    last 48–72h). A dormant EIP suddenly waking up is a real signal.
- **Buzz is measured, not guessed.** Discourse forums expose public JSON; GitHub via `gh`.
  Rank by engagement *velocity*, not raw totals (a 2-year-old thread with 500 replies is
  not "hot" today).
- This file is a **living catalog**: when a source dies, moves, rate-limits, or a new one
  proves useful, update it here with today's date in the relevant entry.

## Default recency window

`72h` for "recent activity"; `14 days` for "newly created". Widen if a quiet week returns
too little; narrow during fork season when everything moves fast.

---

## A. Discourse forums — where the debate is born

Both are standard Discourse installs → public JSON API. **Prefer `curl -s '<url>' | jq`**
for clean raw JSON; fall back to `WebFetch` if curl is blocked.

### ethereum-magicians.org  *(anchor source — Fellowship of Ethereum Magicians)*
EIP/ERC discussion, wallet & L2 working groups, process. This is the primary "what's the
topic of the moment" gauge.

- `https://ethereum-magicians.org/latest.json?order=activity` — recently active threads
- `https://ethereum-magicians.org/top.json?period=daily` — hottest today
- `https://ethereum-magicians.org/top.json?period=weekly` — hottest this week
- `https://ethereum-magicians.org/categories.json` — category list (EIPs, Wallet, L2, …)

### ethresear.ch  *(Ethereum Research)*
Deeper, earlier research — often *precedes* an EIP. Good for "ahead of the curve" angles.

- `https://ethresear.ch/latest.json?order=activity`
- `https://ethresear.ch/top.json?period=weekly`

**Useful Discourse topic fields** (inside `topic_list.topics[]`):
`id`, `title`, `slug`, `posts_count`, `reply_count`, `views`, `like_count`,
`created_at`, `last_posted_at`, `category_id`, `tags`, `pinned`.

- Thread URL = `https://<site>/t/{slug}/{id}`
- Skip `pinned: true` housekeeping threads (rules, welcome, etc.).

**Buzz score (per thread), default formula** — adjust by judgment, not dogma:

```
age_days        = now - created_at            (in days, min 0.5)
recent          = last_posted_at within window?  (yes/no)
velocity        = reply_count / age_days
buzz            = velocity * 2 + (views / 200) + like_count
                  ; require `recent == yes` to qualify at all
shape           = NEW      if age_days <= 14
                  SURGING  if age_days  > 14 AND recent == yes
```

Rank by `buzz`, keep the qualifying NEW/SURGING threads.

---

## B. GitHub — what entered the formal pipeline  *(use `gh api`)*

`gh` is authenticated and avoids rate limits. Sort by `updated`/`created` desc.

- **ethereum/EIPs** & **ethereum/ERCs** — new or actively-debated proposals:
  - `gh api 'repos/ethereum/EIPs/pulls?state=open&sort=updated&direction=desc&per_page=30'`
  - `gh api 'repos/ethereum/ERCs/pulls?state=open&sort=updated&direction=desc&per_page=30'`
  - Signal: PR opened in the window, or many recent `comments` / review activity.
  - Useful fields: `title`, `html_url`, `created_at`, `updated_at`, `comments`, `user.login`.
- **ethereum/pm** — AllCoreDevs (ACDE execution / ACDC consensus) agendas & notes:
  - `gh api 'repos/ethereum/pm/commits?per_page=20'` (recent meeting-note commits)
  - `gh api 'repos/ethereum/pm/issues?state=open&sort=updated&direction=desc&per_page=20'`
  - Signal: this week's call agenda = what core devs are actually deciding now.
- *(optional, deeper)* **ethereum/execution-specs**, **ethereum/consensus-specs** — recent
  commits when a fork's spec is moving.

---

## C. Client releases — features & forks shipping  *(use `gh api`)*

A fresh release often = a new EIP/fork feature reaching users.

```
gh api 'repos/{owner}/{repo}/releases?per_page=3'   # filter published_at within window
```

**Execution clients:**
- `ethereum/go-ethereum` (Geth)
- `paradigmxyz/reth` (Reth)
- `NethermindEth/nethermind` (Nethermind)
- `erigontech/erigon` (Erigon)

**Consensus clients:**
- `prysmaticlabs/prysm` (Prysm)
- `sigp/lighthouse` (Lighthouse)
- `Consensys/teku` (Teku)
- `ChainSafe/lodestar` (Lodestar)
- `status-im/nimbus-eth2` (Nimbus)

Useful fields: `name`, `tag_name`, `html_url`, `published_at`, `body` (release notes —
mine for EIP numbers / fork names mentioned).

---

## Source health log

Append a dated line when something changes (moved repo, dead endpoint, rate-limit, new
source worth adding, source that consistently produces nothing useful).

- `2026-06-23` — Catalog seeded. Erigon org confirmed as `erigontech`, Teku org as
  `Consensys`, Nimbus repo as `status-im/nimbus-eth2`. All Discourse JSON endpoints assumed
  live (verify on first run; update here if any 404/redirect).
