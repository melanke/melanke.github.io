---
name: comment-writer
description: >
  Write comments on third-party posts (LinkedIn, Twitter/X) in Gil's voice. Adds genuine value to the conversation, reflects real expertise, and organically references Gil's published articles when relevant. Never sycophantic, never spam. Also runs a batch as a distribution campaign for one target article (default: Gil's latest post): fetches each pasted tweet's full text, drops the junk and off-campaign tweets, ranks the rest, and writes one reply per survivor — each one bridging the conversation to that article's thesis and the asset it promotes.
  Trigger on: "comentar post", "comment on this", "escrever comentário", "responder post", "comment writer", "comentário linkedin", "comentário twitter", "reply to this post", "responder esses tweets", "reply to these tweets", "process these tweets", "lista de tweets".
---

# Comment Writer

## CRITICAL: Auto-start on load

Jump immediately to Step 1. Do not explain this skill.

---

## Step 1: Detect mode, then gather inputs

First decide which mode you're in:

- **Batch mode** — the user pasted **two or more Twitter/X post URLs** (lines like `https://x.com/<user>/status/<id>` or the old `twitter.com` host), or asked to "process a list of tweets / find which are worth replying to". → Go to **Batch Mode (Twitter/X)** below.
- **Single mode** — one post (any platform), pasted as text or a single URL. → Continue here.

For single mode, ask the user (AskUserQuestion) only what's missing:
1. **Platform:** LinkedIn or Twitter/X
2. **The post:** paste the third-party post content

Then optionally:
3. **Reference post:** which of Gil's articles to mention (or let the skill decide)

---

## Batch Mode (Twitter/X)

A batch run is **a distribution campaign for one target article** — almost always Gil's latest post. The user pastes a list of tweet **URLs**; the skill fetches each tweet's full text, keeps the ones where Gil can genuinely bridge the conversation to that one article, ranks them, and writes one ready-to-paste reply per survivor — every reply orbiting the **same** article's thesis and the asset it promotes.

This is the core difference from single mode: don't pick a per-tweet article from the cache. There is **one** campaign article, chosen up front in B0, and every reply serves it.

### B0. Establish the target article (the campaign)

Before fetching anything, fix the one article this batch promotes:

1. **Default = Gil's latest published post** — the file in `posts/` with the most recent `published-at`. State which one you detected ("Campaign article: *<title>*") and let the user override (they may be pushing a specific older post, or a draft). If the user named an article in their request, use that.
2. **Read it in full now** (per Step 2): extract its **core thesis** and the **asset it promotes** (a skill Gil built, a repo/tool, or a named concept). This single read drives every reply — you won't re-pick articles per tweet.

> Workflow note: these tweet URLs usually come from running that same article's `twitter-engagement-queries` (content-pipeline Phase 6) on X. So the campaign article and the queries that surfaced these tweets are normally the same post — confirm it's the one the user gathered tweets for.

### B1. Fetch each tweet's full text (no "Show more" truncation)

For every URL, resolve the full untruncated tweet via X's public **syndication** endpoint (the one that powers tweet embeds — no auth, returns complete text plus metrics):

1. Extract the numeric tweet ID from the URL: the digits after `/status/`.
2. Compute the syndication token from the ID:
   ```js
   token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "")
   ```
   Run this with the Bash tool (`node -e`) for each ID — don't hand-compute it.
3. WebFetch: `https://cdn.syndication.twimg.com/tweet-result?id=<ID>&token=<TOKEN>&lang=en`
   - Useful fields in the JSON: `text` (the **full** tweet), `user.name` / `user.screen_name`, `favorite_count`, `created_at`, and (for quotes/threads) the parent/quoted tweet text.

**Fallback if syndication fails** (empty JSON, or the endpoint is dead — X has been paywalling these): tell the user that tweet couldn't be auto-fetched and ask them to paste its text. Never guess a tweet's content. This endpoint is undocumented and may change; degrade gracefully rather than fabricate.

### B2. Silently drop the junk and the off-campaign

Discard a tweet **without listing it** (the user chose a clean output — no rejection list) when:

- It's pure shill/promo — token pumping, airdrop farming, `$TICKER` spam, "join my server / buy now".
- It's engagement-bait / bot-flavored, or so old/dead that a reply has no audience (use `created_at` and `favorite_count` as signals).
- **It can't genuinely bridge to the target article's thesis** without forcing it. The campaign gate: *can Gil make a real point here that advances this article's thesis or asset?* A tweet about React performance is a bad fit for a DeFi-spec campaign even if it's a fine tweet — drop it. The reach of the campaign comes from relevance, not volume.

Note the lens shift: with a target article fixed, a tweet that looked like a "reentrancy" fit can become an *on-campaign* fit. An escrow build-in-public tweet bridges to a discovery+spec article via "threat-model the state transitions before you code" — that's the upstream harness applied to escrow, not a detour to an old reentrancy post. Read each tweet through the campaign article's thesis before deciding fit.

If **every** tweet is dropped, say so plainly and stop — don't manufacture weak replies.

### B3. Rank the survivors

Order the surviving tweets best-opportunity-first. Rank by, in rough priority: how strongly the tweet lets Gil advance the **target article's** thesis/asset genuinely › freshness › traction that's healthy but not so viral the reply gets buried. State the ranking briefly.

### B4. Write one reply per survivor

Read context once (Step 2), then for each surviving tweet run Steps 3–4 (write) using the **Twitter/X reply format**. **Every reply orbits the same target article** (B0) — that's the campaign, by design. The discipline is *not* avoiding the article (the old "don't repeat an article" rule does **not** apply in batch); it's making a campaign of identical replies not *read* as one:

- **Vary the surface form.** Don't name the skill/article the same way in every reply. Some replies name the asset directly ("I built a discovery+spec skill that…"); some make the thesis point cleanly with no citation at all; one or two flag authorship casually ("a piece I wrote on this"). Different entry point, different sentence shape, different question each time.
- **Ration the explicit mention.** Naming the skill or flagging the article in *every* reply reads as a campaign if Gil posts them together. Aim for the asset named outright in a minority of replies; the rest advance the same thesis on substance alone. Each reply must still stand on its own as a genuine contribution, not a thesis advert.

### B5. Output (batch)

Open with one line naming the **campaign article** this batch promotes (so Gil sees the lens every reply was written through).

Then, for each surviving tweet, in ranked order, show:
- a one-line identifier (author handle + a short snippet of the tweet, so Gil knows which one it is),
- **the original tweet URL exactly as the user pasted it** — so Gil clicks straight through to reply. This is mandatory: carry each input URL through to its output (key the survivors back to the URL list by tweet ID; never reconstruct or shorten it).
- the reply in its own code block (ready to paste),
- a one-line note on how this reply advances the campaign article (named the asset / made the thesis point uncited / flagged authorship).

No rejection list, no per-tweet praise. Then offer to regenerate any single reply with a different angle.

---

## Step 2: Read context

Read:
1. `.claude/skills/_shared/author-voice.md` — Gil's base voice & mannerisms (always applied; see the Gil's Voice section below).
2. `.claude/skills/_shared/professional-background.md` — the index of where Gil's real experience lives. Use it to ground the comment in an actual project; follow it to the source files (e.g. `components/Timeline.tsx`) when you need a specific project's detail.
3. The Published Articles Cache from `content-pipeline/SKILL.md` (the table at the end of that file).

