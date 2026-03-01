#!/usr/bin/env node

/**
 * PreToolUse hook that reminds about tmux for long-running commands.
 *
 * Non-blocking (always exits 0). Just prints a reminder to stderr
 * when running package installs, tests, builds, etc. outside tmux.
 */

const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  if (toolUse.tool_name !== 'Bash') {
    process.exit(0);
  }

  const command = toolUse.tool_input?.command || '';

  // Check for long-running commands
  const longRunning = /\b(npm (install|test)|pnpm (install|test)|yarn (install|test)?|bun (install|test)|cargo build|make|docker|pytest|vitest|playwright)\b/;
  if (!longRunning.test(command)) {
    process.exit(0);
  }

  // Skip on Windows or if already in tmux
  if (process.platform === 'win32' || process.env.TMUX) {
    process.exit(0);
  }

  log('[Hook] Consider running in tmux for session persistence');
  log('[Hook] tmux new -s dev  |  tmux attach -t dev');
  process.exit(0);
}

main().catch(() => process.exit(0));
