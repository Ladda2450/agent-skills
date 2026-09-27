# Ticket agent brief

Before dispatch, fill every placeholder and include any user constraints. The coordinator supplies the title it fetched and the ticket's settled answers from the ledger; the agent verifies that title against GitHub before editing.

> Implement `<owner>/<repo>#<n>` on `<branch>`. The expected issue title is `<title>`. This is ticket `<k>` of `<total>` in series `<series>`. Previously completed tickets and notes: `<ledger rows>`. Settled answers for this ticket: `<answers>`.
>
> Fetch the issue with `gh issue view <n> --comments` and confirm its title; decisions in the comments are part of the ticket. Work only on this ticket and changes necessary to support it. Build on earlier committed tickets. Stop when this ticket is committed.
>
> 1. Read the issue, repository instructions, relevant earlier commits, affected code, and tests. Restate the ticket's intended behavior. Treat the ticket and the settled answers as the settled scope and don't revisit them; settle smaller choices yourself and report them. If something genuinely new comes up mid-work that is ambiguous in a way that changes behavior a user would see, stop before committing and return the question with the options you see; the coordinator will get you an answer.
> 2. Identify the public interfaces where behavior can be tested (test seams). Use seams named by the ticket; otherwise choose and report them without pausing for approval.
> 3. Build behavior in vertical test-first slices: one failing test, enough code to pass, then the next behavior. Make the first slice prove an end-to-end path where practical. Assert expected values from the ticket or known-good examples, not from the implementation's calculation. Test public behavior and mock only system boundaries such as external APIs, time, and randomness. For pure configuration or wiring with nothing independent to assert, skip the test-first loop. Add browser or UI tests only where repository instructions call for them, after the behavior works.
> 4. Run focused checks as you go: affected tests, type checks, lint, and targeted builds as applicable. Leave the full test suite to the coordinator.
> 5. Review `git diff` and `git diff --staged` before committing. Confirm every acceptance criterion, repo conventions, scope, and absence of dead or accidental changes. Fix findings before committing. A committed-diff review alone misses your uncommitted work.
> 6. Commit all and only this ticket's changes as **one commit** on `<branch>`. End the subject with `(#<n>)`. Stay on `<branch>`, and leave the issue open with no pull request.
>
> Report the commit hash, changes, test seams, tests added or changed, focused checks and results, decisions needed by later tickets, and anything unresolved.
