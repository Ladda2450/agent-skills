---
name: conventional-commits
description: Write a git commit message that follows the Conventional Commits spec, based on the currently staged changes. Use when the user asks to write, draft, or suggest a commit message, or to commit staged work.
---

# Conventional Commits

Write clear commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) format.

## Instructions

1. Look at what is staged with `git diff --staged`. If nothing is staged, tell the user and stop. Don't stage files yourself unless the user asks.
2. Pick the one **type** that best describes the change:
   - `feat`: a new feature
   - `fix`: a bug fix
   - `docs`: documentation only
   - `style`: formatting, with no change in behavior
   - `refactor`: a code change that neither fixes a bug nor adds a feature
   - `perf`: a performance improvement
   - `test`: adds or fixes tests
   - `build` / `ci`: build system, dependencies or CI config
   - `chore`: other maintenance
3. Add an optional **scope** in parentheses when the change is confined to one area, for example `feat(auth):`.
4. Write the **subject**: imperative mood, lowercase, no trailing period, 72 characters or fewer.
5. If the reason for the change isn't obvious from the subject, add a **body** after a blank line. Explain *why*, not *what*, and wrap lines at 72 characters.
6. For breaking changes, add `!` after the type or scope and a `BREAKING CHANGE:` footer that describes the migration.
7. If the staged changes cover unrelated concerns, suggest splitting them into separate commits.

## Format

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer(s)>
```

## Examples

```
feat(cart): add quantity selector to line items
```

```
fix: prevent crash when config file is empty

The loader assumed at least one key was present and indexed into
an empty object. Fall back to defaults instead.
```

```
refactor(api)!: rename getUser to fetchUser

BREAKING CHANGE: callers must update imports from getUser to fetchUser.
```
