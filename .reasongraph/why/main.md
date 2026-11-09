# Why: main

<!-- reasongraph:v1 generated 2026-11-09 — review before sharing; edit freely, edits are preserved -->

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
Touches: `project.md`, `port.md`, `各服务 package.json 与开发、预览、端到端测试配置`

为避免端口冲突，各服务改用已登记端口并启用 `strictPort`，使端口被占用时明确失败，不会静默回退。报告记录 React 5198、WSX 5199、站点开发 5200、端到端测试 5201、站点预览 5202、Storybook 6007；5198、5199 和 5201 已验证。

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
Touches: `.spec/rfc/0039-*.md`, `.spec/rfc/0040-*.md`, `.spec/rfc/0041-*.md`, `.spec/rfc/0042-overlay-theme.md`

The work groups the three demo issues under RFC-0039 as an index, with separate child RFCs for selection-column layout, pinned-column theming, and overlay theming. This keeps each child’s goals and acceptance criteria independently reviewable.

### Put selection first in columnOrder and vertically align the checkbox; do not add click-row-to-select
Status: discussed
Touches: `packages/core/*`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/src/**/Grid.css`, `demos/react/src/**/SelectionCheckbox*`

The selection column is inserted first when checkbox selection is enabled while preserving the user's data-column order and drag reordering. Checkbox alignment belongs in Grid.css because the measured offset comes from the grid cell's inline baseline; putting the rule on the checkbox element would couple it to parent layout. Browser coverage checks alignment within 2px and exercises range selection and select-all.

### Define pinned-column theme tokens and widen the 0008 demo so horizontal overflow is real
Status: discussed
Touches: `.spec/rfc/0041-pinned-column-theme.md`, `packages/core/src/components/Grid.css`, `packages/theme-base`, `packages/theme-default`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Issue #36 had no horizontal scrollbar because total column width was 910px inside a 1134px container. A separate real defect: pinned header/cell backgrounds use --ac-grid-bg-header-pinned and --ac-grid-bg-cell-pinned with light fallbacks that no theme defines, so pinned cells go white on dark themes. RFC-0041 requires those tokens on the built-in themes, 0008 columns wider than 1.5× the container, e2e that scrollWidth > clientWidth, pinned columns stay put while unpinned move, and dark-theme contrast at least 4.5:1, plus mutation checks. Implementation had not started in this segment.

### Scope RFC-0042 to empty/loading overlay theme, not a full-width row view
Status: discussed
Touches: `.spec/rfc/0042-overlay-theme.md`, `Grid.css`

The reproduced issue is the empty-data overlay: its hard-coded white background conflicts with theme-based text color in dark mode. The RFC calls for a theme token and demo controls to verify empty and loading overlays; loading behavior still requires direct validation. Full-width row views remain outside scope.

Risk: Loading-overlay impact was inferred from shared styling and had not been independently reproduced.
Reviewer attention: Confirm dark-theme text contrast meets the specified 4.5:1 threshold and that the acceptance check fails if the background reverts to white.

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
Touches: `packages/core/dist`, `demos/react/e2e/rfc-validation.spec.ts`

The browser test initially loaded stale packages/core/dist, so rendered column order did not reflect the source change. Rebuilding core before rerunning the browser test ensured validation exercised the implementation.

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

### Fast-forward main and delete local fix/inline-editing-bug after PR #45 merges
Status: directed
Touches: `.reasongraph/why/main.md`, `fix-inline-editing-bug.md`

The required order is to check out main and update it from the remote before deleting the already-merged feature branch. An earlier reverse order left HEAD detached instead of on main; the correction is to get this directory onto main first, then continue cleanup.

Reviewer attention: Confirm this working tree is on main (not detached) before any further branch deletions.

### Update main from the ac-grid-main worktree; leave this checkout detached at that tip
Status: discussed — follows from directed cleanup when main is locked in another worktree
Touches: `.reasongraph/why/fix-inline-editing-bug.md`

main was already checked out in the ac-grid-main worktree, so the pull/fast-forward happened there instead of switching branches in the current tree. The current worktree was left on a detached HEAD at the same main tip so the update could finish without fighting the other checkout.

Considered/rejected: Forcing a main checkout in the current worktree was rejected because git already had main bound to ac-grid-main.
Risk: Detached HEAD in the feature worktree can confuse later local commits if someone forgets to create or switch to a branch first.

### Preserve the untracked why digest while cleaning the merged branch
Status: discussed
Touches: `.reasongraph/why/main.md`, `fix-inline-editing-bug.md`

While moving this directory onto main and syncing with origin/main, untracked why digest files including .reasongraph/why/main.md and fix-inline-editing-bug.md were kept in place rather than discarded by checkout or cleanup.

### Remove extra git worktrees; keep only this checkout
Status: directed
Touches: `../ac-grid-cov`, `../ac-grid-specclean`, `../ac-grid-tmp-rfc-0014-data-export`, `../ac-grid-tmp-rfc-0008-column-pinning`

After remotes were updated, the four temporary worktrees used for rebase and conflict resolution were force-removed and the local feat/rfc-0014-data-export and feat/rfc-0008-column-pinning branches were deleted, leaving only the primary checkout.

Risk: Remote feature branches may still exist until separately deleted.

### Leave dirty sibling worktrees in place rather than delete them
Status: agent-initiated — not requested in plan or prompts
Touches: `ac-grid-cov`, `ac-grid-specclean`

After removing the detached surplus worktree, ac-grid-cov and ac-grid-specclean were left alone because ac-grid-cov still had uncommitted and untracked files; deleting them would risk data loss. No explicit rationale beyond that preservation concern was recorded for keeping both.

Considered/rejected: Immediate deletion of all remaining worktrees was rejected to avoid losing uncommitted work under ac-grid-cov.
Risk: Leftover worktrees continue to violate the no-worktree preference until they are cleaned after their dirty state is handled.
Reviewer attention: Confirm whether ac-grid-cov and ac-grid-specclean should still be removed once their local changes are committed, stashed, or intentionally discarded.

### Leave local main one commit ahead of origin/main after the checkout fix
Status: discussed
Touches: `.reasongraph/why/main.md`

After switching this directory to main and clearing the detached worktree, local main was reported one commit ahead of origin/main at 2ec3c49. No push or reset of that tip was performed in this pass.

Reviewer attention: Confirm whether 2ec3c49 should stay local-only, be pushed, or be dropped relative to origin/main.

### Open PR #57 for feat/rfc-0008-column-pinning against main
Status: directed
Touches: `packages/core/*`, `.git`

The agent pushed feat/rfc-0008-column-pinning and opened a PR onto main so the column-pinning branch could be reviewed through GitHub.

### Rebase open PR worktrees onto origin/main before mergeability checks
Status: discussed
Touches: `.spec/rfc/README.md`, `.spec/rfc/PARITY_MATRIX.md`, `skills/ac-grid/references/features.md`, `packages/core/test/pinning.test.ts`

Remaining PR branches were rebased onto fetched origin/main so conflict and mergeable status reflected current main rather than stale bases. Specclean and export branches hit RFC index conflicts; the cov branch needed working-tree cleanup before rebase could proceed.

Reviewer attention: Confirm each rebased PR tip still carries only its intended commits relative to main.

### Resolve specclean RFC index conflicts by dropping README and taking main PARITY_MATRIX
Status: discussed
Touches: `.spec/rfc/README.md`, `.spec/PARITY_MATRIX.md`, `.spec/rfc/PARITY_MATRIX.md`

During rebase of the spec-cleanup branch, .spec/rfc/README.md was removed and PARITY_MATRIX was taken from the incoming main side so the index matched upstream layout after the conflict.

### Move cov init artifacts aside and stash so rebase onto main can finish
Status: discussed — unblock rebase of cov/unit-100
Touches: `.reasongraph/state/`, `.reasongraph/config.json`, `.codegraph`, `skills/ac-grid/references/features.md`

Uncommitted and untracked init outputs blocked checkout during rebase of the coverage branch. They were stashed and moved under a temp artifacts directory so rebase could continue, then the features.md conflict was resolved and the rebase completed.

Considered/rejected: Leaving the untracked .reasongraph/state and .codegraph trees in place was rejected because git refused to overwrite them on checkout.
Risk: Artifacts remain only in stash/temp; they were not committed on the coverage branch.

### Update CellEditor unit tests for blur no longer saving after #45
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

The RFC-0012 focus test now locates the firstName cell by data-column-id. Its prior first-cell selector assumed the first row cell was firstName, which stopped being true when selection became the leading column.

### Close PR #56 after rebase showed RFC-0014 commits already on main
Status: discussed
Touches: `.spec/rfc/*`

关闭 PR #56，因为其 RFC-0014 提交已包含在 main 中，继续合并会重复已有改动。

### Abort the RFC-0008 rebase and close the duplicate pinning PR
Status: discussed
Touches: `.spec/rfc/0008*`

Column pinning had already landed on main through an earlier PR. The leftover feat/rfc-0008-column-pinning branch conflicted with main, so PR #57 was closed without merging.

Considered/rejected: Force-merging the conflicting old pinning branch was rejected.

### Leave init-generated uncommitted tooling files out of PR commits
Status: discussed
Touches: `.gitignore`, `AGENTS.md`, `.codegraph/`, `.reasongraph/`

Init-produced untracked files were kept out of commits on the coverage work; they remain recoverable from stash and the temp artifacts directory rather than landing in the rebased PR history.

### Restrict .spec/rfc to NNNN-*.md files and delete superseded index docs
Status: directed
Touches: `.spec/rfc/README.md`, `.spec/rfc/roadmap.md`, `.spec/rfc/SUMMARY.md`, `.spec/rfc/GETTING-STARTED.md`, `.spec/rfc/RFC-TEMPLATE.md`, `.spec/0010-kickoff-brief.md`, `.spec/ROADMAP.md`

Under specify, .spec/rfc/ is reserved for NNNN-*.md RFCs and the live index is .spec/ROADMAP.md. Legacy README, roadmap, SUMMARY, GETTING-STARTED, RFC-TEMPLATE, and the completed 0010 kickoff brief were deleted because ROADMAP and specify deliver already replace them.

Considered/rejected: Keeping the old index and template docs beside ROADMAP was rejected as duplicated layout.

### Relocate PARITY_MATRIX and ISSUE_REGISTRY to the .spec root
Status: discussed
Touches: `.spec/PARITY_MATRIX.md`, `.spec/ISSUE_REGISTRY.md`, `.spec/rfc/*`

PARITY_MATRIX.md and ISSUE_REGISTRY.md stay referenced from ROADMAP, TASK_TRACKING, many RFCs, and multica-orca docs. They were moved from rfc/ to the .spec root so rfc/ can stay NNNN-only without dropping those shared registries.

Risk: Callers that still resolve the old rfc/ paths will break until their links are updated.
Reviewer attention: Confirm inbound links from ROADMAP, RFCs, and related docs point at the .spec-root locations.

### Repair RFC-0022 PARITY_MATRIX relative links
Status: discussed — separate commit on PR #54
Touches: `.spec/rfc/0022*`, `.spec/PARITY_MATRIX.md`

RFC-0022 had broken PARITY_MATRIX links after the registry move. Those links were fixed in their own commit on the .spec cleanup PR.

### Drop RFC-0014 from feature-matrix pending after it landed on main
Status: discussed
Touches: `feature-matrix.json`

从待处理列表移除 RFC-0014，因为路线图已将其标为完成，覆盖守卫会将旧 pending 项视为过期。

### Leave init-generated uncommitted tooling files out of PR commits (updated)
Status: discussed
Touches: `.gitignore`, `AGENTS.md`

Init-generated tooling files such as .gitignore and AGENTS.md were left uncommitted and were not included in the cleanup or coverage PR commits. Whether they remain on the main checkout after merge was left unverified.

Reviewer attention: Confirm whether those untracked init artifacts are still present on the main worktree.

### Remove extra git worktrees; keep only this checkout (updated)
Status: directed
Touches: `.`

After PR #54 and #55 merged and the stale feature PRs closed, extra worktrees and local branches (including cov/unit-100, chore/spec-cleanup, chore/submit-all-local-main, and test) were removed so only the main checkout remains, matching origin/main. Remote feat/rfc-0008-column-pinning and feat/rfc-0014-data-export were deleted.

### 为 sorting.enabled=false 建立 RFC-0047 并限定修复范围
Status: discussed
Touches: `.spec/rfc/0047-sorting-enabled-config.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

The change was treated as a behavior fix because the existing API already exposed the option and its JSDoc described the default. RFC-0047 tracked the fix without changing the API shape.

### Cover disabled sorting with a browser end-to-end test
Status: discussed
Touches: `rfc-validation.spec.ts`

The end-to-end case disables sorting, clicks a column header twice, and checks that row order and sort indicators remain unchanged. It reproduced the defect before the fix and passed afterward.

### Document sorting.enabled false in the feature reference
Status: discussed
Touches: `features.md`

The feature reference now states that `enabled: false` disables sorting for all columns.

### Build ReviewGraph data outside the repository
Status: discussed
Touches: `ReviewGraph data directory`

ReviewGraph data was built outside the target repository to avoid adding generated index files to its working tree. The recorded build contained 1,581 nodes.

### Initialize IssueGraph in stealth mode
Status: discussed
Touches: `~/.netify/agent-repos/ac-grid`

The netify hook required agent-owned evidence for four graph indexes before edits could proceed. The indexes were initialized in an agent-specific repository to provide that evidence.

### Add an RFC-0047 validation demo and feature row for completed-RFC coverage
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `skills/ac-grid/references/features.md`

The completed-RFC coverage guards require each completed RFC to have both a validation demo and a feature-reference row. RFC-0047 lacked both, so CI failed even though local end-to-end checks passed while the RFC was still Draft. The proposed repair was to add the RFC to the demo order and add a dedicated `0047` row.

### Add an RFC-0047 validation demo and feature row for completed-RFC coverage
Status: discussed — CI repair proposed; not yet applied
Touches: `demos/react/src/rfcValidationDemos.ts`, `skills/ac-grid/references/features.md`

The CI failure showed that completed RFCs are checked for both a validation demo and a skill feature row. Local checks had run before RFC-0047 entered the completed set, so they did not exercise these guards. The stated next step was to add both coverage entries in the existing PR worktree.

### Keep developer API reference documentation separate from RFC-0047
Status: discussed
Touches: `.spec/rfc/0047-sorting-enabled-config.md`, `docs/*`, `apps/site/*`

The change fixes existing sorting behavior without changing the API shape, so RFC-0047 only needs the existing feature reference updated. A generated API reference for developers would be a separate documentation effort; no implementation was recorded.

### Disable table sorting when sortingConfig.enabled is false
Status: discussed
Touches: `Grid.wsx`

The table receives `enableSorting: false` when sorting is disabled, so header clicks cannot change row order or show sort indicators. The change fixes the behavior with a four-line update.

### Add an RFC-0047 validation demo and feature row for completed-RFC coverage (updated)
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `features.md`, `coverage.spec.ts`

Completed-RFC coverage checks require each archived RFC to have a validation demo and a feature-reference row. The initial changes lacked RFC-0047-specific entries, so local checks passed while CI failed after the RFC was archived. The proposed coverage fix was not completed in the transcript.

### Add an RFC-0047 validation demo and feature row for completed-RFC coverage (updated)
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `skills/ac-grid/references/features.md`

The agent added an RFC-0047 demo and feature reference entry so archived-RFC coverage checks include disabled sorting. The demo covers header clicks without row reordering or sort indicators.

### Run coverage checks in archived RFC state inside repair worktree
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `features.md`, `wt-rfc-0047`

The coverage guards inspect archived RFCs, so checks run against the final archived state in the repair worktree. The transcript reports 36/36 checks passing there, including the two previously failing guards.

### Add an RFC-0047 validation demo and feature row for completed-RFC coverage (updated) (updated)
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `features.md`

The completed-RFC coverage guards require both a validation demo and a feature reference row. Adding RFC-0047 to both keeps archived RFCs represented in the demo order and agent skill coverage.

### Keep current E2E coverage unchanged while all seven registry guards pass
Status: discussed
Touches: `e2e/coverage.spec.ts`

The coverage guard reported seven passing Playwright checks and no registered coverage gaps. These checks validate coverage registration and test titles, not completeness of user behavior, so no specific test change or PR was supported by the audit evidence.

Reviewer attention: Confirm guard results are not treated as proof of full behavioral coverage.

### Treat RFC-0034 as process coverage without a product demo
Status: discussed
Touches: `.spec/ISSUE_REGISTRY.md`, `demos/react/src/rfcValidationDemos.ts`

RFC-0034 是验收矩阵基础设施 RFC，不对应可交互产品功能，因此不需要单独 demo。它在 Registry 标为 done、但未出现在产品 demo 导航中，不构成功能 demo 缺口。

### Add RFC-0012, RFC-0013, RFC-0014, and RFC-0022 to the RFC-0034 acceptance matrix
Status: discussed
Touches: `**/RFC-0034*`, `**/rfc-validation.spec.ts`

The matrix was missing four completed RFCs, leaving their acceptance coverage untracked. Add corresponding behavior rows and update the RFC-0007 acceptance items to reflect the actual checks.

### Extend the coverage guard to verify acceptance-matrix mappings
Status: discussed
Touches: `**/coverage.spec.ts`, `**/rfc-validation.spec.ts`

Require each demo route to map to an acceptance-matrix row and an RFC-specific end-to-end test title. This catches future drift between registered coverage and browser tests.

### Keep RFC-0034 out of the product demo navigation
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `.spec/ISSUE_REGISTRY.md`

RFC-0034 属于流程类 RFC，不需要产品功能 demo。导航注释声称列出所有 Registry 中 done 的 RFC，但实际编号口径不一致；应明确导航按产品功能 demo 组织，避免把流程 RFC 当作遗漏的功能页。

Reviewer attention: 确认导航注释与 Registry 的状态口径一致。

### Strengthen end-to-end checks for RFC-0009, RFC-0012, RFC-0014, and RFC-0016
Status: discussed
Touches: `**/rfc-validation.spec.ts`

Existing checks did not verify all specified behaviors: Enter save and Escape cancel, Tab navigation and editing keys, CSV download contents, and theme variables affecting cells. Verify these behaviors so tests do not pass on weaker evidence. If assertions expose component defects, report them before changing product code.

### Wait for grid readiness before interacting in sorting E2E
Status: discussed
Touches: `demo/react/*`

The sorting test clicked as soon as the Grid appeared, before data and interaction were ready. Waiting for readiness addresses the intermittent failure without hiding the initial 34/35 result.

### Extend approved coverage work to fix RFC-0012 Enter editing and RFC-0014 CSV download
Status: directed
Touches: `demo/react/*`, `packages/core/*`

Browser behavior checks exposed two failures: Enter did not open the editor after keyboard navigation, and the export action did not trigger a download. The expanded work fixed these behaviors and validated them with targeted and full E2E runs.

### Handle Enter centrally in Grid to prevent immediate save after starting edit
Status: discussed
Touches: `packages/core/*`

The same Enter event started editing and then bubbled to Grid, which immediately saved the edit. Handling Enter centrally prevents the event from triggering both actions.

### Run Grid afterMount only after its DOM has mounted
Status: discussed
Touches: `packages/core/*`

The export button was created before Grid mounted because afterMount ran too early, leaving the button absent from the page. Running afterMount after mount makes the button available to the browser test and users.

### Rebuild core before Playwright so demo uses current dist
Status: discussed
Touches: `packages/core/dist/*`

Playwright was loading an outdated core dist build, which obscured the implementation under test. Rebuilding core ensured browser validation exercised the current code.

### Diagnose Enter-triggered editing with a failing focus-and-value test before changing implementation
Status: discussed
Touches: `packages/core/test/editing.test.ts`, `packages/core/src/components/CellEditor.wsx`, `packages/core/src/components/Grid.wsx`

The agent planned to assert that Enter-triggered editing focuses the input and preserves the cell's original value. This would distinguish a focus restoration or render-timing issue from a value initialization issue before choosing a minimal fix.

### Create and validate an RFC before implementing the Enter-editing fix
Status: discussed
Touches: `.spec/rfc/*`

The agent planned to use the specify CLI to create an RFC and run its delivery, validation, and sync checks before implementation, following the repository's RFC workflow.

### 将键盘导航 demo 与 E2E 归入 RFC-0012
Status: discussed
Touches: `/?rfc=0012`, `.spec/rfc/completed/`

键盘导航 demo 路由和 Enter/Escape E2E 对应 RFC-0012。该 RFC 已归档为完成状态，因此无需再次关闭。

### 将覆盖率守卫路径指向归档后的 RFC-0034
Status: discussed
Touches: `demos/react/e2e/coverage.spec.ts`, `.spec/rfc/completed/0034-*.md`

覆盖率守卫仍从 RFC 活跃目录读取 RFC-0034，但该 RFC 已移至 completed 目录，导致文件读取报错。摘要指出应更新读取路径；此修复尚未实施。

Risk: 覆盖率端到端套件因文件不存在而失败。

### 保持 RFC-0040 待远端验证后再关闭
Status: discussed
Touches: `.spec/rfc/`

选择列修复对应仍为 Approved 的 RFC-0040。关闭该 RFC 需要先推送并验证远端；当前记录的提交未包含推送或关闭。

Reviewer attention: 确认 RFC-0040 仍处于 Approved，后续按远端验证流程关闭。

### 在连接时同步输入框值后再聚焦
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

WSX 的状态更新在首次渲染后延迟，单靠更新状态无法保证聚焦当帧的输入框已显示原值。因此连接时直接写入 input.value，再执行聚焦，避免依赖后续重渲染。

### 将 Enter 焦点草稿重新编号为 RFC-0048
Status: discussed
Touches: `.spec/rfc/**`, `ROADMAP*`, `TASK_TRACKING*`

origin/main 已用 RFC-0047 记录 sorting.enabled=false 修复。本地 Enter 编辑焦点草稿改为 RFC-0048，远端 RFC-0047 和本地焦点工作均保留；合并时同步了路线图和任务跟踪。

### 在 CellEditor 连接时从 value attribute 初始化编辑值
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `packages/core/src/components/CellEditor.wsx`

Grid 在编辑器连接前通过属性设置值和类型，避免连接后的异步写入覆盖用户输入。CellEditor 中曾尝试的动画帧写值会造成 RFC-0009 端到端测试间歇失败，因此应保留 Grid 侧预置方案。

### 在键盘导航关闭时由单元格处理 Enter 编辑触发
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `packages/core/test/editing.test.ts`, `packages/core/test/accessibility.test.ts`, `packages/core/test/keyboard-navigation-integration.test.ts`

关闭键盘导航时，网格级 `handleGridKeyDown` 会提前返回，导致 `editTrigger: "enter"` 和 `"both"` 无效。单元格 `onKeyDown` 只在键盘导航关闭时处理该 Enter 行为；导航开启时仍由网格级处理，避免重复触发。新增行为用例覆盖未启用导航、`doubleClick` 和导航开启的情形；核心全量单测 52 个文件、524 个测试通过。

### 补充双击编辑路径的原值断言
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

Enter 与双击共用 CellEditor，双击路径也可能受到原值初始化问题影响；现有双击用例只检查编辑器可见，未检查原值。补充断言尚未实施。

### 将开发者 API 参考文档与 RFC-0047 分开
Status: discussed
Touches: `.spec/rfc/0051-api-reference-docs.md`

API 参考文档覆盖公开导出，属于独立文档工作，应避免并入排序修复 RFC-0047。

### 让 coverage guard 从归档目录读取 RFC-0034
Status: discussed
Touches: `*coverage*`

RFC-0034 归档后，coverage guard 仍从活动目录读取它，导致完整 E2E 检查失败。读取路径需覆盖归档状态，才能让 guard 在 RFC 生命周期变更后继续找到该 RFC。

Risk: 若路径处理只针对 RFC-0034，其他归档 RFC 仍可能无法通过覆盖检查。

### 对照基线确认两项全量单测失败与修复无关 (updated)
Status: discussed
Touches: `packages/core/test/accessibility.test.ts`, `packages/core/test/keyboard-navigation-integration.test.ts`, `packages/core/src/components/CellEditor.wsx`

还原 CellEditor 改动后，两项失败仍存在，确认它们也出现在基线中。最新全量结果为 519 项通过、2 项失败；当前 HEAD 的全量单测仍未通过。

Reviewer attention: 确认失败用例与 Enter 编辑路径的预期是否一致，并据此判断是否需要修复。

### 保留 RFC-0009 偶发端到端失败作为未解决问题
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

RFC-0009 单独运行六次均通过，但并行运行时出现一次失败并显示“ErikErik Saved”。渲染竞态仅是未证实的猜测，尚无已确认机制或修复。

Reviewer attention: 确认并行运行中的重复保存是否与 CellEditor 改动相关。

### 验证 CellEditor 的 type 属性读取条件
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

摘要指出，type getter 默认返回 text，使第 73 行的 if (el.type) 条件可能恒真并覆盖 _type。该行为仅通过代码检查提出，尚未验证或修复。

Reviewer attention: 验证 getter 行为及其对非 text 输入类型的影响。

### Initialize CellEditor input from value attribute on connection
Status: discussed
Touches: `packages/core/src/**/*CellEditor*`, `packages/core/**/*CellEditor*`

保留从 `value` attribute 读取初始值的兼容路径，避免只支持 property 的改动破坏现有调用者。直接在 `super.onConnected()` 前初始化会触发 JSDOM `InvalidStateError` 并导致日期编辑失败，因此采用已验证的 Grid 首次连接前赋值路径。

### Assert original value and focus in Enter-edit coverage
Status: discussed
Touches: `packages/core/test/editing.test.ts`, `demos/react/e2e/rfc-validation.spec.ts`

Visibility alone did not catch the empty-input defect. Add assertions for focus and the original value; the test failed before the fix and passed afterward.

### Keep RFC-0048 approved until acceptance criteria pass
Status: discussed
Touches: `.spec/rfc/0048-enter-edit-focus-and-value.md`

Implementation and focused end-to-end checks passed, but full core tests still had two failures and the coverage comparison lacked a confirmed summary. Archive only after remaining acceptance criteria are verified.

### Keep RFC-0009 intermittent end-to-end failure unresolved
Status: discussed
Touches: `demos/react/e2e/rfc-validation.spec.ts`

The failure appeared during parallel execution but passed in six isolated runs. The suspected rendering race was not established, so the cause remains unconfirmed.

### 保留 doubleClick 作为默认编辑触发方式并显式配置 Enter 测试
Status: discussed
Touches: `packages/core/test/keyboard-navigation-integration.test.ts`, `packages/core/src/components/CellEditor.wsx`

实现保留现有默认触发方式，避免改变产品行为。需要验证 Enter 编辑的测试显式设置 `editTrigger: "both"`。

### 补齐 RFC-0029 图表 demo 与浏览器验收
Status: discussed
Touches: `RFC-0029 图表 demo 路径`, `RFC-0034 验收矩阵`, `归档 RFC 覆盖检查路径`

将 RFC-0029 图表 demo 纳入验收覆盖，并修正覆盖检查，使其从归档位置读取 RFC-0034。完整端到端套件通过，结果为 39/39；相关 core 单测通过，结果为 20/20。

Risk: 并行运行时曾出现 grid 未及时加载；单 worker 完整重跑通过。

### 为关闭键盘导航时的 Enter 编辑行为建立 RFC-0049
Status: discussed
Touches: `.spec/rfc/0049-enter-trigger-without-keyboard-nav.md`, `packages/core/src/components/Grid.wsx`, `packages/core/test/editing.test.ts`

网格级 Enter 处理受键盘导航开关控制；关闭导航时，启用 Enter 触发的单元格需自行启动编辑。保留网格级处理作为导航开启时的路径，并测试关闭、开启及 doubleClick 配置下的行为。

### 在编辑期间移除单元格的 data-wsx-key
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`

