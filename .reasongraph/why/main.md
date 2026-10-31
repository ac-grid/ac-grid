# Why: main

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Land the demo and E2E remediation onto main through develop, convert the stray virtual-scroll test plan into RFC-0038, specify P1 demo defects as umbrella RFC-0039 with children 0040–0042, and archive RFC-0001.

## Decisions

### Register port 5173 in the Spark port registry as another project's electron-vite renderer and leave that process running
Status: directed
Touches: `/Volumes/ORICO/ws/prj/spark/port.md`

Port 5173 was held by an electron-vite renderer from another workspace project, not by ac-grid. The process was left running. Spark port.md gained a dedicated section for that project and the summary row for 5173 was changed from a generic Vite-default warning to a named occupancy so new apps are not assigned 5173.

Considered/rejected: Killing the listener was rejected. Changing that other project's Vite config to pin the port with strictPort was offered and not done.
Risk: Spark port.md and project.md remain uncommitted and still contain unrelated uncommitted edits in that repo. That other app still uses Vite's default without strictPort, so it can silently move off 5173 when the port is busy.

### Keep ac-grid off Vite's default 5173; use reserved ports with strictPort
Status: discussed
Touches: `demos/react/playwright.config.ts`, `demos/react/vite.config.ts`

Drag probes and Playwright continued to bind Vite at 127.0.0.1:5201 with --strictPort, not 5173. A leftover Vite on 5201 made Playwright webServer fail with “http://127.0.0.1:5201/?e2e=virtual-scroll is already used”; that process was killed before the RFC-0002 run that passed.

### Do not merge PR #41 while GitHub reports CONFLICTING
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

PR #41 could not be merged: mergeable was CONFLICTING because main had landed RFC-0013 accessibility on the same two files the branch had edited. No merge was performed at that point. CI on the pre-merge tip was still green for unit tests and Playwright e2e.

### Resolve Grid.wsx by combining RFC-0013 ARIA with the branch's focus, clipboard, and drag attributes
Status: directed
Touches: `packages/core/src/components/Grid.wsx`

The merge kept RFC-0013 role, aria-rowindex, aria-colindex, and aria-selected, and kept data-wsx-key and key from the branch. Keyboard tabIndex follows RFC-0013 roving tabindex and falls back to the editable/clipboard tabIndex only when keyboard navigation is off. The className join was taken from the RFC-0013 side because the branch had concatenated grid-cell without a space, producing grid-cellcolumn-dragging during drag. After merge, core unit tests were 234 passed and coverage was lines 59.4% / branches 36.1%.

Reviewer attention: Confirm the combined cell markup still restores WSX focus and still exposes ARIA for RFC-0013.

### Keep both RFC-0013 and RFC-0001 coverage in the validation spec
Status: directed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

The e2e conflict was resolved by retaining the RFC-0013 accessibility tests from main and the rewritten RFC-0001 tests from the branch rather than choosing one side.

### Add an RFC-0013 demo spec, skill row, and e2e query so the coverage guard can pass after the merge
Status: discussed — Follows from the existing coverage guard plus the directed merge, not a new product request
Touches: `demos/react/src/rfcValidationDemos.ts`, `skills/ac-grid/references/features.md`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/e2e/coverage.spec.ts`

After merging main, the coverage guard failed because RFC-0013 was completed on main without a demo in RFC_VALIDATION_ORDER or a features.md row. A 0013 demo spec was added, the skill matrix gained an Accessibility row, and the RFC-0013 e2e was pointed at ?rfc=0013. Full e2e then ran 31/31 three times under the parallel Playwright config. The guard catching a real gap was treated as intended behavior, not something to weaken.

### Leave demos/react Storybook tsc errors untouched
Status: agent-initiated — not requested in plan or prompts
Touches: `demos/react/src/stories/Page.tsx`

tsc --noEmit in demos/react still failed on src/stories files missing ../../lib/components/Header. Those files were not part of the merge resolution and were left as-is.

### Convert the stray virtual-scroll test-plan document into RFC-0038 via the specify CLI and do not copy its claims
Status: directed
Touches: `.spec/rfc/0038-virtual-scrolling-verification.md`, `.spec/rfc/completed/test-plan.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, `demos/react/e2e/virtual-scrolling.spec.ts`, `packages/core/test/virtual-scrolling.test.ts`, `packages/core/src/utils/virtual-scroll.ts`

