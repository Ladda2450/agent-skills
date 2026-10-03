---
name: implementation-coordinator
description: Implement an ordered set of GitHub issues on the current work branch, with one agent and commit per issue pushed to a draft pull request as it goes, then verify the series and finish the pull request. Use when the user supplies an explicit list (possibly split into series), a parent issue, a milestone, or a label and wants coordinated implementation.
argument-hint: '<#12 #13 | A: #12 #13; B: #20 | parent #40 | milestone "v2" | label "export">'
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
2. **Preflight.** Check each of these before delegation. When one stops the run, report the exact state and the action needed to resume.
   - `gh auth status` succeeds for the repository's host. A failure stops the run.
   - The repository has a GitHub remote. Without one, stop.
   - The working tree is clean. A dirty tree stops the run.
   - The branch is the requested or inferred work branch. On the default branch with a clean tree, offer to create a work branch with a short name derived from the input (for example `<user>/<series-name>` or `<user>/issue-<first-number>`) and continue once the user agrees. Any other branch stops the run. Stay on the work branch for the rest of the run.
   - Push access: `gh repo view --json viewerPermission` returns `ADMIN`, `MAINTAIN` or `WRITE`. Without it, the run continues but every push and the pull request are skipped; say so in the plan message.
3. Look for a saved ledger at `.scratch/implementation-coordinator/<branch>.md` (`/` in the branch name becomes `-`). The ledger must never appear in `git status` or a commit: if `git check-ignore -q .scratch/` fails, append `.scratch/` to `.git/info/exclude`. If a ledger exists, show it and ask whether to resume it or start over. To resume, keep its base, baseline, pull request, ticket statuses and settled answers, and confirm each recorded commit is still on the branch. A ticket left `in progress` was interrupted: if a commit ending in `(#<n>)` exists after the last recorded commit, run the completion check on it; otherwise dispatch the ticket again. Then continue from the first ticket that is neither complete, skipped, nor blocked. Otherwise record the current commit as the base.
4. **Expand the input.** When the input is a parent issue, list its sub-issues with `gh api repos/<owner>/<repo>/issues/<n>/sub_issues` and keep them in the order the API returns, which is the parent's sub-issue order. When it is a milestone or a label, list the open issues with `gh issue list --state open --milestone "<milestone>"` or `gh issue list --state open --label "<label>"`. A milestone or label has no inherent order, so plan to ask the user to confirm the resulting order before delegation. If an expansion is empty or the API is unavailable, say so and ask for an explicit list instead. On a resume, the ledger's ticket list already resolves the input; skip this step.
5. **Read the issues.** Read repository instructions and how to run tests. Leave domain, decision, and design documents to the ticket and fix agents, whose briefs already ask them to read what is relevant. Fetch every issue with `gh issue view <n> --comments`, confirm its repository, and record its title, acceptance criteria, decisions made in comments, and dependencies. Dependencies come from the issue text and from GitHub's native links: `gh api repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by` (if that endpoint is unavailable, rely on the text). While reading, note any ambiguity that would change behavior a user sees, tied to the ticket it affects, and flag any ticket that looks done already: its issue is closed, or a commit whose subject ends in `(#<n>)` already exists at or before the base (check with `git log <base> --format=%s`). If GitHub access or issue content is unavailable, report which issue could not be read and why.
6. **Run the baseline.** Tell the user the baseline suite is running, then run the repository's full verification suite on the base according to its instructions: tests, builds, type checks, lint, and integration or end-to-end checks where applicable. If the instructions don't name the commands, take them from the repository's configuration or CI workflow and record what you used. Record each command, its result and the names of any failing tests in the ledger's baseline table; later failures are compared against it. If the suite cannot run or the build fails at the base, ask in the plan message whether to continue from that baseline or stop. On a resume, keep the recorded baseline and skip this step.
7. Build the ledger and save it. Preserve the supplied order within each series and honor dependencies across series, reordering where a blocker is listed after the ticket it blocks. A blocker in this run is satisfied once its ticket is complete here, even though its issue stays open, or once it is skipped and the user confirmed the skip satisfies that blocker; an open blocker outside the run blocks the ticket.
8. **Plan and ask.** Send one plan message that shows the resolved repository, branch, ticket order (noting any reordering and any order to confirm from expanding the input), any blockers, and the baseline result, plus every ambiguity found while reading the issues and every ticket flagged as done already, each as a question naming the ticket it affects. Ask whether to skip each flagged ticket. For a flagged ticket that blocks another ticket in the run, ask in the same message whether the skip satisfies that blocker; it counts as satisfied only if the user says so. Ask all of them here, before any agent starts, and wait for the answers. State that the run pushes the branch after each completed ticket, opens a draft pull request against the default branch after the first one, and finishes it at the end, unless the user opts out of pushing or asks to push only at the end; record either choice in the settled answers. If there are no questions, say so in the plan message and begin delegation without waiting for a reply. Record each answer in the ledger's settled answers table as soon as you have it, so a resumed run keeps it without re-asking.

