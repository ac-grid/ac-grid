# Why: fix-rfc-0047-sorting-enabled

<!-- reasongraph:v1 generated 2026-11-01 — review before sharing; edit freely, edits are preserved -->

## Intent
Define and implement RFCs for demo grid selection alignment, fixed-column theming, and empty-state overlay theming.

## Decisions

### Use RFC 0039 as an index for three focused child RFCs
Status: discussed
Touches: `.spec/rfc/0039-demo-defects-p1.md`, `.spec/rfc/0040-selection-column-order.md`, `.spec/rfc/0041-pinned-column-theme.md`, `.spec/rfc/0042-overlay-theme.md`

The P1 demo defects were split into focused RFCs for selection-column order, pinned-column theming with horizontal scrolling, and empty/loading overlay theming. This keeps each implementation scope independently reviewable.

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
Status: directed
Touches: `packages/core/src/utils/a1-notation.ts`, `packages/core/src/utils/formula-parser.ts`, `packages/core/src/utils/formula-graph.ts`, `packages/core/src/utils/flex-render.ts`, `packages/core/src/utils/pinning-utils.ts`, `packages/core/src/i18n/manager.ts`

The agent removed 17 unreachable branches in a separate commit after checking call relationships with CodeGraph and reviewing the source. Removing these branches lets the affected TypeScript files reach 100% coverage without ignoring code.

Reviewer attention: Confirm each removed branch was unreachable and that the existing tests cover the remaining behavior.

### Do not claim 100% coverage for transformed WSX components
Status: discussed
Touches: `packages/core/src/components/*.wsx`, `packages/core/vite.config.ts`

The agent left WSX components under the existing global coverage floor because the Vite plugin emits no source map and inlines Babel decorator helpers that component tests cannot execute. A separate issue tracks resolving the measurement limitation; no helpers were ignored or excluded.

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
Touches: `.spec/rfc/README.md`, `.spec/rfc/roadmap.md`, `.spec/rfc/SUMMARY.md`, `.spec/rfc/GETTING-STARTED.md`, `.spec/rfc/RFC-TEMPLATE.md`, `.spec/0010-kickoff-brief.md`

The agent removed legacy process guides, duplicate indexes, a one-time work report, and a completed RFC kickoff brief from the RFC tree. Numbered RFC documents remain the contents of `.spec/rfc`.

### Move parity and issue registries to .spec root
Status: discussed
Touches: `.spec/rfc/PARITY_MATRIX.md`, `.spec/rfc/ISSUE_REGISTRY.md`, `.spec/PARITY_MATRIX.md`, `.spec/ISSUE_REGISTRY.md`

The agent moved the parity matrix and issue registry to `.spec/` because they are tracking documents, not RFCs. References and RFC-relative links were updated to the new locations.

### Close stale pull requests instead of forcing merges
Status: discussed
Touches: `.spec/rfc/roadmap.md`, `RFC-0014 data-export changes`, `RFC-0008 column-pinning changes`

关闭内容已为空或已被主分支取代的变更，避免合入过时实现。

### Remove RFC-0014 from the pending feature matrix
Status: discussed
Touches: `demos/react/e2e/feature-matrix.json`, `demos/react/e2e/coverage.spec.ts`

The agent removed RFC-0014 from the pending list after its E2E coverage was present. Leaving an implemented feature marked pending made the coverage guard fail.

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

