---
name: linkedin-post
description: >
  Turns one idea or rough draft into a finished, ready-to-paste LinkedIn **text** post (no carousel, no blog article, no images) in Gil's voice — short, funny, and shipped in a single run with zero questions asked. Built for volume: hand it a half-formed thought and get back the post, the first comment, and the hashtags. Accepts several ideas at once and writes one post for each.
  Trigger on: "post do linkedin", "post de texto", "linkedin post", "texto pro linkedin", "escrever post linkedin", "postar isso", "transforma isso em post", "text post", "quick post", "post rápido".
---

# LinkedIn Text Post

## CRITICAL: one shot, no questions

This skill runs **start to finish in a single turn**. There is no phase detection, no "want me to continue?", no menu of options, no clarifying question. The user handed over an idea; hand back a finished post.

- **Never ask the user anything.** Ambiguous input? Pick the sharpest reading and write it.
- **Never present intermediate work** (angles, hook options, outlines). The passes below are internal.
- **Never stop halfway** to check in. The run ends with the finished post on screen.
- If the input is thin, that's fine — thin ideas make the best short posts. Don't ask for more material, invent the *framing*, never the facts.

The only thing that ever gets discussed is a post that already exists. Tweaks come after delivery, if the user asks.

## This is not a carousel and not an article

No slides, no image prompts, no OG image, no Reddit, no Twitter thread, no `posts/` publishing, no cross-link hunting. One block of plain text that goes in the LinkedIn composer. If the user wants slides that's `/linkedin-carousel`; a full article is `/content-pipeline`.

---

## Step 0 — Context (fast)

Read, in this order:

1. `.agents/skills/_shared/author-voice.md` — the voice and, more importantly, the **Avoid LLM tells** list and its final self-check. Both apply in full. Blog-specific rules (CTA, bio line, section dividers) do not.
2. `ls content/linkedin-posts/` — a filename glance, nothing more. It exists so two posts in a row don't reuse the same joke or the same shape.
3. `.agents/skills/_shared/professional-background.md` **only if** the idea leans on a real project, role, or number. It maps which portfolio files hold what; read the source it points at (usually `content/timeline-items.ts`) before stating any fact. Generic dev pain needs none of this — skip it and stay fast.

Never invent an employer, a project name, a metric, or an incident. Generic relatable pain is always available and costs nothing.

---

## Step 1 — Read the input

Two kinds of input, one behavior each:

**An idea** (a line, a complaint, a link, a topic) → build the post around it. The idea is the seed, not the text.

**A rough draft** (paragraphs the user already typed) → **compress it**. The output is almost always shorter than the input. Keep the user's actual point and any real detail they gave; cut throat-clearing, cut the second example, cut the wrap-up paragraph. Resist the urge to expand.

**Several ideas at once** → batch mode. One post per idea, each fully finished, each in its own file. Vary the shape between them so the batch doesn't read as one template.

---

## Step 2 — Pick a shape

Pick the one that fits the idea. Don't default to the same one twice in a row (that's what the `ls` in Step 0 is for).

| Shape | What it is | Fits |
|-------|-----------|------|
| **Cold observation** | One sharp claim, one beat of evidence, done. 40–70 words. | A single opinion with an edge |
| **Three-beat story** | Setup, the moment it went sideways, what it taught. | Something that actually happened |
| **The short list** | Hook, then 3–5 one-line items with `→`, then a landing line. | Recurring patterns, red flags, "things nobody tells you" |
| **Contrarian** | "Everyone says X." / what happens in production. | Cargo-culted advice worth puncturing |
| **Overheard dialogue** | 4–8 lines of fake conversation (PM/dev, dev/agent, dev/dev), no narration. | Absurd process, expectations, AI tooling |
| **Before / after** | Two short blocks under plain labels. | Two eras, a migration, a habit that changed |
| **The receipt** | A tiny code/config/log snippet as plain text, then one line of why it's funny. | The joke *is* the code, and it's 3–5 lines |

Nothing is mandatory. If the idea suggests a shape not on this list, use it.

---

## Step 3 — Write it

