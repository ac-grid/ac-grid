# Why: chore-submit-all-local-main

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Raise unit-test coverage toward 100% on branch cov/unit-100 for tasks 0044–0046, and initialize CodeGraph/ReasonGraph tooling in workspace ac-grid-cov.

## Decisions

### Initialize CodeGraph and ReasonGraph in ac-grid-cov via coding-graph-init
Status: directed
Touches: `.codegraph/`, `**.reasongraph/**`, `.gitignore`, `AGENTS.md`

CodeGraph was indexed at 164 files, 1457 nodes, and 4481 edges for later call-graph lookups before edits such as Grid.wsx. ReasonGraph was initialized in the same pass. IssueGraph and ReviewGraph were skipped because the npm packages returned E404 and no local command or skill existed.

Considered/rejected: Initializing IssueGraph/ReviewGraph was abandoned after package lookup failed.
Risk: Uncommitted init artifacts (.gitignore, AGENTS.md, .codegraph/, .reasongraph/config.json) remain in the tree and can mix into later commits if paths are not explicit.
Reviewer attention: Confirm graph tooling belongs on this coverage branch and that IssueGraph/ReviewGraph remain intentionally absent.

### Decline ReasonGraph historical-session backfill at init
Status: agent-initiated — not requested in plan or prompts
Touches: `.reasongraph/config.json`, `.reasongraph/**`

During ReasonGraph init the agent answered No to backfilling historical sessions. Twelve prior sessions remained available for a later reasongraph distill run and were left untouched.

### Leave graph-init artifacts uncommitted pending ignore-policy choice
Status: discussed
Touches: `.gitignore`, `AGENTS.md`, `.codegraph/`, `.reasongraph/config.json`, `.reasongraph/**`

Init added .reasongraph/state/ to .gitignore and a ReasonGraph section to AGENTS.md; .codegraph/ stayed untracked. Those paths were withheld from coverage commits because they may conflict with an existing approach that keeps only why/ under .reasongraph via a nested .gitignore. Whether to ignore .codegraph/ was left open.

Considered/rejected: Bundling graph-init files into the per-work coverage commits was rejected to avoid mixing tooling setup with test work.
Reviewer attention: Decide whether .codegraph/ should be gitignored and how .reasongraph ignore rules should merge.

### Independently re-verify each worker’s coverage and dead-code claims
Status: agent-initiated — not requested in plan or prompts
Touches: `packages/core/src/**/*.ts`, `packages/core/src/**/*.wsx`, `**/*test*`

Worker reports were not accepted at face value. After each worker finished, coverage was re-run and dead-code claims were checked against source before committing that work unit.

### Re-confirm 17 unreachable branches with CodeGraph callers/node
Status: directed
Touches: `**/i18n/manager.ts`, `**/flex-render.ts`, `**/pinning-utils.ts`, `**/a1-notation.ts`, `**/formula-parser.ts`, `packages/core/src/**`

CodeGraph callers and node queries were used to re-check reported dead branches. All 17 sites remained unreachable: private languagePacks with only set and constructor-registered enUS make get("en-US")||enUS dead; flex-render’s later render===undefined is unreachable after an earlier nullish return; buildColumnPinningFromDefs always returns arrays so downstream nullish paths are dead; a1-notation and formula-parser dead arms sit behind callers that already validated tokens or exhaustively switch ASTs.

Reviewer attention: Spot-check the listed sites against CodeGraph callers before any deletion commit.

### Defer deletion of the 17 dead-code sites to a separate approved commit
Status: discussed
Touches: `**/i18n/manager.ts`, `**/flex-render.ts`, `**/pinning-utils.ts`, `**/a1-notation.ts`, `**/formula-parser.ts`

Confirmed unreachable branches were left in place. Removal was planned as its own commit only after explicit approval, so coverage commits document blocked branches instead of silently deleting production code.

Risk: Leaving known dead arms keeps statement/branch coverage below 100% on those modules until deletion lands.

### Commit coverage work per work unit with explicit paths on cov/unit-100
Status: directed
Touches: `**/*test*`, `packages/core/src/**`