### Ledger format

Keep this exact shape so a later run can resume from it. Update the file whenever a status, commit or pull request changes. Statuses are `pending`, `in progress`, `complete`, `blocked`, and `skipped`. A `skipped` row's Notes say why (the issue was closed, a commit ending in `(#<n>)` already existed at or before the base, or the user chose to skip) and, when it blocks another ticket, whether the user said the skip satisfies that blocker. The baseline table gets one row per suite command run at the base. The fix commits table gets one row per fix commit, naming the commit, its affected issue(s) and the finding or failure it resolves.

```markdown
# Implementation ledger: <branch>

Repository: <owner>/<repo>
Base: <sha>
PR: <url> | none
Run: in progress | finished

| # | Series | Ticket | Title | Status | Commit | Notes |
|---|--------|--------|-------|--------|--------|-------|
| 1 | A | #12 | Add export endpoint | complete | a1b2c3d | Chose CSV as the default format |
| 2 | A | #13 | Remove legacy export | skipped | | Closed before the run; user said the skip satisfies #14 |

## Baseline

The full suite at the base, so later failures can be compared with it.

| Command | Result |
|---------|--------|
| npm test | 1 failing: `import > rejects empty file` |

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
3. **Check completion yourself.** Confirm that exactly one new commit exists since the recorded `HEAD`, its subject ends in `(#<n>)`, the working tree is clean, and `git show <sha>` has no unrelated changes. Compare the agent's acceptance-criteria checklist with the criteria you recorded when reading the issues: every criterion must appear, and each must be backed by a test or diff location that you confirm in `git show <sha>`. A missing, unmet or unbacked criterion fails the check. Run the exact commands the agent reported for its focused checks and confirm they pass, adding your own command when the reported ones don't clearly cover the changed behavior. The agent's report of passing tests is a claim until you have seen them pass. Pure configuration or wiring may have nothing independent to test. This is a completion check, not the final code review.
4. **Retry once.** If a check fails, send the specific gaps to the same agent with the fix that matches the failure:
   - **No commit:** finish the ticket and commit it. An agent that returned a question instead is handled by step 2, not here.
   - **Several commits:** squash them into one ticket commit whose subject ends in `(#<n>)`, using `git reset --soft <recorded HEAD>` and then a single commit.
   - **Uncommitted or stray changes:** fold the ticket's changes into its commit and discard unrelated ones, explaining each discarded change.
   - **Gaps in content or criteria:** fix them and amend the ticket commit.

   Record the resulting hash and run step 3 again.
5. **Block if it still fails.** Mark the ticket blocked and record the blocker exactly as found. Leave missing requirements for the user to supply. Then:
   - If the branch now holds an unverified commit or uncommitted changes from this ticket, stop and ask the user whether to keep the commit for them to finish, revert it with a new commit, or reset the branch to the recorded `HEAD`. Say that the reset discards the work. Don't choose for them, because the partial work may be worth keeping.
   - Otherwise skip tickets that depend on this one and continue with independent tickets.
6. **Record and push.** Mark the ticket complete only after its commit and focused checks pass, then update the ledger. Unless pushing is off for this run (no push access, the user opted out or chose to push only at the end, or an earlier push failed), push with `git push -u origin <branch>`. Push only commits that passed their checks, so the squash retry and the reset choice above never touch pushed history and no force-push is needed; a blocked ticket's commit the user chose to keep goes up with the next push, and the pull request stays a draft. After the first complete ticket, if the ledger's `PR:` line is `none` and `gh pr list --head <branch> --state open` finds nothing, open a draft with `gh pr create --draft --base <default branch> --head <branch>`, titled as in [Finish the pull request](#finish-the-pull-request), with a body that says the run is in progress and lists the planned tickets; record its URL on the `PR:` line. If a push or the draft fails, report the error once, stop pushing for the rest of the run, and keep working locally; the final push retries it.
7. **Report.** Keep each progress update to one line per ticket: `✓ #13 Add export endpoint (a1b2c3d), next: #14` — the completed ticket, its short commit SHA, and the next ticket to run (or the next step, when none remain). A blocked ticket still gets the full explanation: the blocker exactly as found and the action needed to resume. This is for progress updates during the run; the ledger and the final summary report keep their detail.
8. **Checkpoint.** Run the full suite and compare it with the baseline when the last runnable ticket of a series completes and tickets in other series remain, and after every 5 completed tickets since the last checkpoint within a series (the user may change that number). Skip it after the last runnable ticket of the run, since the series verification runs the suite. Report it in one line, for example `✓ checkpoint after series A: suite matches baseline`. Before the next ticket starts, fix any failure the baseline doesn't show as in [Verify the series](#verify-the-series): a fresh fix agent, the same checks and attempt limit, a row in the fix commits table, and a push. Then rerun the suite. If a failure remains after both attempts, record it as a blocker and ask the user whether to continue with the remaining tickets or stop the run.

## Verify the series

After all runnable tickets are complete or blocked, confirm the working tree is clean. Tell the user that full verification is starting, since it may take a while. Run the same full verification suite as the baseline. Compare each failure with the baseline: one the baseline already shows predates the series, so report it as pre-existing and leave it outside this work; any other failure is a failure to fix below.

Spawn a Standards review agent and a Spec review agent in parallel, using [the review agent briefs](references/review-agent-brief.md), the suite results and the baseline. When they return, confirm each finding by reading the code at the finding's location and any related tests, instead of reading all of `git diff <base>...HEAD`. Reviewers can be wrong, so confirm a finding against the code before acting on it. Fix confirmed requirement gaps, regressions, crashes or wrong results in the new code, security defects, and documented rule violations. Report debatable code smells as suggestions without fixing them.

Group the failures and confirmed findings before delegating: those that touch the same file or affect the same issue(s) go to one fresh fix agent, while unrelated ones still get separate agents. Run the agents one at a time, using [the fix agent brief](references/fix-agent-brief.md) and the same model policy. Check each result like the completion check in Implement tickets: one new commit per finding in the group, each subject referencing its affected issue number(s), a clean tree, and every finding resolved with focused checks passing. Preserve the ticket commits, record each fix commit in the ledger's fix commits table, and push it under the same rules as a ticket commit. If the agent cannot reproduce a problem, weigh its evidence and either drop that finding or send a sharper reproduction. Allow at most two fix attempts per failure or finding; a finding that fails as part of a group can be retried on its own. After the fixes, rerun the full suite. If evidence shows a new failure is unrelated to the series, such as a flaky test that also fails at the base when rerun, report that evidence and leave it outside this work.

## Finish the pull request

Skip this step when the user opted out of pushing, push access is missing, or no ticket is complete; say which in the report.

1. Push with `git push -u origin <branch>`. This also retries a push that failed during the run. If the push fails, report the error and skip the rest of this step.
2. Find the existing pull request, usually the draft opened after the first ticket: the ledger's `PR:` line, or else `gh pr list --head <branch> --state open`. If one exists, update its title and body with `gh pr edit`; otherwise create one with `gh pr create --base <default branch> --head <branch>`.
3. Title it after the input: the single ticket's title, or the parent issue, milestone, label or series name.
4. Write the body. If the repository has a pull request template (`.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `PULL_REQUEST_TEMPLATE.md` or `docs/PULL_REQUEST_TEMPLATE.md`), fill in its sections; otherwise use the summary table, full suite results, review findings and suggestions, and risks from the report below. Add one `Closes #<n>` line per complete ticket. List blocked and skipped tickets without closing keywords. A parent issue input gets `Part of #<parent>`, never `Closes`.
5. Mark it ready for review. Keep it a draft instead, and say why in the body, when blockers or unresolved review findings remain or the full suite fails. Match the pull request's state with `gh pr ready` or `gh pr ready --undo`, or pass `--draft` when creating it.
6. Record the URL on the ledger's `PR:` line, so a resumed run updates this pull request instead of opening another.

## Report the outcome

Set the ledger's `Run:` line to `finished`, or leave it `in progress` when blockers remain so a later run can resume. Leave issues open; the pull request's `Closes` lines close them when it merges. Report in this shape:

```markdown
## Implementation summary: <branch>

| Ticket | Status | Commit | Summary |
|--------|--------|--------|---------|

**Full suite:** each command run and its result, with failures the baseline already showed marked pre-existing.
**Review findings:** each confirmed finding with its fix commit, or "unresolved". Suggestions follow in a separate list.
**Blockers:** each with the specific next action needed to resume.
**Risks and follow-ups:** anything a reviewer of the branch should know.
**Pull request:** its URL and whether it is ready or a draft and why, or why none was opened.
**Branch state:** final `git status`, and commits since base.
```
