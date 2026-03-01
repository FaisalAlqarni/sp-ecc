#!/usr/bin/env node

/**
 * PostToolUse hook that runs TypeScript type checking after .ts/.tsx edits.
 *
 * Finds the nearest tsconfig.json and runs `npx tsc --noEmit`, then
 * filters errors to only show those related to the edited file.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  const filePath = toolUse.tool_input?.file_path;

  if (!filePath || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  // Find nearest tsconfig.json
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir) && !fs.existsSync(path.join(dir, 'tsconfig.json'))) {
    dir = path.dirname(dir);
  }

  if (!fs.existsSync(path.join(dir, 'tsconfig.json'))) {
    process.exit(0);
  }

  try {
    const result = execFileSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const lines = result.split('\n').filter(l => l.includes(filePath)).slice(0, 10);
    if (lines.length) {
      log(lines.join('\n'));
    }
  } catch (e) {
    const output = (e.stdout || '') + (e.stderr || '');
    const lines = output.split('\n').filter(l => l.includes(filePath)).slice(0, 10);
    if (lines.length) {
      log(lines.join('\n'));
    }
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
