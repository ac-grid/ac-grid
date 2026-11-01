# Why: fix-rfc-0047-sorting-enabled

<!-- reasongraph:v1 generated 2026-11-01 — review before sharing; edit freely, edits are preserved -->

## Intent
Define and implement RFCs for demo grid selection alignment, fixed-column theming, and empty-state overlay theming.

## Decisions

### Use RFC 0039 as an index for three focused child RFCs
Status: discussed
Touches: `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042*`

The approved work is split into focused RFCs for selection-column ordering, pinned-column theming, and empty-state overlay theming. Each item is intended for a separate worktree based on `origin/main`, with a failing e2e before implementation and a mutation check afterward.

### Treat empty-cell clicks as distinct from row selection
Status: discussed
Touches: `.spec/rfc/0040*`

RFC 0040 records that clicking a cell without selecting its row is not a defect. This keeps the selection change focused on placing the selection column first and aligning its checkbox.

### Define fixed-column theming alongside horizontal scrolling
Status: discussed
Touches: `.spec/rfc/0041*`, `packages/*/src/**/*`, `demos/react/**/*`

Pinned headers and cells need dedicated theme colors, and the demo needs wider columns to exercise horizontal scrolling. The proposed variables are `--ac-grid-bg-header-pinned` and `--ac-grid-bg-cell-pinned`.

### Theme the empty-state overlay through a dedicated variable
Status: discussed
Touches: `.spec/rfc/0042*`, `packages/core/src/**/*.css`, `demos/react/**/*`

The empty-state overlay should use `--ac-grid-bg-overlay` so its appearance can be themed independently. The demo should expose clearing data and light/dark theme controls for verification.

### Keep full-width row views outside the overlay change
Status: discussed
Touches: `packages/core/src/**/*.wsx`

Pinned-column drops across the pinned boundary are rejected by design, but provide no feedback. Selection columns cannot reorder because `selection` is absent from `columnOrder`; RFC 0040 addresses that ordering constraint.

### Add demo controls for empty-state theme verification
Status: discussed
Touches: `.spec/rfc/0042-overlay-theme`

The RFC calls for demo controls to clear data and switch themes so the empty overlay can be checked in light and dark modes.

### Link RFC 0016 from its actual location
Status: discussed
Touches: `.spec/rfc/0042-overlay-theme`

RFC 0016 is located in the `.spec/rfc/` root rather than `completed/`; links use its actual location to avoid a broken reference.

### Use CodeGraph to verify call relationships before assessing unreachable branches
Status: discussed
Touches: `packages/core/src/**/*.ts`, `packages/core/src/**/*.wsx`

The agent used CodeGraph `callers` and `node` results alongside source inspection to verify whether suspected branches were reachable. This supported classifying 17 branches as unreachable.

### Verify each worker's test results independently
Status: discussed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/test/export.test.ts`

The export changes came from another session and had not been tested before commit. The export utility and type files were reported at 100% statement and branch coverage, but the branch still needs its tests run before it is pushed.

### Commit coverage tests by work unit
Status: discussed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/test/export.test.ts`

The RFC-0014 export implementation, tests, and RFC tracking updates were grouped in a dedicated feature commit. Separate chore and Birdify-artifact commits were also created on `feat/rfc-0014-data-export`, which had not been pushed.

### Keep dead-code removal separate from coverage tests
Status: discussed
Touches: `.spec/rfc/0046*`

The component coverage proposal separates triggerable behavior, dead code, and defensive code: cover reachable behavior with e2e, remove dead code, and require documented reasons for exclusions.

### Do not claim 100% coverage for transformed WSX components
Status: discussed
Touches: `packages/core/src/**/*.wsx`, `packages/core/vite.config.ts`

Vitest coverage does not measure browser e2e behavior, so the reported unit-test result cannot establish 100% combined coverage. The RFC proposal defines 100% across unit and e2e coverage, with CI enforcement and per-file thresholds for pure-logic modules.

### Leave graph initialization artifacts uncommitted pending disposition
Status: discussed
Touches: `.birdify/*`

A separate commit added Birdify architecture and coverage artifacts, including a nested `.birdify/.birdify/` directory that may be accidental. The artifact commit's final disposition remains unresolved.

### Remove temporary component coverage test file
Status: discussed
Touches: `packages/core/src/**/*.test.ts`

The agent removed the temporary `cov-comp-dd-tmp.test.ts` file after confirming it was not part of the completed component test work.

### Keep `.spec/rfc` limited to numbered RFC documents
Status: discussed
Touches: `.spec/rfc/roadmap.md`

冲突解决保留路线图文件的删除，使 `.spec/rfc` 清理结果与变更目标一致。`specify sync-check` 通过。

### Move parity and issue registries to .spec root
Status: discussed
Touches: `.spec/PARITY_MATRIX.md`, `.spec/ISSUE_REGISTRY.md`, `.spec/rfc/*`

These documents remain useful to the roadmap, RFCs, and workflow documentation, so they belong at the `.spec/` root rather than among numbered RFCs.

### Close stale pull requests instead of forcing merges
Status: discussed
Touches: `.spec/rfc/roadmap.md`, `RFC-0014 data-export changes`, `RFC-0008 column-pinning changes`

关闭内容已为空或已被主分支取代的变更，避免合入过时实现。

### Remove RFC-0014 from the pending feature matrix
Status: discussed
Touches: `feature-matrix.json`

RFC-0014 已在主分支完成，但覆盖矩阵仍将其标为待处理；移除该项以保持状态一致。

### Update CellEditor tests for removal of blur autosave
Status: discussed
Touches: `*CellEditor*`

