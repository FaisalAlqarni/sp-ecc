#!/usr/bin/env node

/**
 * PostToolUse hook that extracts PR URLs from `gh pr create` output.
 *
 * Logs the PR URL and a review command to stderr for easy access.
 */

const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  if (toolUse.tool_name !== 'Bash') {
    process.exit(0);
  }

  const command = toolUse.tool_input?.command || '';

  if (!/gh pr create/.test(command)) {
    process.exit(0);
  }

  const output = toolUse.tool_output?.output || '';
  const match = output.match(/https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/);

  if (match) {
    log(`[Hook] PR created: ${match[0]}`);
    const repo = match[0].replace(/https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+/, '$1');
    const pr = match[0].replace(/.*\/pull\/(\d+)/, '$1');
    log(`[Hook] To review: gh pr review ${pr} --repo ${repo}`);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
