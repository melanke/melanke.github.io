# Gil's Professional Background — Where to Read It

> **The single index of where Gil's real experience lives** — for any skill that needs to anchor in his projects, roles, skills, metrics, or biography.
> Companion to `author-voice.md`: that file is *how* Gil writes, this one is *where* to read *what* he has done.
> Used by: `gilsay` (job forms, LinkedIn replies, bios), `comment-writer` (grounding a comment in a real project), `content-pipeline` (anchoring an article in real work), and any future skill.

## This file holds NO facts on purpose

Gil edits his portfolio constantly, so any summary copied here would go stale. There is **no cached bio** in this file — only a map of where the real, current information lives. **Always read the source files below at runtime**; never recite experience from memory or from an older version of this file.

The source files are the components of Gil's live portfolio site (gil.solutions). Reading them locally is always in sync with Gil's latest edits — including changes not yet deployed — and gives both bio variants, which the live HTML does not. So read the local source, not the URL.

## Source of truth — read these, never invent

| File | What it holds | Read it when |
|------|---------------|--------------|
| `components/Bio.tsx` | One ready-made bio summary per resume variant (`general`, `web3`, `leader`, `enterprise`, `product`, `webdev`) | Almost always — fastest grounding; start here |
| `content/timeline-items.ts` | Full work history: every company/project, dates, role, tech, descriptions (markdown), plus a `priority` per resume version — 1 means it's a headline item for that version, 2 means it's real but secondary there, 3 means it's real but minor/dated for that version, 4 means it's not part of that version's story at all | Any claim about a specific project, role, date, or what he built — check `priority` before treating something as a flagship example for a given audience; skip anything at 4 for that version |
| `components/Achievements.tsx` | Headline metrics per project | Citing a number (volume, users, devices, GMV) |
| `components/ResumePage.tsx` | Technical skills (name + since-year, no proficiency levels), contacts, title, career-history narrative | Listing skills/tech, career story, or contact/location/languages |
| `lib/technologies.ts` | Canonical tech name + since-year per technology, grouped by category | Confirming the exact name/year for a specific technology |
| `components/OtherSection.tsx` | Secondary skills (mobile, design, UX, game/3D) | Those topics come up |
| `app/contentVersion.ts` | The list of resume variants (`general`, `web3`, `leader`, `enterprise`, `product`, `webdev`) | Deciding which `Bio.tsx` variant / `content/timeline-items.ts` priority to lean on |
| `content/career-gaps.md` | The **negative** record: what Gil has NOT done, what he did long ago and would need to revisit, and what he has but hasn't registered in the CV yet | Before claiming any skill, tool or practice that the portfolio sources do not already support |

**Read `content/career-gaps.md` whenever a task tempts you to fill a gap.** A job
form asking about Spring, an interviewer's question about observability, a comment
that would read better if he had Kubernetes experience — that file says which of
those are real, which are years stale, and which he never touched. Nothing marked
❌ or 🟡 there may be stated as current experience; a 🟡 may be mentioned in the
past tense, with its date, and never in the present.

The variants are the same real history told for different readers: `general` (`/`) leads with backend + AI, `web3` (`/web3`) with protocol work, `leader` (served at `/project-manager`) with delivery management as a Technical Project Manager, `product` (`/product`) with discovery/requirements, `webdev` (`/webdev`) with React/Next/TypeScript as a Senior Full-Stack Engineer, and `enterprise` (`/enterprise`) is backend-first with Web3 framed as integration work and no DeFi/smart-contract vocabulary. Note that `leader` is an internal identifier only — its public title is Technical Project Manager, never "Tech Lead" or "Engineering Manager". When a task targets a specific audience, read the matching variant — never mix the wording of two.

Read the minimum the task needs (often just `Bio.tsx`, plus `content/timeline-items.ts` when project specifics matter), and open more only when a field demands it.

**Never invent** project names, dates, metrics, roles, employers, or biographical details. If the source doesn't support a claim, leave it out or keep it general — answer honestly at the level the record supports rather than fabricating.