WSX 会按 data-wsx-key 恢复单元格焦点，导致焦点从编辑输入框移回单元格。编辑期间省略该键可让焦点留在输入框，并由端到端焦点断言覆盖此行为。

### 将 RFC-0048 保持 Approved 直到验收标准通过
Status: discussed
Touches: `.spec/rfc/0048-enter-edit-focus-and-value.md`, `.spec/rfc/0049-enter-trigger-without-keyboard-nav.md`

两个 RFC 已通过验证和同步检查，但仍处于 Approved；RFC 生命周期应等实现提交推送并确认远端后再推进到 Implemented 和归档。

### 更新 CellEditor 单元测试以适配 blur 不再保存
Status: discussed
Touches: `packages/core/test/keyboard-navigation-integration.test.ts`

键盘导航集成测试显式启用 both 编辑触发方式，使 Enter 编辑行为与当前触发配置一致。

### 在编辑期间移除单元格的 data-wsx-key
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

端到端验收需同时确认编辑输入框获得焦点且显示原值；单元测试无法单独证明 WSX 不会在浏览器中恢复单元格焦点。

### Use fnm with Node.js 22 for project commands
Status: directed
Touches: `package.json`

The agent selected fnm to run the project with Node.js 22 because the package metadata still pins Node.js 22.23.2 through a Volta block, while fnm provides Node.js 22.23.4. The repository configuration was not changed.

