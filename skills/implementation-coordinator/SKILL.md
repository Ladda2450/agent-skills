---
name: implementation-coordinator
description: Implement an ordered set of GitHub issues on the current work branch, with one agent and commit per issue, then verify the series. Use when the user supplies a ticket sequence and wants coordinated implementation.
argument-hint: <#12 #13 | A: #12 #13; B: #20 | parent #40 | milestone "v2" | label "export">
disable-model-invocation: true
---

# Implementation Coordinator

Coordinate only the issues the user supplies and fixes needed for those issues. Delegate code changes to subagents; your own edits are limited to the ledger and reports. Your job is to dispatch, check independently, and keep the ledger true. The user may override the defaults below.

## Start the run

The input is an explicit list of issues, which may be split into series, a parent issue, a milestone, or a label:

- Single series: `/implementation-coordinator #12 #13 #14`
- Multiple series: `/implementation-coordinator A: #12 #13; B: #20`
- Grouped instead of listed: `/implementation-coordinator parent #40`, `/implementation-coordinator milestone "v2"`, `/implementation-coordinator label "export"`

1. Resolve the repository, input, series order, and constraints from the request. Use the current Git repository and checked-out branch when unambiguous. Ask one concise question for any missing ticket numbers or unclear order before delegation. Take inputs already available from the request or repository as given.
2. Check that `gh auth status` succeeds for the repository's host, the repository has a GitHub remote, and the working tree is clean. A failed auth or a dirty tree stops the run: stop before delegation and report the exact state and the action needed to resume. When the checked-out branch is the default branch and the tree is clean, offer to create a work branch with a suggested name and continue once the user agrees; suggest a short name derived from the input (for example `<user>/<series-name>` or `<user>/issue-<first-number>`). Stay on that branch for the rest of the run. Any other mismatch — no GitHub remote, or a checked-out branch that is neither the default nor the requested or inferred work branch — still stops with the exact state reported.
3. Look for a saved ledger at `.scratch/implementation-coordinator/<branch>.md` (`/` in the branch name becomes `-`). The ledger must never appear in `git status` or a commit: if `git check-ignore -q .scratch/` fails, append `.scratch/` to `.git/info/exclude`. If a ledger exists, show it and ask whether to resume it or start over. To resume, keep its base, ticket statuses and settled answers, and confirm each recorded commit is still on the branch. A ticket left `in progress` was interrupted: if a commit ending in `(#<n>)` exists after the last recorded commit, run the completion checks on it; otherwise dispatch the ticket again. Then continue from the first ticket that is neither complete, skipped, nor blocked. Otherwise record the current commit as the base.
4. **Expand the input.** When the input is a parent issue, list its sub-issues with `gh api repos/<owner>/<repo>/issues/<n>/sub_issues` and keep them in the order the API returns, which is the parent's sub-issue order. When it is a milestone or a label, list the open issues with `gh issue list --state open --milestone "<milestone>"` or `gh issue list --state open --label "<label>"`. A milestone or label has no inherent order, so plan to ask the user to confirm the resulting order before delegation. If an expansion is empty or the API is unavailable, say so and ask for an explicit list instead. On a resume, the ledger's ticket list already resolves the input; skip this step.
5. Read repository instructions and how to run tests. Leave domain, decision, and design documents to the ticket and fix agents, whose briefs already ask them to read what is relevant. Fetch every issue with `gh issue view <n> --comments`, confirm its repository, and record its title, acceptance criteria, decisions made in comments, and dependencies. Dependencies come from the issue text and from GitHub's native links: `gh api repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by` (if that endpoint is unavailable, rely on the text). While reading, note any ambiguity that would change behavior a user sees, tied to the ticket it affects, and flag any ticket that looks done already: its issue is closed, or a commit whose subject ends in `(#<n>)` already exists at or before the base (check with `git log <base> --format=%s`). If GitHub access or issue content is unavailable, report which issue could not be read and why.
6. Build the ledger and save it. Preserve the supplied order within each series and honor dependencies across series, reordering where a blocker is listed after the ticket it blocks. A blocker in this run is satisfied once its ticket is complete here, even though its issue stays open, or once it is skipped and the user confirmed the skip satisfies that blocker; an open blocker outside the run blocks the ticket.
7. **Plan and ask.** Send one plan message that shows the resolved repository, branch, ticket order (noting any reordering and any order to confirm from step 4), and any blockers, plus every ambiguity from step 5 and every ticket flagged as done already, each as a question naming the ticket it affects. Ask whether to skip each flagged ticket. For a flagged ticket that blocks another ticket in the run, ask in the same message whether the skip satisfies that blocker; it counts as satisfied only if the user says so. Ask all of them here, before any agent starts, and wait for the answers. If there are no questions, say so in the plan message and begin delegation without waiting for a reply. Record each answer in the ledger's settled answers table as soon as you have it, so a resumed run keeps it without re-asking.

### Ledger format

