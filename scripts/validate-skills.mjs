#!/usr/bin/env node
// Validates every skills/<name>/SKILL.md: frontmatter, name format and description.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const seen = new Map();

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    // Only top-level keys; nested keys (indented) are ignored.
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    data[kv[1]] = value;
  }
  return data;
}

if (!existsSync(skillsDir)) {
  console.error("No skills/ directory found.");
  process.exit(1);
}

const dirs = readdirSync(skillsDir).filter(
  (d) => !d.startsWith(".") && statSync(join(skillsDir, d)).isDirectory()
);

for (const dir of dirs) {
  const file = join(skillsDir, dir, "SKILL.md");
  const where = `skills/${dir}/SKILL.md`;
  if (!existsSync(file)) {
    errors.push(`${where}: missing SKILL.md`);
    continue;
  }
  const fm = parseFrontmatter(readFileSync(file, "utf8"));
  if (!fm) {
    errors.push(`${where}: missing or malformed YAML frontmatter (--- block at top of file)`);
    continue;
  }

  const { name, description } = fm;
  if (!name) {
    errors.push(`${where}: missing "name"`);
  } else {
    if (!NAME_RE.test(name)) errors.push(`${where}: name "${name}" must be lowercase letters, digits and single hyphens`);
    if (name.length > 64) errors.push(`${where}: name is ${name.length} chars (max 64)`);
    if (name !== dir) errors.push(`${where}: name "${name}" must match folder name "${dir}"`);
    if (seen.has(name)) errors.push(`${where}: duplicate name "${name}" (also in skills/${seen.get(name)})`);
    seen.set(name, dir);
  }

  if (!description) {
    errors.push(`${where}: missing or empty "description"`);
  } else if (description.length > 1024) {
    errors.push(`${where}: description is ${description.length} chars (max 1024)`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ ${dirs.length} skill(s) valid: ${[...seen.keys()].join(", ")}`);
