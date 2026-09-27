---
name: implementation-coordinator
description: Implement an ordered set of GitHub issues on the current work branch, with one agent and commit per issue, then verify the series. Use when the user supplies a ticket sequence and wants coordinated implementation.
disable-model-invocation: true
---

# Implementation Coordinator

Coordinate only the issues the user supplies and fixes needed for those issues. Delegate code changes to subagents; your own edits are limited to the ledger and reports. The user may override the defaults below.

## Start the run

1. Resolve the repository, ticket numbers or URLs, series order, and constraints from the request. Use the current Git repository and checked-out branch when unambiguous. Ask one concise question for any missing ticket numbers or unclear order before delegation. Take inputs already available from the request or repository as given.
2. Check that the repository has a GitHub remote, the checked-out branch is the requested or inferred work branch and is not the default branch, and the working tree is clean. Stay on the checked-out branch. If a check fails, stop before delegation and report the exact state and the action needed to resume.
3. Look for a saved ledger at `.scratch/implementation-coordinator/<branch>.md` (`/` in the branch name becomes `-`). The ledger must never appear in `git status` or a commit: if `git check-ignore -q .scratch/` fails, append `.scratch/` to `.git/info/exclude`. If a ledger exists, show it and ask whether to resume it or start over. To resume, keep its `<base>` and ticket statuses, confirm each recorded commit is still on the branch, and continue from the first ticket that is neither complete nor blocked. Otherwise record the current commit as `<base>`.
4. Read repository instructions and relevant domain, decision, and test documentation. Fetch every issue with `gh issue view <n> --comments`, confirm its repository, and record its title, acceptance criteria, decisions made in comments, and dependencies. Dependencies come from the issue text and from GitHub's native links: `gh api repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by` (if that endpoint is unavailable, rely on the text). If GitHub access or issue content is unavailable, report which issue could not be read and why.
5. Build the ledger with series, ticket, status, commit, and notes, and save it to the ledger file. Update the file whenever a status or commit changes. Preserve the supplied order within each series and honor dependencies across series, reordering where a blocker is listed after the ticket it blocks. A blocker in this run is satisfied once its ticket is complete here, even though its issue stays open; an open blocker outside the run blocks the ticket. Before delegation, tell the user the resolved repository, branch, ticket order (noting any reordering), and any blockers.

## Implement tickets

For each unblocked ticket, record `HEAD` and spawn a fresh implementation subagent. Run one implementation or fix agent at a time, and wait for it to finish before the next step. Subagents use the session's model unless the user names one; if a named model is unavailable, ask before substituting. Give the agent the issue title, repository, branch, series position, prior ledger entries, user constraints, and [the ticket agent brief](references/ticket-agent-brief.md). The agent must fetch the issue and confirm its title before editing.

If the agent returns a question instead of a commit, ask the user, then send the answer to the same agent (continue it by its agent ID so it keeps its context). A question is part of the work, not a failed attempt.

When the agent finishes, independently verify that exactly one new commit exists since the recorded `HEAD`, its subject ends in `(#<n>)`, the working tree is clean, and `git show <sha>` addresses the ticket without unrelated changes. Rerun the focused tests covering the changed behavior yourself, using the repository's fast test command, and confirm they pass; the agent's report of passing tests is a claim until you have seen them pass. Pure configuration or wiring may have nothing independent to test. This is a completion check, not the final code review.

If a completion check fails, send the specific gaps to the same agent once, have it amend its ticket commit, record the amended commit's new hash, and recheck. If it still fails, mark the ticket blocked. Record genuine requirement or external blockers exactly as found, leaving missing requirements for the user to supply. Skip dependent tickets. Continue with independent ones only when the branch is clean and contains no unverified ticket commit; otherwise stop and report the branch state. Mark a ticket complete only after its commit and focused checks pass. After each ticket, tell the user its status, commit or blocker, and what happens next.

## Verify the series

After all runnable tickets are complete or blocked, confirm the working tree is clean. Run the repository's full verification suite according to its instructions: tests, builds, type checks, lint, and integration or end-to-end checks where applicable. Ticket agents use focused checks; run the full suite here and again after fixes. Tell the user when full verification begins, since it may take time.

Review `git diff <base>...HEAD` and the commits against every ticket's acceptance criteria and the combined behavior. Check repo standards, regressions, duplication, dead code, and security defects. If a `code-review` skill is available, use it with `<base>`; otherwise conduct independent Standards and Spec reviews. The two review agents may run in parallel at this final stage. Confirm each finding against the code. Fix confirmed requirement gaps, regressions, crashes or wrong results in the new code, security defects, and documented rule violations. Report debatable code smells as suggestions.

Delegate each confirmed failure or finding to a fresh fix agent, one at a time, using the same model policy and focused verification. Preserve the ticket commits; make separate fix commits referencing the affected issue number(s), and add them to the ledger. Recheck the finding and relevant verification. Allow at most two focused fix attempts for the same failure or finding, then report it unresolved. Rerun the full suite after fixes. If evidence shows a failure predates or is unrelated to the series, report that evidence and leave it outside this work.

## Report the outcome

Report the ledger with each ticket's status, commit hash, and summary; full-suite commands and results; confirmed review findings and fix commits; final `git status`; and unresolved blockers, risks, or follow-ups. For each blocker, give the specific next action needed to resume. Mark the ledger file finished, or leave it in progress when blockers remain so a later run can resume. Leave issues open and the branch without a pull request; the user closes and publishes.
