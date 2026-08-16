# RFC-0010 Kickoff Brief (execution) — 分组和聚合

Follow the RFC spec at `.spec/rfc/0010-grouping-aggregation.md` verbatim for
API shape, targets and acceptance. This brief only pins the execution plan.

## Pipeline context

- Issue: ACG-21 (this issue). Tracked in Multica; registry row = RFC-0010, stage 4 (v0.3.0).
- All three source-of-truth rules apply — see the `multica-orca` skill
  (git PR merged → Multica done → ISSUE_REGISTRY writeback; PR is open ⇒ in_review).
- Do NOT touch ISSUE_REGISTRY.md / ROADMAP.md / TASK_TRACKING.md or Multica
  status until the PR is actually merged.

## Scope — non-negotiable

Only what RFC-0010 asks. No refactors, no speculative API surface, no extra
features. Tests are part of the deliverable (unit tests per RFC test section).
Targets: grouping compute < 100ms @10K rows, expand/collapse < 16ms.

## Execution mode — SINGLE OWNER, serial phases

This feature is one package (`packages/ac-grid-react`), one Grid component,
one shared row-model pipeline. The three RFC phases touch overlapping files:

1. 基础分组 — `getGroupedRowModel` + group-row rendering + grouping state
2. 展开/折叠 — `getExpandedRowModel` + expand/collapse UI + state
3. 聚合 — aggregation fns (sum/avg/count/min/max/custom) + aggregate display in group rows

→ Work serially in ONE worktree (Orca if available, else local branch).
→ Do NOT spawn parallel worktrees for these phases — they share Grid.tsx ,
   row renderers, and the table-core pipeline; parallel work would collide.
→ Ship ONE PR that closes this issue (`Closes ACG-21`), then update status
   to in_review. The coordinator handles merge → done → registry writeback.

## Deliverable checklist

- [ ] Phase 1: grouping works (single + multi column per RFC)
- [ ] Phase 2: expand/collapse + expandAll/collapseAll + toggleGroup
- [ ] Phase 3: aggregation fn per column + display in group rows
- [ ] Unit tests: single/multi grouping, expand/collapse, all aggregation fns
- [ ] Storybook demo for grouping & aggregation
- [ ] Update affected package version / CHANGELOG if the repo convention requires it
- [ ] PR body: title prefix `feat(grouping)`, body closes `ACG-21`
