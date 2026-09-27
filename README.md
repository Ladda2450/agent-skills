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

## Update

```bash
# Update all installed skills to the latest version
npx skills update

# Update one skill
npx skills update conventional-commits

# Update only global (-g) or only project (-p) skills
npx skills update -g
```

## Uninstall

```bash
# Choose skills to remove interactively
npx skills remove

# Remove one skill
npx skills remove conventional-commits

# Remove a skill you installed globally
npx skills remove -g conventional-commits

# List installed skills (add -g for global ones)
npx skills ls
```

## Skills

| Skill | Description |
| --- | --- |
| [conventional-commits](skills/conventional-commits/SKILL.md) | Writes Conventional Commits messages from staged changes. |
| [implementation-coordinator](skills/implementation-coordinator/SKILL.md) | Implements an ordered set of GitHub issues on the current branch, one subagent and one commit per issue, then verifies the whole series. Run it manually with `/implementation-coordinator`. |

### Requirements

**implementation-coordinator**
- An agent that can spawn subagents (for example Claude Code or Codex)
- The [GitHub CLI](https://cli.github.com) (`gh`), signed in to the repo you're working on

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
