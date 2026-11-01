# Why: fix-rfc-0047-sorting-enabled

<!-- reasongraph:v1 generated 2026-11-01 — review before sharing; edit freely, edits are preserved -->

## Intent
Define and implement RFCs for demo grid selection alignment, fixed-column theming, and empty-state overlay theming.

## Decisions

### Use RFC 0039 as an index for three focused child RFCs
Status: discussed
Touches: `.spec/rfc/0039-*`, `.spec/rfc/0040-*`, `.spec/rfc/0041-*`, `.spec/rfc/0042-overlay-theme`

The work separates issues #35, #36, and #38 into focused child RFCs, with RFC 0039 serving only as their index. This keeps each RFC scoped to one concern.

### Treat empty-cell clicks as distinct from row selection
Status: discussed
Touches: `.spec/rfc/0040*`

RFC 0040 records that clicking a cell without selecting its row is not a defect. This keeps the selection change focused on placing the selection column first and aligning its checkbox.

### Define fixed-column theming alongside horizontal scrolling
Status: discussed
Touches: `.spec/rfc/0041-*`

The fixed-column theme work is paired with RFC 0008's horizontal scrolling context so the behavior can be specified together.

### Theme the empty-state overlay through a dedicated variable
Status: discussed
Touches: `.spec/rfc/0042-overlay-theme`, `Grid.css`

The overlay's hard-coded white background causes a gray-white cover in dark mode while its text color follows the theme. RFC 0042 specifies a dedicated `--ac-grid-bg-overlay` variable defined by each built-in theme; acceptance includes dark-theme contrast of at least 4.5:1 and a mutation check that fails if the background is restored to white.

### Keep full-width row views outside the overlay change
Status: discussed
Touches: `.spec/rfc/0042-overlay-theme`

RFC 0042 addresses the empty-data overlay. Full-width row views are explicitly out of scope because they are a separate view.

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
Touches: `packages/core/src/**/*.test.ts`

The agent reran coverage and tests instead of relying on worker reports, so submitted results reflected independently checked outcomes.

### Commit coverage tests by work unit
Status: discussed
Touches: `packages/core/src/**/*.test.ts`, `*.md`

The agent split test changes into separate commits for each work unit. Commit messages identified files limited by unreachable branches, preserving an accurate account of coverage.

### Keep dead-code removal separate from coverage tests
Status: discussed
Touches: `packages/core/src/i18n/manager.ts`, `packages/core/src/**/flex-render.ts`, `packages/core/src/**/pinning-utils.ts`, `packages/core/src/**/a1-notation.ts`, `packages/core/src/**/formula-parser.ts`

The agent identified 17 unreachable branches and proposed removing them in a separate change. No removal was made, so test work remained isolated from production logic changes.

### Do not claim 100% coverage for transformed WSX components
Status: discussed
Touches: `packages/core/src/**/*.wsx`, `packages/core/vite.config.*`, `packages/core/vitest.config.*`

The agent found that the WSX transform emits inline Babel decorator helpers without source maps, and v8 counts the generated lines. Component coverage therefore cannot be represented as 100% without changing instrumentation or accepting lower coverage; the approach remains unresolved.

### Leave graph initialization artifacts uncommitted pending disposition
Status: discussed
Touches: `.gitignore`, `AGENTS.md`, `.codegraph/**`, `.reasongraph/config.json`

The agent left graph initialization changes out of the coverage commits. The repository ignore rules and generated graph files had unresolved ownership and compatibility questions.

### Remove temporary component coverage test file
Status: discussed
Touches: `packages/core/src/**/*.test.ts`

The agent removed the temporary `cov-comp-dd-tmp.test.ts` file after confirming it was not part of the completed component test work.

### Keep .spec/rfc limited to numbered RFC documents
Status: discussed
Touches: `.spec/rfc/*`, `.spec/ROADMAP.md`

The RFC directory contains only numbered RFC documents so its contents follow the specify convention. The roadmap and delivery workflow provide the index and template functions that legacy files duplicated.

### Move parity and issue registries to .spec root
Status: discussed
Touches: `.spec/PARITY_MATRIX.md`, `.spec/ISSUE_REGISTRY.md`, `.spec/rfc/*`

These documents remain useful to the roadmap, RFCs, and workflow documentation, so they belong at the `.spec/` root rather than among numbered RFCs.

### Close stale pull requests instead of forcing merges
Status: discussed
Touches: `.spec/feature-matrix.json`, `RFC-0008`, `RFC-0014`

The data export branch matched `main` after rebase, leaving its pull request empty. Column pinning had already landed through another pull request, and its older implementation conflicted with `main`; forcing either merge would add no valid change.

### Remove RFC-0014 from the pending feature matrix
Status: discussed
Touches: `feature-matrix.json`, `.spec/ROADMAP.md`

RFC-0014 was already merged and marked completed in the roadmap. Keeping it pending made the feature guard treat completed work as outstanding, so the stale entry was removed.

### Update CellEditor tests for removal of blur autosave
Status: discussed
Touches: `CellEditor tests`

The tests were adjusted to match the behavior change that removed automatic saving on blur. The full unit suite passed with 52 files and 519 tests.

### Keep gh-pages branch for site deployment
Status: discussed
Touches: `gh-pages`

The branch remains in use for site deployment, so cleanup left it intact.

### Add browser correctness and performance verification for virtual scrolling
Status: discussed
Touches: `.spec/rfc/0038-virtual-scrolling-verification.md`

The RFC calls for browser E2E assertions on rendered row contents, scrolling to the end and back, and window resizing, with mutation checks for each assertion. Performance thresholds are to be set after measurement because no measurements were available; JSDOM cannot measure layout or frame rate.

### Keep the Vite configuration change scoped to the PR branch
Status: discussed
Touches: `demos/react/*vite*`

The Vite change was made on the PR branch, leaving the separate checkout on its default port configuration. The transcript does not establish whether the port issue was resolved.

### Resolve develop-to-main conflicts by syncing main into develop
Status: discussed
Touches: `Grid.wsx`, `rfcValidationDemos.ts`, `rfc-validation.spec.ts`, `TASK_TRACKING.md`

The conflict resolution synced main into develop from a separate worktree, then pushed the result. This addressed history divergence after the earlier squash merge; the resulting pull request was mergeable but remained blocked by repository rules.

### Preserve Birdify workspace artifacts in the main checkout
Status: discussed
Touches: `.birdify/*`

The untracked Birdify directory was copied into the main checkout so its artifacts remained available after worktree cleanup.
