# Agent Skills

A collection of [agent skills](https://skills.sh) for Claude Code, Cursor, Codex and other AI coding agents.

## Install

Uses the [`skills`](https://github.com/vercel-labs/skills) CLI, with no global install needed:

```bash
# Choose skills interactively
npx skills add Ladda2450/agent-skills

# List the available skills
npx skills add Ladda2450/agent-skills --list

# Install one skill
npx skills add Ladda2450/agent-skills --skill conventional-commits

# Install globally (user-level) for a specific agent
npx skills add Ladda2450/agent-skills -g -a claude-code
```

## Skills

| Skill | Description |
| --- | --- |
| [conventional-commits](skills/conventional-commits/SKILL.md) | Writes Conventional Commits messages from staged changes. |

## Adding a new skill

1. Copy the template: `cp -r template skills/<skill-name>`
2. Edit `skills/<skill-name>/SKILL.md`:
   - `name` must match the folder name (lowercase, hyphens)
   - `description` should say what the skill does **and** when to use it
   - remove the `metadata: internal: true` lines
3. Validate: `node scripts/validate-skills.mjs`
4. Add the skill to the table above and commit.

Each skill folder can also include `scripts/`, `references/` and `assets/` subfolders.

## License

[MIT](LICENSE)
