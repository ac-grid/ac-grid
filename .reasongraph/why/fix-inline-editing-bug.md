# Why: fix-inline-editing-bug

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Bring packages/core to 100% vitest unit coverage and require a Playwright E2E for every implemented ROADMAP P0/P1/P2 feature, specified as RFCs 0043–0046.

## Decisions

### Specify coverage work as umbrella RFC 0043 plus children 0044–0046
Status: discussed
Touches: `.spec/rfc/0043-coverage-100-umbrella.md`, `.spec/rfc/0044-unit-coverage-logic.md`, `.spec/rfc/0045-e2e-coverage-collection.md`, `.spec/rfc/0046-component-coverage-closure.md`, `.spec/ROADMAP.md`

Coverage work was authored through the specify CLI as one umbrella RFC and three children rather than a single document, because unit logic, E2E gating, and .wsx component closure are separate acceptance surfaces. Next specify id was 0043. All four were validated, sync-checked, then advanced to Approved before implementation. No implementation was written in the RFC-authoring step.

Reviewer attention: Confirm the Approved RFCs still match the later clarified acceptance (independent 100% unit coverage; E2E as feature presence, not merged V8).

### Keep unit and E2E as independent 100% gates; do not merge reports
Status: directed
Touches: `.spec/rfc/0043-coverage-100-umbrella.md`, `.spec/rfc/0044-unit-coverage-logic.md`, `.spec/rfc/0045-e2e-coverage-collection.md`, `.spec/rfc/0046-component-coverage-closure.md`

Unit coverage and E2E coverage are measured and gated separately. A merged unit∪E2E number is a Non-goal because it would let code that never ran under Playwright still appear fully covered. Logic modules in RFC 0044 are not required to have E2E coverage and must not be offset by E2E data. Component gaps in RFC 0046 must be closed on each report independently.

Considered/rejected: Merging vitest and Playwright V8 into one report with a ratchet-only-up gate. Rejected because duplicate coverage would hide unexecuted E2E paths.

### Define unit 100% as vitest code coverage and E2E as P0/P1/P2 feature presence
Status: directed
Touches: `.spec/rfc/0043-coverage-100-umbrella.md`, `.spec/rfc/0045-e2e-coverage-collection.md`, `.spec/ROADMAP.md`, `demos/react/e2e/coverage.spec.ts`

Unit work must reach 100% statements, branches, functions, and lines under vitest. E2E success is not V8 line coverage: every ROADMAP P0, P1, and P2 feature must have a corresponding Playwright test, with CI failing when one is missing. Priorities are read from the ROADMAP table, not invented.

Considered/rejected: Collecting Playwright V8 coverage, mapping it onto packages/core/src, and gating E2E on line/branch percentages. Rejected in favor of a feature-list check.

### Forbid v8 ignore, excluded files, and exemption caps
Status: directed — an earlier exemption design was removed after it conflicted with the 100% requirement
Touches: `.spec/rfc/0043-coverage-100-umbrella.md`, `.spec/rfc/0044-unit-coverage-logic.md`, `.spec/rfc/0046-component-coverage-closure.md`, `packages/core/src/**/*.ts`, `packages/core/vite.config.ts`

Reaching 100% by v8 ignore comments, excluding files, or a registered exemption list with a count cap is not allowed. Unreachable branches must be deleted; JSDOM gaps (canvas, ResizeObserver, layout size) are to be stubbed in tests without changing product code. If a path cannot be covered, work stops and the blocker is reported instead of being waived.

Considered/rejected: Allowing documented v8 ignore entries with a registry and quantity cap, originally added so defensive JSDOM-untestable code would not block 100%.

### Confine the 100% coverage RFCs to packages/core
Status: discussed
Touches: `packages/core/**`, `.spec/rfc/0043-coverage-100-umbrella.md`

The coverage RFCs apply only to packages/core. Theme packages, demos, and the site are out of scope for the 100% unit and P0/P1/P2 E2E gates.

### Require a mutation check on every coverage child RFC
Status: agent-initiated — not requested in plan or prompts
Touches: `.spec/rfc/0044-unit-coverage-logic.md`, `.spec/rfc/0045-e2e-coverage-collection.md`, `.spec/rfc/0046-component-coverage-closure.md`, `packages/core/src/utils/*`, `packages/core/src/i18n/manager.ts`, `packages/core/src/components/*.wsx`, `demos/react/e2e/rfc-validation.spec.ts`