### Restore keyboard focus by matching each grid cell key
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/helpers.ts`, `demos/react/e2e/rfc-validation.spec.ts`

WSX restores focus across rerenders only for elements carrying `data-wsx-key`, while grid cells had only a render key. Adding the matching attribute lets focus survive rerenders; the focus handler avoids redundant state updates that would create a render loop.

### Fix the intermittent header-drag test at its cause
Status: discussed
Touches: `tests/**/0002*`

The header-drag test failed in 4 of 10 runs before the fix and passed all 10 afterward. The fix addresses the test's intermittent failure while preserving parallel execution.

### Measure core coverage across all source files
Status: discussed
Touches: `packages/core/vite.config.ts`, `packages/core/test/clipboard.test.ts`, `packages/core/src/utils/clipboard.ts`

The previous coverage scope included only five already-covered files and reported 100%. Coverage now includes all core source files, with thresholds set at the measured baseline; clipboard serialization and parsing gained behavioral tests.

### Assign strict fixed ports to each development service
Status: directed
Touches: `demos/react/vite.config.ts`, `demos/react/playwright.config.ts`, `demos/wsx/vite.config.ts`, `apps/site/vite.config.ts`, `apps/site/package.json`, `package.json`, `.spec/rfc/0034-rfc-demo-acceptance-matrix.md`, `.spec/rfc/0037-dev-port-assignment.md`

Development services received strict ports: React demo 5198, WSX demo 5199, site dev 5200, E2E 5201, site preview 5202, and Storybook 6007. Fixed assignments prevent fallback to conflicting or default ports; site dev and Storybook availability remained unverified.

### Set coverage thresholds at the measured floor
Status: discussed
Touches: `packages/core/vite.config.ts`, `packages/core/src/**/*.ts`

The agent set statements, branches, functions, and lines to 100% for plain TypeScript source files. The threshold is active: a check confirmed it fails when applied to transformed WSX files that remain below 100%.

Reviewer attention: Confirm the threshold applies to all intended TypeScript files and excludes no source files.

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

### Require demos, E2E tests, and skill entries for every completed RFC
Status: discussed
Touches: `demos/react/e2e/coverage.spec.ts`, `skills/ac-grid/SKILL.md`

The coverage guard scans completed RFC documents and requires a matching demo, E2E test, and feature entry in the ac-grid skill. This catches gaps that a fixed validation list missed.

### Wire clipboard keyboard actions to the active grid cell
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `packages/core/src/utils/clipboard.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Clipboard handlers existed without event bindings, and the active cell was never recorded. Binding copy and paste to the grid host and tracking the cell on mousedown makes the feature usable; the active-cell field stays non-reactive so updates do not rerender and drop focus.

### Externalize the shared theme manager from the core bundle
Status: discussed
Touches: `packages/core/vite.config.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Bundling a second theme manager created an empty registry in core, so registered themes were invisible to the grid. Externalizing the shared package preserves one registry for theme registration and application.

### Create an ac-grid skill with verified API references
Status: directed
Touches: `skills/ac-grid/SKILL.md`, `skills/ac-grid/skill-release.json`, `skills/ac-grid/LICENSE`, `skills/ac-grid/references/`

The skill documents actual grid options and installation layout using source-backed examples. Its discoverability and copy installation were checked with the skills CLI; the release metadata URL remained unverified.

### Correct RFC-0036 to separate reproduced defects from unverified reports
Status: discussed
Touches: `.spec/rfc/0036-demo-quality-remediation.md`

The RFC records browser-probed findings and distinguishes confirmed failures from issues not reproduced on the updated branch. It also corrects the claim that the initialization race explained the editor report after settled probes did not reproduce that failure.

### Wait for a quiet grid before interacting in E2E tests
Status: discussed
Touches: `demos/react/e2e/helpers.ts`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/playwright.config.ts`

The grid can paint rows before initialization finishes, allowing early test input to be swallowed. A shared quiet-DOM helper waits for rows and initialization to settle before interaction; parallel execution was retained after serial mode failed to address the underlying issue.

### Keep column drag state out of reactive rerenders
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

Reactive drag-state changes rerendered headers during native drag and could detach the source or target node. Plain fields and direct DOM class updates preserve drag nodes while retaining visible drag feedback.

### Test formulas through the standalone formula engine
Status: discussed
Touches: `demos/react/src/App.tsx`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/src/rfcValidationDemos.ts`, `.spec/rfc/0036-demo-quality-remediation.md`

RFC-0030 scopes formulas to a standalone engine and does not promise grid integration. The demo therefore uses interactive formula inputs backed by the real engine, while grid-embedded formulas remain a separate capability gap.

### Assert observable behavior in demo E2E tests
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/src/App.tsx`, `demos/react/src/rfcValidationDemos.ts`

Element counts and internal grid state did not establish that features worked. The revised tests exercise sorting, keyboard navigation, and formula updates through observable interactions; mutation checks confirmed the new assertions fail when the tested behavior is broken.

### Use the specify CLI to create and validate RFCs
Status: discussed
Touches: `.spec/rfc/0036-demo-quality-remediation.md`, `.spec/rfc/0037-dev-port-assignment.md`, `.spec/ROADMAP.md`

