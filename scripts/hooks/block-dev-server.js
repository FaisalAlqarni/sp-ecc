#!/usr/bin/env node

/**
 * PreToolUse hook that blocks dev server commands outside tmux.
 *
 * Dev servers should run in tmux so logs are accessible and the
 * process persists after Claude's session ends.
 *
 * Skips on Windows or when tmux is not installed.
 */

const { readStdinJson, log } = require('../lib/utils');

async function main() {
  const toolUse = await readStdinJson();

  if (toolUse.tool_name !== 'Bash') {
    process.exit(0);
  }

  const command = toolUse.tool_input?.command || '';

  // Only check dev server commands
  if (!/\b(npm run dev|pnpm( run)? dev|yarn dev|bun run dev)\b/.test(command)) {
    process.exit(0);
  }

  // Skip on Windows (no tmux) or when tmux isn't available
  if (process.platform === 'win32') {
    process.exit(0);
  }

  // If already in tmux, allow
  if (process.env.TMUX) {
    process.exit(0);
  }

  log('[Hook] BLOCKED: Dev server must run in tmux for log access');
  log('[Hook] Use: tmux new-session -d -s dev "npm run dev"');
  log('[Hook] Then: tmux attach -t dev');
  process.exit(1);
}

main().catch(() => process.exit(0));
