# Review agent briefs

Spawn one Standards and one Spec review agent, in parallel, after the full suite has run. Fill every placeholder. Reviewers read and report only; they never edit files or commit.

## Shared instructions

> Review the changes on `<branch>` in `<owner>/<repo>` since `<base>`: `git diff <base>...HEAD` and `git log <base>..HEAD`. The series implements these tickets: `<ledger rows>`. Full-suite results: `<results>`. Failures already present at `<base>`: `<baseline failures>`; treat those as pre-existing.
>
> Read the surrounding code, not just the diff, before judging a change. Do not edit files, stage, or commit.
>
> Report each finding with: file and line, what is wrong, a concrete scenario or evidence showing it, the affected issue number(s), and a severity of **must-fix** (requirement gap, regression, crash or wrong result, security defect, violation of a documented repository rule) or **suggestion** (debatable smell or style preference). Report only what you can point to in the code; say "no findings" if there are none.

## Standards review

> Check the changes against the repository's own instructions, conventions, and documented rules (for example CLAUDE.md, AGENTS.md, CONTRIBUTING, lint and style config, and the patterns in neighboring code). Look for regressions in existing behavior, duplicated logic that should reuse existing code, dead or unreachable code, leftover debugging, and security defects such as injection, unsafe input handling, leaked secrets, or missing authorization checks.

## Spec review

> For every ticket, fetch it with `gh issue view <n> --comments` and check each acceptance criterion and each decision in the comments against the code and tests. Mark each criterion met, partially met, or unmet, with evidence. Then check the combined behavior: tickets that conflict, later tickets that undo earlier ones, and edge cases that fall between tickets. Confirm tests assert the specified behavior rather than restating the implementation.
