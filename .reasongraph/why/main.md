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
Status: discussed
Touches: `Grid.wsx`

The merge retains RFC-0013 role and ARIA attributes alongside the branch's key attributes. Keyboard navigation keeps RFC-0013 tabIndex behavior, with editable and clipboard behavior used when keyboard navigation is disabled. The class name includes a separating space so drag state does not produce a malformed class.

### Keep both RFC-0013 and RFC-0001 coverage in the validation spec
Status: discussed
Touches: `rfc-validation.spec.ts`

Both RFCs retain coverage in the validation spec so the merge preserves checks for each behavior.

### Add an RFC-0013 demo spec, skill row, and e2e query so the coverage guard can pass after the merge
Status: discussed
Touches: `features.md`, `RFC-0013 demo`, `RFC-0013 demo spec`, `skill coverage table`

The coverage guard found that completed RFC-0013 lacked a demo and corresponding skill coverage. Adding those artifacts lets the guard verify the completed feature.

### Leave demos/react Storybook tsc errors untouched
Status: agent-initiated — not requested in plan or prompts
Touches: `demos/react/src/stories/Page.tsx`

tsc --noEmit in demos/react still failed on src/stories files missing ../../lib/components/Header. Those files were not part of the merge resolution and were left as-is.

### Convert the stray virtual-scroll test-plan document into RFC-0038 via the specify CLI and do not copy its claims
Status: discussed
Touches: `.spec/test-plan.md`, `.spec/rfc/0038-virtual-scrolling-verification.md`, `.spec/rfc/completed/test-plan.md`, `ROADMAP.md`, `TASK_TRACKING.md`

RFC-0038 replaces the stray test-plan with a validated proposal. The source made unsupported claims about files, existing tests, and performance results, and proposed frame-rate testing in JSDOM, which lacks browser layout and rendering. The RFC calls for browser correctness coverage and measuring performance before setting thresholds.

### Delete the untracked checkout copy of test-plan.md
Status: directed
Touches: `.spec/test-plan.md`

The untracked test-plan copy was removed after its useful scope had been captured in RFC-0038.

### Stop expanding RFC-0036; split P1 demo defects into umbrella 0039 and three child RFCs
Status: discussed
Touches: `.spec/rfc/0036-*.md`, `.spec/rfc/0039-*.md`, `.spec/rfc/0040-*.md`, `.spec/rfc/0041-*.md`, `.spec/rfc/0042-*.md`

RFC-0036 combined multiple root causes and priority levels, so the work is organized as an umbrella with focused child RFCs. RFC-0040 covers selection-column placement and alignment, RFC-0041 covers pinned-column theme tokens and horizontal overflow, and RFC-0042 covers the row-view demo and theme behavior.

### Put selection first in columnOrder and vertically align the checkbox; do not add click-row-to-select
Status: discussed
Touches: `.spec/rfc/0040-*.md`, `Grid.wsx`

The selection column was absent from columnOrder, causing it to appear last, and the checkbox alignment was visibly wrong. Row-click selection is outside the existing RFC-0007 behavior, which covers checkbox selection and Shift range selection.

### Define pinned-column theme tokens and widen the 0008 demo so horizontal overflow is real
Status: discussed
Touches: `.spec/rfc/0041-*.md`, `Grid.css`, `RFC-0008 demo`

The demo's total column width was smaller than its container, so it could not demonstrate horizontal scrolling. Pinned columns also lacked dark-theme background variables and fell back to a light background.

### Scope RFC-0042 to empty/loading overlay theme, not a full-width row view
Status: discussed
Touches: `.spec/rfc/0042-*.md`, `RFC-0019 demo`, `Grid.css`