specify init/deliver created RFC-0038 as Draft, validate passed, and the non-RFC file under completed/ was removed. The original document was not copied: it listed VirtualizedRow.wsx, VirtualizedColumn.wsx, and virtual-scroll-example.tsx as created though they are absent; it said tests were still to be written though three unit files and one e2e already exist; it marked performance as estimated-achieved with no measurements; and it proposed JSDOM frame-rate checks, which cannot measure layout. RFC-0038 P0 requires browser e2e that assert rendered row content after wheel scroll, bottom and top, and resize, each with mutation checks. P1 is a 10K-row benchmark with thresholds set after measuring. Native scrollbar drag is documented as untestable in Playwright; wheel and scrollTop cover the behavior instead.

Considered/rejected: Keeping a free-form test-plan.md in the RFC tree, copying the original as-is, JSDOM FPS, and Playwright-dragging the native scrollbar.

### Delete the untracked checkout copy of test-plan.md
Status: directed
Touches: `.spec/test-plan.md`, `.spec/rfc/completed/test-plan.md`

The untracked .spec/test-plan.md on the stale checkout was removed after its content had been absorbed into RFC-0038 on the PR branch. It was never a git-tracked file there. A leftover index deletion of completed/test-plan.md on that checkout was left uncommitted because origin/main already lacks the file.

### Stop expanding RFC-0036; split P1 demo defects into umbrella 0039 and three child RFCs
Status: discussed
Touches: `.spec/rfc/0036-demo-quality-remediation.md`, `.spec/rfc/0039-demo-defects-p1.md`, `.spec/rfc/0040-selection-column-order.md`, `.spec/rfc/0041-pinned-column-theme.md`, `.spec/rfc/0042-overlay-theme.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

RFC-0036 already bundled multiple root causes and P0–P3 work, which violates one-RFC-one-concern. P1 issues #35, #36, and #38 were specified as umbrella 0039 plus children 0040, 0041, and 0042 via specify deliver --umbrella and --parent. RFC-0036 stayed Draft and was not reopened. Titles were delivered without extra parentheses because the CLI already appends (Umbrella). A first 0039 generation with a broken title was discarded uncommitted and redelivered. Child Related links to RFC-0016 point at .spec/rfc/0016-theme-system.md, not completed/, after sync-check flagged the wrong path. All four validates were OK; remaining sync-check failures were pre-existing 0001/0009/0012/0013 links, left alone until the 0001 close.

Considered/rejected: Stacking the P1 fixes into RFC-0036, and a first 0042 draft scoped to a full-width row-view demo.

### Put selection first in columnOrder and vertically align the checkbox; do not add click-row-to-select
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`

On origin/main, dragging the selection header (RFC-0007) or dropping another column onto it leaves column order unchanged. selection is not in columnOrder, so it cannot participate in reorder; that is the same root RFC-0040 already targets. No click-row-to-select behavior was added.

### Define pinned-column theme tokens and widen the 0008 demo so horizontal overflow is real
Status: discussed
Touches: `.spec/rfc/0041-pinned-column-theme.md`, `packages/core/src/components/Grid.css`, `packages/theme-base`, `packages/theme-default`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Issue #36 had no horizontal scrollbar because total column width was 910px inside a 1134px container. A separate real defect: pinned header/cell backgrounds use --ac-grid-bg-header-pinned and --ac-grid-bg-cell-pinned with light fallbacks that no theme defines, so pinned cells go white on dark themes. RFC-0041 requires those tokens on the built-in themes, 0008 columns wider than 1.5× the container, e2e that scrollWidth > clientWidth, pinned columns stay put while unpinned move, and dark-theme contrast at least 4.5:1, plus mutation checks. Implementation had not started in this segment.

