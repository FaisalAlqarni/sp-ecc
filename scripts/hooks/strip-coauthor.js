#!/usr/bin/env node

/**
 * PreToolUse hook that strips Co-Authored-By lines from git commit messages.
 *
 * Intercepts `git commit -m "..."` commands and removes any Co-Authored-By
 * trailer lines from the commit message, then outputs the modified tool input.
 */

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const toolUse = JSON.parse(input);

    // Only process Bash tool with git commit commands
    if (toolUse.tool_name !== 'Bash') {
      process.exit(0);
    }

    const command = toolUse.tool_input?.command || '';

    if (!/\bgit\s+commit\b/.test(command)) {
      process.exit(0);
    }

    // Check if the command contains Co-Authored-By
    if (!/Co-Authored-By/i.test(command)) {
      process.exit(0);
    }

    // Strip Co-Authored-By lines from the commit message
    // Handle both single-line -m "msg" and heredoc styles
    let modified = command;

    // Remove Co-Authored-By lines (with optional leading newlines/whitespace)
    modified = modified.replace(/\n?\s*Co-Authored-By:.*$/gim, '');

    // Clean up trailing whitespace/newlines in the message
    modified = modified.replace(/(\n\s*)+("|\nEOF)/g, '$2');

    if (modified !== command) {
      console.error('[Hook] Stripped Co-Authored-By from commit message');

      // Output modified tool input
      const result = {
        ...toolUse,
        tool_input: {
          ...toolUse.tool_input,
          command: modified
        }
      };
      console.log(JSON.stringify(result));
    }

    process.exit(0);

  } catch (error) {
    console.error('Error in strip-coauthor hook:', error.message);
    process.exit(0); // Allow on error
  }
});
