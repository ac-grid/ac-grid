# Why: feat-rfc-0014-data-export

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Ship RFC-0014 data export in packages/core on a dedicated feature branch, then measure packages/core unit-test coverage against a 100% target.

## Decisions

### Commit RFC-0014 export on feat/rfc-0014-data-export instead of main
Status: discussed — local only; not pushed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/src/Grid.wsx`

The working tree mixed RFC-0014 export work with unrelated leftover edits, so the agent opened feat/rfc-0014-data-export from origin/main at e4acd4b instead of committing on main. Three local commits exist (0b3d31c, 6305619, fbfa195) and have not been pushed.

Risk: The RFC-0014 export tests were not run in this session before those commits; that code came from another session.
Reviewer attention: Run export tests before treating 0b3d31c as verified.

### Split the working tree into three topical commits
Status: discussed
Touches: `packages/core/src/utils/export.ts`, `.reasongraph/.gitignore`, `.birdify/**`

One mixed commit would have bundled export implementation, ignore-rule chores, and birdify artifacts. The agent split them so each topic can be reviewed or dropped independently.

Considered/rejected: A single catch-all commit of every dirty path was rejected because it mixed unrelated work.

### Land RFC-0014 export types, util, Grid wiring, tests, and spec archive together
Status: discussed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/src/Grid.wsx`, `packages/core/test/export.test.ts`, `**/0014-data-export.md`, `ROADMAP`, `TASK_TRACKING`

Commit 0b3d31c groups the export util and types, Grid.wsx wiring, export.test.ts, and the RFC-0014 archive plus ROADMAP and TASK_TRACKING updates. New export files report 100% statement and branch coverage in vitest.

Risk: Those tests were not executed as part of making the commit.

### Ignore ReasonGraph state, test-results, and theme-base tsbuildinfo
Status: directed
Touches: `.reasongraph/.gitignore`, `.reasongraph/state/**`, `.gitignore`

The agent added .reasongraph/.gitignore with *, !.gitignore, !why/, and !why/** so check-ignore hits state/ on the first * rule. Root ignore also covers test-results and theme-base tsbuildinfo in the chore commit 6305619. The new gitignore was untracked until that commit grouping.

Reviewer attention: Unrelated spec edits (completed/0014, ROADMAP, TASK_TRACKING, PARITY_MATRIX, 0025) were already dirty in the checkout and were not authored in this session.

### Keep .reasongraph/why/main.md tracked
Status: directed
Touches: `.reasongraph/why/main.md`, `.reasongraph/.gitignore`

The ignore exceptions keep why/ and why/** visible to git. why/main.md stayed tracked (AM); the agent did not edit it.

### Put birdify artifacts in their own commit so they can be dropped
Status: discussed — nested .birdify/.birdify/ looks like a mistaken copy
Touches: `.birdify/**`, `.birdify/.birdify/**`

Commit fbfa195 isolates architecture diagrams and coverage JSON under .birdify/ so the commit can be removed without rewriting the export or ignore work.

Risk: A nested .birdify/.birdify/ tree is present and looks like an accidental copy. Prior direction was that .birdify should not be tracked.
Reviewer attention: Decide whether to drop fbfa195 before push.

### Do not commit packages/core/test/debug.test.ts
Status: discussed
Touches: `packages/core/test/debug.test.ts`

debug.test.ts remains excluded from the RFC-0014 commit set.

### Do not treat package-wide 100% vitest coverage as this branch's gate
Status: discussed
Touches: `packages/core/vite.config.ts`, `packages/core/src/Grid.wsx`, `packages/core/src/Dropdown.wsx`, `packages/core/src/DraggableTableHeader.wsx`, `packages/core/src/FilterMenu.wsx`, `packages/core/src/GlobalSearch.wsx`

packages/core vitest reported 33 files, 243 passed, 1 skipped, 0 failed. Measured coverage was statements 56.85%, branches 36.01%, functions 56.06%, lines 59.14% against configured floors of 58/55/35/56. Grid.wsx is about 3000 lines at ~65% statements and 53% branches; Dropdown.wsx ~15%, DraggableTableHeader.wsx ~23%, FilterMenu.wsx ~25%, GlobalSearch.wsx ~26%. About 2100 of 4953 statements are uncovered. Forcing JSDOM tests onto those .wsx widgets would not exercise real behavior already covered by demos/react Playwright e2e.

Risk: Reported statements 56.85% sit below the 58% floor even though the run was described as passing the ratchet; vite.config.ts and the report need a re-read.
Reviewer attention: Reconcile the statement-threshold mismatch before relying on the ratchet numbers.

### Raise coverage by filling pure-logic files first, then lifting the ratchet
Status: discussed — encoded as draft RFC 0044; uncommitted
Touches: `packages/core/src/utils/**`, `packages/core/src/i18n/**`, `packages/core/src/types/**`, `packages/core/vite.config.ts`

The coverage program starts by driving vitest on utils, i18n, and types to 100% and writing those per-file floors into config, then raising the package ratchet. That avoids padding widget tests to chase a package-wide vitest 100%.

### Unstage .reasongraph/state rather than delete it
Status: discussed
Touches: `.reasongraph/state/**`

state/ had been staged as added but not committed. The agent used git restore --staged so the files remain on disk and stay out of HEAD once the ignore rule applies.

Considered/rejected: Deleting the state files was rejected; only the index entry was cleared.

### Treat cross-pin header drops as silently discarded by design
Status: discussed
Touches: `packages/core/src/Grid.wsx`, `packages/core/src/DraggableTableHeader.wsx`, `demos/react/**`

On a clean origin/main, real-mouse header drags reorder normal columns (default, 0002, 0003, 0007, and 0008 lastName→age). Dragging between pinned and unpinned columns (0008 firstName→lastName, progress→email) moves the ghost but leaves order unchanged with no message. reorderPinnedOnColumnDrag only permutes within the same pinned side; cross-boundary drops are dropped on purpose. Missing visual feedback makes that look broken.

Reviewer attention: Confirm whether the intended fix is feedback on rejected drops or allowing cross-pin reorder.

### Attribute selection-column drag no-ops to selection missing from columnOrder
Status: discussed
Touches: `packages/core/src/Grid.wsx`, `demos/react/**`

On demo 0007, dragging selection or dropping another column onto it does not change order because selection is not in columnOrder. That is the same root cause RFC 0040 is meant to fix by placing selection first in columnOrder.

### Rebuild gitignored package dist before trusting demo rendering
Status: discussed
Touches: `packages/core/**`, `**/dist/**`

Ignored dist was a stale build, which made the demo fail to render until core and theme packages were rebuilt. A later zhCN-export-missing diagnosis was a false positive from rtk swallowing grep output and was reverted; a clean worktree rendered normally.

### Define 100% as merged vitest ∪ Playwright coverage
Status: discussed — draft RFC 0043; uncommitted and unpushed
Touches: `packages/core/**`, `demos/react/**`, `packages/core/vite.config.ts`

The completion bar is packages/core merged coverage (unit ∪ e2e) at 100% statements, branches, functions, and lines, with those floors stored in config and enforced in CI. Vitest-alone 100% was rejected for .wsx components because JSDOM tests would not reflect real widget behavior.

Considered/rejected: Requiring 100% from vitest in isolation was rejected to avoid tests written only to paint coverage.

### Split the 100% coverage program into RFC 0043–0046
Status: discussed — Drafts in worktree /Volumes/ORICO/ws/prj/ac-grid/ac-grid-cov on docs/rfc-coverage-100; validate and sync-check passed; not committed or pushed
Touches: `**/0043*`, `**/0044*`, `**/0045*`, `**/0046*`

The agent generated four Draft RFCs: 0043 as the umbrella 100% merged-coverage gate; 0044 for vitest on pure-logic modules; 0045 for Playwright V8 collection merged with vitest; 0046 for remaining .wsx gaps.

### Allow v8 ignore only with a written reason and a registry
Status: discussed — proposed in the coverage RFC drafts, not yet confirmed
Touches: `packages/core/src/**`, `**/0046*`

RFC 0046 allows v8 ignore for defensive code only when a reason is written and the exemption is listed. Dead code should be deleted instead of ignored.

Risk: Unlisted ignores would hide real gaps behind the 100% gate.

### Collect Playwright V8 coverage mapped onto packages/core/src
Status: discussed
Touches: `demos/react/**`, `packages/core/src/**`, `**/0045*`

RFC 0045 adds Playwright V8 coverage, remaps it onto packages/core/src, merges it with vitest into one report, and keeps a ratchet that only moves up.

### Close .wsx coverage gaps with e2e, deletions, and justified exemptions
Status: discussed
Touches: `packages/core/src/Grid.wsx`, `packages/core/src/Dropdown.wsx`, `packages/core/src/DraggableTableHeader.wsx`, `packages/core/src/FilterMenu.wsx`, `packages/core/src/GlobalSearch.wsx`, `**/0046*`

Remaining widget holes should be closed by triggering real e2e paths where possible, deleting dead code, and exempting only justified defensive branches. Filling them with JSDOM tests that do not exercise the widgets is out of scope.

### Implement RFC 0040–0042 and 0038 from failing e2e with mutation checks
Status: discussed — approved direction; not started this session
Touches: `packages/core/src/Grid.wsx`, `demos/react/**`

Each of those RFCs is to be done in a fresh worktree from origin/main: write a failing e2e, change code, then revert the fix to prove the test turns red. Full e2e runs three times under the parallel config; the coverage ratchet stays put. Each RFC gets its own PR to main. Birdify maps and a plan are shown before Grid.wsx edits.

### Put selection first in columnOrder to fix checkbox alignment
Status: discussed — RFC 0040; not implemented
Touches: `packages/core/src/Grid.wsx`, `demos/react/**`

RFC 0040 places selection at the front of columnOrder so the checkbox column aligns and can participate in order. That also addresses the selection-column drag no-op.

### Add pinned header and cell background theme tokens
Status: discussed — RFC 0041; not implemented
Touches: `**/*theme*`, `demos/react/**`

RFC 0041 defines --ac-grid-bg-header-pinned and --ac-grid-bg-cell-pinned on every theme and widens demo 0008 columns so horizontal scrolling is visible.

### Drive the empty-state overlay from --ac-grid-bg-overlay
Status: discussed — RFC 0042; not implemented
Touches: `packages/core/src/Grid.wsx`, `demos/react/**`

RFC 0042 restyles .grid-overlay with --ac-grid-bg-overlay and adds a clear-data control plus light/dark toggle on demo 0019.

### Add a 10K-row virtual-scroll e2e performance benchmark
Status: discussed — RFC 0038; not implemented
Touches: `demos/react/**`

RFC 0038 adds a browser e2e performance benchmark at 10K rows to validate virtual scrolling.