Each child RFC requires temporarily breaking the exercised logic and confirming tests go red, then restoring the source, so coverage is not padded with empty assertions. Mutation checks were applied to A1/formula modules, fourteen utility files, seven small components, and the RFC-0006 E2E title used by the feature-presence gate.

### Name the implementation branch cov/unit-100
Status: agent-initiated — not requested in plan or prompts
Touches: `packages/core/test/*`

Implementation ran on branch cov/unit-100 in worktree ac-grid-cov. The first name test/unit-coverage-100 could not be created because a local branch named test already exists, and git cannot hold both test and test/... refs.

Considered/rejected: test/unit-coverage-100, rejected solely because of the existing test ref.

### Split unit-coverage tests across four non-overlapping workers
Status: agent-initiated — not requested in plan or prompts
Touches: `packages/core/test/cov-a1-logic.test.ts`, `packages/core/test/cov-formula-logic.test.ts`, `packages/core/test/cov-i18n-manager.test.ts`, `packages/core/test/cov-util-*.test.ts`, `packages/core/test/cov-comp-*.test.ts`, `packages/core/src/components/Grid.wsx`

Four parallel workers owned disjoint new test files (formula/A1, small utils, small components, editor/drag components). Grid.wsx was left unassigned because it still had 534 uncovered statements and 654 uncovered branches and shares the .wsx coverage-mapping blocker. Workers were forbidden from editing src/ or vite.config.ts. Coverage JSON was written to temp directories so concurrent vitest runs would not clobber coverage-final.json.

### Add new cov-* tests without editing existing tests or source
Status: discussed
Touches: `packages/core/test/cov-a1-logic.test.ts`, `packages/core/test/cov-formula-logic.test.ts`, `packages/core/test/cov-i18n-manager.test.ts`, `packages/core/test/cov-util-filter-functions.test.ts`, `packages/core/test/cov-util-column-sizing.test.ts`, `packages/core/test/cov-util-pinning.test.ts`, `packages/core/test/cov-util-pagination.test.ts`, `packages/core/test/cov-util-components.test.ts`, `packages/core/test/cov-util-create-grid.test.ts`, `packages/core/test/cov-util-editing-keyboard-clipboard.test.ts`, `packages/core/test/cov-comp-simple.test.ts`, `packages/core/test/cov-comp-pagination-search.test.ts`, `packages/core/test/cov-comp-filter.test.ts`, `packages/core/test/cov-comp-dd-dropdown.test.ts`, `packages/core/test/cov-comp-dd-celleditor.test.ts`, `packages/core/test/cov-comp-dd-handler.test.ts`, `packages/core/test/cov-comp-dd-cell.test.ts`, `packages/core/test/cov-comp-dd-header.test.ts`, `packages/core/test/cov-comp-dd-row.test.ts`

Coverage was added as new test files only. Existing tests were left intact; create-grid.ts still depends on test/create-grid.test.ts for full coverage, with cov-util-create-grid.test.ts covering options that file misses. After all workers landed, the full suite was 51 files and 509 passing tests. Temporary cov-comp-dd-tmp.test.ts was removed before commit. Commits were split per worker: e9ee2a8 (A1/formula, 425 insertions), 2a9f920 (i18n/utils), d5fd35d (small components), 0bd3360 (dropdown/editor/drag).

### Build theme-base and theme-default before running core vitest
Status: discussed
Touches: `packages/theme-base/**`, `packages/theme-default/**`, `packages/core/vite.config.ts`

A first vitest run failed to resolve @ac-grid/theme-base package entry. Both theme packages were built, after which coverage collection could run. Core tests use jsdom.

### Gate E2E on ROADMAP P0/P1/P2 titles rather than V8 collection
Status: directed
Touches: `demos/react/e2e/coverage.spec.ts`, `demos/react/e2e/feature-matrix.json`, `demos/react/e2e/rfc-validation.spec.ts`, `demos/react/e2e/virtual-scrolling.spec.ts`, `skills/ac-grid/references/features.md`, `.spec/ROADMAP.md`

