#!/usr/bin/env node

/**
 * PostToolUse hook that auto-formats JS/TS files with Prettier after edits.
 *
 * Runs `npx prettier --write` on the edited file. Silently skips if
 * Prettier is not available or the file doesn't exist.
 */

const fs = require('fs');
const { execFileSync } = require('child_process');
const { readStdinJson } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  const filePath = toolUse.tool_input?.file_path;

  if (!filePath || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  try {
    execFileSync('npx', ['prettier', '--write', filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch {
    // Silently skip if prettier unavailable
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
