# AC Grid – Task Tracking

> **Purpose**: Single source of truth for current sprint and site/docs work.  
> **Sync with**: [ROADMAP.md](./ROADMAP.md), [PARITY_MATRIX.md](./rfc/PARITY_MATRIX.md).  
> **Updated**: 2026-06-28

## How to use (including AI / subagent)

1. **Before starting any feature or site work**: Read ROADMAP.md, PARITY_MATRIX.md, and this file.
2. **When picking a task**: Prefer items in "Current focus" and parity gaps marked P0.
3. **When completing a task**: Mark it done here and update ROADMAP + RFC status.
4. **When adding work**: Add under "Current focus" or "Backlog" with a short scope.

---

## Current focus

- [x] ACG-2: AG Grid parity matrix + gap RFCs (0017–0032) in `.spec/rfc/`
- [x] Site rebrand for acgrid.dev (meta, CNAME, hero copy)
- [x] Site redesign: violet theme, Docs (API + guide), Samples by feature
- [ ] Fix site build (tsconfig base / 404)
- [x] RFC-0005 virtual scrolling — row virtualization shipped (`Virtualizer` + Grid + tests)

---

## Parity planning (ACG-2) — Done 2026-06-28

| Deliverable | Path | Status |
|-------------|------|--------|
| AG Grid ↔ AC Grid 对标矩阵 | `.spec/rfc/PARITY_MATRIX.md` | Done |
| Community 缺口 RFC 0017–0019 | `.spec/rfc/0017`–`0019` | Done (draft) |
| Enterprise 对标 RFC 0020–0029 | `.spec/rfc/0020`–`0029` | Done (draft) |
| Stretch RFC 0030–0032 | `.spec/rfc/0030`–`0032` | Done (draft) |
| RFC 索引更新 | `.spec/rfc/README.md` | Done |
| 路线图 Phase 2/3 | `.spec/ROADMAP.md` | Done |
| **RFC → Issue 映射（32 个子 issue）** | `.spec/rfc/ISSUE_REGISTRY.md` | Done 2026-06-29 |

---

## Site & docs (this sprint)

| Task | Status | Notes |
|------|--------|-------|
| TASK_TRACKING.md + ROADMAP sync rule | Done | This file + parity matrix |
| Violet design system | Done | site/design-system/ac-grid/MASTER.md |
| Docs structure | Done | Getting Started, API, Features |
| Site build (tsconfig) | Pending | Resolve extends / 404 |

---

## Backlog (from ROADMAP + PARITY_MATRIX)

### Phase 1 — Community (v0.1.0–v0.5.0)

- v0.1.0: Column resizing (RFC-0004), 100% test coverage, Storybook
- v0.2.0: Virtual scroll (0005), Pagination (0006), Row selection (0007)
- v0.3.0: Pinning (0008), Cell editing (0009)
- v0.4.0: Custom components (0019), Keyboard (0012), a11y (0013), Theme advanced (0011)
- v0.5.0: CSV export (0014), i18n (0015), Framework bindings (0017), State API (0018)

### Phase 2 — Enterprise (v1.1.0–v1.2.0)

- v1.1.0: Tree (0020), Master/Detail (0021), Range selection (0022), Clipboard (0023), Menus (0026)
- v1.1.0: Grouping/aggregation (0010) — moved from v0.3.0 per parity
- v1.2.0: Pivot (0024), Excel advanced (0025), Tool panels (0027), Advanced filter (0028), Charts (0029)

### Phase 3 — Stretch (v2.0.0+)

- Formulas (0030) ✔️ 引擎已完成；SSRM (0031), AI Toolkit (0032)

---

## ROADMAP ↔ Task sync

- **PARITY_MATRIX** = what AG Grid has vs what we plan.
- **ROADMAP** = version scope, RFC links, release dates.
- **TASK_TRACKING** = concrete next steps and site/docs chores.
