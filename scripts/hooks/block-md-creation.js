#!/usr/bin/env node

/**
 * PreToolUse hook that blocks creation of random .md/.txt files.
 *
 * Keeps documentation consolidated. Allows specific files and directories:
 * - README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE.md
 * - Files in tasks/, docs/
 */

const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  if (toolUse.tool_name !== 'Write') {
    process.exit(0);
  }

  const filePath = toolUse.tool_input?.file_path || '';

  // Only check .md and .txt files
  if (!/\.(md|txt)$/.test(filePath)) {
    process.exit(0);
  }

  // Allow specific files
  if (/(README|CLAUDE|AGENTS|CONTRIBUTING|CHANGELOG|LICENSE)\.md$/.test(filePath)) {
    process.exit(0);
  }

  // Allow files in tasks/ or docs/
  if (/\btasks\//.test(filePath) || /\bdocs\//.test(filePath)) {
    process.exit(0);
  }

  log('[Hook] BLOCKED: Unnecessary documentation file creation');
  log(`[Hook] File: ${filePath}`);
  log('[Hook] Use README.md for documentation instead');
  process.exit(1);
}

main().catch(() => process.exit(0));
