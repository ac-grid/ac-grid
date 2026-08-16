---
name: multica-orca
description: "Use when working on a Multica issue (ACG-N / MUL-N) for a repo that ALSO tracks RFCs in .spec/rfc/ISSUE_REGISTRY.md — the ac-grid pipeline. Teaches the agent how to run the full loop end-to-end while keeping the three state sources consistent: Multica issue status ↔ Orca worktree card status ↔ ISSUE_REGISTRY.md. Covers which CLI to use when (multica for issue truth, orca for worktree/orchestration), the sync direction (git PR merge → Multica status → registry writeback), status mapping between Orca workspace-status and Multica issue status, and the side-effect warnings (status changes enqueue agents, mentions trigger runs). Use when: starting work on an RFC issue, opening/closing a worktree for an issue, linking a PR, marking an issue done, or syncing ISSUE_REGISTRY."
---

# Multica + Orca: Consistency Workflow

This project runs an RFC → Multica → Orca → GitHub pipeline. Keeping it
consistent means treating three state sources as one logical state and
knowing who updates what, in which order.

## The three state sources

| Source | Role | Truth for | Update by |
|--------|------|-----------|-----------|
| **Git / GitHub PR** | fact | "is it merged?" | agent (commit, PR, merge) |
| **Multica issue** (`multica`) | tracker | status, assignee, comments, pipeline metadata | agent via `multica` CLI |
| **`.spec/rfc/ISSUE_REGISTRY.md`** | mirror | RFC→issue map, stage, registry "done" count | agent, after Multica update |

**Sync direction (never reverse):**

```
RFC doc (Draft→Approved)  ──create/import──▶  Multica issue (backlog→todo→done)
Multica issue (todo)      ──pick up──▶         Orca worktree (goes in-progress)
Orca worktree (done)      ──PR merged──▶       Multica issue --status done
Multica issue (done)      ──writeback──▶       ISSUE_REGISTRY.md row + sync header
```

Status in the registry must never move before Multica; Multica must never move
before the PR is actually merged. If a PR is open, the issue is `in_review`,
not `done`.

## Start safely (both CLIs)

```bash
multica version && multica auth status          # logged in? workspace set?
orca status --json                              # Orca runtime up? (open with `orca open` if not)
```

Then orient on the current state of all three sources for the issue you are
about to touch:

```bash
multica issue get ACG-13 --output json          # Multica truth (status, assignee, metadata)
multica issue pull-requests ACG-13 --output json
multica issue metadata list ACG-13 --output json
git log --oneline -5 -- .spec/rfc/ISSUE_REGISTRY.md   # last registry sync
```

Confirm no drift before writing anything: registry status should match Multica
status for that row. If they differ, report the drift and reconcile Multica
first (Multica is the tracker of record).

## The full loop, per RFC issue

### 1. Start work (backlog/todo → Orca worktree)

```bash
# create the worktree with the issue as payload; --no-parent for independent work
orca worktree create --name acg-13-custom-components --no-parent --agent codex \
  --prompt "<RFC-0019 brief: implement custom components, see ACG-13>" --json
```

- Use `--agent <id>` + `--prompt` for agent-first create; the create response
  contains `startupTerminal.handle` — use that single handle throughout.
- For supervised multi-agent work (multiple tasks, DAGs, decision gates) use
  **orchestration** instead: `orca orchestration run-create` → `task-create` →
  `dispatch --task <tid> --to <handle> --inject`.

### 2. Progress visibility (keep three sources in sync as you work)

Orca card status ↔ Multica issue status are isomorphic. Update both at
meaningful checkpoints:

```bash
# Orca side (cheap, local, do often)
orca worktree set --worktree active --comment "cell editing impl done; running tests" --json
orca worktree set --worktree active --workspace-status in-review --json
```

| Orca `--workspace-status` | Multica `issue status` | When |
|---------------------------|------------------------|------|
| todo | backlog / todo | not started |
| in-progress | in_progress | agent actively working |
| in-review | in_review | PR open / awaiting review |
| completed | done | PR merged, then sync |

Only promote Multica to `in_progress` / `in_review` explicitly; do not spam
status writes — they are side-effecting (see Warnings).

### 3. Link the PR