RFC-0045 adds coverage.spec.ts that parses ROADMAP.md for P0/P1/P2 rows, treats a /completed/ link as implemented, and requires a test or describe titled RFC-<id>. Unimplemented features 0014 and 0020–0029 live in feature-matrix.json pending with reasons; stale pending entries fail. Archiving RFC-0001 had turned a skill-coverage guard red, so a 0001 Core architecture row was added to skills/ac-grid/references/features.md. The new checks (7 tests) passed; a mutation that renamed the RFC-0006 title failed as required, then was restored. Full Playwright (fullyParallel) was run three times at 34 passed each (about 6.2s). Commit 161da91.

### Initialize CodeGraph and ReasonGraph in the coverage worktree
Status: directed
Touches: `.codegraph/**`, `.reasongraph/config.json`, `.gitignore`, `AGENTS.md`

codegraph init indexed 164 files into 1457 nodes and 4481 edges (codegraph 1.4.1). reasongraph init ran with historical catch-up declined. IssueGraph and ReviewGraph CLIs were unavailable (npm 404 for the guessed package; no local command). Init left uncommitted .gitignore (.reasongraph/state/), an AGENTS.md ReasonGraph block, untracked .codegraph/, and .reasongraph/config.json. Those artifacts were kept out of coverage commits because they collide with an existing .reasongraph/.gitignore that ignores everything except why/.

Considered/rejected: Backfilling 12 prior ReasonGraph sessions during init; declined. Installing IssueGraph/ReviewGraph from a guessed npm name; the registry returned 404 so they were reported unavailable rather than invented.

### Treat seventeen logic-module branches as unreachable and delete them
Status: directed
Touches: `packages/core/src/utils/a1-notation.ts`, `packages/core/src/utils/formula-parser.ts`, `packages/core/src/utils/formula-graph.ts`, `packages/core/src/i18n/manager.ts`, `packages/core/src/utils/flex-render.ts`, `packages/core/src/utils/pinning-utils.ts`

Worker reports of dead code were re-checked by reading source and by codegraph callers. All 17 sites are unreachable given earlier regex/token/map initialization: a1-notation.ts row<0 and catch (A1_CELL_RE guarantees non-negative rows and alphabetic columns); formula-parser.ts #REF! throws and post-switch #ERROR! (ref tokens only exist after successful parseA1Cell; evaluateAst already exhausts the union); formula-graph.ts ?? fallbacks; manager.ts || enUS (constructor always registers en-US and the Map is private with no delete); flex-render.ts render===undefined after render==null; pinning-utils.ts ?? [] on arrays just built. Deletion used non-null assertions where the same file already did at line 104, dropped the post-switch return so TypeScript exhaustiveness holds, and did not change function signatures. Commit f1122f9 (6 files, 18 insertions, 38 deletions) after tsc was clean and 51/509 tests still passed. Issue #47 tracked this and was closed by that commit. Before deletion the stuck files were a1-notation 96.8/96.2, formula-parser 98.5/98.8, formula-graph branches 87.5, manager branches 98.7, flex-render 93.8/94.4, pinning-utils branches 87.5; afterwards every plain .ts file in packages/core was 100% on all four metrics.

Risk: Removing defensive fallbacks means a future parser/token change could throw instead of returning null/#REF!.
Reviewer attention: Confirm each deleted branch is still unreachable after tokenize/parseA1Cell/buildColumnPinningFromDefs, and that runtime behavior is unchanged.

### Keep pinColumnInState and applyColumnDefPins; they are live Grid API
Status: discussed
Touches: `packages/core/src/utils/pinning-utils.ts`, `packages/core/src/components/Grid.wsx`, `packages/core/src/index.ts`

CodeGraph callers show applyColumnDefPins and pinColumnInState are re-exported from index.ts and called from Grid.wsx (including around lines 237, 745, and 2599). They are not dead functions. Only the unreachable ?? [] branches inside them were removed.

