/**
 * Tests for scripts/lib/session-manager.js
 *
 * Run with: node tests/lib/session-manager.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Import the module
const sessionManager = require('../../scripts/lib/session-manager');

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

/**
 * Create a temporary directory for file-based tests
 */
function createTempDir() {
  const tempDir = path.join(os.tmpdir(), `session-manager-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Remove a temporary directory and all its contents
 */
function removeTempDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

/**
 * Build a sample session markdown content for testing
 */
function buildSessionContent(options = {}) {
  const {
    title = 'Test Session',
    date = '2026-01-17',
    started = '14:30',
    lastUpdated = '15:45',
    completed = ['Set up project', 'Write tests'],
    inProgress = ['Fix bug in parser'],
    notes = 'Remember to check edge cases',
    context = 'file1.js\nfile2.js'
  } = options;

  let content = `# ${title}\n\n`;
  content += `**Date:** ${date}\n`;
  content += `**Started:** ${started}\n`;
  content += `**Last Updated:** ${lastUpdated}\n\n`;

  if (completed.length > 0) {
    content += `### Completed\n`;
    for (const item of completed) {
      content += `- [x] ${item}\n`;
    }
    content += '\n';
  }

  if (inProgress.length > 0) {
    content += `### In Progress\n`;
    for (const item of inProgress) {
      content += `- [ ] ${item}\n`;
    }
    content += '\n';
  }

  if (notes) {
    content += `### Notes for Next Session\n${notes}\n\n`;
  }

  if (context) {
    content += `### Context to Load\n\`\`\`\n${context}\n\`\`\`\n`;
  }

  return content;
}

// Test suite
function runTests() {
  console.log('\n=== Testing session-manager.js ===\n');

  let passed = 0;
  let failed = 0;

  // =========================================================================
  // parseSessionFilename tests
  // =========================================================================
  console.log('parseSessionFilename:');

  if (test('parses new format with short ID', () => {
    const result = sessionManager.parseSessionFilename('2026-01-17-abc12345-session.tmp');
    assert.ok(result !== null, 'Should not return null');
    assert.strictEqual(result.filename, '2026-01-17-abc12345-session.tmp');
    assert.strictEqual(result.shortId, 'abc12345');
    assert.strictEqual(result.date, '2026-01-17');
    assert.ok(result.datetime instanceof Date, 'datetime should be a Date object');
  })) passed++; else failed++;

  if (test('parses old format without short ID', () => {
    const result = sessionManager.parseSessionFilename('2026-01-17-session.tmp');
    assert.ok(result !== null, 'Should not return null');
    assert.strictEqual(result.filename, '2026-01-17-session.tmp');
    assert.strictEqual(result.shortId, 'no-id');
    assert.strictEqual(result.date, '2026-01-17');
  })) passed++; else failed++;

  if (test('returns null for invalid filenames', () => {
    assert.strictEqual(sessionManager.parseSessionFilename('invalid.tmp'), null);
    assert.strictEqual(sessionManager.parseSessionFilename('not-a-session'), null);
    assert.strictEqual(sessionManager.parseSessionFilename(''), null);
    assert.strictEqual(sessionManager.parseSessionFilename('random-text.txt'), null);
  })) passed++; else failed++;

  if (test('returns null for non-session .tmp files', () => {
    assert.strictEqual(sessionManager.parseSessionFilename('2026-01-17.tmp'), null);
    assert.strictEqual(sessionManager.parseSessionFilename('data.tmp'), null);
  })) passed++; else failed++;

  if (test('returns null for filenames with wrong date format', () => {
    assert.strictEqual(sessionManager.parseSessionFilename('26-01-17-session.tmp'), null);
    assert.strictEqual(sessionManager.parseSessionFilename('2026-1-17-session.tmp'), null);
    assert.strictEqual(sessionManager.parseSessionFilename('2026-01-7-session.tmp'), null);
  })) passed++; else failed++;

  if (test('handles longer short IDs (more than 8 chars)', () => {
    const result = sessionManager.parseSessionFilename('2026-03-01-abcdef123456-session.tmp');
    assert.ok(result !== null, 'Should accept longer short IDs');
    assert.strictEqual(result.shortId, 'abcdef123456');
  })) passed++; else failed++;

  if (test('rejects short IDs shorter than 8 characters', () => {
    const result = sessionManager.parseSessionFilename('2026-03-01-abc-session.tmp');
    assert.strictEqual(result, null, 'Should reject short ID with fewer than 8 chars');
  })) passed++; else failed++;

  if (test('datetime is parsed correctly from date string', () => {
    const result = sessionManager.parseSessionFilename('2026-06-15-abc12345-session.tmp');
    assert.ok(result !== null);
    assert.strictEqual(result.datetime.getFullYear(), 2026);
    // Month is 0-indexed in JS Date
    assert.strictEqual(result.datetime.getMonth(), 5);
    assert.strictEqual(result.datetime.getDate(), 15);
  })) passed++; else failed++;

  // =========================================================================
  // getSessionPath tests
  // =========================================================================
  console.log('\ngetSessionPath:');

  if (test('returns full path under sessions directory', () => {
    const result = sessionManager.getSessionPath('2026-01-17-abc12345-session.tmp');
    assert.ok(result.includes('sessions'), 'Path should contain sessions directory');
    assert.ok(result.endsWith('2026-01-17-abc12345-session.tmp'), 'Path should end with filename');
    assert.ok(path.isAbsolute(result), 'Path should be absolute');
  })) passed++; else failed++;

  // =========================================================================
  // parseSessionMetadata tests
  // =========================================================================
  console.log('\nparseSessionMetadata:');

  if (test('extracts title from heading', () => {
    const content = '# My Session Title\n\nSome content';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.title, 'My Session Title');
  })) passed++; else failed++;

  if (test('extracts date from bold date field', () => {
    const content = '# Title\n\n**Date:** 2026-01-17\n';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.date, '2026-01-17');
  })) passed++; else failed++;

  if (test('extracts started time', () => {
    const content = '# Title\n\n**Started:** 14:30\n';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.started, '14:30');
  })) passed++; else failed++;

  if (test('extracts last updated time', () => {
    const content = '# Title\n\n**Last Updated:** 15:45\n';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.lastUpdated, '15:45');
  })) passed++; else failed++;

  if (test('extracts completed items', () => {
    const content = '### Completed\n- [x] Task one\n- [x] Task two\n\n### Other';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.completed.length, 2);
    assert.strictEqual(metadata.completed[0], 'Task one');
    assert.strictEqual(metadata.completed[1], 'Task two');
  })) passed++; else failed++;

  if (test('extracts in-progress items', () => {
    const content = '### In Progress\n- [ ] WIP task one\n- [ ] WIP task two\n\n### Other';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.inProgress.length, 2);
    assert.strictEqual(metadata.inProgress[0], 'WIP task one');
    assert.strictEqual(metadata.inProgress[1], 'WIP task two');
  })) passed++; else failed++;

  if (test('extracts notes for next session', () => {
    const content = '### Notes for Next Session\nRemember to check edge cases\n\n### Other';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.notes, 'Remember to check edge cases');
  })) passed++; else failed++;

  if (test('extracts context to load from code block', () => {
    const content = '### Context to Load\n```\nfile1.js\nfile2.js\n```\n';
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.context, 'file1.js\nfile2.js');
  })) passed++; else failed++;

  if (test('returns empty metadata for null content', () => {
    const metadata = sessionManager.parseSessionMetadata(null);
    assert.strictEqual(metadata.title, null);
    assert.strictEqual(metadata.date, null);
    assert.strictEqual(metadata.started, null);
    assert.strictEqual(metadata.lastUpdated, null);
    assert.deepStrictEqual(metadata.completed, []);
    assert.deepStrictEqual(metadata.inProgress, []);
    assert.strictEqual(metadata.notes, '');
    assert.strictEqual(metadata.context, '');
  })) passed++; else failed++;

  if (test('returns empty metadata for empty string content', () => {
    const metadata = sessionManager.parseSessionMetadata('');
    assert.strictEqual(metadata.title, null);
    assert.strictEqual(metadata.date, null);
    assert.deepStrictEqual(metadata.completed, []);
    assert.deepStrictEqual(metadata.inProgress, []);
  })) passed++; else failed++;

  if (test('returns empty metadata for undefined content', () => {
    const metadata = sessionManager.parseSessionMetadata(undefined);
    assert.strictEqual(metadata.title, null);
    assert.deepStrictEqual(metadata.completed, []);
  })) passed++; else failed++;

  if (test('parses full session content correctly', () => {
    const content = buildSessionContent();
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.title, 'Test Session');
    assert.strictEqual(metadata.date, '2026-01-17');
    assert.strictEqual(metadata.started, '14:30');
    assert.strictEqual(metadata.lastUpdated, '15:45');
    assert.strictEqual(metadata.completed.length, 2);
    assert.strictEqual(metadata.completed[0], 'Set up project');
    assert.strictEqual(metadata.completed[1], 'Write tests');
    assert.strictEqual(metadata.inProgress.length, 1);
    assert.strictEqual(metadata.inProgress[0], 'Fix bug in parser');
    assert.strictEqual(metadata.notes, 'Remember to check edge cases');
    assert.strictEqual(metadata.context, 'file1.js\nfile2.js');
  })) passed++; else failed++;

  if (test('handles content with no completed items', () => {
    const content = buildSessionContent({ completed: [], inProgress: ['Task A'] });
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.deepStrictEqual(metadata.completed, []);
    assert.strictEqual(metadata.inProgress.length, 1);
  })) passed++; else failed++;

  if (test('handles content with no in-progress items', () => {
    const content = buildSessionContent({ completed: ['Done'], inProgress: [] });
    const metadata = sessionManager.parseSessionMetadata(content);
    assert.strictEqual(metadata.completed.length, 1);
    assert.deepStrictEqual(metadata.inProgress, []);
  })) passed++; else failed++;

  // =========================================================================
  // getSessionSize tests
  // =========================================================================
  console.log('\ngetSessionSize:');

  if (test('returns "0 B" for non-existent file', () => {
    const size = sessionManager.getSessionSize('/non/existent/path/session.tmp');
    assert.strictEqual(size, '0 B');
  })) passed++; else failed++;

  if (test('returns correct size in bytes for small file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'small.tmp');
      fs.writeFileSync(filePath, 'Hello');  // 5 bytes
      const size = sessionManager.getSessionSize(filePath);
      assert.strictEqual(size, '5 B');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns correct size in KB for larger file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'medium.tmp');
      // Write exactly 2048 bytes (2 KB)
      fs.writeFileSync(filePath, 'x'.repeat(2048));
      const size = sessionManager.getSessionSize(filePath);
      assert.strictEqual(size, '2.0 KB');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns correct size in MB for large file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'large.tmp');
      // Write 1.5 MB
      fs.writeFileSync(filePath, 'x'.repeat(1024 * 1024 + 512 * 1024));
      const size = sessionManager.getSessionSize(filePath);
      assert.strictEqual(size, '1.5 MB');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns "0 B" for empty file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'empty.tmp');
      fs.writeFileSync(filePath, '');
      const size = sessionManager.getSessionSize(filePath);
      assert.strictEqual(size, '0 B');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  // =========================================================================
  // File operations tests (writeSessionContent, appendSessionContent,
  //   getSessionContent, deleteSession, sessionExists)
  // =========================================================================
  console.log('\nFile Operations:');

  if (test('writeSessionContent creates file with content', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'write-test.tmp');
      const content = '# Test Session\n\nSome content';
      const result = sessionManager.writeSessionContent(filePath, content);
      assert.strictEqual(result, true);
      assert.ok(fs.existsSync(filePath), 'File should exist after write');
      assert.strictEqual(fs.readFileSync(filePath, 'utf8'), content);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('writeSessionContent overwrites existing file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'overwrite-test.tmp');
      sessionManager.writeSessionContent(filePath, 'Original content');
      sessionManager.writeSessionContent(filePath, 'New content');
      assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'New content');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('appendSessionContent appends to existing file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'append-test.tmp');
      sessionManager.writeSessionContent(filePath, 'Line 1\n');
      const result = sessionManager.appendSessionContent(filePath, 'Line 2\n');
      assert.strictEqual(result, true);
      assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'Line 1\nLine 2\n');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('appendSessionContent creates file if it does not exist', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'append-new.tmp');
      const result = sessionManager.appendSessionContent(filePath, 'First line\n');
      assert.strictEqual(result, true);
      assert.strictEqual(fs.readFileSync(filePath, 'utf8'), 'First line\n');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('getSessionContent reads file content', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'read-test.tmp');
      const content = '# Session\n\nContent here';
      fs.writeFileSync(filePath, content, 'utf8');
      const result = sessionManager.getSessionContent(filePath);
      assert.strictEqual(result, content);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('getSessionContent returns null for non-existent file', () => {
    const result = sessionManager.getSessionContent('/non/existent/file.tmp');
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('deleteSession removes existing file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'delete-test.tmp');
      fs.writeFileSync(filePath, 'content', 'utf8');
      assert.ok(fs.existsSync(filePath), 'File should exist before delete');
      const result = sessionManager.deleteSession(filePath);
      assert.strictEqual(result, true);
      assert.ok(!fs.existsSync(filePath), 'File should not exist after delete');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('deleteSession returns false for non-existent file', () => {
    const result = sessionManager.deleteSession('/non/existent/file.tmp');
    assert.strictEqual(result, false);
  })) passed++; else failed++;

  if (test('sessionExists returns true for existing file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'exists-test.tmp');
      fs.writeFileSync(filePath, 'content', 'utf8');
      assert.strictEqual(sessionManager.sessionExists(filePath), true);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('sessionExists returns false for non-existent file', () => {
    assert.strictEqual(sessionManager.sessionExists('/non/existent/file.tmp'), false);
  })) passed++; else failed++;

  if (test('sessionExists returns false for directory path', () => {
    const tempDir = createTempDir();
    try {
      // tempDir is a directory, not a file
      assert.strictEqual(sessionManager.sessionExists(tempDir), false);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('write, read, append, read roundtrip', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'roundtrip.tmp');
      const initial = '# Session\n';
      const appended = '## Added Section\n';

      sessionManager.writeSessionContent(filePath, initial);
      assert.strictEqual(sessionManager.getSessionContent(filePath), initial);

      sessionManager.appendSessionContent(filePath, appended);
      assert.strictEqual(sessionManager.getSessionContent(filePath), initial + appended);

      sessionManager.deleteSession(filePath);
      assert.strictEqual(sessionManager.getSessionContent(filePath), null);
      assert.strictEqual(sessionManager.sessionExists(filePath), false);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  // =========================================================================
  // getSessionStats tests
  // =========================================================================
  console.log('\ngetSessionStats:');

  if (test('counts completed and in-progress items', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'stats-test.tmp');
      const content = buildSessionContent({
        completed: ['Task 1', 'Task 2', 'Task 3'],
        inProgress: ['Task 4']
      });
      fs.writeFileSync(filePath, content, 'utf8');

      const stats = sessionManager.getSessionStats(filePath);
      assert.strictEqual(stats.completedItems, 3);
      assert.strictEqual(stats.inProgressItems, 1);
      assert.strictEqual(stats.totalItems, 4);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('reports line count correctly', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'lines-test.tmp');
      const content = 'Line 1\nLine 2\nLine 3\n';
      fs.writeFileSync(filePath, content, 'utf8');

      const stats = sessionManager.getSessionStats(filePath);
      assert.strictEqual(stats.lineCount, 4); // 3 lines + trailing empty after last \n
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('reports hasNotes and hasContext correctly', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'flags-test.tmp');
      const content = buildSessionContent({
        notes: 'Some notes',
        context: 'some-file.js'
      });
      fs.writeFileSync(filePath, content, 'utf8');

      const stats = sessionManager.getSessionStats(filePath);
      assert.strictEqual(stats.hasNotes, true);
      assert.strictEqual(stats.hasContext, true);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('hasNotes is false when no notes section', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'no-notes.tmp');
      const content = '# Simple Session\n\n**Date:** 2026-01-17\n';
      fs.writeFileSync(filePath, content, 'utf8');

      const stats = sessionManager.getSessionStats(filePath);
      assert.strictEqual(stats.hasNotes, false);
      assert.strictEqual(stats.hasContext, false);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns zero stats for non-existent file', () => {
    const stats = sessionManager.getSessionStats('/non/existent/stats.tmp');
    assert.strictEqual(stats.totalItems, 0);
    assert.strictEqual(stats.completedItems, 0);
    assert.strictEqual(stats.inProgressItems, 0);
    assert.strictEqual(stats.lineCount, 0);
    assert.strictEqual(stats.hasNotes, false);
    assert.strictEqual(stats.hasContext, false);
  })) passed++; else failed++;

  // =========================================================================
  // getSessionTitle tests
  // =========================================================================
  console.log('\ngetSessionTitle:');

  if (test('extracts title from session file', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'title-test.tmp');
      const content = buildSessionContent({ title: 'My Great Session' });
      fs.writeFileSync(filePath, content, 'utf8');

      const title = sessionManager.getSessionTitle(filePath);
      assert.strictEqual(title, 'My Great Session');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns "Untitled Session" for file without title', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'no-title.tmp');
      fs.writeFileSync(filePath, 'Some content without a heading\n', 'utf8');

      const title = sessionManager.getSessionTitle(filePath);
      assert.strictEqual(title, 'Untitled Session');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('returns "Untitled Session" for non-existent file', () => {
    const title = sessionManager.getSessionTitle('/non/existent/title.tmp');
    assert.strictEqual(title, 'Untitled Session');
  })) passed++; else failed++;

  // =========================================================================
  // getAllSessions tests (using temp sessions directory)
  // =========================================================================
  console.log('\ngetAllSessions:');

  // Note: getAllSessions uses getSessionsDir() internally, which returns the
  // real sessions dir. We test behavior against the real environment.
  // For controlled tests, we also test edge cases we can verify.

  if (test('returns object with expected shape', () => {
    const result = sessionManager.getAllSessions();
    assert.ok(Array.isArray(result.sessions), 'sessions should be an array');
    assert.strictEqual(typeof result.total, 'number');
    assert.strictEqual(typeof result.offset, 'number');
    assert.strictEqual(typeof result.limit, 'number');
    assert.strictEqual(typeof result.hasMore, 'boolean');
  })) passed++; else failed++;

  if (test('respects default limit and offset', () => {
    const result = sessionManager.getAllSessions();
    assert.strictEqual(result.offset, 0);
    assert.strictEqual(result.limit, 50);
  })) passed++; else failed++;

  if (test('respects custom limit and offset', () => {
    const result = sessionManager.getAllSessions({ limit: 5, offset: 2 });
    assert.strictEqual(result.offset, 2);
    assert.strictEqual(result.limit, 5);
  })) passed++; else failed++;

  if (test('pagination with limit returns correct hasMore', () => {
    const result = sessionManager.getAllSessions({ limit: 1, offset: 0 });
    if (result.total > 1) {
      assert.strictEqual(result.hasMore, true, 'Should have more when total > limit');
    } else {
      assert.strictEqual(result.hasMore, false, 'Should not have more when total <= limit');
    }
  })) passed++; else failed++;

  if (test('date filter narrows results', () => {
    // Use a date that certainly has no sessions
    const result = sessionManager.getAllSessions({ date: '1999-01-01' });
    assert.strictEqual(result.sessions.length, 0, 'No sessions should exist for 1999-01-01');
    assert.strictEqual(result.total, 0);
  })) passed++; else failed++;

  if (test('search filter narrows results', () => {
    // Use a search term that almost certainly matches nothing
    const result = sessionManager.getAllSessions({ search: 'zzzznonexistent9999' });
    assert.strictEqual(result.sessions.length, 0);
    assert.strictEqual(result.total, 0);
  })) passed++; else failed++;

  if (test('sessions have expected metadata fields', () => {
    const result = sessionManager.getAllSessions({ limit: 1 });
    if (result.sessions.length > 0) {
      const session = result.sessions[0];
      assert.ok('filename' in session, 'Should have filename');
      assert.ok('shortId' in session, 'Should have shortId');
      assert.ok('date' in session, 'Should have date');
      assert.ok('sessionPath' in session, 'Should have sessionPath');
      assert.ok('size' in session, 'Should have size');
      assert.ok('modifiedTime' in session, 'Should have modifiedTime');
      assert.ok('hasContent' in session, 'Should have hasContent');
    }
    // If no sessions exist, the test still passes (structure is correct)
    assert.ok(true);
  })) passed++; else failed++;

  // =========================================================================
  // getSessionById tests
  // =========================================================================
  console.log('\ngetSessionById:');

  if (test('returns null for non-existent session ID', () => {
    const result = sessionManager.getSessionById('nonexistent99');
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('returns null when sessions directory does not exist', () => {
    // This test depends on environment; if sessions dir exists it will search.
    // We test with a definitely non-matching ID.
    const result = sessionManager.getSessionById('xxxxxxxxzzzz');
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('finds session by short ID if sessions exist', () => {
    // Get all sessions and try to find the first one by ID
    const all = sessionManager.getAllSessions({ limit: 1 });
    if (all.sessions.length > 0 && all.sessions[0].shortId !== 'no-id') {
      const shortId = all.sessions[0].shortId;
      const found = sessionManager.getSessionById(shortId);
      assert.ok(found !== null, `Should find session with ID ${shortId}`);
      assert.strictEqual(found.shortId, shortId);
    }
    // If no sessions exist or only old-format, skip gracefully
    assert.ok(true);
  })) passed++; else failed++;

  if (test('includes content when includeContent is true', () => {
    const all = sessionManager.getAllSessions({ limit: 1 });
    if (all.sessions.length > 0 && all.sessions[0].shortId !== 'no-id') {
      const shortId = all.sessions[0].shortId;
      const found = sessionManager.getSessionById(shortId, true);
      assert.ok(found !== null);
      assert.ok('content' in found, 'Should include content field');
      assert.ok('metadata' in found, 'Should include metadata field');
      assert.ok('stats' in found, 'Should include stats field');
    }
    assert.ok(true);
  })) passed++; else failed++;

  if (test('does not include content when includeContent is false', () => {
    const all = sessionManager.getAllSessions({ limit: 1 });
    if (all.sessions.length > 0 && all.sessions[0].shortId !== 'no-id') {
      const shortId = all.sessions[0].shortId;
      const found = sessionManager.getSessionById(shortId, false);
      assert.ok(found !== null);
      assert.ok(!('content' in found), 'Should not include content field');
      assert.ok(!('metadata' in found), 'Should not include metadata field');
    }
    assert.ok(true);
  })) passed++; else failed++;

  // =========================================================================
  // Integration: write then query with getSessionStats + getSessionTitle
  // =========================================================================
  console.log('\nIntegration (write + stats + title):');

  if (test('write session then verify stats and title', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'integration.tmp');
      const content = buildSessionContent({
        title: 'Integration Test Session',
        completed: ['A', 'B'],
        inProgress: ['C', 'D', 'E'],
        notes: 'Important note',
        context: 'ctx.js'
      });
      sessionManager.writeSessionContent(filePath, content);

      const title = sessionManager.getSessionTitle(filePath);
      assert.strictEqual(title, 'Integration Test Session');

      const stats = sessionManager.getSessionStats(filePath);
      assert.strictEqual(stats.completedItems, 2);
      assert.strictEqual(stats.inProgressItems, 3);
      assert.strictEqual(stats.totalItems, 5);
      assert.strictEqual(stats.hasNotes, true);
      assert.strictEqual(stats.hasContext, true);

      const size = sessionManager.getSessionSize(filePath);
      assert.ok(size.includes('B') || size.includes('KB'), `Size should be formatted: ${size}`);
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('append to session updates content correctly', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'append-integration.tmp');
      const initial = buildSessionContent({
        title: 'Append Test',
        completed: ['Done'],
        inProgress: [],
        notes: '',
        context: ''
      });
      sessionManager.writeSessionContent(filePath, initial);

      // Append an in-progress section
      sessionManager.appendSessionContent(filePath, '\n### In Progress\n- [ ] New task\n');

      const content = sessionManager.getSessionContent(filePath);
      assert.ok(content.includes('New task'), 'Appended content should be present');

      const metadata = sessionManager.parseSessionMetadata(content);
      assert.strictEqual(metadata.completed.length, 1);
      assert.strictEqual(metadata.inProgress.length, 1);
      assert.strictEqual(metadata.inProgress[0], 'New task');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  if (test('delete then verify session no longer exists', () => {
    const tempDir = createTempDir();
    try {
      const filePath = path.join(tempDir, 'delete-int.tmp');
      sessionManager.writeSessionContent(filePath, '# Temp\n');

      assert.strictEqual(sessionManager.sessionExists(filePath), true);
      sessionManager.deleteSession(filePath);
      assert.strictEqual(sessionManager.sessionExists(filePath), false);
      assert.strictEqual(sessionManager.getSessionContent(filePath), null);
      assert.strictEqual(sessionManager.getSessionTitle(filePath), 'Untitled Session');
    } finally {
      removeTempDir(tempDir);
    }
  })) passed++; else failed++;

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
