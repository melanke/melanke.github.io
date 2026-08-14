# Gil's Carousel Visual Identity — House Style

> **Single source of truth for the look of Gil's LinkedIn carousels.**
> The goal is *recognizability*: someone scrolling LinkedIn should know it's one of Gil's carousels from the art alone, before reading a word. That only happens if every slide, across every carousel, shares the same frame, palette, typography, and mascot.
>
> **Image models have no memory between generations.** Writing "same style as the previous slide" is not enough — each slide is generated cold. So **every** slide prompt must embed the full STYLE BLOCK below verbatim, and every slide where the mascot appears must embed the full MASCOT BLOCK too. Update the identity HERE; the `linkedin-carousel` skill pulls from this file.

This is the **default** house style. A given carousel may tune an accent color or swap a motif, but the frame + typography + mascot stay fixed — that consistency *is* the brand.

---

## The three pillars of recognizability

1. **The frame** — same container on every slide (background, border, header tag, slide counter). This is the strongest recognizability cue because it's identical on all 9+ slides.
2. **The mascot (Mel)** — a fixed, precisely-specified character that reappears acting out each slide's scenario. Same body, same glasses, same mustache, same hoodie, every time.
3. **The palette + line style** — a narrow, fixed color set and a clean flat-vector look with a light "hand-drawn" wobble so it reads as illustration, not stock art.

---

## STYLE BLOCK (paste into EVERY slide prompt, verbatim)

> Copy this whole block into every image prompt. It defines the frame, palette, and rendering style so all slides match. Fill the two `{{...}}` slots per slide.

```
STYLE: A LinkedIn carousel slide in "Gil's dev-humor" house style. Portrait 4:5 aspect ratio (1080x1350). Flat vector cartoon illustration with a subtle hand-drawn wobble to the linework — clean but not sterile, never 3D, never photographic, no stock-photo people. A near-black code-editor charcoal (#0D1117) background fills the entire 1080x1350 frame. Inset from the frame edges by a small even margin on all four sides sits ONE large rounded-corner panel (#161B22) with a 2px electric-blue (#4C8EFF) border and a soft outer glow. That panel is the container for EVERYTHING on the slide: the header, the slide counter, every heading, every code block and the whole illustration all sit INSIDE the blue border, with comfortable padding between the border and the content. No element is ever placed outside the blue border, out in the surrounding margin, or overlapping the border line itself. Inside the panel, tucked just below its top border at the top-LEFT, sits the header, composed of exactly two elements in this strict left-to-right order: FIRST a bright electric-blue (#4C8EFF) semicolon ";" logo mark, THEN immediately to its right the small monospace tag "gil.solutions" in muted grey. The semicolon always sits to the LEFT of the words and never after them; the header reads "; gil.solutions" and never "gil.solutions ;". Inside that same panel, tucked just below its top border at the top-RIGHT and sitting on the same horizontal line as the header, a small monospace slide counter "{{N_OF_TOTAL}}". All text is monospace (JetBrains Mono / Fira Code look), off-white (#E6EDF3). Accent palette, used sparingly and consistently: electric blue (#4C8EFF) for structure/highlights, emerald (#3FB950) for the good/✅ path, coral red (#FF6B6B) for the bad/❌ path, warm amber (#F0B429) for emphasis pops. High contrast, generous negative space, bold and legible at phone size. CONTENT: {{SLIDE_CONTENT}}
```

- `{{N_OF_TOTAL}}` → this slide's counter, e.g. `1/9`, `2/9` … cover is `1/9`.
- `{{SLIDE_CONTENT}}` → everything specific to this slide: the on-slide text/title, any code or labels, and what Mel is doing (from the MASCOT BLOCK when Mel appears).

---

## MASCOT BLOCK — "Mel" (paste whenever Mel appears in a slide)

> Mel is the recurring character. Keep the design **identical** every time — that repetition is what makes the series recognizable. Embed this description (you may compress wording, never the design facts) inside `{{SLIDE_CONTENT}}`, then add what Mel is *doing* on this slide.