测试改为匹配失焦不再自动保存的行为，避免恢复已移除的自动保存逻辑。

### Keep gh-pages branch for site deployment
Status: discussed
Touches: `gh-pages`

保留用于站点部署的分支，避免清理分支时影响部署流程。

### Add browser correctness and performance verification for virtual scrolling
Status: discussed
Touches: `.spec/rfc/0038*`, `demos/react/*`

Virtual scrolling needs browser-level correctness and performance checks, including a 10K-row benchmark. The proposed verification runs the full e2e suite three times with parallel configuration and keeps the coverage gate unchanged.

### Keep the Vite configuration change scoped to the PR branch
Status: discussed
Touches: `packages/core/vite.config.ts`

The coverage threshold is a ratchet and should not be lowered to make the current result appear complete. The recorded overall statement coverage was 56.85%, below the stated 58% threshold, so the figures need rechecking against the actual configuration and report.

### Resolve develop-to-main conflicts by syncing main into develop
Status: discussed
Touches: `Grid.wsx`, `rfcValidationDemos.ts`, `rfc-validation.spec.ts`, `TASK_TRACKING.md`

The conflict resolution synced main into develop from a separate worktree, then pushed the result. This addressed history divergence after the earlier squash merge; the resulting pull request was mergeable but remained blocked by repository rules.

### Preserve Birdify workspace artifacts in the main checkout
Status: discussed
Touches: `.birdify/*`

The untracked Birdify directory was copied into the main checkout so its artifacts remained available after worktree cleanup.

### Ignore ReasonGraph state while retaining why files
Status: discussed
Touches: `.reasongraph/.gitignore`, `.reasongraph/state/*`, `.reasongraph/why/*`

The nested ignore rules ignore state artifacts while keeping the ignore file and `why/` content trackable. Previously staged state files were unstaged without deleting them; `.reasongraph/.gitignore` remained uncommitted.

### Use behavioral assertions for formula-sheet tests
Status: discussed
Touches: `App.tsx`, `tests/**/0001*`, `tests/**/0030*`

The formula-sheet tests exercise interaction so they fail when the feature is broken. Text-only assertions did not verify the behavior.

### Keep Playwright tests parallel while fixing flakiness
Status: discussed
Touches: `playwright.config.*`, `tests/**`

Parallel execution remains enabled. Flakes were addressed at their causes instead of masking them with serial execution; the suite passed 10 consecutive full runs after fixes and 15 consecutive runs in the final report.

### Use a shared quiet-wait helper for initialization-race tests
Status: discussed
Touches: `tests/**`, `*.spec.ts`

A shared helper replaced inconsistent waits, including a fixed 300 ms delay in the sorting test. This makes tests wait on a real condition and reduces timing-dependent failures. The full suite passed 10 consecutive runs at 26/26.

### Restore focus by matching the grid cell key
Status: discussed
Touches: `src/**`, `tests/**/0012*`

WSX focus restoration searches for `data-wsx-key`, while grid cells used `key`, so restoration could not locate the target. The test now exercises focus, pause, and keypress behavior; it fails without the fix and passes with it.

### Fix the intermittent header-drag test at its cause
Status: discussed
Touches: `tests/**/0002*`

The header-drag test failed in 4 of 10 runs before the fix and passed all 10 afterward. The fix addresses the test's intermittent failure while preserving parallel execution.

### Measure coverage across all core source files
Status: discussed
Touches: `packages/*/.nycrc`, `packages/*/src/**`

The previous coverage include list measured only five files that already had full coverage, making its 100% thresholds ineffective for the core package. Coverage now includes all core source; measured floors are 58.8% lines, 35.3% branches, and 55.4% functions, with thresholds set at those floors and intended to rise.

### Assign strict fixed ports to each development service
Status: discussed
Touches: `**/package.json`, `**/vite.config.*`, `**/playwright.config.*`

Each service uses a distinct fixed port with `strictPort`, so startup fails clearly on a collision instead of silently falling back. Assigned ports are React demo 5198, WSX demo 5199, site development 5200, e2e 5201, site preview 5202, and Storybook 6007. Verification confirmed 5198 and 5199 returned 200 and the e2e runner started and released 5201; 5200 and 6007 remained unverified.

### Set coverage thresholds at the measured floor
Status: discussed
Touches: `packages/*/.nycrc`, `packages/*/src/**`

Thresholds reflect measured coverage across core rather than the previous restricted file list: 58.8% lines, 35.3% branches, and 55.4% functions. This makes the gate meaningful for the included source; the stated direction is to raise thresholds over time.

### Keep sorting behavior enabled when testing unrelated features
Status: discussed
Touches: `.spec/rfc/**`, `src/**`, `tests/**`

A mutation check found that `sorting: { enabled: false }` did not disable sorting. The finding was recorded in an RFC, but the transcript does not establish whether the product bug was fixed.

### Leave site and Storybook port validation open until dependencies are available
Status: discussed
Touches: `apps/site/package.json`, `apps/site/**`, `**/storybook*`

The site development server could not start because `@wsxjs/wsx-press` was not installed, and Storybook port 6007 was not verified. The 5200 and 6007 port assignments therefore lack runtime confirmation.

### Wait for a Birdify plan before editing P1 issues
Status: discussed
Touches: `.birdify/**`, `.spec/**`

P1 issues #35, #36, #38, and #39 had read-only investigation only; editing was left pending a Birdify plan and confirmation. No implementation decision for those issues was made.

### Fix the RFC 0022 parity-matrix link
Status: discussed
Touches: `RFC 0022`

修复失效的 `PARITY_MATRIX` 链接，使 RFC 文档指向有效位置。