### Recover from an invalid working directory before reloading fnm
Status: discussed
Touches: `/Users/albert.li/.zshrc`

The agent traced the Volta, fnm, and pnpm errors to a shell whose current directory no longer exists. Reloading the shell configuration can invoke fnm, which also needs a valid current directory, so recovery requires changing to an existing directory or opening a new terminal first.

### Defer Node version configuration cleanup to the RFC process
Status: discussed
Touches: `package.json`, `.node-version`

The agent identified a stale Volta block and proposed a `.node-version` file for fnm auto-switching. Those configuration edits were deferred as a separate change requiring the repository's RFC process.

### 先 RFC 后实现
Status: directed
Touches: `.spec/rfc/*.md`

Persistent changes require an RFC created and validated before implementation. Code changes remain gated on explicit RFC approval.

### 从公开导出生成 API 参考并发布到站点
Status: discussed
Touches: `.spec/rfc/0051-api-reference-docs.md`, `packages/core/src/index.ts`, `apps/site/public/docs/api/`

The package export barrel is the API's authoritative surface. The proposal generates reference pages from types and TSDoc, publishes them under `/docs/api/`, and makes missing pages fail the build.

### 为已实现但缺少文档的功能补充使用指南 (updated)
Status: discussed
Touches: `.spec/rfc/0052-feature-guides.md`, `apps/site/public/docs/guide/`