Completed worker units were committed separately on cov/unit-100 with explicit file paths rather than a blanket add. Commits recorded: 161da91 (0045 E2E feature-checklist skill line), e9ee2a8 (0044 A1/formula tests, 2 files), 2a9f920 (0044 i18n/utils tests, 8 files), d5fd35d (0046 sort/filter/selection/pagination/search components, 3 files), 0bd3360 (0046 Dropdown/CellEditor/draggable components, 6 files). In-progress worker files were left alone until those workers finished.

Considered/rejected: A single combined coverage commit and git add -A were avoided.
Reviewer attention: Ensure mainline feat/rfc-0014-data-export dirty files are not mixed into these coverage commits.

### State unreachable-branch blockers honestly in unit-test commit messages
Status: agent-initiated — not requested in plan or prompts
Touches: `**/*test*`, `**/i18n/manager.ts`, `**/a1-notation.ts`, `**/formula-parser.ts`, `**/pinning-utils.ts`, `**/flex-render.ts`

Unit-test commit messages explicitly named files stuck on unreachable branches instead of claiming 100% coverage for those modules.

### Hold further file edits until remaining coverage workers finish
Status: directed
Touches: `**/cov-comp-*`, `**/*test*`

After the first commits, remaining component/drag-edit workers were allowed to finish without touching their files. On completion, results were verified, full unit tests were run, and those units were committed separately.

### Treat .wsx 100% coverage as blocked by decorator-helper instrumentation
Status: discussed
Touches: `**/*.wsx`, `**/@wsxjs/wsx-vite-plugin/**`, `**/vite*.ts`, `**/vitest*.ts`, `packages/core/src/**`

After .wsx transform via @wsxjs/wsx-vite-plugin, no source maps are emitted and the compiled output gains roughly 120 lines of inlined babel decorator helpers such as _applyDecs. V8 coverage attributes those helper lines, so component-layer 100% for task 0046 is not achievable under the current toolchain. Options left open: exclude the helpers in coverage config, fix plugin source maps, or accept sub-100% on .wsx.

Considered/rejected: Claiming component-layer 100% coverage under the current instrumentation was rejected after independent verification.
Risk: 0046 coverage goals stay unmet until a tooling or acceptance decision is made.
Reviewer attention: Choose an explicit policy for .wsx helper lines before further coverage chasing.

### Remove temporary cov-comp-dd-tmp.test.ts after component workers finished
Status: agent-initiated — not requested in plan or prompts
Touches: `**/cov-comp-dd-tmp.test.ts`

A temporary cov-comp-dd-tmp.test.ts left by a component worker was deleted before the component-coverage commits so it would not land as a stray test file.

### Revert transient keyboard-navigation.ts mutation from a worker
Status: agent-initiated — not requested in plan or prompts
Touches: `packages/core/src/utils/keyboard-navigation.ts`

git status showed packages/core/src/utils/keyboard-navigation.ts dirty while workers are barred from changing src/. The change was identified as a temporary mutation-check state and was restored so src/ stayed clean for coverage commits.

Reviewer attention: Confirm keyboard-navigation.ts is clean before the next commit.

### Gate next coverage steps on a green full unit suite of 51 files / 509 tests
Status: discussed
Touches: `**/*test*`, `packages/core/src/**`

Before finishing the component-coverage commits, the new tests plus the full unit suite were run; 51 files and 509 tests passed. Logic-module 100% remains blocked by the 17 dead sites, and .wsx 100% remains blocked by transform helpers.

### Wait for reasongraph pre-push hook without bypassing
Status: discussed — push follow-through after branch commits were ready
Touches: `.husky/pre-push`

The push was blocked by the repository’s reasongraph pre-push hook. The agent chose to wait for that hook to finish rather than skip or bypass it, so remote update proceeds only under the repo’s normal pre-push checks.

Considered/rejected: Bypassing the hook (for example with a no-verify push) was rejected in favor of letting the hook complete.
Risk: Push remains blocked or delayed until the hook finishes successfully.
Reviewer attention: Confirm the push completed only after the reasongraph pre-push hook succeeded and was not skipped.