### Scope RFC-0042 to empty/loading overlay theme, not a full-width row view
Status: directed
Touches: `.spec/rfc/0042-overlay-theme.md`, `packages/core/src/components/Grid.css`, `packages/core/src/components/Grid.wsx`, `packages/theme-base`, `packages/theme-default`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Issue #38 is the no-rows overlay ignoring theme, not a full-width row view. Clearing 0019 data under a dark theme showed .grid-overlay hard-coded to rgba(255,255,255,0.72) while overlay text uses a theme text token, washing out the grid. RFC-0042 was rebuilt as 0042-overlay-theme: background becomes var(--ac-grid-bg-overlay) with that fallback, every built-in theme defines the token, demo 0019 gets a clear-data control and light/dark toggle, and e2e require the no-rows overlay, dark contrast at least 4.5:1, color change on theme toggle, and a loading overlay check, with a mutation that restoring hard-coded white must fail. Full-width row view is a Non-goal. Loading overlay was inferred to share the same CSS and listed for live check rather than separately reproduced. Uncommitted wrong-slug drafts were deleted and redelivered before commit 774db55.

Considered/rejected: Adding a fullWidthRowComponent demo and treating missing row view as the #38 bug.

### Advance RFC-0038 through 0042 to Approved via specify and do not start implementation until that status exists
Status: directed
Touches: `.spec/rfc/0038-virtual-scrolling-verification.md`, `.spec/rfc/0039-demo-defects-p1.md`, `.spec/rfc/0040-selection-column-order.md`, `.spec/rfc/0041-pinned-column-theme.md`, `.spec/rfc/0042-overlay-theme.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

specify advance set 0038–0042 to Approved and the status-only change was committed. Implementation of 0040 was planned as a failing RFC-0007 e2e first, then Grid.wsx columnOrder, then mutation checks and three parallel full e2e runs without lowering coverage gates. That implementation did not begin in this segment because merge and RFC-0001 close took the remaining work.

### Leave sorting.enabled no-op, native scrollbar-drag coverage, and RFC-0030 Grid formula integration out of this P1 set
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `.spec/rfc/*`

The next implementation queue remains 0040, 0041, 0042, then 0038. sorting.enabled as a no-op stays unscheduled with the rest of that excluded P1 set.

### Do not admin-bypass the main ruleset; retarget PR #41 to develop instead
Status: directed
Touches: `packages/core/src/components/Grid.wsx`

gh pr merge 41 --squash on main failed with base branch policy prohibits the merge. Repository ruleset 24866126 on main includes deletion, non_fast_forward, required_signatures, strict required status checks, creation, and update. --admin was not used. origin/develop had no rules, was behind main by 3 commits, and the feature branch contained develop's history and merged cleanly, so PR #41's base was changed to develop. After the GitHub squash merge, the feature branch matched develop and was deleted remotely.

Considered/rejected: Merging to main with gh pr merge --admin without an explicit admin instruction.

### Restore develop/main ancestry after the squash by merging main into develop and taking develop's tree
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/src/rfcValidationDemos.ts`, `.spec/TASK_TRACKING.md`

PR #42 (develop → main) was CONFLICTING because the squash of #41 dropped commit ancestry while the trees already contained main's RFC-0013 work. In worktree ac-grid-sync on chore/sync-main-into-develop, main was merged into develop and the four conflict files were resolved --ours (develop). The result tree matched develop, so main added no unique content. Commit ab87484 was pushed to develop; PR #42 became MERGEABLE and later merged as 4e79059. Direct merge to main remained blocked by the same ruleset until it was merged on GitHub.

Risk: --ours is safe only because the trees were verified identical; a later unique main change would have been dropped.
Reviewer attention: Confirm ab87484 is an ancestry-only merge and that 4e79059 on main contains the demo/E2E/skill remediation.

### Clean merged worktrees and local feature branches after verifying content identity
Status: directed
Touches: `.birdify/`

After PR #41 landed on develop and PR #42 landed on main, ac-grid-latest, fix/rfc-demo-e2e-skill, ac-grid-sync, and chore/sync-main-into-develop were removed. Untracked .birdify/ was copied onto the primary checkout before removing ac-grid-latest. Two prunable /private/tmp worktrees were left alone. The primary checkout stayed on stale local main until a later reset.

### Close RFC-0001 as Implemented through specify, add the missing Status/Summary headers, and repair stale 0012/0001 relative links
Status: directed
Touches: `.spec/rfc/completed/0001-ac-grid-architecture.md`, `.spec/rfc/0001-ac-grid-architecture.md`, `.spec/rfc/completed/0009-cell-editing.md`, `.spec/rfc/completed/0012-keyboard-navigation.md`, `.spec/rfc/completed/0013-accessibility.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

0001 used a legacy header without **Status:**, so specify advance reported OK but changed nothing until **Status:** Implemented and a ## Summary were added. archive moved it to completed/. Checklist items inside 0001 were left because archived RFCs may keep them. Relative links in 0001, 0009, 0012, and 0013 that still pointed at unarchived 0001/0012 paths were rewritten so sync-check became OK. Work landed via PR #44 as e4acd4b. Implemented was chosen because archive only accepts Implemented, Rejected, Superseded, or Pending.

Risk: Hand-rewriting links in completed RFCs sits outside the specify CLI. Treating the architecture RFC as Implemented because later feature RFCs exist may overstate that 0001's original checklist is done.
Reviewer attention: Read the new Summary and Status on completed/0001 and the 0012 link rewrites in 0009/0012/0013.

### Reset the stale local main to origin/main after backing up the extra local commit
Status: directed — The backup branch itself was not requested
Touches: `.spec/rfc/completed/test-plan.md`

Local main was ahead 1 / behind 14. The extra commit 73a8c53 was already contained on origin via f90bfdb, and origin/main has no completed/test-plan.md, so the staged deletion of that file was discarded. backup/main-73a8c53 was created, then main was hard-reset to origin/main at e4acd4b so Vite uses 5198–5202. Untracked .birdify/ and Playwright test-results/ were left.

Risk: A hard reset drops any uncommitted index state on that checkout. The backup branch is leftover unless deleted.

### Treat pin-boundary and selection header drops as silent no-ops; unpinned-to-unpinned reorder works
Status: directed
Touches: `packages/core/src/components/Grid.wsx`, `packages/core/src/utils/*pinn*`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Real mouse header drags on a clean origin/main worktree reorder unpinned columns (default demo, RFC-0002, RFC-0003, RFC-0007, and 0008 pairs such as lastName→age). The RFC-0002 e2e “reorders columns after a real header drag” passed in 2.8s after packages were rebuilt. Drops that cross a pin boundary on RFC-0008 (firstName→lastName, progress→email) animate a drag but restore the original order with no message. reorderPinnedOnColumnDrag only permutes within the same pin side and discards cross-side drops.

Reviewer attention: Confirm silent discard of cross-pin drops is the intended pin invariant, not a missed drop handler.

### Do not fold cross-pin drop feedback into RFC-0039; specify a separate RFC for drop UX, selection reorder policy, and three-class e2e
Status: discussed — draft RFC not created; specify deferred pending confirmation
Touches: `.spec/rfc/*`, `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

The pin-boundary silent no-op and selection-column immovability are out of the 0039 P1 split. A separate RFC should cover explicit drop feedback and whether selection may reorder (tied to 0040), plus e2e for ordinary, pinned, and selection drops.

Considered/rejected: Folding this into umbrella RFC-0039. Also left open two drop-UX options without choosing: forbidden-drop styling versus changing pin state on drop.
Risk: Auto-changing pin state on a cross-boundary drop would weaken the current same-side pin invariant.

### Implement RFC-0040, then 0041, 0042, and 0038 as separate TDD PRs from origin/main worktrees
Status: discussed — planned; 0040 code not started pending a birdify plan
Touches: `packages/core/src/components/Grid.wsx`, `packages/theme-base/**`, `packages/theme-default/**`, `demos/react/e2e/*`, `demos/react/src/rfcValidationDemos.ts`

Each RFC is to be built in a new worktree from origin/main: failing e2e first, then the fix, then a mutation check that the test goes red if the fix is reverted. Full e2e should run three times under the parallel config with the coverage gate unchanged. Each RFC gets its own PR targeting main. 0040 moves selection to the front of columnOrder and fixes checkbox alignment; 0041 adds --ac-grid-bg-header-pinned and --ac-grid-bg-cell-pinned and widens demo 0008; 0042 points .grid-overlay at --ac-grid-bg-overlay and extends demo 0019; 0038 adds a 10K-row virtual-scroll browser benchmark.

### Rebuild gitignored core and theme dist when the react demo never shows grid rows
Status: discussed
Touches: `packages/core/dist`, `packages/theme-base/dist`, `packages/theme-default/dist`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/playwright.config.ts`

packages/core/dist is gitignored. An existing packages/core/dist/index.js of 264.8K left the RFC-0002 e2e failing on .grid-row visibility at a 15_000 ms timeout. Rebuilding @ac-grid/core produced dist/index.js at 309.58 kB (gzip 61.38 kB); theme-base and theme-default were rebuilt as well. A later clean origin/main worktree with those builds made RFC-0002 pass.

### Leave packages/core/src/index.ts i18n barrel unchanged after a duplicate zhCN export failed to compile
Status: discussed
Touches: `packages/core/src/index.ts`, `packages/core/src/i18n/index.ts`, `packages/core/src/i18n/*`

A hypothesis that RFC-0015 zhCN was missing from the core public export, causing a blank demo, did not hold on a clean origin/main worktree. packages/core/src/i18n/index.ts already re-exports locales. No explicit rationale beyond the compile error was given for keeping the barrel as-is other than that the tree already exports the locales.

Considered/rejected: Re-adding zhCN (and related locale) re-exports on packages/core/src/index.ts. That produced TS2300 Duplicate identifier 'zhCN' at index.ts line 232; the extra export was reverted.

### Ignore everything under .reasongraph except why/ and the nested .gitignore
Status: directed
Touches: `.reasongraph/.gitignore`, `.reasongraph/why/**`, `.reasongraph/state/**`

A nested .reasongraph/.gitignore was added with a deny-all star, then exceptions for the gitignore itself, why/, and why/**. That keeps session and state artifacts out of git while leaving why-digests visible. check-ignore confirmed .reasongraph/state/entries.json is ignored and .reasongraph/why/main.md is not. why/.gitkeep was already tracked; why/main.md was left as-is.

Considered/rejected: Putting the same rules only in the repo-root .gitignore, or deleting local state files, was not used; the ignore file lives under .reasongraph and on-disk state was kept.
Risk: A leading * will hide any future .reasongraph paths unless they are explicitly un-ignored. The !why/ line before !why/** is required so git still descends into that directory.
Reviewer attention: Confirm the nested gitignore is the file that should be committed and that no paths under .reasongraph/state remain staged.

### Unstage .reasongraph/state from the index without deleting the files
Status: discussed — follows from ignore-except-why; files were staged as new and never in HEAD
Touches: `.reasongraph/state/**`

Files under .reasongraph/state had been staged as additions but were not in HEAD. git restore --staged was used so the ignore rules take effect without removing the on-disk files. No commit was made.

Risk: If those paths are re-added to the index before the nested gitignore is committed, session state can land in git again.