Existing guides omit several implemented features. The first proposed batch covers editing, keyboard navigation, pagination, and virtual scrolling, with examples tied to existing demos or end-to-end coverage.

### 更新 README 以反映当前包结构和可达文档
Status: discussed
Touches: `.spec/rfc/0053-readme-refresh.md`, `README.md`, `docs/README.md`, `pnpm-workspace.yaml`, `.spec/ROADMAP.md`

The root README describes an outdated package layout and version. The proposal aligns package listings with the workspace and feature status with the roadmap; both README link to a nonexistent root `ROADMAP.md`.

### 将 typedoc 产物设为构建时生成而非入库
Status: discussed
Touches: `.spec/rfc/0051-api-reference-docs.md`, `apps/site/`

API 页面由源码类型生成，可在站点构建前生成产物，避免提交重复维护的生成文件。该方式仍需站点依赖可用并验证构建链路。

Considered/rejected: 将生成产物入库会增加需要随源码同步维护的重复内容。

### 保持 GridSortingConfig 类型位置不变，先验证文档生成器
Status: discussed
Touches: `.spec/rfc/0051-api-reference-docs.md`, `packages/core/src/components/Grid.wsx`

GridSortingConfig 位于 Grid.wsx，typedoc 可能无法解析。先验证工具解析能力；若需移动类型定义，应作为独立产品代码变更处理。

