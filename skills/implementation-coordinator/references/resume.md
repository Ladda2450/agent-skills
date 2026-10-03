# Blocking and resuming

## Block a ticket

Mark the ticket `blocked` and record the blocker exactly as found; its Notes start with the blocker (`question: <summary>` for an open question). Leave missing requirements for the user to supply. If the branch now holds unverified commits or uncommitted changes from this ticket, set the partial work aside so the work branch keeps only verified commits:

1. Commit any uncommitted changes as `WIP: <title> (#<n>)`.
2. Run `git branch <branch>-wip-<n>` to save the work there, and push that branch unless pushing is off.
3. Run `git reset --hard <recorded HEAD>` on the work branch, and confirm the tree is clean.

Name the WIP branch in the ticket's Notes. The reset only touches unpushed commits, so no force-push is needed, and the work stays on the WIP branch for the user or a resumed run. Then skip tickets that depend on this one and continue with independent tickets.

## Resume a run

A ledger with `Run: in progress` is resumed unless the user asked to start over. Say in the plan message that the run is resuming.

1. Keep the ledger's base, baseline, pull request, ticket statuses and settled answers. Skip expanding the input and running the baseline; the ledger already has both. Confirm each recorded commit is still on the branch.
2. A ticket left `in progress` was interrupted. If a commit ending in `(#<n>)` exists after the last recorded commit, run the completion check on it; otherwise dispatch the ticket again.
3. A `blocked` ticket is pending again once its blocker is resolved: an `open` question answered in the request, in the ledger, or in a comment on the pull request (read them with `gh pr view <n> --comments`), or another blocker the user says is fixed. Record the answer, and give the ticket agent the WIP branch from its Notes as a starting point.
4. Ask any question still `open` again in the plan message.
5. Continue from the first ticket that is neither complete, skipped, nor blocked.