### Report the .wsx V8 mapping blocker instead of faking 100%
Status: directed
Touches: `packages/core/src/components/*.wsx`, `packages/core/vite.config.ts`, `packages/core/src/components/SortingIndicator.wsx`, `packages/core/src/components/FilterIcon.wsx`, `packages/core/src/components/SelectionCheckbox.wsx`, `packages/core/src/components/PaginationControls.wsx`, `packages/core/src/components/GlobalSearch.wsx`, `packages/core/src/components/FilterInput.wsx`, `packages/core/src/components/FilterMenu.wsx`, `packages/core/src/components/Grid.wsx`

@wsxjs/wsx-vite-plugin transforms .wsx without a source map (map sources and mappings undefined). Compiled SortingIndicator output was 220 lines versus roughly 168 source lines; the extra ~120 lines are inlined babel _applyDecs/_setFunctionName/_checkInRHS helpers from @autoRegister/@state. v8 therefore scores transformed code. Component class bodies from ~line 129 were fully covered, but file-level statements sat around 50%–77% and branches around 20%–46% (e.g. FilterIcon 50.0/19.5, PaginationControls 66.1/27.8). No ignore, exclude, or threshold lowering was applied. Options left open: externalize helpers via @babel/runtime, emit source maps and count source lines only, or redefine the .wsx target as source-line 100%. Grid.wsx coverage was not started because the same mapping would hide a 100% result. Issue #46. An earlier reading that treated uncovered transformed line numbers as source lines was retracted.

Risk: RFC-0046 cannot be closed while V8 continues to score inlined decorator helpers.
Reviewer attention: Confirm the plugin still emits no source map and that helper branches are absent from source before accepting any .wsx 100% claim.

### Raise per-file vitest thresholds to 100% for src/**/*.ts only
Status: discussed
Touches: `packages/core/vite.config.ts`

After the dead-branch deletion, packages/core/vite.config.ts gained a 100% statements/branches/functions/lines threshold for src/**/*.ts. A negative check pointed the same threshold at .wsx files and failed, so the gate is not a no-op. .wsx files remain on the existing global floor (lines 58, functions 55, branches 35, statements 56) until issue #46 is decided. Commit a184cdf. Existing package coverage dependency is @vitest/coverage-v8 4.1.11.

### Stub missing requestUpdate and invoke private handlers in .wsx unit tests
Status: agent-initiated — not requested in plan or prompts
Touches: `packages/core/test/cov-comp-simple.test.ts`, `packages/core/test/cov-comp-pagination-search.test.ts`, `packages/core/test/cov-comp-filter.test.ts`, `packages/core/src/components/FilterInput.wsx`, `packages/core/src/components/FilterMenu.wsx`, `packages/core/src/components/Dropdown.wsx`

wsx-core 0.0.20 has no requestUpdate, so FilterInput.value and FilterMenu.value tests stub it to rerender() on the instance only. Private handlers (handleDropdownChange, handleOperatorChange, _handleFilterChange(null)) were called directly because they cannot be reached through DOM. _i18n was set to undefined to hit fallbacks. A preset helper assigned properties before upgrade. PaginationControls page-size tests only assert no throw because onPageSizeChange never fires. FilterMenu tests return the callback from itself so the @state setter keeps it.

### File GitHub issues for the coverage blocker and six product defects; do not silently patch them
Status: directed
Touches: `packages/core/src/components/PaginationControls.wsx`, `packages/core/src/components/Dropdown.wsx`, `packages/core/src/components/FilterInput.wsx`, `packages/core/src/components/FilterMenu.wsx`, `packages/core/src/components/FilterIcon.wsx`, `packages/core/src/components/Grid.wsx`

Observed product defects were filed rather than mixed into coverage commits: #48 PaginationControls handlePageSizeChange is passed unbound so this is the select and onPageSizeChange never runs; #49 Dropdown/FilterInput/FilterMenu value setters call missing requestUpdate() and throw TypeError (FilterInput.wsx 29–33, Dropdown.wsx 56/60); #50 FilterMenu @state _filterChangeCallback treats a function as an updater and immediately invokes it with null (FilterMenu.wsx 27–32, Grid.wsx ~1316); #51 FilterInput.handleOperatorChange is unwired dead code (104–107); #52 FilterIcon visible=false render() returns null and _rerender appendChild(null) throws; #53 wsx h() maps onChange to a DOM change listener and writes value as an attribute, so custom-element onChange/value/style objects do not apply. #51 (wire vs delete) and #53 (upstream runtime) were left undecided. #48/#49/#50/#52 were not patched in this branch because the repo gate is RFC-then-failing-test before source edits.

