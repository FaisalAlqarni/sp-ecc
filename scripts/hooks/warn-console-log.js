#!/usr/bin/env node

/**
 * PostToolUse hook that warns about console.log statements after JS/TS edits.
 *
 * Scans the edited file for console.log and reports line numbers to stderr.
 * Non-blocking (always exits 0).
 */

const fs = require('fs');
const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  const filePath = toolUse.tool_input?.file_path;

  if (!filePath || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const matches = [];

  lines.forEach((line, idx) => {
    if (/console\.log/.test(line)) {
      matches.push(`${idx + 1}: ${line.trim()}`);
    }
  });

  if (matches.length > 0) {
    log(`[Hook] WARNING: console.log found in ${filePath}`);
    matches.slice(0, 5).forEach(m => log(m));
    log('[Hook] Remove console.log before committing');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
