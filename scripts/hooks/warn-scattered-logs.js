#!/usr/bin/env node

/**
 * PostToolUse hook that warns about scattered log statements after source file edits.
 *
 * Detects common scattered logging patterns across JS/TS, Ruby, C#, and Python.
 * Non-blocking (always exits 0). Nudges the user to run /logging.
 */

const fs = require('fs');
const { readStdinJson, log } = require('../lib/utils');

const PATTERNS = [
  // JS/TS
  { regex: /console\.(log|warn|error)\s*\(/, label: 'console.log/warn/error' },
  // Ruby
  { regex: /\bputs\s/, label: 'puts' },
  { regex: /Rails\.logger\.\w+/, label: 'Rails.logger' },
  { regex: /Logger\.new/, label: 'Logger.new' },
  // C#
  { regex: /Debug\.WriteLine/, label: 'Debug.WriteLine' },
  { regex: /Console\.WriteLine/, label: 'Console.WriteLine' },
  { regex: /_logger\.Log(Information|Warning|Error|Debug|Critical)/, label: '_logger.Log*' },
  // Python
  { regex: /\bprint\s*\(/, label: 'print()' },
  { regex: /\blogging\.(debug|info|warning|error|critical)\s*\(/, label: 'logging.*' },
];

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
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) return;

    for (const { regex, label } of PATTERNS) {
      if (regex.test(line)) {
        matches.push({ line: idx + 1, label, text: trimmed });
        break;
      }
    }
  });

  if (matches.length >= 3) {
    log(`[Hook] Scattered logging detected in ${filePath} (${matches.length} statements)`);
    matches.slice(0, 5).forEach(m => log(`  L${m.line}: ${m.label} — ${m.text.substring(0, 80)}`));
    if (matches.length > 5) log(`  ... and ${matches.length - 5} more`);
    log('[Hook] Consider consolidating into wide events. Run /logging for guidance.');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
