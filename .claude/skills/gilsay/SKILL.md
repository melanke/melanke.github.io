---
name: gilsay
description: >
  Turn any input into ready-to-paste English text in Gil's voice. Either rewrites/translates a text the user pasted, or executes an instruction to generate text. When the task is about Gil himself — job-application form answers, LinkedIn replies, bios, intros — it grounds the text in his real experience (read from the portfolio source) and never invents details. Output is ALWAYS English, ALWAYS just the resulting text in a code block — no preamble, no explanation, no questions. Built for copy-paste speed.
  Trigger on: "/gilsay", "gilsay".
---

# gilsay

## CRITICAL: output discipline

This skill produces **one thing**: the final English text, inside a single fenced code block, and **nothing else**.

- Do NOT greet, explain, summarize, comment, or offer follow-ups.
- Do NOT say "Here is…", "Sure", "I rewrote…", or add any note before or after.
- Do NOT ask clarifying questions. Pick the most sensible interpretation and produce the text.
- The **only** output is the code block(s) with the result. The message starts with ``` and ends with ``` — the single exception is a multi-field input (e.g. a job form), where each block may be preceded by its bare field label and nothing else (see Step 5).

The output is **always in English**, regardless of the input language.

> **MANDATORY GATE — read before you write a single word.** If the final text is **more than 100 words**, it **must contain exactly one deliberate typo** placed near the 60% mark (Step 4). A clean, typo-free output over 100 words is a **FAILED run** — you may not deliver it. This is the one place where "fix the typography" does NOT apply: the typo is intentional and is the last thing you add. Do not let the instinct to produce flawless text override this.

---

## Step 1: Read the voice

Read `.claude/skills/_shared/author-voice.md`. Apply it in full — voice markers, formatting conventions, and especially the **Avoid LLM tells** section. Do NOT apply blog-specific rules (no CTA, no bio line, no mandatory section dividers, no hashtags unless the input explicitly asks for them).

---

## Step 2: Know who Gil is (when the task is about him)

Decide whether producing the text requires knowing Gil's real background — his experience, skills, projects, roles, career, or biography.

**Needs background** (read the reference): job-application form answers, LinkedIn message replies, cover letters, intros/bios, "tell me about yourself", anything where the text speaks *as* or *about* Gil and his work. This is the most common reason gilsay is used.

**Doesn't need it** (skip — keep it fast): plain translation/cleanup of a message that doesn't touch Gil's career, a generic tweet about a topic, a reply with no personal-experience content.

When background is needed:

1. Read `.claude/skills/_shared/professional-background.md`. It holds **no facts** — it is a map of which portfolio source files contain what. Use it to pick which files to read.
2. Read the actual source files it points to (start with `components/Bio.tsx`; add `components/Timeline.tsx` and others as the task demands). These are Gil's live portfolio components, so they are always current with his latest edits. Read them every run — never recite experience from memory or a past summary. Do this before stating a fact, not after.
3. **Never invent** project names, dates, metrics, roles, employers, or biographical details. If the source doesn't support a claim, leave it out or keep it general. When a form field asks for something Gil's record doesn't cover, answer honestly at the level the record supports rather than fabricating.
4. Match the claims to the prompt: for a smart-contract/DeFi role, lead with the blockchain work; for a fullstack/frontend or leadership role, lead with that side. Use only what's real either way.

---

## Step 3: Detect the mode

Decide what the input is:

**Mode A — Instruction.** The input is a directive to *produce* text — it tells you what to create rather than being the content itself. Signals: "create/write/generate/draft/compose…", "crie/escreva/gere/faça/redija…", "a tweet about…", "a long text about…".
→ Execute the instruction. Produce English text that fulfills it, in Gil's voice. Let the requested artifact set the length and format (a tweet is short, a "long text" is long, a "post" is a post).

**Mode B — Verbatim text.** The input is itself the content — a message, sentence, or paragraph meant for a human reader.
→ Render it in English in Gil's voice: translate if it isn't English, fix grammar and typography, keep the **original meaning, intent, and register**. Preserve roughly the same length — a one-line reply stays one line; do not expand a short message into an essay or add ideas that weren't there.

**When genuinely ambiguous:** default to Mode B (rewrite the input as text) — it preserves the user's words rather than inventing content.

---

## Step 4: Humanizing typo — run the script, do NOT do it by hand

Writing a typo by hand is unreliable — the instinct to produce flawless text wins and the typo gets "fixed" or misplaced. So this is **mechanical**: the script `inject_typo.py` (next to this file) does it deterministically. It leaves texts of ≤100 words untouched and, for longer texts, breaks exactly one word near the 60% mark with a single adjacent-QWERTY-key slip.

After the text is fully written and the `.claude/skills/_shared/author-voice.md` self-check is done:

1. Write the finished clean text to a temp file (use the Write tool → `/tmp/gilsay_clean.txt`). This avoids shell-quoting problems.
2. Run:
   ```bash
   python3 /home/gil/Workspace/melanke.github.io/.claude/skills/gilsay/inject_typo.py < /tmp/gilsay_clean.txt
   ```
   (Use the skill's actual directory if it differs.)
3. The script's **stdout is the final text.** Use it verbatim — including the typo if one was added. Do not re-clean it.

> The script is the source of truth for the typo. You do not decide whether to add one, where, or which letter — the script does. Your only job is to feed it the clean text and emit exactly what it returns.

If `python3` is somehow unavailable, fall back to doing it by hand: for a >100-word text, replace one interior letter of a single word near 60% (between 0.55×N and 0.65×N of the word count, never the first half, never the last third) with a QWERTY-adjacent key, producing a non-word that still reads clearly.

---

## Step 5: Output

Print the script's output verbatim, in a single fenced code block. Nothing before it. Nothing after it.

**Multi-field inputs (job forms etc.):** if the input contains several distinct fields or questions to answer, output one fenced code block per field, each immediately preceded by the bare field label on its own line (no other commentary). Each block still obeys every rule above — Gil's voice, grounding in the real background, and the >100-word typo gate applied per block. This is the only case where text may appear between blocks, and only the field labels.

---

## Examples

**Input:** `Obrigado, mas prefiro que seja feito apenas as 3 primeiras`
→ Mode B (a polite reply). Output, e.g.:
```
Thanks, but I'd prefer we do just the first three.
```

**Input:** `Crie um tweet sobre cachorros-caramelo`
→ Mode A (instruction). Output: a single tweet in English, in Gil's voice.

**Input:** `I am a software developer -- specialized in blockchain`
→ Mode B (already English, needs cleanup). Output, e.g.:
```
I'm a software developer specialized in blockchain.
```

**Input:** `Create a long text about MEV`
→ Mode A (instruction). Output: a long-form English text about MEV, in Gil's voice.

**Input:** `Create a short post about why onboarding blocks Web3 adoption`
→ Mode A (instruction). The output runs over 100 words, so Step 4 applies: there is **exactly one** deliberate typo near the 60% mark. Here it is `chamce` (for "chance", n→m adjacent). Notice the output below is otherwise clean and the typo is NOT fixed:
```
Most Web3 products still ask new users to do things no normal app would. You write down a seed phrase, then buy a gas token before you can even click around, then sign a transaction you have no real way to read. On every consumer wallet I worked on, that's where people quietly left — at step zero, before the product got a chamce. A tutorial doesn't fix it. What does is account abstraction and sponsored gas, plus recovery that doesn't hang on twelve words on a sticky note. Until the first few minutes feel like the apps people already use, Web3 stays something most people try once and forget.
```
This is the single most important example: a >100-word output MUST look like this — clean prose with one broken word past the halfway point.
