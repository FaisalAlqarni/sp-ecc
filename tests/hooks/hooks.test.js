/**
 * Tests for hook scripts
 *
 * Run with: node tests/hooks/hooks.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

// Async test helper
async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

// Run a script and capture output
function runScript(scriptPath, input = '', env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    if (input) {
      proc.stdin.write(input);
    }
    proc.stdin.end();

    proc.on('close', code => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', reject);
  });
}

// Create a temporary test directory
function createTestDir() {
  const testDir = path.join(os.tmpdir(), `hooks-test-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });
  return testDir;
}

// Clean up test directory
function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

// Test suite
async function runTests() {
  console.log('\n=== Testing Hook Scripts ===\n');

  let passed = 0;
  let failed = 0;

  const scriptsDir = path.join(__dirname, '..', '..', 'scripts', 'hooks');

  // session-start.js tests
  console.log('session-start.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('outputs session info to stderr', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.ok(
      result.stderr.includes('[SessionStart]') ||
      result.stderr.includes('Package manager'),
      'Should output session info'
    );
  })) passed++; else failed++;

  // session-end.js tests
  console.log('\nsession-end.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-end.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('creates or updates session file', async () => {
    // Run the script
    await runScript(path.join(scriptsDir, 'session-end.js'));

    // Check if session file was created
    // Note: Without CLAUDE_SESSION_ID, falls back to project name (not 'default')
    // Use local time to match the script's getDateString() function
    const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Get the expected session ID (project name fallback)
    const utils = require('../../scripts/lib/utils');
    const expectedId = utils.getSessionIdShort();
    const sessionFile = path.join(sessionsDir, `${today}-${expectedId}-session.tmp`);

    assert.ok(fs.existsSync(sessionFile), `Session file should exist: ${sessionFile}`);
  })) passed++; else failed++;

  if (await asyncTest('includes session ID in filename', async () => {
    const testSessionId = 'test-session-abc12345';
    const expectedShortId = 'abc12345'; // Last 8 chars

    // Run with custom session ID
    await runScript(path.join(scriptsDir, 'session-end.js'), '', {
      CLAUDE_SESSION_ID: testSessionId
    });

    // Check if session file was created with session ID
    // Use local time to match the script's getDateString() function
    const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sessionFile = path.join(sessionsDir, `${today}-${expectedShortId}-session.tmp`);

    assert.ok(fs.existsSync(sessionFile), `Session file should exist: ${sessionFile}`);
  })) passed++; else failed++;

  // pre-compact.js tests
  console.log('\npre-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('outputs PreCompact message', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.ok(result.stderr.includes('[PreCompact]'), 'Should output PreCompact message');
  })) passed++; else failed++;

  if (await asyncTest('creates compaction log', async () => {
    await runScript(path.join(scriptsDir, 'pre-compact.js'));
    const logFile = path.join(os.homedir(), '.claude', 'sessions', 'compaction-log.txt');
    assert.ok(fs.existsSync(logFile), 'Compaction log should exist');
  })) passed++; else failed++;

  // suggest-compact.js tests
  console.log('\nsuggest-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: 'test-session-' + Date.now()
    });
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('increments counter on each call', async () => {
    const sessionId = 'test-counter-' + Date.now();

    // Run multiple times
    for (let i = 0; i < 3; i++) {
      await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
        CLAUDE_SESSION_ID: sessionId
      });
    }

    // Check counter file
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);
    const count = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10);
    assert.strictEqual(count, 3, `Counter should be 3, got ${count}`);

    // Cleanup
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  if (await asyncTest('suggests compact at threshold', async () => {
    const sessionId = 'test-threshold-' + Date.now();
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);

    // Set counter to threshold - 1
    fs.writeFileSync(counterFile, '49');

    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: sessionId,
      COMPACT_THRESHOLD: '50'
    });

    assert.ok(
      result.stderr.includes('50 tool calls reached'),
      'Should suggest compact at threshold'
    );

    // Cleanup
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  // evaluate-session.js tests
  console.log('\nevaluate-session.js:');

  if (await asyncTest('runs without error when no transcript', async () => {
    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('skips short sessions', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // Create a short transcript (less than 10 user messages)
    const transcript = Array(5).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('Session too short'),
      'Should indicate session is too short'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('processes sessions with enough messages', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // Create a longer transcript (more than 10 user messages)
    const transcript = Array(15).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('15 messages'),
      'Should report message count'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // hooks.json validation
  console.log('\nhooks.json Validation:');

  if (test('hooks.json is valid JSON', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const content = fs.readFileSync(hooksPath, 'utf8');
    JSON.parse(content); // Will throw if invalid
  })) passed++; else failed++;

  if (test('hooks.json has required event types', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    assert.ok(hooks.hooks.PreToolUse, 'Should have PreToolUse hooks');
    assert.ok(hooks.hooks.PostToolUse, 'Should have PostToolUse hooks');
    assert.ok(hooks.hooks.SessionStart, 'Should have SessionStart hooks');
    assert.ok(hooks.hooks.SessionEnd, 'Should have SessionEnd hooks');
    assert.ok(hooks.hooks.Stop, 'Should have Stop hooks');
    assert.ok(hooks.hooks.PreCompact, 'Should have PreCompact hooks');
  })) passed++; else failed++;

  if (test('all hook commands use run-node.sh or session-start.sh', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            assert.ok(
              hook.command.includes('run-node.sh') || hook.command.includes('session-start.sh'),
              `Hook command should use run-node.sh or session-start.sh: ${hook.command.substring(0, 80)}...`
            );
          }
        }
      }
    };

    for (const [, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  if (test('script references use CLAUDE_PLUGIN_ROOT variable', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command' && hook.command.includes('scripts/hooks/')) {
            // Check for the literal string "${CLAUDE_PLUGIN_ROOT}" in the command
            const hasPluginRoot = hook.command.includes('${CLAUDE_PLUGIN_ROOT}');
            assert.ok(
              hasPluginRoot,
              `Script paths should use CLAUDE_PLUGIN_ROOT: ${hook.command.substring(0, 80)}...`
            );
          }
        }
      }
    };

    for (const [, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  if (test('no observe.sh hooks in hooks.json (observer disabled)', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const content = fs.readFileSync(hooksPath, 'utf8');
    assert.ok(!content.includes('observe.sh'), 'hooks.json should not reference observe.sh (observer disabled)');
  })) passed++; else failed++;

  if (test('no inline JS in hooks.json (all extracted to scripts)', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkNoInlineJs = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            assert.ok(
              !hook.command.includes('-e "'),
              `Hook should not use inline JS (-e): ${hook.command.substring(0, 80)}...`
            );
          }
        }
      }
    };

    for (const [, hookArray] of Object.entries(hooks.hooks)) {
      checkNoInlineJs(hookArray);
    }
  })) passed++; else failed++;

  if (test('all referenced script files exist', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const pluginRoot = path.join(__dirname, '..', '..');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkScriptExists = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            // Extract script paths from the command
            const scriptMatches = hook.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)/g);
            if (scriptMatches) {
              for (const match of scriptMatches) {
                const relativePath = match.replace('${CLAUDE_PLUGIN_ROOT}/', '');
                const fullPath = path.join(pluginRoot, relativePath);
                assert.ok(
                  fs.existsSync(fullPath),
                  `Referenced script should exist: ${relativePath}`
                );
              }
            }
          }
        }
      }
    };

    for (const [, hookArray] of Object.entries(hooks.hooks)) {
      checkScriptExists(hookArray);
    }
  })) passed++; else failed++;

  // block-destructive-git.js tests
  console.log('\nblock-destructive-git.js:');

  if (await asyncTest('blocks git push --force', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git push --force origin main' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 1, `Should exit 1 for force push, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  if (await asyncTest('blocks git reset --hard', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git reset --hard HEAD~1' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 1, `Should exit 1 for hard reset, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('blocks git rebase', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git rebase main' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 1, `Should exit 1 for rebase, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('allows git commit', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git commit -m "test commit"' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for normal commit, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('allows git push (non-force)', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git push origin main' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for normal push, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('allows git add', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git add -A' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for git add, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('blocks git push --force-with-lease', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git push --force-with-lease origin main' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 1, `Should exit 1 for force-with-lease push, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  if (await asyncTest('allows git rebase --abort', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git rebase --abort' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for rebase --abort, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('allows git pull --rebase', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git pull --rebase origin main' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for pull --rebase, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('allows non-Bash tools', async () => {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: 'test.js' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-destructive-git.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-Bash tools, got ${result.code}`);
  })) passed++; else failed++;

  // strip-coauthor.js tests
  console.log('\nstrip-coauthor.js:');

  if (await asyncTest('strips Co-Authored-By from git commit', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git commit -m "Fix bug\n\nCo-Authored-By: Claude <noreply@anthropic.com>"' }
    });
    const result = await runScript(path.join(scriptsDir, 'strip-coauthor.js'), input);
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
    assert.ok(result.stderr.includes('Stripped'), 'Should report stripping');
    // stdout should contain the modified command without Co-Authored-By
    if (result.stdout.trim()) {
      const output = JSON.parse(result.stdout);
      assert.ok(!output.tool_input.command.includes('Co-Authored-By'), 'Should have removed Co-Authored-By');
    }
  })) passed++; else failed++;

  if (await asyncTest('passes through non-commit commands', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git push origin main' }
    });
    const result = await runScript(path.join(scriptsDir, 'strip-coauthor.js'), input);
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
    assert.strictEqual(result.stdout.trim(), '', 'Should not modify non-commit commands');
  })) passed++; else failed++;

  // block-dev-server.js tests
  console.log('\nblock-dev-server.js:');

  if (await asyncTest('exits 0 for non-Bash tools', async () => {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: 'test.js' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-Bash tools, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 for non-dev-server commands', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'npm run build' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-dev-server commands, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 for git commands', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'git status' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for git commands, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 when TMUX is set (already in tmux)', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'npm run dev' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input, { TMUX: '/tmp/tmux-test' });
    assert.strictEqual(result.code, 0, `Should exit 0 when in tmux, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('blocks npm run dev outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      // On Windows it always exits 0
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'npm run dev' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 1, `Should exit 1 for dev server outside tmux, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  if (await asyncTest('blocks pnpm dev outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'pnpm dev' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 1, `Should exit 1 for pnpm dev outside tmux, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  if (await asyncTest('blocks yarn dev outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'yarn dev' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 1, `Should exit 1 for yarn dev outside tmux, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  if (await asyncTest('blocks bun run dev outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'bun run dev' }
    });
    const result = await runScript(path.join(scriptsDir, 'block-dev-server.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 1, `Should exit 1 for bun run dev outside tmux, got ${result.code}`);
    assert.ok(result.stderr.includes('BLOCKED'), 'Should contain BLOCKED message');
  })) passed++; else failed++;

  // tmux-reminder.js tests
  console.log('\ntmux-reminder.js:');

  if (await asyncTest('exits 0 for non-Bash tools', async () => {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: 'test.js' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-Bash tools, got ${result.code}`);
    assert.strictEqual(result.stderr.trim(), '', 'Should not print any reminder for non-Bash tools');
  })) passed++; else failed++;

  if (await asyncTest('exits 0 silently for non-matching commands', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'echo hello' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-matching commands, got ${result.code}`);
    assert.strictEqual(result.stderr.trim(), '', 'Should not print reminder for non-matching commands');
  })) passed++; else failed++;

  if (await asyncTest('exits 0 silently when TMUX is set', async () => {
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'npm install' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input, { TMUX: '/tmp/tmux-test' });
    assert.strictEqual(result.code, 0, `Should exit 0 when in tmux, got ${result.code}`);
    assert.strictEqual(result.stderr.trim(), '', 'Should not print reminder when already in tmux');
  })) passed++; else failed++;

  if (await asyncTest('prints reminder for npm install outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'npm install express' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 0, `Should always exit 0, got ${result.code}`);
    assert.ok(result.stderr.includes('tmux'), 'Should print tmux reminder');
  })) passed++; else failed++;

  if (await asyncTest('prints reminder for pytest outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'pytest tests/' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 0, `Should always exit 0, got ${result.code}`);
    assert.ok(result.stderr.includes('tmux'), 'Should print tmux reminder for pytest');
  })) passed++; else failed++;

  if (await asyncTest('prints reminder for docker outside tmux (non-Windows)', async () => {
    if (process.platform === 'win32') {
      return;
    }
    const input = JSON.stringify({
      tool_name: 'Bash',
      tool_input: { command: 'docker build .' }
    });
    const result = await runScript(path.join(scriptsDir, 'tmux-reminder.js'), input, { TMUX: '' });
    assert.strictEqual(result.code, 0, `Should always exit 0, got ${result.code}`);
    assert.ok(result.stderr.includes('tmux'), 'Should print tmux reminder for docker');
  })) passed++; else failed++;

  // typescript-check.js tests
  console.log('\ntypescript-check.js:');

  if (await asyncTest('exits 0 for missing file_path', async () => {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: {}
    });
    const result = await runScript(path.join(scriptsDir, 'typescript-check.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for missing file_path, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 for non-existent file', async () => {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: '/tmp/does-not-exist-typescript-check-test.ts' }
    });
    const result = await runScript(path.join(scriptsDir, 'typescript-check.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 for non-existent file, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 when no tsconfig.json found', async () => {
    const testDir = createTestDir();
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(testFile, 'const x: number = 1;');

    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: testFile }
    });
    const result = await runScript(path.join(scriptsDir, 'typescript-check.js'), input);
    assert.strictEqual(result.code, 0, `Should exit 0 when no tsconfig.json found, got ${result.code}`);

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('always exits 0 (non-blocking)', async () => {
    // Even with a valid TS file and tsconfig, should exit 0
    const testDir = createTestDir();
    const testFile = path.join(testDir, 'test.ts');
    fs.writeFileSync(testFile, 'const x: string = 123;'); // type error on purpose
    fs.writeFileSync(path.join(testDir, 'tsconfig.json'), '{"compilerOptions":{"strict":true}}');

    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: testFile }
    });
    const result = await runScript(path.join(scriptsDir, 'typescript-check.js'), input);
    assert.strictEqual(result.code, 0, `Should always exit 0, got ${result.code}`);

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // check-console-log.js tests
  console.log('\ncheck-console-log.js:');

  if (await asyncTest('runs without error and exits 0', async () => {
    const result = await runScript(path.join(scriptsDir, 'check-console-log.js'));
    assert.strictEqual(result.code, 0, `Should exit 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('exits 0 when not in a git repo', async () => {
    const testDir = createTestDir();
    const result = await runScript(path.join(scriptsDir, 'check-console-log.js'), '', {
      GIT_DIR: path.join(testDir, 'nonexistent-git')
    });
    assert.strictEqual(result.code, 0, `Should exit 0 outside git repo, got ${result.code}`);
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('always exits 0 (non-blocking)', async () => {
    // Run with empty stdin to verify it handles gracefully
    const result = await runScript(path.join(scriptsDir, 'check-console-log.js'), '');
    assert.strictEqual(result.code, 0, `Should always exit 0, got ${result.code}`);
  })) passed++; else failed++;

  // plugin.json validation
  console.log('\nplugin.json Validation:');

  if (test('plugin.json does NOT have explicit hooks declaration', () => {
    // Claude Code automatically loads hooks/hooks.json by convention.
    // Explicitly declaring it in plugin.json causes a duplicate detection error.
    // See: https://github.com/affaan-m/everything-claude-code/issues/103
    const pluginPath = path.join(__dirname, '..', '..', '.claude-plugin', 'plugin.json');
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

    assert.ok(
      !plugin.hooks,
      'plugin.json should NOT have "hooks" field - Claude Code auto-loads hooks/hooks.json'
    );
  })) passed++; else failed++;

  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
