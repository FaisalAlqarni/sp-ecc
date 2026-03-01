#!/usr/bin/env node

/**
 * PostToolUse hook that auto-formats JS/TS/CSS files after edits.
 *
 * Auto-detects formatter:
 * 1. Biome (biome.json / biome.jsonc) → npx @biomejs/biome format --write
 * 2. Prettier (11 config variants) → npx prettier --write
 * 3. No formatter found → skip silently
 *
 * Traverses up from edited file to find config in nearest ancestor directory.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { readStdinJson, log } = require('../lib/utils');

const BIOME_CONFIGS = ['biome.json', 'biome.jsonc'];

const PRETTIER_CONFIGS = [
  '.prettierrc',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  '.prettierrc.json5',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.mjs',
  '.prettierrc.toml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs'
];

/**
 * Walk up from startDir looking for any of the given config files.
 * Returns { type: 'biome'|'prettier', dir } or null.
 */
function detectFormatter(startDir) {
  let dir = startDir;
  const root = path.parse(dir).root;

  while (dir !== root) {
    // Check Biome first (preferred)
    for (const cfg of BIOME_CONFIGS) {
      if (fs.existsSync(path.join(dir, cfg))) {
        return { type: 'biome', dir };
      }
    }

    // Check Prettier
    for (const cfg of PRETTIER_CONFIGS) {
      if (fs.existsSync(path.join(dir, cfg))) {
        return { type: 'prettier', dir };
      }
    }

    // Also check package.json for prettier key
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.prettier) {
          return { type: 'prettier', dir };
        }
      } catch {
        // ignore parse errors
      }
    }

    dir = path.dirname(dir);
  }

  return null;
}

async function main() {
  const toolUse = await readStdinJson();
  const filePath = toolUse.tool_input?.file_path;

  if (!filePath || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const fileDir = path.dirname(path.resolve(filePath));
  const formatter = detectFormatter(fileDir);

  if (!formatter) {
    process.exit(0);
  }

  try {
    if (formatter.type === 'biome') {
      execFileSync('npx', ['@biomejs/biome', 'format', '--write', filePath], {
        cwd: formatter.dir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } else {
      execFileSync('npx', ['prettier', '--write', filePath], {
        cwd: formatter.dir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }
  } catch {
    // Silently skip if formatter unavailable or errors
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