Risk: 若生成器无法解析该类型，API 文档覆盖可能不完整。

### Keep RFC-0048 and RFC-0049 approved until closure evidence is complete
Status: discussed
Touches: `.spec/rfc/0048-*.md`, `.spec/rfc/0049-*.md`

RFC 生命周期须等验收通过、实现提交并推送、远端分支确认后再推进。项目级覆盖率未达 100%，不能将其报告为全仓 100%；实际过滤既有失败项后的覆盖率为 statements 71.87%、branches 47.96%、functions 71.52%、lines 75.26%。

### Create RFC-0050 umbrella issue with three backlog child issues
Status: discussed
Touches: `./mc-0050.md`

The agent created DEV-188 for RFC-0050 and DEV-189 through DEV-191 for RFC-0051 through RFC-0053, linking each child to the umbrella issue. All four issues use `backlog` status and remain unassigned because the RFCs are Draft.

Reviewer attention: Confirm issue titles, parent-child links, and backlog statuses for DEV-188 through DEV-191.

### 将文档覆盖拆成总纲与三个独立子 RFC
Status: discussed
Touches: `.spec/rfc/0050-documentation-coverage.md`, `.spec/rfc/0051-api-reference-docs.md`, `.spec/rfc/0052-feature-guides.md`, `.spec/rfc/0053-readme-refresh.md`