The manually drafted RFC-0036 failed repository validation because it lacked required structure and tracking. The specify CLI generated the RFC structure and updated roadmap tracking; validation then passed.

### Reproduce column reordering failure before changing implementation
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

The existing RFC-0002 browser test was used to check whether a real header drag changes column order. Its initial failure occurred before the grid became ready, so the core and theme packages were rebuilt to rule out stale ignored `dist` artifacts before further diagnosis.

### Archive RFC 0001 as implemented after its child RFCs were created
Status: discussed
Touches: `.spec/rfc/0001-ac-grid-architecture.md`, `.spec/rfc/completed/0001-ac-grid-architecture.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, `.spec/rfc/completed/0009-cell-editing.md`, `.spec/rfc/completed/0012-keyboard-navigation.md`, `.spec/rfc/completed/0013-accessibility.md`

RFC 0001 was converted to the specify-compatible format, advanced to Implemented, and archived because its feature work had been split into child RFCs. Related roadmap, tracking, and RFC links were updated; `specify sync-check` then passed.

### Verify virtual scrolling correctness in the browser before setting performance thresholds
Status: discussed
Touches: `.spec/rfc/0038-virtual-scrolling-verification.md`, `demos/react/e2e/virtual-scrolling.spec.ts`, `packages/core/test/virtual-scrolling.test.ts`, `packages/core/test/virtualizer.test.ts`

The verification plan adds browser assertions for rendered row contents after scrolling, reaching the bottom and returning to the top, and resizing the viewport. Performance thresholds are to be based on measurements rather than estimates, since the existing browser test only counted rendered rows and JSDOM cannot measure layout or frame rate.

### Put the selection column first and verify selection behavior
Status: discussed
Touches: `.spec/rfc/0040-selection-column-order.md`, `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

The selection column is prepended to rendered columns but omitted from `columnOrder`, causing TanStack to place it last. The RFC specifies placing it first and checking single selection, shift-range selection, header select-all, and checkbox alignment.

### Require E2E coverage for implemented P0/P1/P2 features
Status: directed
Touches: `demos/react/e2e/coverage.spec.ts`, `demos/react/e2e/feature-matrix.json`, `skills/ac-grid/references/features.md`

The agent added a guard that checks implemented P0, P1, and P2 roadmap features have matching RFC-titled E2E tests, while unimplemented features have a pending reason. This keeps feature-level browser coverage separate from unit code coverage.

### File discovered component defects as GitHub issues
Status: directed
Touches: `packages/core/src/components/PaginationControls.wsx`, `packages/core/src/components/Dropdown.wsx`, `packages/core/src/components/FilterInput.wsx`, `packages/core/src/components/FilterMenu.wsx`, `packages/core/src/components/FilterIcon.wsx`, `packages/core/src/components/*`

The agent tracked the six discovered WSX behavior defects in separate GitHub issues (#48–#53) so each can be reviewed and fixed independently. The issues cover page-size callbacks, nonexistent update calls, state setter behavior, an unwired handler, null rendering, and custom-element property handling.

### Honor sorting.enabled=false across all columns
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`

Grid accepted `sorting.enabled` but did not pass the setting to the table, so sorting remained active when disabled. Setting `enableSorting: false` when the explicit config disables sorting makes header behavior match the documented API while preserving column-level behavior when sorting is enabled.

### Add end-to-end coverage for disabled sorting
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

The test checks that header clicks leave row order unchanged and hide the sorting indicator when sorting is disabled. It reproduced the defect before the fix; the RFC-0002 and RFC-0047 tests passed after the fix.

### Add an RFC-0047 validation demo for disabled sorting
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `skills/ac-grid/references/features.md`

The completed-RFC coverage guard requires each archived RFC to have a validation demo and an entry in the agent feature reference. Adding both lets the guard verify RFC-0047 instead of failing after archival.

### Document sorting.enabled=false in the feature reference
Status: discussed
Touches: `skills/ac-grid/references/features.md`

The feature reference previously described enabled sorting but omitted the disabling behavior. A separate RFC-0047 row records that setting disables sorting for every column and avoids overstating the RFC-0002 entry.
