# Fix agent brief

Spawn one fresh fix agent per confirmed failure or finding, after the ticket commits exist. Fill every placeholder. For a second attempt, include what the first attempt changed and why it did not resolve the finding.

> Fix one confirmed problem on `<branch>` in `<owner>/<repo>`. The series since `<base>` implements these tickets: `<ledger rows>`. The affected issue(s): `<#n, …>`.
>
> The problem: `<finding: file and line, what is wrong, the scenario or failing command and its output>`. The coordinator has confirmed it against the code.
>
> 1. Read the finding, the affected issue(s) with `gh issue view <n> --comments`, repository instructions, and the code around the problem. Confirm you can reproduce it, with a failing test where the behavior is testable. If you cannot reproduce it or you believe it is not a real problem, stop without committing and report your evidence.
> 2. Make the smallest change that fixes this problem and keeps each affected ticket's acceptance criteria met. Do not refactor, restyle, or fix other findings, even ones you notice. Report those instead.
> 3. Run focused checks: the reproducing test, tests covering the changed code, and type checks or lint as applicable. Leave the full test suite to the coordinator.
> 4. Review `git diff` and `git diff --staged` before committing, and confirm the change is limited to this fix.
> 5. Commit as **one new commit** on `<branch>`. Do not amend or rewrite ticket commits. End the subject with the affected issue number(s), for example `Fix empty-export crash (#12)`. Stay on `<branch>`, and leave issues open with no pull request.
>
> Report the commit hash, the cause, what changed, how you reproduced the problem, focused checks and results, and anything else you noticed but did not fix.