Include the routable issue key in the PR title/body/branch so Multica links it:

```text
feat(core): RFC-0019 custom components (ACG-13)
```

Read linked PR state from Multica, never guess from GitHub:

```bash
multica issue pull-requests ACG-13 --output json
```

Record pipeline facts as issue metadata (durable state, not a log):

```bash
multica issue metadata set ACG-13 --key pipeline_status --value waiting_review
multica issue metadata set ACG-13 --key pr_number --value 16
multica issue metadata set ACG-13 --key pr_url --value https://github.com/ac-grid/ac-grid/pull/16
```

### 4. Merge → close the loop (the usual drift point)

After the PR merges, in order:

```bash
# 1. Multica: promote to done + record the merge
multica issue status ACG-13 done
multica issue comment add ACG-13 --content-file ./note.md   # "merged via PR #16"
# (write comment bodies to a file first — never inline with backticks/$())

# 2. Registry: update the row AND the sync header
#    Edit .spec/rfc/ISSUE_REGISTRY.md:
#      row:  | 0019 | Custom components | [ACG-13](...) | done | 5 |
#      header: > **Synced**: 2026-08-16 (Multica pipeline — ACG-13 done)

# 3. Commit the writeback as a chore(spec) commit
git add .spec/rfc/ISSUE_REGISTRY.md && git commit -m "chore(spec): mark ACG-13 done in ISSUE_REGISTRY"
```

If the PR is still open, stop at `in_review` — never mark done pre-merge.

## Subtask / sub-issue pattern

For ordered multi-step work (design → build → test), use Multica sub-issues
with stages, later steps on `backlog` so they do not enqueue:

```bash
multica issue create --title "Research" --parent <id> --assignee <agent> --stage 1 --status todo
multica issue create --title "Build"   --parent <id> --assignee <agent> --stage 2 --status backlog
multica issue children <id> --output json
```

## Orca-native parallel execution (the ac-grid way)

This repo uses **Orca** for parallel work — not OpenClaw, not any marketplace
"worktree" skill. Orca already provides both isolation (worktrees) and
supervision (orchestration) natively. Pick the level by how much the subtasks
depend on each other:

### Level 1 — independent modules → parallel worktrees

Split a large RFC into independent modules and give each its own worktree.
Each worker owns its module end-to-end and ships its own PR:

```bash
# coordinator (the Multica-assigned agent) does the split:
orca worktree create --name <rfc>-<module-a> --no-parent --agent codex \
  --prompt "<RFC-0010 module A brief: what, where, acceptance>" --json
orca worktree create --name <rfc>-<module-b> --no-parent --agent claude \
  --prompt "<module B brief>" --json
```

- Use `--no-parent` + `--agent <id>` + `--prompt` → agent-first create, fully
  independent. The create response carries `startupTerminal.handle`.
- Independent modules must NOT touch the same files or tests. If they share
  interfaces, that interface must already exist or be serialized first.
- Each worker pushes its own branch + PR on completion — no coordinator merge.

### Level 2 — coordinated subtasks → Orca orchestration (supervised DAG)

When subtasks share state, must land in order, or need question/answer loops,
use supervised orchestration from ONE coordinator worktree:

```bash
orca orchestration run-create --objective "<RFC-0010 brief>" --json
orca orchestration task-create --run <run_id> --title "impl core" --agent codex --json
orca orchestration dispatch --task <task_id> --to <handle> --inject --json
orca orchestration check --wait --types worker_done,escalation,question --timeout-ms 300000 --json
```

- The coordinator owns the DAG, answers `ask` questions via
  `orca orchestration reply --id <msg_id> --body ...`, and waits for
  `worker_done` before dispatching the next dependent task.
- Long coding tasks run 15-60 min — treat `check --wait` timeout as a
  checkpoint, not failure.
- Heartbeats/terminal activity = alive, not done. Never kill a worker on
  impatience.

### Level 3 — single-owner handoff (no supervision)

For work that is really just "hand this to one agent, done", use a full
handoff, NOT orchestration:

```bash
orca worktree create --name <task> --no-parent --agent codex --prompt "<brief>" --json
```

Then stop monitoring. Orchestration adds tracking state nobody asked for.