**Length: 60–150 words.** Under 100 is usually better. A post that needs 200 words is either an article or two posts.

The skeleton, loosely:

- **Line 1 is the whole game.** LinkedIn folds the post at roughly 200 characters behind "…see more", so the first line has to be complete enough to land on its own and pointed enough to earn the tap. Make it a claim, a confession about the industry, or the funniest line in the post. Never a setup that pays off below the fold. Never a question as the opener.
- **Blank line. Then the body**, one idea per line or per two-line paragraph, blank line between. Whitespace is the formatting.
- **The turn** — the joke's payoff, or the one real thing Gil knows that the rest of the post has been circling.
- **A genuine question** at the end, specific enough to answer with a story ("Who's got a worse one?", "What's the check your team actually runs before merging?"). Not "Thoughts?", not "Agree?", not "Comment below 👇" as a demand.
- **Blank line, then hashtags** — 3 to 6, in LinkedIn's `hashtag#Word` format. This is mandatory: `#Word` does not render as clickable when pasted; `hashtag#Word` does. Mix one broad tag (`hashtag#SoftwareEngineering`) with specific ones (`hashtag#NodeJS`, `hashtag#DevHumor`).

### LinkedIn mechanics that actually matter

- **Plain text only.** The composer does not render markdown. No `**bold**`, no `#` headings, no `[text](url)`, no tables, no fenced code blocks. Line breaks and Unicode arrows (`→`) are all the formatting there is. Code, when used, is a bare indented-looking line inside the text.
- **No link in the post body.** Outbound links suppress reach. If the idea points at an article, a repo, or anything with a URL, the post carries the thought and the URL goes in `## First comment`, posted by Gil right after publishing.
- **Emoji: 0 to 2 in the whole post.** One in the hook at most. Never one per line, never as bullet decoration.
- **No "P.S. follow me", no engagement-bait**, no "I'll say the quiet part out loud", no fake vulnerability opener ("I got rejected 47 times and here's what I learned").

---

## Step 4 — Two internal passes (do not show these)

**Humor pass.** Read it back. If nothing in it earns a smirk, it's a memo, not a post — sharpen or replace the weakest line. Specificity is what makes it funny: "the `try/catch` around a `setTimeout` that catches nothing" lands, "error handling is hard" does not.

**Voice pass.** Run the *Final self-check* from `author-voice.md` — triads to zero, colon-lists to zero, at most one em dash, no competence filler, no importance inflation, vary line length. A 90-word post has nowhere to hide a tell.

Fix what fails, silently. Then ship.

---

## Step 5 — Write the file, then print the post

**File:** `content/linkedin-posts/{Title}.md`, where the title is a short human-readable name for the post (spaces and capitals fine — it's a label, never rendered anywhere).

```markdown
---
kind: linkedin-post
shape: <one of Step 2's shapes>
status: ready
---

## Post

<the exact text to paste, hashtags included>

## First comment

<the link + one line of context — omit this whole section if the post has no link>
```

**Then print the post in the chat, inside a fenced code block, ready to paste**, with the first comment in a second block when there is one. One short line before it is allowed (which shape, which file). Nothing after it — no summary of what you wrote, no offer of variants, no posting-time lecture. The user can see the post; they don't need it described back.

For batch runs: one file per post, then the code blocks in sequence, each under its bare title.

---

## Humor & voice notes

Same rules that govern the carousels, because it's the same feed and the same person.

- **Authority over self-deprecation (priority rule).** Gil is building authority. Aim the joke at how most teams get it wrong, at cargo-culted process, at a footgun, at an unreasonable timeline. Never at Gil's own competence. "We've all been paged at 5pm" is fine; anything implying Gil ships sloppy work is not — rewrite it so the sloppiness belongs to "most teams".
- **Punch at shared pain, never at named people or companies.**
- **Specific beats generic**, always. One precise, true detail is worth three general observations.
- **Deadpan over zany.** Understatement carries the joke. No "😂😂", no all-caps.
- **A real war story is a bonus, never a requirement** — and when there is one, it has to be real (Step 0, rule 3).
- Everything else defers to `.agents/skills/_shared/author-voice.md`.
