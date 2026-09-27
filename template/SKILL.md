---
name: my-skill-name
description: One or two sentences on what this skill does AND when an agent should use it. Include trigger phrases a user might say. Max 1024 characters.
metadata:
  internal: true
---

<!--
  HOW TO USE THIS TEMPLATE
  1. Copy this folder to skills/<your-skill-name>/
  2. Set `name` to exactly match the folder name (lowercase, hyphens, max 64 chars)
  3. Write a specific `description`, because it's what agents use to decide when to load the skill
  4. Delete the `metadata: internal: true` lines so the skill can be installed
  5. Run `node scripts/validate-skills.mjs`

  Optional subfolders next to SKILL.md:
    scripts/     executable helpers the agent can run
    references/  longer docs the agent reads only when needed
    assets/      templates, images and other files used in output
-->

# My Skill Name

A short summary of what this skill helps accomplish.

## When to use

- Situation or request that should trigger this skill
- Another trigger

## Instructions

1. First step
2. Second step
3. Third step

## Examples

**Input:** what the user asks for

**Output:** what a good result looks like