RFC-0050 serves as an index and closes after its three child RFCs are complete. RFC-0051 covers generated API reference, RFC-0052 covers feature guides, and RFC-0053 covers README updates.

### Keep RFC-0050 through RFC-0053 in Draft until approved
Status: discussed
Touches: `.spec/rfc/0050-documentation-coverage.md`, `.spec/rfc/0051-api-reference-docs.md`, `.spec/rfc/0052-feature-guides.md`, `.spec/rfc/0053-readme-refresh.md`

All four RFCs remain Draft, so implementation does not begin before approval.

### Use explicit paths for commits and review hook-generated digest changes
Status: discussed
Touches: `.reasongraph/why/main.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, `.spec/rfc/0048-enter-edit-focus-and-value.md`, `.spec/rfc/0049-enter-trigger-without-keyboard-nav.md`

Commits should stage only named paths so unrelated workspace changes are not swept in. The hook-generated ReasonGraph digest requires diff review before deciding whether to include it.

### Keep unapproved RFC issues in backlog without assignees
Status: discussed
Touches: `.spec/rfc/0050-documentation-coverage.md`, `.spec/rfc/0051-api-reference-docs.md`, `.spec/rfc/0052-feature-guides.md`, `.spec/rfc/0053-readme-refresh.md`

The RFCs are Draft, so their corresponding issues remain in backlog without assignees. This avoids activating implementation work before approval.

### Defer typedoc integration choice until feasibility is assessed
Status: discussed
Touches: `.spec/rfc/0051-api-reference-docs.md`, `package.json`

The project has no API documentation generator, while `@wsxjs/wsx-press` includes a typedoc dependency. Whether it can be reused directly remains unassessed.

### 推送实现与 ReasonGraph 生成提交并核对远端 SHA
Status: discussed
Touches: `.reasongraph/why/**`

实现提交已推送到 main；ReasonGraph hook 随后生成了本地提交。同步命令未能处理 14 个历史会话，但确认 why-pack 已提交且 RFC 变更未受影响，因此继续推送生成提交并核对远端 SHA。

Risk: 历史会话未完成蒸馏；自动生成提交可能包含尚未处理的会话状态。

### Reject post-render CellEditor value writes after stress failures
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

The agent reverted the post-render `input.value` write after stress runs showed 7/90 failures with that approach versus 0/90 on the baseline. Failures duplicated old and new cell text, so the approach was not safe to keep.

### Align RFC-0048 Design with the implemented root cause
Status: discussed
Touches: `.spec/rfc/0048-enter-edit-focus-and-value.md`

The agent updated the Design section to match the observed causes and implementation in `Grid.wsx`; the earlier description pointed to `CellEditor.wsx`. This keeps the RFC useful for reviewing the actual behavior change.

### Use a theme token for grid overlay backgrounds
Status: discussed
Touches: `**/Grid.css`, `.spec/rfc/0042-overlay-theme.md`

The agent chose `--ac-grid-bg-overlay` for `.grid-overlay` instead of a hard-coded white background, with each built-in theme defining the token. This keeps overlay backgrounds aligned with theme-aware text colors. Acceptance criteria require dark-theme contrast of at least 4.5:1 and a regression check that fails if the background is changed back to white.

Risk: The loading overlay was inferred to share the same issue; it had not been independently reproduced.

### 先 RFC 后实现 (updated)
Status: discussed
Touches: `.spec/rfc/*`

排序演示的实现须等待对应 RFC 获批；草案阶段不启动实现，以保持 RFC 审批门槛。

### Replace text-only RFC checks with interactive behavior tests
Status: discussed
Touches: `App.tsx`, `Playwright RFC-0001 and RFC-0030 test files`

RFC-0001 和 RFC-0030 的原测试只断言文本，无法证明交互行为。工作改为实现交互式公式表并用行为测试替换弱断言；报告称新测试在功能损坏时失败、恢复后通过。

### Use a shared quiet-wait helper for initialization-race tests
Status: discussed
Touches: `Playwright test helper`, `RFC-0022 test`, `sorting test`

多个测试等待初始化稳定的方式不一致，排序测试还使用固定的 `waitForTimeout(300)`。统一 helper 并让等待依赖实际稳定条件，避免测试依赖任意延迟。报告称全量测试连续 10 次通过，每次 26/26；修复前约 9 次中有 6 次失败。

### Restore focus through the grid cells' existing key attribute
Status: discussed
Touches: `RFC-0012 Playwright test`, `Grid cell rendering code`

WSX 的重渲染焦点恢复按 `data-wsx-key` 查找元素，而网格单元格使用 `key`，导致恢复逻辑找不到目标。修复围绕真实键盘操作验证焦点恢复，并加入可复用的安静等待；报告称全量测试连续 10 次通过。

### Keep Playwright end-to-end tests parallel
Status: discussed
Touches: `Playwright configuration`

串行运行会掩盖并行环境中的真实失败，因此恢复上游并行配置，并修复并行运行中暴露的问题。报告称完整端到端套件在并行配置下连续 15 次通过。

### Measure coverage across all core source files
Status: discussed
Touches: `packages/core coverage configuration`

原覆盖率配置只纳入 5 个已达到 100% 的文件，无法反映整个 core 的测试缺口。配置改为统计全部 `src`，门槛设在实测基线并要求只升不降；记录的基线为行覆盖率 58.8%、分支覆盖率 35.3%、函数覆盖率 55.4%。

### Keep sorting.enabled false as an unresolved product bug
Status: discussed
Touches: `Grid sorting implementation`, `sorting-related RFC`

检查发现 `sorting: { enabled: false }` 没有关闭排序，说明配置行为与预期不符。该缺陷已记录到 RFC，但当前修复状态未确认。

### Validate TSV quote escaping with a mutation check
Status: discussed
Touches: `packages/core TSV serialization source`, `TSV serialization tests`

通过临时破坏 `serializeTsv` 的引号转义来确认测试能检测回归；报告称测试捕获了该破坏，随后源码已恢复。

### Generate API reference from public types and TSDoc
Status: discussed
Touches: `packages/core/src/types/*.ts`, `packages/core/src/index.ts`

The API reference is planned from exported types and TSDoc using the documentation framework’s typedoc route. This keeps reference content tied to the public API and avoids a separately maintained hand-written reference.

Considered/rejected: A hand-written API reference was rejected because it would duplicate source definitions.

### Create RFC-0050 umbrella with three documentation child RFCs
Status: discussed
Touches: `.spec/rfc/0050-documentation-coverage.md`, `.spec/rfc/0051-api-reference-docs.md`, `.spec/rfc/0052-feature-guides.md`, `.spec/rfc/0053-readme-refresh.md`

The umbrella RFC tracks the overall documentation gap and closes after its three child RFCs are complete. Separate child RFCs keep API reference generation, feature guides, and README updates independently scoped.

### Create RFC-0050 umbrella with three documentation child RFCs (updated)
Status: discussed
Touches: `.spec/rfc/0050-documentation-coverage.md`, `.spec/rfc/0051-api-reference-docs.md`, `.spec/rfc/0052-feature-guides.md`, `.spec/rfc/0053-readme-refresh.md`

RFC-0050 serves as an index and closes only after all three child RFCs are complete. The child RFCs separate API reference generation, feature guides, and README/index corrections so each has focused acceptance criteria.

Risk: All four RFCs remain Draft; implementation and issue activation depend on approval.

### Generate API reference from public types and TSDoc (updated)
Status: discussed
Touches: `packages/*/src/index.ts`, `docs/api/`

RFC-0051 defines API pages from public type exports and TSDoc, keeping reference content tied to source definitions. Acceptance criteria cover every export, fail the build when a page is missing, verify that TSDoc edits appear, and check pages in a browser.

Risk: A missing-page guard must detect omissions reliably; the RFC requires a mutation check.

### Add usage guides for existing features with demo or E2E examples
Status: discussed
Touches: `docs/`

RFC-0052 starts with editing, keyboard navigation, pagination, and virtual scrolling guides. Examples must match existing demos or end-to-end coverage, so documentation does not describe unsupported behavior; each guide is checked in a browser.

### Refresh README package, roadmap, and accessibility links
Status: discussed
Touches: `README.md`, `docs/README.md`, `pnpm-workspace.yaml`, `.spec/ROADMAP.md`

RFC-0053 ties package listings to workspace configuration and feature status to the spec roadmap. Link checks include a mutation check; the RFC records that both READMEs link to a missing root roadmap, the root README names `packages/ac-grid-react`, and the docs index lacks an accessibility link.

### 仅对 attribute-only CellEditor 初始化值执行回退写入
Status: discussed
Touches: `packages/core/*`, `RFC-0048`

直接读取 value attribute 的既有调用路径需要保留初始值，因此补回该路径的兼容写入。Grid 已预设 property 时跳过回退写入，避免重复设置文本。

Reviewer attention: 确认 attribute-only 路径保留原值，Grid 预设 property 路径不重复写入；相关单测通过。

### 限制 CellEditor 测试 teardown 的焦点清理范围
Status: discussed
Touches: `packages/core/*`

测试遗留的焦点污染了 PaginationControls 的跨文件重渲染，导致分页 i18n 测试失败。teardown 仅 blur 自身容器内的活动元素，避免影响其他组件。组合测试 33/33 通过。

### 仅在远端确认提交后将 RFC-0048 和 RFC-0049 标记为 Implemented
Status: discussed
Touches: `RFC-0048`, `RFC-0049`

RFC 状态流转依赖实现提交已推送并存在于远端。先推送并核对远端提交，再通过 Specify 更新状态并归档，保证 RFC 生命周期记录与代码状态一致。

### 如实报告全量覆盖率，不将范围测试当作全包 100%
Status: discussed
Touches: `packages/core/*`, `RFC-0043`

全量 core 覆盖率为语句 71.89%、分支 48.04%、函数 71.52%、行 75.28%，结果为 527 通过、1 跳过。RFC-0043 才负责提升全包覆盖率至 100%，因此本次验证报告保留实测范围与数值。