### Decision rule — hybrid, not binary

Real RFCs use BOTH styles, keyed on coupling between subtasks:

1. **Freeze contracts first (serial, coordinator).** Any interface between
   modules (types, data model, wire format, migration, component API) must be
   committed to a shared branch BEFORE workers start — implementers then only
   READ the frozen contract and touch disjoint files. One short serial step
   unblocks a whole parallel phase; without it, parallel worktrees collide.
2. **Parallel worktrees (Level 1) for independent modules.** Once contracts
   are frozen: one `--no-parent` worktree per module, own agent, own PR.
3. **Orchestration (Level 2) for the seams and gates.** Cross-module ordering
   (module B needs module A's runtime output), integration/merge, review
   escalations, and any Q&A run in ONE supervised DAG on a coordinator.
4. **Handoff (Level 3) only for fire-and-forget, single-owner pieces** — never
   wrap those in orchestration state nobody asked for.

| Coupling between subtasks | Use |
|---------------------------|-----|
| disjoint files, contract already committed | parallel worktrees |
| shared interface, NOT yet frozen | freeze contract (serial), then parallel |
| B needs A's runtime output / strict ordering | orchestration gate |
| Q&A / decision escalations expected | orchestration (ask/reply) |
| single owner, no supervision | handoff |

All three levels report into the SAME Multica issue: coordinator notes each
worktree/PR in issue comments, sets metadata (`pr_number` per PR), and the
loop closes when all PRs merge → `done` → registry writeback.

## Warnings — side effects

- **Status changes are not cosmetic.** Promoting backlog→todo/in_progress can
  enqueue the assigned agent. `done`/`cancelled` are terminal.
- **Mentions trigger runs.** `[agent](mention://agent/<id>)` enqueues the agent;
  `member`/`issue` mentions are harmless links. Never re-mention to thank —
  that can start a loop. Look up real UUIDs before constructing mentions.
- **Writes require consent.** If the user did not clearly ask for the write
  (status change, comment, assignment, create), ask first. Read-only
  investigation is always safe.
- **PRs auto-close only with intent:** `Closes ACG-13` / `Fixes` / `Resolves`
  in the PR body.

## CLI boundary cheat-sheet

| Need | Command |
|------|---------|
| Multica issue truth | `multica issue get <id> --output json` |
| Multica issue list | `multica issue list [--status s] [--project id] [--limit N] --output json` |
| Link/read PRs | `multica issue pull-requests <id> --output json` |
| Status | `multica issue status <id> <backlog\|todo\|in_progress\|in_review\|done\|blocked\|cancelled>` |
| Comment | `multica issue comment add <id> --parent <cid> --content-file ./f.md` |
| Metadata | `multica issue metadata set <id> --key k --value v` |
| Orca worktree | `orca worktree create --name <n> --no-parent --agent <id> --prompt "<...>" --json` |
| Orca card status | `orca worktree set --worktree active --workspace-status <todo\|in-progress\|in-review\|completed> --json` |
| Orca comment/status note | `orca worktree set --worktree active --comment "<short note>" --json` |
| Orca supervised multi-agent | `orca orchestration run-create` → `task-create` → `dispatch --inject` → `check --wait` |
| Orca parallel (independent) | `orca worktree create --name <m> --no-parent --agent <id> --prompt "<brief>" --json` × N |

## Diagnosis: drift already present

If the registry and Multica disagree when you arrive:

1. `multica issue get <id>` — Multica is the tracker of record.
2. Check linked PR state: open → `in_review`; merged → `done` (then writeback).
3. Update `ISSUE_REGISTRY.md` row + header, commit `chore(spec): sync ...`.
4. If many RFCs drifted (run import), reconcile Multica + registry in one pass,
   bounded by the actual PR states, then commit once.

## Scope boundary

- This skill covers the **consistency workflow**, not Multica CLI internals
  (see `multica-cli` skill) and not Orca CLI internals (see `orca-cli` /
  `orchestration` skills). Load those for command detail; this file is the
  glue that says which tool, which order, which state.
- Workspace: `ac-grid` (`ac9449c6-...`); projects `ac-grid` and `gopdf.fyi`.
  Use `--workspace-id` where you must override the default.