# Why: feat-rfc-0008-column-pinning

<!-- reasongraph:v1 generated 2026-10-31 — review before sharing; edit freely, edits are preserved -->

## Intent
Restore the current working directory onto the main branch (not a detached HEAD at the same commit) while keeping local untracked worknotes intact.

## Decisions

### Check out the main branch tip instead of detaching HEAD at main's commit
Status: directed — prior attempt left a detached HEAD at main's tip
Touches: `.reasongraph/why/fix-inline-editing-bug.md`

Returning to main was treated as making HEAD point at the main commit rather than attaching the current directory to the main branch. That left a detached HEAD while the working tree was still not on main. The intended end state is the current directory checked out on the main branch.

Considered/rejected: Detached HEAD at the same commit as main was rejected because it does not satisfy being on the main branch.
Risk: Further commits from a detached HEAD can orphan work relative to branch history.
Reviewer attention: Confirm the current directory is on branch main, not a detached HEAD at the same SHA.

### Free the other worktree that already has main checked out before switching here
Status: discussed
Touches: `.reasongraph/why/fix-inline-editing-bug.md`

main was already checked out in another worktree, so a direct checkout of main in this directory could not proceed. Recovery requires releasing that worktree's hold on main, then attaching this directory to main.

Risk: Removing or relocating the other worktree can disrupt parallel work still using that tree.
Reviewer attention: Confirm no needed worktree still uniquely owns the main checkout before forcing a switch here.

### Preserve untracked .reasongraph why notes across the branch recovery
Status: discussed
Touches: `.reasongraph/why/fix-inline-editing-bug.md`

Untracked files in the current directory needed to be kept while freeing the main worktree and finishing the switch onto main. The untracked note at .reasongraph/why/fix-inline-editing-bug.md remained after the recovery steps described.

Risk: Worktree or cleanup commands can still drop untracked files if they are not explicitly protected.
Reviewer attention: Confirm .reasongraph/why/fix-inline-editing-bug.md is still present and unchanged.

### Do not delete the local feature branch before securing untracked work and the main checkout
Status: agent-initiated — not requested in plan or prompts; later called out as the wrong order
Touches: `.reasongraph/why/fix-inline-editing-bug.md`

The local feature branch was removed during the attempted return to main. The correct order given afterward is to secure untracked files, free the main worktree, then place this directory on main—without deleting the feature branch as a prerequisite.

Considered/rejected: Deleting the local feature branch first was rejected as the wrong recovery step relative to preserving untracked files and obtaining a main checkout.
Risk: Premature branch deletion can lose branch-only commits that were not pushed elsewhere.
Reviewer attention: Check whether the deleted feature branch still exists on a remote or another worktree if those commits are still needed.
