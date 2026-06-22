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
| `components/Bio.tsx` | Two ready-made bio summaries (`general` + `web3`) | Almost always — fastest grounding; start here |
| `components/Timeline.tsx` | Full work history: every company/project, dates, role, tech, descriptions | Any claim about a specific project, role, date, or what he built |
| `components/Achievements.tsx` | Headline metrics per project | Citing a number (volume, users, devices, GMV) |
| `app/page.tsx` | Technical skills with levels + since-year, contacts, title, career-history narrative | Listing skills/tech, career story, or contact/location/languages |
| `components/LeadershipSection.tsx` | Leadership roles + years | A leadership/management question |
| `components/OtherSection.tsx` | Secondary skills (mobile, design, UX, game/3D) | Those topics come up |
| `app/contentVersion.ts` | Which bio variant the live site currently uses (`general` or `web3`) | Deciding which `Bio.tsx` variant to lean on |

Read the minimum the task needs (often just `Bio.tsx`, plus `Timeline.tsx` when project specifics matter), and open more only when a field demands it.

**Never invent** project names, dates, metrics, roles, employers, or biographical details. If the source doesn't support a claim, leave it out or keep it general — answer honestly at the level the record supports rather than fabricating.
