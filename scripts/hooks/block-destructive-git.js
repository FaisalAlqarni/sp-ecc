#!/usr/bin/env node

/**
 * Pre-tool-use hook to block destructive git operations.
 *
 * Allows normal git operations (commit, push, add, checkout, branch, merge,
 * pull, fetch) but blocks truly destructive ones that can rewrite history
 * or cause irreversible data loss.
 */

// Destructive operations to block (regex patterns)
const BLOCKED_OPERATIONS = [
  /\bgit\s+push\s+.*--force\b/,
  /\bgit\s+push\s+.*--force-with-lease\b/,
  /\bgit\s+push\s+-f\b/,
  /\bgit\s+reset\s+--hard\b/,
  /\bgit\s+clean\s+-f\b/,
  /\bgit\s+branch\s+-D\b/,
  /\bgit\s+checkout\s+--\s+\.\s*/,
  /\bgit\s+rebase\b(?!.*--abort)/,
];

// Human-readable descriptions for blocked operations
const BLOCKED_DESCRIPTIONS = {
  'push.*--force': 'Force push (rewrites remote history)',
  'push.*--force-with-lease': 'Force push with lease (rewrites remote history)',
  'push.*-f': 'Force push (rewrites remote history)',
  'reset.*--hard': 'Hard reset (discards uncommitted changes)',
  'clean.*-f': 'Force clean (permanently deletes untracked files)',
  'branch.*-D': 'Force delete branch (may lose unmerged work)',
  'checkout.*-- \\.': 'Checkout all files (discards all working changes)',
  'rebase': 'Rebase (rewrites commit history)',
};

// Read tool use from stdin
let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const toolUse = JSON.parse(input);

    // Only check Bash tool
    if (toolUse.tool_name !== 'Bash') {
      process.exit(0);
    }

    const command = toolUse.tool_input?.command || '';

    // Allow safe rebase operations
    if (/\bgit\s+pull\s+--rebase\b/.test(command) || /\bgit\s+rebase\s+--abort\b/.test(command)) {
      process.exit(0);
    }

    // Check for blocked operations
    for (const pattern of BLOCKED_OPERATIONS) {
      if (pattern.test(command)) {
        const desc = Object.entries(BLOCKED_DESCRIPTIONS).find(
          ([key]) => new RegExp(key).test(command)
        );
        const reason = desc ? desc[1] : 'Destructive operation';

        console.error(`\n[Hook] BLOCKED: Destructive git operation detected`);
        console.error(`[Hook] Reason: ${reason}`);
        console.error(`[Hook] Command: ${command}`);
        console.error(`[Hook] Policy: Destructive git operations are blocked for safety.`);
        console.error(`[Hook] Normal git operations (commit, push, add, branch, merge) are allowed.\n`);
        process.exit(1);
      }
    }

    // Allow the operation
    process.exit(0);

  } catch (error) {
    console.error('Error in block-destructive-git hook:', error.message);
    process.exit(0); // Allow on error to not break workflow
  }
});
