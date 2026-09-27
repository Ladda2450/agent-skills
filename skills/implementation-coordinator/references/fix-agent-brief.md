# Fix agent brief

Spawn one fresh fix agent per group of related confirmed failures or findings, after the ticket commits exist. Findings are related when they touch the same file or affect the same issue(s); unrelated findings go to separate agents. Fill every placeholder. For a second attempt, include what the first attempt changed and why it did not resolve the finding.

> Fix these confirmed findings on `<branch>` in `<owner>/<repo>`. The series since `<base>` implements these tickets: `<ledger rows>`. The affected issue(s): `<#n, …>`.
>
> The findings: `<one entry per finding: file and line, what is wrong, the scenario or failing command and its output>`. The coordinator has confirmed each against the code.
>
> 1. Read the findings, the affected issue(s) with `gh issue view <n> --comments`, repository instructions, and the code around each problem. Confirm you can reproduce each one, with a failing test where the behavior is testable. For any finding you cannot reproduce or believe is not a real problem, leave it unfixed and report your evidence for it instead of a commit.
> 2. Make the smallest change that fixes each finding and keeps each affected ticket's acceptance criteria met. Do not refactor, restyle, or fix other findings, even ones you notice. Report those instead.
> 3. Run focused checks: the reproducing tests, tests covering the changed code, and type checks or lint as applicable. Leave the full test suite to the coordinator.
> 4. Review `git diff` and `git diff --staged` before committing, and confirm the changes are limited to these fixes.
> 5. Commit the fixes as **one new commit per fixed finding** on `<branch>`. Do not amend or rewrite ticket commits. End each subject with the affected issue number(s), for example `Fix empty-export crash (#12)`. Stay on `<branch>`, and leave issues open with no pull request.
>
> Report the commit hash and cause for each fixed finding, what changed, how you reproduced each problem, the exact commands to rerun your focused checks and their results, any finding you left unfixed with your evidence, and anything else you noticed but did not fix.