Risk: Coverage tests currently encode broken runtime (unbound this, TypeError on set, appendChild(null)) and will need rewriting if those bugs are fixed.

### Leave graph-init files, Grid.wsx work, and a coverage PR unpushed
Status: discussed
Touches: `.spec/**`

The chore/spec-cleanup commit stayed local in the ac-grid-specclean worktree with no push or PR. Merge conflict risk was noted for an uncommitted PARITY_MATRIX change on the other feature worktree once this relocation lands.

### Delete legacy non-RFC files from .spec/rfc and the kickoff brief
Status: directed
Touches: `.spec/rfc/README.md`, `.spec/rfc/roadmap.md`, `.spec/rfc/SUMMARY.md`, `.spec/rfc/GETTING-STARTED.md`, `.spec/rfc/RFC-TEMPLATE.md`, `.spec/0010-kickoff-brief.md`

Those paths predate the specify convention and are not RFCs: duplicate indexes and roadmaps, a one-off split report, superseded process/template docs, and a finished RFC-0010 kickoff brief. Under specify, .spec/rfc should only contain NNNN-*.md files, so they were removed rather than kept as peers of real RFCs.

Considered/rejected: Leaving them under .spec/rfc was rejected because they dilute the RFC-only directory rule.

### Move PARITY_MATRIX and ISSUE_REGISTRY to .spec root
Status: discussed
Touches: `.spec/PARITY_MATRIX.md`, `.spec/ISSUE_REGISTRY.md`, `.spec/rfc/PARITY_MATRIX.md`, `.spec/rfc/ISSUE_REGISTRY.md`

Both files are useful reference tables but are not RFCs. They are still linked from ROADMAP, TASK_TRACKING, many RFCs, and multica-orca skills, so they were relocated to .spec/ instead of deleted, and inbound plus in-file relative RFC links were rewritten for the new location.

Considered/rejected: Deleting them was rejected because live cross-references would break; keeping them inside .spec/rfc was rejected because they are not numbered RFCs.

### Treat .spec/ROADMAP.md as the sole RFC index after cleanup
Status: discussed
Touches: `.spec/ROADMAP.md`, `.spec/rfc/*`, `.spec/PARITY_MATRIX.md`

With the duplicate rfc/README and rfc/roadmap gone, the specify model is that numbered RFCs live under .spec/rfc and the only index is .spec/ROADMAP.md. Link and layout edits were made to match that rule rather than reintroduce a second index under rfc/.

Risk: Readers or skills that still expect indexes under .spec/rfc/ will need updated paths.

### Name the implementation branch chore/spec-cleanup
Status: agent-initiated — not requested in plan or prompts
Touches: `.spec/**`

Cleanup was isolated in a new worktree branched from origin/main as chore/spec-cleanup so the edits stay off the active feature worktree. The branch was committed locally and left unpushed.

### Verify cleanup with specify sync-check and code path greps
Status: agent-initiated — not requested in plan or prompts
Touches: `.spec/PARITY_MATRIX.md`, `.spec/ROADMAP.md`, `.spec/rfc/**`

After the moves and deletes, relative RFC links in the moved parity matrix and related docs were repaired until specify sync-check reported OK. A grep across ts/js/json/yml confirmed no remaining code references to the removed or relocated paths.

### Only retarget links in docs/GETTING-STARTED.md
Status: discussed
Touches: `docs/GETTING-STARTED.md`

docs/GETTING-STARTED.md still describes an outdated docs/rfc layout. Link targets were updated for the cleanup; the broader outdated narrative was left alone rather than rewritten in this change.

### Leave ISSUE_REGISTRY deletion undecided after the move
Status: discussed
Touches: `.spec/ISSUE_REGISTRY.md`

ISSUE_REGISTRY was kept after the move because it is still referenced, even though GitHub issues are described as the live tracker. Whether to delete the Multica sync table entirely was left open and was not part of the committed cleanup.

Risk: A stale registry may diverge from GitHub issue state until a follow-up decides keep-or-delete.
