---
name: linkedin-carousel
description: >
  Produces a single humorous LinkedIn carousel post — NOT a blog article. Output is two things: a short, funny LinkedIn caption in Gil's voice, and a set of self-contained image-generation prompts (cover + N content slides) that all share Gil's recognizable carousel house style (fixed frame + the mascot "Mel"). Handles ideation (funny carousel angles) when no topic is given, then spine, slides, caption, and a polish pass. Much shorter and lighter than content-pipeline; no blog, no OG image, no Reddit/Twitter, no cross-links.
  Trigger on: "carrossel", "carousel", "linkedin carousel", "post de carrossel", "slides linkedin", "novo carrossel", "carousel post", "funny carousel", "meme carousel", "swipe post".
---

# LinkedIn Carousel

## CRITICAL: Auto-start on load

Jump straight to **Phase Detection**. Do not summarize this skill or explain what you're about to do. Detect the phase and begin.

## CRITICAL: Always write to the file, never just to the chat

Every artifact — spine, on-slide text, each slide's image prompt, the caption, `status` — is written into `content/carousels/{Title}.md` **as you generate it**, before you present it for review. The chat is for iterating on what's already in the file. A phase isn't done until its output lives in the file.

## This is not a blog post

No article body, no OG image, no Reddit, no Twitter thread, no cross-links to published articles, no `posts/` publishing. Just one LinkedIn carousel: a caption + slide image prompts. Keep everything short and funny. If the user wants a full article, that's `content-pipeline`, not this.

---

## Step 0: Read context

Before anything else, read:

1. `.claude/skills/_shared/carousel-visual-identity.md` — the house style: the frame, palette, and the mascot **Mel**. Every slide prompt embeds the STYLE BLOCK from here (and the MASCOT BLOCK where Mel appears). This file is what makes the series recognizable — do not improvise a look.
2. `.claude/skills/_shared/author-voice.md` — Gil's base voice. It still applies, but this skill dials **humor up**: playful, self-deprecating, dev in-jokes. The anti-LLM-tells rules still hold (no triads, no colon-lists, sparse em dashes) — funny writing breaks those naturally anyway.
3. `.claude/skills/_shared/professional-background.md` — only skim it. Grounding is welcome ("after years of production incidents…") but this skill does **not** require anchoring every slide to a real `timeline-items.ts` project. Generic, relatable dev humor is fine; a real war story is a bonus, never a requirement.

---

## Phase Detection

| Condition | Enter at |
|-----------|----------|
| No topic given, or user asks for ideas | Phase 0: Ideation |
| Topic given, no file in `content/carousels/` yet | Phase 1: Spine & Title |
| File exists, spine present, but slide prompts not written | Phase 2: Slides & Image Prompts |
| Slide prompts written, no `## Caption` filled | Phase 3: Caption |
| Caption written, no `status: ready` | Phase 4: Polish & Ready |
| `status: ready` present | Done — offer tweaks (regenerate a slide, punch up a joke, retitle) |
| User names a phase | Jump there |

After any phase, offer to continue to the next.

---

## File schema (`content/carousels/{Title}.md`)

The filename is the human-readable title (spaces, capitals, punctuation). Frontmatter holds metadata; the body holds the ready-to-paste deliverable.

```markdown
---
kind: linkedin-carousel
aspect-ratio: "4:5"          # portrait 1080x1350; the house default
slide-count: 9               # cover + 8, or whatever the spine lands on
status: ready                # ADD ONLY in Phase 4, when it passes the self-check
---

## Caption

<the ready-to-paste LinkedIn caption — Phase 3>

## Slides

**Slide 0 — Cover**
```
<full image prompt — Phase 2>
```

**Slide 1 — <one-line beat>**
```
<full image prompt — Phase 2>
```

... one block per slide ...
```

> Note: slides are numbered from 0 (the cover) to match the example the user works from, while the **on-slide counter** in each prompt is 1-based (`1/9`, `2/9`, …) because that's what a reader sees. Cover = Slide 0 in the file, `1/9` on the art.

---

## Phase 0 — Ideation (funny carousel angles)

**Goal:** ~12 concrete, *funny* carousel concepts Gil could post.