Identify articles that have **genuine topical overlap** with the third-party post — not just keyword match, but real conceptual connection.

**Then, before writing any comment that will reference an article, open the article file itself** (`posts/{...}.md` — match by slug) and read it. The one-line cache entry is only a *detector* of overlap; it is far too thin to write an angle from. From the article extract two things:
- **Its core thesis** — the actual argument it makes (not its broad topic). E.g. *Discovery and Spec* argues the missing harness is the *upstream* discovery+spec step that constrains AI **before** any Solidity — the CI/audit/fuzz layer is downstream and too late.
- **The asset it promotes** — the concrete thing Gil wants more people to care about: a skill he built, a repo/tool, or a named concept (e.g. "harness engineering for DeFi", the `defi-protocol-discovery` / `defi-spec-driven` skills). Many articles exist to spread a specific asset; the comment is partly distribution for it.

Never write the article angle from the cache summary alone. If you reference an article, the comment must accurately represent what that article actually argues — citing the wrong sub-point (e.g. a fuzzing war story for an article that's really about design-phase specs) is a failure.

---

## Step 3: Evaluate reference opportunity

Use the Published Articles Cache to decide:

**Reference Gil's article if:**
- There is clear thematic overlap (the article directly addresses something raised in the post)
- The reference adds value to the reader (not just self-promotion)
- This would be the first reference in this thread/conversation

**Do NOT reference if:**
- Overlap is superficial or forced
- This would be the 2nd+ reference in the same thread
- The post author already referenced something from Gil
- The connection requires too much explanation to feel natural

### What the comment should advance

A comment isn't only "add a smart point." For Gil it's also distribution — so when the tweet genuinely overlaps an article's **core thesis**, the angle must *advance that thesis and the asset the article promotes*, not drift to a loosely-related anecdote.

Ask, before choosing the angle: **why is Gil commenting on this one?** Usually the strongest answer is "because this tweet is exactly the problem my skill / my thesis addresses." Lead with that.

- If the tweet describes the *problem* an article's thesis solves → the comment should name the **solution Gil built**, in his own words, as the substantive point. **When the promoted asset is a concrete skill or tool Gil built, name it directly** — don't soften it down to the abstract concept. "I built a discovery+spec skill that forces the economic invariants and threat model before any Solidity" beats "I call this the upstream harness". The concept is the framing; the skill is the asset, and the asset is what the article exists to spread. Example: a tweet about "AI wrote it, tests passed, it still got drained" overlaps *Discovery and Spec* — the right angle names the **discovery+spec skill** Gil built to constrain the design before code, **not** a fuzzing story (that belongs to a different article).
- Don't bury the asset behind a tangent just to sound less promotional. Naming a real thing you built, on-topic, in answer to the exact problem raised, is genuine value — not a spam CTA. The anti-promo rule bans link-dropping and "check out my post", not honestly saying "I built X to solve this".
- The tangent test: if your draft references an article but the point you made isn't the article's actual argument, you picked the wrong angle. Rewrite around the thesis.

---

## Step 4: Write the comment

### Rules (always apply)

- **Never start with:** "Great post!", "Loved this!", "Such an insightful piece!", "Well said!", or any variant
- **First sentence:** a concrete perspective, additional data point, or experience from Gil's real projects — something that adds to the conversation
- **Body:** 1 substantive point grounded in real experience. When the tweet overlaps an article's thesis, this point *is* the article's thesis / the asset it promotes (see Step 3), said plainly in Gil's words.
- **No decorative name-drops.** A project name must carry real information — the specific thing that happened or that Gil built. "On our CLOB a fuzzer caught a drift" used only as flavor is name-dropping; it reads fictitious precisely because it says nothing concrete. Either state the specific, true substance ("I built a discovery+spec skill that forces the economic invariants and threat model before any Solidity") or drop the name and make the point cleanly. If you can't say something specific and true about the project, don't invoke it.
- **Reference (if applicable) — flag authorship, not the title.** Make it explicit it's *Gil's own* writing, framed casually: "something I wrote about recently", "I dug into this in a piece I wrote". Do **not** drop the formal article title as if it were a known publication ("…in Discovery and Spec") — that reads like citing a famous paper and is stiff. Naming the exact title is optional and secondary; flagging that *he wrote it* is the point, because it invites the reader to ask for it. **Never put a link in the reply** (X suppresses reach on outbound links, and a link reads as a spam CTA); if the person wants it, Gil sends the link in a follow-up. The point you make must be what that article actually argues (Step 2/3), not a different sub-topic.
- **Close:** a genuine question or invitation to continue the conversation — never a CTA to visit his website or follow him

### LinkedIn comment format

2–4 short paragraphs. Conversational but professional. No bullet lists. No headers. No hashtags.

Target: 60–120 words.

### Twitter/X reply format

1–2 sentences. Punchy. Direct. No hashtags in the reply body. No URL in the reply. If referencing Gil's writing, flag authorship casually ("a piece I wrote recently") rather than dropping the title; he sends the link only if asked.

**Length is a hard gate, not a suggestion. Count the characters of every reply before presenting it.** X will not post a single tweet over **280 characters** — a reply that long is unusable, no matter how good. If a draft is over, trim it: cut qualifiers, shorten the setup, tighten the question, drop the article mention before you drop the substantive point. Never present a reply over 280. **Target ≤220** to leave room for conversation. Naming a skill Gil built plus a genuine question takes words, so economize the framing — but the count is non-negotiable.

---

## Step 5: Output

Present the comment in a code block (ready to copy-paste). Then briefly explain (1 sentence) whether and why you referenced a Gil article (or why you chose not to).

Offer to generate an alternative version if the user wants a different angle.

---

## Gil's Voice (apply to all comments)

**Read `.claude/skills/_shared/author-voice.md` — it is the single source of truth for Gil's voice and mannerisms.** Apply it to every comment.

Comment-specific reminders (the shared base still applies):
- No headers, no code blocks, no `---` rules — a comment is plain prose (overrides the shared formatting conventions).
- Lead with substance, never with praise — the shared "no sycophancy" rule is non-negotiable here.
- Close with a genuine question that invites dialogue, never a CTA to visit Gil's site or follow him.