Keep this exact shape so a later run can resume from it. Update the file whenever a status or commit changes. Statuses are `pending`, `in progress`, `complete`, `blocked`, and `skipped`. A `skipped` row's Notes say why (the issue was closed, a commit ending in `(#<n>)` already existed at or before the base, or the user chose to skip) and, when it blocks another ticket, whether the user said the skip satisfies that blocker.

```markdown
# Implementation ledger: <branch>

Repository: <owner>/<repo>
Base: <sha>
Run: in progress | finished

| # | Series | Ticket | Title | Status | Commit | Notes |
|---|--------|--------|-------|--------|--------|-------|
| 1 | A | #12 | Add export endpoint | complete | a1b2c3d | Chose CSV as the default format |
| 2 | A | #13 | Remove legacy export | skipped | | Closed before the run; user said the skip satisfies #14 |

## Settled answers

Questions asked before or during the run, with their answers, so a resumed run reuses them.

| Ticket | Question | Answer |
|--------|----------|--------|
| #12 | CSV or JSON export? | CSV |

## Fix commits

| Commit | Issues | Finding |
|--------|--------|---------|
```

## Implement tickets

Run one implementation or fix agent at a time, and wait for it to finish before the next step. Subagents use the session's model unless the user names one; if a named model is unavailable, ask before substituting. A ticket marked `skipped` in the ledger is already resolved and is not dispatched.

For each unblocked ticket:

1. **Dispatch.** Record `HEAD`, mark the ticket `in progress`, and spawn a fresh implementation subagent. Give it the issue title, repository, branch, series position, prior ledger rows, user constraints, the ticket's settled answers from the ledger, and [the ticket agent brief](references/ticket-agent-brief.md). The agent must fetch the issue and confirm its title before editing.
2. **Answer questions.** An agent may still return a question instead of a commit when something new comes up; the settled answers are scope, not a ban on questions. Ask the user, then send the answer to the same agent (continue it by its agent ID so it keeps its context), and record it in the ledger's settled answers table. A question is part of the work, not a failed attempt.
3. **Check completion yourself.** Confirm that exactly one new commit exists since the recorded `HEAD`, its subject ends in `(#<n>)`, the working tree is clean, and `git show <sha>` addresses the ticket without unrelated changes. Rerun the focused tests covering the changed behavior with the repository's fast test command and confirm they pass. The agent's report of passing tests is a claim until you have seen them pass. Pure configuration or wiring may have nothing independent to test. This is a completion check, not the final code review.
4. **Retry once.** If a check fails, send the specific gaps to the same agent, have it amend its ticket commit, record the amended hash, and recheck.
5. **Block if it still fails.** Mark the ticket blocked and record the blocker exactly as found. Leave missing requirements for the user to supply. Then:
   - If the branch now holds an unverified commit or uncommitted changes from this ticket, stop and ask the user whether to keep the commit for them to finish, revert it with a new commit, or reset the branch to the recorded `HEAD`. Say that the reset discards the work. Don't choose for them, because the partial work may be worth keeping.
   - Otherwise skip tickets that depend on this one and continue with independent tickets.
6. **Record and report.** Mark the ticket complete only after its commit and focused checks pass. Update the ledger, then tell the user the ticket's status, commit or blocker, and what happens next.

## Verify the series

After all runnable tickets are complete or blocked, confirm the working tree is clean. Tell the user that full verification is starting, since it may take a while. Run the repository's full verification suite according to its instructions: tests, builds, type checks, lint, and integration or end-to-end checks where applicable.

Spawn a Standards review agent and a Spec review agent in parallel, using [the review agent briefs](references/review-agent-brief.md) and the suite results. While they work, confirm each finding by reading the code at the finding's location and any related tests, instead of reading all of `git diff <base>...HEAD`. Reviewers can be wrong, so confirm a finding against the code before acting on it. Fix confirmed requirement gaps, regressions, crashes or wrong results in the new code, security defects, and documented rule violations. Report debatable code smells as suggestions without fixing them.

Delegate each confirmed failure or finding to a fresh fix agent, one at a time, using [the fix agent brief](references/fix-agent-brief.md) and the same model policy. Check its result as in step 3 above: one new commit that references the affected issue number(s), a clean tree, and the finding resolved with focused checks passing. Preserve the ticket commits and add each fix commit to the ledger. If the agent cannot reproduce the problem, weigh its evidence and either drop the finding or send a sharper reproduction. Allow at most two fix attempts per failure or finding, then report it unresolved. After fixes, rerun the full suite. If evidence shows a failure predates or is unrelated to the series, report that evidence and leave it outside this work.

## Report the outcome

Set the ledger's `Run:` line to `finished`, or leave it `in progress` when blockers remain so a later run can resume. Leave issues open and the branch without a pull request; the user closes and publishes. Report in this shape:

```markdown
## Implementation summary: <branch>

| Ticket | Status | Commit | Summary |
|--------|--------|--------|---------|

**Full suite:** each command run and its result.
**Review findings:** each confirmed finding with its fix commit, or "unresolved". Suggestions follow in a separate list.
**Blockers:** each with the specific next action needed to resume.
**Risks and follow-ups:** anything a reviewer of the branch should know.
**Branch state:** final `git status`, and commits since base.
```
