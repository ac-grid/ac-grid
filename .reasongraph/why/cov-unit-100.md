# Why: cov-unit-100

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Author and validate RFCs for ac-grid demo defects (selection-column order, pinned-column theme, empty-state overlay theme), land them on a PR branch, and begin red-first E2E implementation starting with the selection-column fix.

## Decisions

### Structure demo-defect work as umbrella RFC 0039 plus three child RFCs
Status: discussed
Touches: `.spec/rfc/0039*`, `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042*`

Issue-driven work was split into an index-only umbrella (0039) and three children: 0040 for selection-column-first checkbox alignment (#35), 0041 for pinned-column theme variables with horizontal scroll (#36), and 0042 for overlay theming (#38). Each child includes Problem, Goals, Non-goals, Design, and Acceptance with mutation checks so validate and cross-links stay coherent.

### Treat #38 as empty-data overlay theming, not full-width row view
Status: directed
Touches: `.spec/rfc/0042-overlay-theme*`, `.spec/rfc/0039*`

The defect was reinterpreted as the no-rows empty overlay failing to follow theme, not a full-width row view. Full-width row view was moved to Non-goals. The RFC was renamed to 0042-overlay-theme and rebuilt with that scope.

### Attribute empty overlay failure to hardcoded .grid-overlay background
Status: discussed
Touches: `**/Grid.css`, `.spec/rfc/0042-overlay-theme*`

Browser reproduction with emptied 0019 demo data under dark theme showed the overlay background hardcoded as rgba(255,255,255,0.72) while text color already used theme tokens, washing out contrast. The planned fix is to drive .grid-overlay background from --ac-grid-bg-overlay defined per built-in theme, add demo clear-data and theme-toggle controls, require dark-theme text contrast ≥ 4.5:1, and require the acceptance case to fail if the background is reverted to white.

### Require live verification that loading overlay shares the same theme bug
Status: discussed — inferred from shared styles; not separately reproduced
Touches: `**/Grid.css`, `.spec/rfc/0042-overlay-theme*`

Loading overlay uses the same .grid-overlay styling, so the same theme-token fix is assumed to apply, but it was not reproduced alone. Acceptance requires measuring that path rather than treating the inference as proven.

Risk: Loading overlay might behave differently despite shared class names.

### Rebuild RFCs 0039–0042 instead of editing title/slug via CLI
Status: agent-initiated — not requested in plan or prompts
Touches: `.spec/rfc/0039*`, `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042-overlay-theme*`

The specify CLI could not change title or slug after the wrong 0042 framing. Uncommitted generation was rolled back and 0039–0042 were regenerated under the correct overlay-theme name so links and slugs stayed consistent.

### Document that clicking a cell without selecting the row is not a 0040 defect
Status: discussed
Touches: `.spec/rfc/0040*`

RFC 0040 records that cell click without row selection is expected behavior, narrowing the defect to selection-column placement and checkbox alignment rather than selection semantics.

### Point 0016 links at .spec/rfc/ root, not completed/
Status: agent-initiated — found during sync-check after authoring
Touches: `.spec/rfc/0039*`, `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042-overlay-theme*`, `.spec/rfc/0016*`

sync-check flagged broken 0016 links written as if under completed/. 0016 lives at .spec/rfc/ root, so the new RFCs' links were corrected there.

### Leave pre-existing sync-check broken links on main untouched
Status: agent-initiated — not requested in plan or prompts
Touches: `.spec/rfc/completed/0001*`, `.spec/rfc/0009*`, `.spec/rfc/0012*`, `.spec/rfc/0013*`

After fixing the new RFCs' links, remaining sync-check failures were cross-links among older RFCs 0001, 0009, 0012, and 0013 pointing at 0012. Those were treated as unrelated mainline debt and not modified in this branch.

### Require validate and sync-check before commit; defer push until directed
Status: discussed
Touches: `.spec/rfc/0039*`, `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042-overlay-theme*`

All four new RFCs were validated OK with coherent umbrella/child links. Commit and push were withheld until explicitly directed, then performed onto PR #41 as commit 774db55 on fix/rfc-demo-e2e-skill.

### Implement approved RFCs red-first starting at 0040
Status: discussed
Touches: `.spec/rfc/0040*`, `**/*e2e*`

After the five RFCs were Approved, implementation order was set to 0040 then 0041 then 0042. Work began by writing an E2E expected to fail for the right reason before changing product code; that red-to-green loop was not finished.

### Keep Vite port changes on the PR branch only
Status: discussed
Touches: `**/vite.config.*`, `demos/react/**`

Vite configuration changes exist on the PR branch worktree only. The separate local checkout still uses the default 5173, so when that port is busy Vite falls through to 5174; that checkout was not updated.

### Refuse admin-bypass merge of PR #41 without explicit confirmation
Status: discussed
Touches: `.spec/rfc/0039*`, `.spec/rfc/0040*`, `.spec/rfc/0041*`, `.spec/rfc/0042-overlay-theme*`

PR #41 is CI-green and otherwise mergeable, but main ruleset 24866126 blocks gh pr merge with base branch policy prohibits the merge (update restriction, required signatures, strict checks). Options left open were --admin squash plus branch cleanup, --auto (likely ineffective under update), or manual GitHub merge. Admin bypass was not executed pending an explicit admin confirmation.

Risk: Leaving the branch unmerged blocks 0040+ implementation on main.
Reviewer attention: Confirm whether --admin squash merge and remote branch deletion are intentional before bypassing the ruleset.