The reported row-view theme issue could not be reproduced because the demo had no row view. RFC-0042 requires a representative demo before evaluating theme behavior; if the first test passes, the issue is demo coverage rather than a core rendering defect.

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
Status: discussed
Touches: `.spec/rfc/completed/0001-ac-grid-architecture.md`, `.spec/rfc/0009-*.md`, `.spec/rfc/0012-*.md`, `.spec/rfc/0013-*.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

The agent added the current-format Status header and Summary section because the lifecycle command did not recognize the old-format status, then advanced and archived RFC-0001. Implemented was selected because the archive command accepts only Implemented or Rejected. The agent also repaired relative links between the listed RFCs.

### Reset the stale local main to origin/main after backing up the extra local commit
Status: discussed
Touches: `main`

The agent synchronized local main with origin/main after preserving the extra local commit on a backup branch. The backup was later deleted, leaving local main aligned with the remote tip.

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
Touches: `packages/core/dist/**`, `packages/theme/dist/**`

Local end-to-end checks initially lacked generated dist output. Building the packages before rerunning the coverage guard made the demo use current artifacts; the guard passed 7 of 7 checks.

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
Touches: `**/*CellEditor*test*`

The tests were changed to match the existing behavior after blur stopped saving. Restoring the old save behavior would contradict that change.

Risk: Tests may miss a regression if blur-save behavior is later reintroduced intentionally.

### Close PR #56 after rebase showed RFC-0014 commits already on main
Status: discussed
Touches: `.spec/rfc/*0014*.md`

Rebasing showed the PR's RFC-0014 changes were already present on main, leaving no distinct change to merge. Closing the empty PR avoids duplicating landed work.

### Abort the RFC-0008 rebase and close the duplicate pinning PR
Status: discussed
Touches: `.spec/rfc/*0008*.md`

The pinning implementation had already landed through another PR, making the rebased branch obsolete. Closing it avoids merging stale or duplicate changes.

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
Status: discussed
Touches: `.spec/rfc/*0022*.md`

A broken relative link was corrected so RFC-0022 points to the parity matrix at its current location.

### Drop RFC-0014 from feature-matrix pending after it landed on main
Status: discussed
Touches: `feature-matrix.json`

RFC-0014 was already completed on main, while the feature matrix still listed it as pending. Removing the stale entry aligns the coverage guard with the archived implementation state.

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

### Create and validate an RFC before the Enter-editing fix
Status: discussed
Touches: `.spec/rfc/0047-enter-edit-focus-and-value.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

将 Enter 编辑时焦点与原值问题记录为 RFC-0047，并在实施前验证和批准范围。RFC 状态推进至 Approved；本次代码改动围绕该问题展开。

Risk: 记录显示 RFC 检查通过，但 `sync-check` 退出码未单独核对。

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

Enter 编辑覆盖需同时断言焦点和原值，才能捕捉输入框为空这一根因。修复前的回归验证中，原值断言失败而焦点断言通过；修复后新增单测通过。

### Keep RFC-0048 approved until acceptance criteria pass
Status: discussed
Touches: `.spec/rfc/0048-enter-edit-focus-and-value.md`

Implementation and focused end-to-end checks passed, but full core tests still had two failures and the coverage comparison lacked a confirmed summary. Archive only after remaining acceptance criteria are verified.

### Keep RFC-0009 intermittent end-to-end failure unresolved
Status: discussed
Touches: `demos/react/e2e/`

RFC-0009 单独运行通过，但整体端到端运行曾失败，随后单独重复六次通过；该差异提示并行运行时可能存在渲染竞态，现有证据不足以确认问题已解决。

Reviewer attention: 确认后续整体并行端到端运行是否稳定；不要将单独重跑通过视为竞态已修复。

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
Touches: `Grid.wsx`, `PaginationControls`

Agent merged remote `main` changes, then reran validation because `Grid.wsx` changed. Focused unit tests passed 34/34 and Chromium end-to-end tests passed 42/42, but the full unit suite still had one reproducible failure in an unchanged pagination i18n test; RFCs therefore remain Approved pending complete acceptance evidence.

Risk: Implementation push may proceed while RFC closure remains blocked by the existing pagination test failure.
Reviewer attention: Confirm remote implementation commit and track the pagination i18n failure before marking either RFC Implemented.

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
Touches: `main`, `.reasongraph/why/`

推送实现提交后，pre-push hook 又生成 why-pack 提交，使本地 `main` 再次领先。代理继续推送，直到本地与远端 SHA 一致；远端已收到的提交为 `46be960`，随后生成的本地提交为 `9c42b7e`。

Risk: ReasonGraph pre-push hook 的 Codex 与 Claude 后端均发生超时，推送可能延迟。

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

### Remove extra git worktrees; keep only this checkout (updated)
Status: discussed
Touches: `.git/worktrees/*`

Merged PR worktrees and branches were cleaned up after verifying their content and merge state. The main checkout was left clean and synchronized with origin/main.

### 由 PaginationControls 的 i18n setter 单独安排下一帧渲染
Status: directed
Touches: `packages/core/src/**/*PaginationControls*`, `packages/core/**/*PaginationControls*`

通用状态调度器在渲染期间丢弃更新，导致 `_isRendering` 卡在 `true`，后续 i18n setter 和显式重渲染都失效。让 setter 自行安排下一帧，修复组件动态文案更新。

### 用默认文案到自定义文案的回归测试覆盖 i18n 更新
Status: directed
Touches: `packages/core/**/*PaginationControls*test*`

隔离测试复现了动态 i18n 文案未更新。回归测试先验证默认文案，再切换自定义文案，并检查 falsy 值仍被保留。

### 将 RFC-0054 的测试通过与覆盖率门槛失败分开报告
Status: discussed
Touches: `.spec/rfc/**/*0054*`, `packages/core/src/**/*grid-state*`

完整 core 测试 533/533 通过，浏览器 E2E 42/42 通过；覆盖率命令仍因既有 `grid-state.ts` 缺口触发 RFC-0043 的全包门槛失败。该缺口不属于 RFC-0054 修复范围，因此未修改。

### 通过 Specify 归档 RFC-0054 及已完成的 RFC-0048、RFC-0049
Status: discussed
Touches: `.spec/rfc/**/*0048*`, `.spec/rfc/**/*0049*`, `.spec/rfc/**/*0054*`

Specify 将 RFC-0048、RFC-0049 和 RFC-0054 标记为 Implemented 并归档，且同步检查通过。

### 在连接时同步输入框值后再聚焦 (updated)
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

Grid 通过 `value` attribute 将单元格原值传给编辑器，但编辑器未读取该 attribute；延迟的状态重渲染会让输入框在聚焦时仍为空。连接时读取 attribute，并在聚焦同一帧写入输入框，可避免依赖延迟重渲染。

### 推送生成的 ReasonGraph digest after syncing pending sessions
Status: discussed
Touches: `.reasongraph/why/**`

同步完成后，本地生成两个 why-pack 提交，远端尚未包含这些提交。推送并核对最终 SHA，确保生成的 digest 与远端一致。

### Move the generic getting-started guide to docs
Status: discussed
Touches: `.spec/rfc/GETTING-STARTED.md`, `docs/GETTING-STARTED.md`

The guide is general project documentation, so it belongs under `docs/` rather than beside RFCs. Its links were updated to match the new location.

### Merge RFC tracking and parity into canonical files
Status: discussed
Touches: `.spec/rfc/roadmap.md`, `.spec/rfc/ISSUE_REGISTRY.md`, `.spec/rfc/PARITY_MATRIX.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

The dependency graph and AG Grid parity content were folded into `.spec/ROADMAP.md`; RFC-to-issue mappings were folded into `.spec/TASK_TRACKING.md`. The roadmap already listed RFCs 0001–0032, and the registry added issue mapping absent from task tracking, so both sources could be removed after preserving their unique content.

Considered/rejected: Keeping separate detail files would preserve redundant sources and require ongoing cross-file synchronization.

### Remove the RFC template and stale summary instead of retaining RFC-specific docs
Status: discussed
Touches: `.spec/rfc/RFC-TEMPLATE.md`, `.spec/rfc/SUMMARY.md`, `docs/RFC-TEMPLATE.md`, `docs/RFC-SUMMARY.md`, `.spec/rfc/README.md`

The template was removed rather than copied into another document, and the historical summary was dropped as superseded. Useful RFC management rules remained in `.spec/rfc/README.md`.

### Merge docs README content into the repository README
Status: directed
Touches: `docs/README.md`, `README.md`

Unique documentation links and pointers were added to the root README, then the duplicate docs README was removed so there is one project entry point.

### Update documentation links after the RFC file consolidation
Status: discussed
Touches: `docs/GETTING-STARTED.md`, `README.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, `.spec/rfc/*.md`, `.claude/skills/multica-orca/SKILL.md`, `.cursor/skills/multica-orca/SKILL.md`, `.opencode/skills/multica-orca/SKILL.md`, `.agent/skills/multica-orca/SKILL.md`

Links were redirected to the canonical roadmap and task-tracking files after the standalone registry and parity documents were removed. The Multica workflow copies were updated because they instructed future runs to edit the deleted registry path.

### Update RFC path references to the refactored demo directories
Status: directed
Touches: `.spec/rfc/0017-framework-bindings.md`, `.spec/rfc/completed/0005-virtual-scrolling.md`, `.spec/rfc/completed/0006-pagination.md`

References were changed from the previous `apps/demo-*` locations to `demos/react` and `demos/wsx` so the RFCs point to the current repository layout.

### Track the RFC-0010 coverage gap in a separate RFC before implementation
Status: directed
Touches: `.spec/rfc/0035-rfc-0010-e2e-coverage.md`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`, `.spec/rfc/0010-grouping-aggregation.md`, `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`

The audit found grouping and aggregation already implemented and covered by a 298-line unit suite, while the `?rfc=0010` demo route and matching end-to-end test were missing. RFC-0035 records the smaller coverage and status correction scope rather than treating the feature as a fresh implementation. The RFC validated as Draft, and implementation remained pending approval.

### Keep unit and end-to-end coverage as separate 100% gates
Status: directed
Touches: `.spec/rfc/0043-*.md`, `.spec/rfc/0044-*.md`, `.spec/rfc/0045-*.md`, `.spec/rfc/0046-*.md`, `ROADMAP.md`

单元测试以 `packages/core` 的语句、分支、函数和行覆盖率各 100% 为目标。端到端测试按 ROADMAP 中的 P0、P1、P2 功能清单检查覆盖，不采集或合并 V8 代码覆盖率；两类门槛分别报告、分别检查。

Considered/rejected: 拒绝合并单元与端到端覆盖率，也拒绝用 V8 排除项或豁免清单凑足 100%。

### Collect Playwright coverage separately with V8
Status: discussed
Touches: `.spec/rfc/0045-*.md`

RFC-0045 specifies V8 coverage collection from Playwright, mapped to packages/core/src, with a separate output directory and test:e2e:coverage command. Its acceptance criteria require the report to contain no Vitest data.

### Require mutation checks and justified coverage exclusions
Status: discussed
Touches: `.spec/rfc/0043-*.md`, `.spec/rfc/0044-*.md`, `.spec/rfc/0045-*.md`, `.spec/rfc/0046-*.md`

The RFCs require mutation checks that demonstrate tests fail when covered behavior is broken. Coverage exclusions use v8 ignore only with a written reason, a registry entry, and a cap.

### Split coverage work into an umbrella and three scoped RFCs
Status: discussed
Touches: `.spec/rfc/0043-*.md`, `.spec/rfc/0044-*.md`, `.spec/rfc/0045-*.md`, `.spec/rfc/0046-*.md`

RFC-0043 defines the overall coverage target; RFC-0044 covers pure-logic unit tests, RFC-0045 covers end-to-end coverage collection and gating, and RFC-0046 addresses .wsx component gaps. Scope remains packages/core, with each suite's gaps addressed by that suite's tests.

### Keep the RFC-0014 work in separate local commits
Status: discussed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/src/components/Grid.wsx`, `packages/core/test/export.test.ts`, `.spec/rfc/*`, `.gitignore`, `.reasongraph/.gitignore`, `.reasongraph/why/main.md`, `.birdify/*`

The local branch separates the export implementation, repository and ReasonGraph ignore artifacts, and Birdify artifacts into three commits. The branch was not pushed, and the export tests had not been run before the export commit.

### Implement CSV export through Grid API and shared export utilities
Status: directed
Touches: `packages/core/src/utils/export.ts`, `packages/core/src/types/export.ts`, `packages/core/src/components/Grid.wsx`, `packages/core/src/index.ts`

The implementation adds CSV generation, download handling, export modes, column filtering, and custom formatting through the Grid API. This keeps export behavior reusable and exposes its types from the core package.

### Cover CSV export behavior with unit tests
Status: directed
Touches: `packages/core/test/export.test.ts`

Unit tests exercise CSV generation and export behavior. The export test file reported 10 passing tests.

### Rebuild theme-base to resolve stale output behind theme integration failures
Status: discussed
Touches: `packages/theme-base/*`

Rebuilding the package resolved the three theme integration failures without changing Grid code. The full core suite then reported 244 passing tests.

### Restore i18n exports from the core entry point
Status: discussed
Touches: `packages/core/src/index.ts`

The earlier entry-point edit removed the existing i18n export block, so the built package lacked `zhCN` and the demo import failed. Restoring the exports made `zhCN` appear in the build output.

### Keep custom editor support through column editor functions
Status: discussed
Touches: `packages/core/src/types/editing.ts`, `packages/core/src/utils/editing-utils.ts`

The existing editor utility recognizes function-valued `columnDef.editor` as a custom editor, while the built-in editor type lists text, number, and date. This preserves the current extension point for custom editors.

### Remove blur-triggered saving from CellEditor
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

The editor saved and closed on every blur, which could discard the editing session when focus changed during rendering. Saving now uses explicit Enter handling; Escape cancels the edit.

Considered/rejected: Keeping blur-to-save was rejected because unrelated focus changes could close the editor.

### Update grid data when an edit is saved
Status: discussed
Touches: `packages/core/src/components/Grid.wsx`

The optional `onEditSave` callback left the edited value unchanged when consumers omitted it. The grid now updates its internal data and still invokes the callback for consumers that need external persistence.

Risk: Consumers that also update the same data in `onEditSave` may need to check for duplicate update behavior.

### Initialize CellEditor input from its value property
Status: discussed
Touches: `packages/core/src/components/CellEditor.wsx`

The original cell value was not reliably displayed when the editor opened. The value setter no longer skips initialization based on equality with its default, and connection setup reads the component's current value.

### Disable StrictMode in the React demo
Status: directed
Touches: `demos/react/src/main.tsx`

Removing the StrictMode wrapper was chosen to avoid development-only double mounting in the demo while investigating the editor behavior.

### Add RFC-0014 validation demo and coverage (updated)
Status: discussed
Touches: `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`, `skills/ac-grid/references/features.md`

The completed-RFC coverage guard required a demo, end-to-end test, and feature reference entry for RFC-0014. The validation demo and browser test cover CSV export, with the feature row making the RFC discoverable to the guard.

### Create PR #45 for inline editing fixes
Status: directed
Touches: `packages/core/src/components/CellEditor.wsx`, `packages/core/src/components/Grid.wsx`, `demos/react/src/main.tsx`, `demos/react/src/rfcValidationDemos.ts`, `demos/react/e2e/rfc-validation.spec.ts`, `skills/ac-grid/references/features.md`, `PARITY_MATRIX.md`

The inline editing and validation changes were committed on `fix/inline-editing-bug`, pushed, and submitted as PR #45 to keep the changes reviewable and mergeable.

### Use a main worktree without switching the current branch
Status: directed
Touches: `../ac-grid-main`

A separate worktree for `main` was requested so work on that branch can proceed without switching the current checkout. The transcript shows an attempt to add the worktree, but does not show its result.
