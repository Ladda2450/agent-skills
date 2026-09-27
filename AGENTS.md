# Agent instructions

This repo publishes agent skills that anyone can install with `npx skills add Ladda2450/agent-skills`.

## Layout

- `skills/<name>/SKILL.md`: one folder per published skill. Supporting files go in `references/`, `scripts/` or `assets/` inside the skill folder.
- `template/`: the starting point for new skills. It isn't published.
- `scripts/validate-skills.mjs`: checks every skill's frontmatter. CI runs it on each push.

## Rules for skills

- **Self-contained.** A skill must not depend on other installable skills. Don't write "use the `tdd` skill" or "use a `code-review` skill if available". Put the instructions in the skill itself, inline or in its `references/` folder, so users never have to install anything else.
- **Tools are fine as requirements.** A skill may rely on tools such as the `gh` CLI or an agent that can spawn subagents. List them under the skill in the README's Requirements section.
- **Frontmatter.** `name` must match the folder name (lowercase letters, digits and hyphens, 64 characters max). `description` must say what the skill does and when to use it (1024 characters max).
- **Portable.** Don't assume anything about the repo the skill runs in, such as its `.gitignore`, folder layout or tooling. Check for what you need or set it up.

## Adding or changing a skill

1. Copy `template/` to `skills/<name>/` and remove the `metadata: internal: true` lines.
2. Run `node scripts/validate-skills.mjs`.
3. Run `npx -y skills add . --list` to confirm the CLI finds the skill.
4. Update the skills table in `README.md`, and its Requirements section if the skill needs tools.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on Ladda2450/agent-skills (via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
