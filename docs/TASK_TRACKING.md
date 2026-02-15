# AC Grid – Task Tracking

> **Purpose**: Single source of truth for current sprint and site/docs work.  
> **Sync with**: [ROADMAP.md](./ROADMAP.md) (version milestones, RFCs).  
> **Updated**: 2026-02-15

## How to use (including AI / subagent)

1. **Before starting any feature or site work**: Read ROADMAP.md (relevant version slice) and this file.
2. **When picking a task**: Prefer items in "Current focus" and "Site & docs".
3. **When completing a task**: Mark it done here and, if it maps to ROADMAP, ensure ROADMAP checklist is updated.
4. **When adding work**: Add under "Current focus" or "Backlog" with a short scope.

---

## Current focus

- [x] Site rebrand for acgrid.dev (meta, CNAME, hero copy)
- [x] Site redesign: violet theme, Docs (API + guide), Samples by feature
- [x] Remove unrelated content (WSXJS-only docs) from site
- [ ] Fix site build (tsconfig base / 404)

---

## Site & docs (this sprint)

| Task | Status | Notes |
|------|--------|-------|
| TASK_TRACKING.md + ROADMAP sync rule | Done | This file + .cursor/rules/roadmap-and-tasks.mdc |
| Violet design system (ui-ux-pro-max) | Done | site/design-system/ac-grid/MASTER.md + pages/site.md |
| Apply violet theme to site (CSS vars, fonts) | Done | main.css :root, index.html fonts |
| Docs structure: Getting Started, API, Features | Done | Getting Started AC Grid, Features links, API/RFCs GitHub |
| Samples: Basic, Sorting, Filtering, Theming | Done | ExamplesSection with 4 demos |
| Remove WSXJS-only docs from site/public/docs | Done | Kept guide/features + essentials/getting-started (AC Grid) |
| Nav: Home, Docs, Samples | Done | App.wsx |
| Site build (tsconfig) | Pending | Resolve extends / 404 |

---

## Backlog (from ROADMAP)

- v0.1.0: Column resizing (RFC-0004), 100% test coverage, Storybook
- v0.2.0: Virtual scroll (0005), Pagination (0006), Row selection (0007)
- v0.3.0: Pinning (0008), Cell editing (0009), Grouping (0010)

---

## ROADMAP ↔ Task sync

- **ROADMAP** = version scope, RFC links, release dates.
- **TASK_TRACKING** = concrete next steps and site/docs chores.
- When a ROADMAP checklist item is completed (e.g. "发布 v0.0.2"), mark the corresponding work here and in ROADMAP.