Good carousel angles are listicle-shaped and pain-recognizable — the reader thinks "oh no, that's me." Draw from Gil's world: backend/Node, TypeScript, AI-assisted dev, LLM agents, smart contracts/Solidity, DeFi, wallets/onboarding, tech-lead pains, estimation, code review.

Angle shapes that work (mix them, don't list one type):
- **"N ways to get wrecked by X"** (the classic — bugs, footguns, incidents)
- **Myth vs reality** ("what the PM thinks X takes / what it actually takes")
- **Stages of grief** (of a prod incident, a migration, an audit)
- **Red flags / green flags** in a codebase, a PR, a job description
- **"Things nobody tells you about X"**
- **Character types** ("the N developers you meet on every team")

Each idea = a punchy working title + one line on the joke + a rough slide count. Present as a numbered list. Ask the user to pick. Then Phase 1.

Every title must be genuinely funny or it doesn't ship — no dry "5 tips for X". If the user gave a topic already, skip this phase.

---

## Phase 1 — Spine & Title

**Inputs:** the topic/angle (from Phase 0 or the user).

Lock two things and write them to the file:

1. **Title** — the carousel's name, used as the filename `content/carousels/{Title}.md` and rendered big on the cover. Punchy and funny, one clear idea. Include the number if it's a listicle ("8 Ways to Get Wrecked by Exceptions in Node.js").
2. **The spine** — the ordered list of beats: the cover, then one line per content slide describing that slide's single idea. Keep each slide to **one** idea. Typical length: cover + 5 to 8 slides. Don't pad past the funny.

**Pick a spine shape that fits the goal (stay flexible — no format is mandatory):**

| Shape | When it fits | Panels per slide |
|-------|--------------|------------------|
| **Listicle** ("N ways to get wrecked by X") | pure relatable pain, humor-forward | 1 |
| **Before / After** | contrasting two eras | 2 |
| **Authority 3-panel** ("Before → How most teams do it ❌ → Do this instead ✅") | when the post must **show expertise**, not just get laughs — the recommended default whenever Gil is teaching, not just venting | 3 |
| **Myth vs reality / Red flags vs green flags** | correcting a belief | 2 |
| **Stages of grief / character types** | narrative humor | 1 |

The **Authority 3-panel** is how you keep humor *and* credibility (see the "Authority vs self-deprecation" rule in Humor & voice notes): the middle panel is where the joke lives — you roast **how most teams get it wrong**, never Gil — and the third panel is Gil showing the right way. Ask which shape the user wants if it's ambiguous; when the topic is one Gil has real authority on, lean 3-panel.

Create the file with frontmatter (`kind`, `aspect-ratio: "4:5"`, `slide-count`, no `status` yet) and a `## Slides` section listing each beat as a `**Slide n — <beat>**` header with the prompt to be filled in Phase 2. Present the spine, let the user cut/reorder/add beats before you write prompts.

---

## Phase 2 — Slides & Image Prompts

For the cover and each slide, produce, in the file, under that slide's header, a **single fully self-contained image prompt** in a fenced block.

Every prompt MUST:
- **Embed the STYLE BLOCK** from `carousel-visual-identity.md` verbatim, with `{{N_OF_TOTAL}}` filled to this slide's 1-based counter (`1/9` … `9/9`; cover is `1/9`).
- **Fill `{{SLIDE_CONTENT}}`** with everything specific to this slide:
  - The **on-slide text spelled out in quotes** so the model renders the exact words (title, labels, any short code lines, the ✅/❌ headers if the joke is code). Keep on-slide text short — carousels are read at a glance.
  - **What Mel is doing** — embed the MASCOT BLOCK design facts, then the action/expression acting out this slide's joke. The joke lives in the situation around Mel, not in restyling Mel.
- Use the **cover treatment** (from the identity file) for Slide 0: big headline, subtitle hook, "swipe →", Mel front and center in the theme's chaos.
- Pass the **anti-generic checklist** at the bottom of the identity file.

Code on a slide is optional — only when the joke *is* code (a footgun vs the fix). When used, keep it 3–6 lines, real, and put the punchline in a comment. When the joke isn't code, Mel + a situation carries the slide; don't force code in.

Write all prompts to the file, then show the user the list. Offer to regenerate any single slide's prompt.

---

## Phase 3 — Caption (the LinkedIn post copy)

Write the caption that sits above the carousel, into `## Caption`. This is the text people read in-feed; the slides are the swipe.

Structure (short — the whole thing is ~120–220 words):
- **Hook line** — funny, ≤20 words, 1 emoji. The pain, stated so the reader feels it.
- **1–2 setup lines** — why this list exists ("after years of prod incidents, I've learned errors don't happen, they *wait*"). Real experience welcome, lightly.
- **"A few personal favorites:"** then **2–4 teaser bullets** (use `→`) pulling the funniest slides — tease the joke, never over-explain it. This is what makes people swipe.
- **Swipe CTA** — "Swipe through." + a shareable nudge ("Tag the teammate whose PR you're reviewing 😏").
- **Engagement question** — a genuine, funny question that invites confessions in the comments ("Which one got you in prod? 👇"). Early comments drive reach.
- Blank line, then **hashtags**: 6–12 tags in LinkedIn's **`hashtag#Word`** format (mandatory — NOT `#Word`; LinkedIn only renders `hashtag#` as clickable when pasted). Mix broad (`hashtag#SoftwareEngineering`) with specific (`hashtag#NodeJS`, `hashtag#DevHumor`).

Voice: Gil, but funnier and looser than a blog post. Self-deprecating, peer-to-peer, in on the joke. Still no marketing language, no LLM tells. Write it, then show it.

---

## Phase 4 — Polish & Ready

Quick self-check (this is a light pass, not the 5-dimension blog score). Confirm each, fix what fails:

1. **Funny?** Cover title lands, at least half the slides earn a smirk. If it reads like dry tips, punch it up.
2. **Caption teases, doesn't spoil.** The favorites bullets make people want to swipe; the payoff is on the slides, not in the caption.
3. **Brand consistency.** Every slide prompt embeds the STYLE BLOCK with the correct `n/N` counter; every Mel slide embeds Mel's design facts. Counters run in order and total matches `slide-count`.
4. **On-slide text is short and quoted** in every prompt so the model renders exact words.
5. **Hashtags** use `hashtag#` format, 6–12, relevant.
6. **Voice check** — run the anti-LLM-tells pass from `author-voice.md` on the caption (triads, colon-lists, em dashes).

When it passes, add `status: ready` to the frontmatter and tell the user. Then remind them of the handoff:
- Generate each slide image from its prompt (paste into the image model in order; the STYLE BLOCK keeps them consistent, but review for drift and regenerate outliers).
- Assemble the images into a PDF/document and post as a LinkedIn **document post**, with the caption from `## Caption`.
- Reply to comments in the first 30–60 minutes — that's what drives carousel reach.

---

## Humor & voice notes

- **Authority over self-deprecation (priority rule).** Gil is building authority — the humor must never cost him credibility. Never make Gil the incompetent one: no "my 4,000-line PR I *think* I understand". Aim the joke at **the common wrong way most teams/devs do it**, and let Gil be the one who shows the right way. Relatable self-deprecation is fine only when it *doesn't* undercut expertise ("we've all been paged at 5pm") — the moment a joke implies Gil ships sloppy work, rewrite it so the sloppiness belongs to "most teams", not him. When in doubt, the Authority 3-panel spine (Before → most teams get it wrong ❌ → do this instead ✅) makes this automatic: joke in the middle panel, expertise in the last.
- **The frame is the brand, the joke is the content.** Keep Mel and the layout fixed; let each slide's *situation* be the gag.
- **Punch at shared pain and at bad practice, not at Gil and not at named people.** Bugs, footguns, cargo-culted process, PMs' timelines — fair game. Gil's own competence, or named individuals/companies — no.
- **Specific beats generic.** "The `try/catch` around a `setTimeout` that catches nothing" is funny because it's true and precise. "Errors are bad" is not.
- **Deadpan over zany.** Mel is calm in the fire. The understatement carries it.
- Everything else defers to `.claude/skills/_shared/author-voice.md`.