```
Mel is a small, rounded, pale turquoise (#9FD8D2) blob-shaped creature about one-and-a-half heads tall, with simple stubby arms and legs and four-fingered mitten hands. Mel is completely BALD: no hair, no cowlick, no tuft, no strands and no stubble of any kind. The bald head is filled with exactly the same FLAT MATTE pale turquoise as the rest of the body, as one single area of solid color. There is no shine on the scalp whatsoever: no glossy highlight, no white specular dot or streak, no sheen, no gradient, no shading blob, no reflection and no rim light on the head. The scalp is as matte and as flat as Mel's hands. Mel always wears big round matte-black glasses (two perfect circles joined by a bridge) with two tiny dot pupils, and an oversized charcoal hoodie (#2D333B) with a tiny electric-blue semicolon ";" on the chest. Mel's only facial hair is a single thick mustache in dark slate grey (#39404A) sitting on the upper lip, drawn as one solid dark shape with real bulk that stands proud of the face, the boldest feature after the glasses. Apart from that mustache Mel is completely CLEAN-SHAVEN: no beard, no goatee, no chin patch, no soul patch, no stubble and no sideburns. The jawline, chin and cheeks are smooth bare pale turquoise with nothing drawn on them at all. Mel's mouth sits visible in the clear open space just below the mustache. Mel is deadpan and unbothered by default, calm even in chaos ("this is fine" energy), and shows emotion mainly through the eyebrows above the glasses and that visible mouth.
```

**Rules for Mel:**
- Mel is the constant; the *situation* around Mel is the joke. Let Mel react to the disaster (calm, smug, exhausted, betrayed) rather than redesigning the character.
- One Mel per slide as a rule. Crowds of Mels only for a deliberate gag.
- Mel can hold props, wear one prop accessory (a firefighter helmet, a fishing rod), sit at a laptop, run, etc. — but body, glasses, mustache, hoodie, semicolon stay fixed.
- **Describe geometry, never analogy.** Every drift we've hit came from naming a shape instead of building it. "A curl of hair" let the model pick a solid C or a thin spiral; "beside it" never said which side; "the slide sits inside a panel" never said what contained what. When adding or changing a design fact, state origin, size relative to something else, direction, weight, and what it must NEVER look like. A comparison to a real-world object is fine as a label, but it never replaces the geometry.
- If a carousel truly needs a different protagonist, keep the frame + palette identical so the series still reads as Gil's — but prefer Mel.

---

## Recurring motifs (optional seasoning, keep sparse)

Reuse these across carousels so they become signatures — never all at once:
- Small red popup rectangles with a tiny ❌ and squiggle "error" text, piling up.
- Tiny cartoon bombs with lit fuses, calm and cute, not dramatic.
- Little floating monospace labels pointing at things (e.g. a tag reading `try/catch` on a net).
- The electric-blue semicolon `;` logo hidden somewhere as a stamp.
- A mug of coffee near Mel.

---

## Cover slide — extra treatment

The cover (`1/N`) is the feed thumbnail; it works harder than the rest:
- Large, bold headline text center/top — the carousel's title in punchy monospace, one accent word colored (amber or coral).
- A short subtitle line under it (the hook, ≤7 words, may include one emoji).
- Mel front-and-center acting out the theme, surrounded by the relevant chaos (error popups / bombs / fire).
- Bottom-right: a "swipe →" hint plus the `1/N` counter.
- Same frame, palette, and Mel as every other slide — just bolder and more graphic.

---

## Anti-generic checklist (run on every prompt before saving)

- [ ] STYLE BLOCK embedded verbatim, with the `{{N_OF_TOTAL}}` counter filled and correct.
- [ ] Aspect ratio stated explicitly ("Portrait 4:5") — image models drop it otherwise.
- [ ] If Mel is in the slide, the full MASCOT BLOCK design facts are embedded (not "the mascot from before").
- [ ] The on-slide text is spelled out literally in the prompt, in quotes, so the model renders the exact words.
- [ ] The joke is in the *situation around Mel*, not in restyling the character.
- [ ] Palette limited to the house colors — no rogue gradients, neon cyberpunk, or gratuitous colors.
