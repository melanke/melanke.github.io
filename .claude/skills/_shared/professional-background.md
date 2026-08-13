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
| `components/Bio.tsx` | Four ready-made bio summaries (`general`, `web3`, `leader`, `enterprise`) | Almost always — fastest grounding; start here |
| `content/timeline-items.ts` | Full work history: every company/project, dates, role, tech, descriptions (markdown), plus a `priority` per resume version — 1 means it's a headline item for that version, 2 means it's real but secondary there, 3 means it's real but minor/dated for that version, 4 means it's not part of that version's story at all | Any claim about a specific project, role, date, or what he built — check `priority` before treating something as a flagship example for a given audience; skip anything at 4 for that version |
| `components/Achievements.tsx` | Headline metrics per project | Citing a number (volume, users, devices, GMV) |
| `components/ResumePage.tsx` | Technical skills (name + since-year, no proficiency levels), contacts, title, career-history narrative | Listing skills/tech, career story, or contact/location/languages |
| `lib/technologies.ts` | Canonical tech name + since-year per technology, grouped by category | Confirming the exact name/year for a specific technology |
| `components/OtherSection.tsx` | Secondary skills (mobile, design, UX, game/3D) | Those topics come up |
| `app/contentVersion.ts` | The list of resume variants (`general`, `web3`, `leader`, `enterprise`, `product`) | Deciding which `Bio.tsx` variant / `content/timeline-items.ts` priority to lean on |

The variants are the same real history told for different readers: `general` (`/`) leads with backend + AI, `web3` (`/web3`) with protocol work, `leader` (`/leader`) with management, `product` (`/product`) with discovery/requirements, and `enterprise` (`/enterprise`) is backend-first with Web3 framed as integration work and no DeFi/smart-contract vocabulary. When a task targets a specific audience, read the matching variant — never mix the wording of two.

Read the minimum the task needs (often just `Bio.tsx`, plus `content/timeline-items.ts` when project specifics matter), and open more only when a field demands it.

**Never invent** project names, dates, metrics, roles, employers, or biographical details. If the source doesn't support a claim, leave it out or keep it general — answer honestly at the level the record supports rather than fabricating.
