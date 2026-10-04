# AC Grid – Task Tracking

> **Purpose**: Single source of truth for current sprint and site/docs work.  
> **Sync with**: [ROADMAP.md](./ROADMAP.md), [PARITY_MATRIX.md](./rfc/PARITY_MATRIX.md).  
> **Updated**: 2026-08-16

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
- [x] RFC-0019 custom components — PR #16 merged (ACG-13 done)
- [x] Horizontal scroll sync (header/body) — PR #17 merged (ACG-118 done)
- [x] RFC-0019 custom components — PR #16 merged (ACG-13 done)
- [ ] v0.3.0: Grouping/aggregation (0010) — 收尾缺口 (10-14天)
- [x] v0.4.0: Theme advanced (0011) — 已完成 (ACG-14)
- [ ] v0.4.0: Keyboard (0012) / a11y (0013)

---

## Parity planning (ACG-2) — Done 2026-06-28

| Deliverable                           | Path                          | Status          |
| ------------------------------------- | ----------------------------- | --------------- |
| AG Grid ↔ AC Grid 对标矩阵            | `.spec/rfc/PARITY_MATRIX.md`  | Done            |
| Community 缺口 RFC 0017–0019          | `.spec/rfc/0017`–`0019`       | Done (draft)    |
| Enterprise 对标 RFC 0020–0029         | `.spec/rfc/0020`–`0029`       | Done (draft)    |
| Stretch RFC 0030–0032                 | `.spec/rfc/0030`–`0032`       | Done (draft)    |
| RFC 索引更新                          | `.spec/rfc/README.md`         | Done            |
| 路线图 Phase 2/3                      | `.spec/ROADMAP.md`            | Done            |
| **RFC → Issue 映射（32 个子 issue）** | `.spec/rfc/ISSUE_REGISTRY.md` | Done 2026-06-29 |

---

## Site & docs (this sprint)

| Task                                 | Status  | Notes                                |
| ------------------------------------ | ------- | ------------------------------------ |
| TASK_TRACKING.md + ROADMAP sync rule | Done    | This file + parity matrix            |
| Violet design system                 | Done    | site/design-system/ac-grid/MASTER.md |
| Docs structure                       | Done    | Getting Started, API, Features       |
| Site build (tsconfig)                | Pending | Resolve extends / 404                |

---

## Backlog (from ROADMAP + PARITY_MATRIX)

### Phase 1 — Community (v0.1.0–v0.5.0)

- v0.1.0: Column resizing (RFC-0004), 100% test coverage, Storybook
- v0.2.0: Virtual scroll (0005), Pagination (0006), Row selection (0007)
- v0.3.0: Pinning (0008) ✅, Cell editing (0009) ✅, Grouping/aggregation (0010) — remaining
- v0.4.0: Custom components (0019) ✅, Theme advanced (0011) ✅, Keyboard (0012), a11y (0013)
- v0.5.0: CSV export (0014), i18n (0015), Framework bindings (0017), State API (0018)

### Phase 2 — Enterprise (v1.1.0–v1.2.0)

- v1.1.0: Tree (0020), Master/Detail (0021), Range selection (0022), Clipboard (0023), Menus (0026)
- v1.2.0: Pivot (0024), Excel advanced (0025), Tool panels (0027), Advanced filter (0028), Charts (0029)

### Phase 3 — Stretch (v2.0.0+)

- Formulas (0030) ✔️ 引擎已完成；SSRM (0031), AI Toolkit (0032)

## ROADMAP ↔ Task sync

- **PARITY_MATRIX** = what AG Grid has vs what we plan.
- **ROADMAP** = version scope, RFC links, release dates.
- **TASK_TRACKING** = concrete next steps and site/docs chores.

## Active

- [ ] Track RFC 0001: AC Grid architecture (RFC 0001)
- [ ] Track RFC 0010: Grouping and aggregation (RFC 0010)
- [x] Track RFC 0011: Theme system (RFC 0011)
- [ ] Track RFC 0012: Keyboard navigation (RFC 0012)
- [ ] Track RFC 0013: Accessibility (RFC 0013)
- [ ] Track RFC 0014: Data export (RFC 0014)
- [ ] Track RFC 0015: Internationalization (RFC 0015)
- [ ] Track RFC 0016: Theme system architecture (RFC 0016)
- [ ] Track RFC 0017: Framework bindings (RFC 0017)
- [ ] Track RFC 0018: Grid state API (RFC 0018)
- [ ] Track RFC 0020: Tree data (RFC 0020)
- [ ] Track RFC 0021: Master/detail (RFC 0021)
- [ ] Track RFC 0022: Range selection (RFC 0022)
- [ ] Track RFC 0024: Pivot mode (RFC 0024)
- [ ] Track RFC 0025: Advanced Excel export (RFC 0025)
- [ ] Track RFC 0026: Context and column menus (RFC 0026)
- [ ] Track RFC 0027: Tool panels and status bar (RFC 0027)
- [ ] Track RFC 0028: Advanced filtering (RFC 0028)
- [ ] Track RFC 0029: Integrated charts (RFC 0029)
- [ ] Track RFC 0031: Server-side row model (RFC 0031)
- [ ] Track RFC 0032: AI toolkit (RFC 0032)

## Done
- [x] Track RFC 0002: Sorting (RFC 0002)
- [x] Track RFC 0003: Filtering (RFC 0003)
- [x] Track RFC 0004: Column resizing (RFC 0004)
- [x] Track RFC 0005: Virtual scrolling (RFC 0005)
- [x] Track RFC 0006: Pagination (RFC 0006)
- [x] Track RFC 0007: Row selection (RFC 0007)
- [x] Track RFC 0008: Column pinning (RFC 0008)
- [x] Track RFC 0009: Cell editing (RFC 0009)
- [x] Track RFC 0019: Custom components (RFC 0019)
- [x] Implement RFC 0023: Clipboard operations (ACG-25) (RFC 0023)
- [x] Track RFC 0030: Formulas (RFC 0030)

---
