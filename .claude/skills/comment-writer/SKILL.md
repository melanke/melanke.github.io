---
name: comment-writer
description: >
  Write comments on third-party posts (LinkedIn, Twitter/X) in Gil's voice. Adds genuine value to the conversation, reflects real expertise, and organically references Gil's published articles when relevant. Never sycophantic, never spam.
  Trigger on: "comentar post", "comment on this", "escrever comentário", "responder post", "comment writer", "comentário linkedin", "comentário twitter", "reply to this post".
---

# Comment Writer

## CRITICAL: Auto-start on load

Jump immediately to Step 1. Do not explain this skill.

---

## Step 1: Gather inputs

Ask the user (AskUserQuestion):
1. **Platform:** LinkedIn or Twitter/X
2. **The post:** paste the third-party post content

Then optionally:
3. **Reference post:** which of Gil's articles to mention (or let the skill decide)

---

## Step 2: Read published articles

Read the Published Articles Cache from `content-pipeline/SKILL.md` (the table at the end of that file).

Identify articles that have **genuine topical overlap** with the third-party post — not just keyword match, but real conceptual connection.

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

---

## Step 4: Write the comment

### Rules (always apply)

- **Never start with:** "Great post!", "Loved this!", "Such an insightful piece!", "Well said!", or any variant
- **First sentence:** a concrete perspective, additional data point, or experience from Gil's real projects — something that adds to the conversation
- **Body:** 1 substantive point grounded in real experience (from author-profile.md projects)
- **Reference (if applicable):** mention organically — "I wrote about this recently in [title]…" or "This connects to something I explored in [title]…" — never "Check out my post at [URL]"
- **Close:** a genuine question or invitation to continue the conversation — never a CTA to visit his website or follow him

### LinkedIn comment format

2–4 short paragraphs. Conversational but professional. No bullet lists. No headers. No hashtags.

Target: 60–120 words.

### Twitter/X reply format

1–2 sentences. Punchy. Direct. No hashtags in the reply body. If referencing an article, just the title — no URL (let them search or ask).

Target: ≤200 characters (leave room for conversation).

---

## Step 5: Output

Present the comment in a code block (ready to copy-paste). Then briefly explain (1 sentence) whether and why you referenced a Gil article (or why you chose not to).

Offer to generate an alternative version if the user wants a different angle.

---

## Gil's Voice (apply to all comments)

Pulled from `content-pipeline/SKILL.md` voice section:
- Practitioner, not theorist — ground every point in something real
- First person, concrete, humble
- Honest about trade-offs — if the post is wrong or incomplete, say so respectfully
- Generous, curious — close with a question that invites dialogue
- No marketing language, no hype, no adjective inflation
