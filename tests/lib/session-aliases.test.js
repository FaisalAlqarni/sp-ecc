/**
 * Tests for scripts/lib/session-aliases.js
 *
 * Run with: node tests/lib/session-aliases.test.js
 *
 * Strategy: Since the module uses getClaudeDir() internally for file paths,
 * we backup any existing aliases file before tests, run all tests using the
 * module's own functions, then restore the original file afterwards.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Import the module under test
const aliases = require('../../scripts/lib/session-aliases');

// We also need getClaudeDir to locate the aliases file for backup/restore
const { getClaudeDir, ensureDir } = require('../../scripts/lib/utils');

// Test helpers (same pattern as utils.test.js)
function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function asyncTest(name, fn) {
  return fn().then(() => {
    console.log(`  \u2713 ${name}`);
    return true;
  }).catch(err => {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  });
}

// Backup and restore helpers
const aliasesPath = aliases.getAliasesPath();
const backupPath = aliasesPath + '.test-backup';

function backupAliasesFile() {
  if (fs.existsSync(aliasesPath)) {
    fs.copyFileSync(aliasesPath, backupPath);
  }
}

function restoreAliasesFile() {
  // Clean up the test aliases file
  if (fs.existsSync(aliasesPath)) {
    fs.unlinkSync(aliasesPath);
  }
  // Also clean up any .tmp or .bak files left behind
  if (fs.existsSync(aliasesPath + '.tmp')) {
    fs.unlinkSync(aliasesPath + '.tmp');
  }
  if (fs.existsSync(aliasesPath + '.bak')) {
    fs.unlinkSync(aliasesPath + '.bak');
  }
  // Restore original
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, aliasesPath);
    fs.unlinkSync(backupPath);
  }
}

function clearAliasesFile() {
  if (fs.existsSync(aliasesPath)) {
    fs.unlinkSync(aliasesPath);
  }
}

function writeMalformedAliasesFile() {
  ensureDir(path.dirname(aliasesPath));
  fs.writeFileSync(aliasesPath, '{invalid json content!!!', 'utf8');
}

function writeInvalidStructureAliasesFile() {
  ensureDir(path.dirname(aliasesPath));
  fs.writeFileSync(aliasesPath, JSON.stringify({ noAliasesKey: true }), 'utf8');
}

// Test suite
function runTests() {
  console.log('\n=== Testing session-aliases.js ===\n');

  let passed = 0;
  let failed = 0;

  // Backup the real aliases file before any tests
  backupAliasesFile();

  try {

    // === loadAliases tests ===
    console.log('loadAliases:');

    clearAliasesFile();

    if (test('returns default structure when file does not exist', () => {
      const data = aliases.loadAliases();
      assert.strictEqual(data.version, '1.0');
      assert.ok(data.aliases && typeof data.aliases === 'object', 'Should have aliases object');
      assert.strictEqual(Object.keys(data.aliases).length, 0, 'Aliases should be empty');
      assert.ok(data.metadata, 'Should have metadata');
      assert.strictEqual(data.metadata.totalCount, 0, 'totalCount should be 0');
    })) passed++; else failed++;

    if (test('handles malformed JSON gracefully', () => {
      writeMalformedAliasesFile();
      const data = aliases.loadAliases();
      assert.strictEqual(data.version, '1.0');
      assert.strictEqual(Object.keys(data.aliases).length, 0, 'Should return empty aliases');
      clearAliasesFile();
    })) passed++; else failed++;

    if (test('handles invalid structure (missing aliases key)', () => {
      writeInvalidStructureAliasesFile();
      const data = aliases.loadAliases();
      assert.strictEqual(data.version, '1.0');
      assert.strictEqual(Object.keys(data.aliases).length, 0, 'Should return empty aliases');
      clearAliasesFile();
    })) passed++; else failed++;

    if (test('handles empty file content', () => {
      ensureDir(path.dirname(aliasesPath));
      fs.writeFileSync(aliasesPath, '', 'utf8');
      const data = aliases.loadAliases();
      assert.strictEqual(data.version, '1.0');
      assert.strictEqual(Object.keys(data.aliases).length, 0);
      clearAliasesFile();
    })) passed++; else failed++;

    // === setAlias tests ===
    console.log('\nsetAlias:');

    clearAliasesFile();

    if (test('creates a new alias', () => {
      const result = aliases.setAlias('my-project', '/path/to/session', 'My Project');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isNew, true);
      assert.strictEqual(result.alias, 'my-project');
      assert.strictEqual(result.sessionPath, '/path/to/session');
      assert.strictEqual(result.title, 'My Project');
    })) passed++; else failed++;

    if (test('updates existing alias and preserves createdAt', () => {
      // First, read what createdAt was set to
      const before = aliases.resolveAlias('my-project');
      assert.ok(before, 'Alias should exist from previous test');
      const originalCreatedAt = before.createdAt;

      // Update the alias with a new session path
      const result = aliases.setAlias('my-project', '/path/to/new-session', 'Updated Title');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isNew, false);

      // Verify createdAt was preserved
      const after = aliases.resolveAlias('my-project');
      assert.strictEqual(after.createdAt, originalCreatedAt, 'createdAt should be preserved');
      assert.strictEqual(after.sessionPath, '/path/to/new-session');
    })) passed++; else failed++;

    if (test('rejects empty alias name', () => {
      const result = aliases.setAlias('', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('empty'), 'Error should mention empty');
    })) passed++; else failed++;

    if (test('rejects null alias name', () => {
      const result = aliases.setAlias(null, '/path/to/session');
      assert.strictEqual(result.success, false);
    })) passed++; else failed++;

    if (test('rejects alias with invalid characters (spaces)', () => {
      const result = aliases.setAlias('my project', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('letters, numbers, dashes, and underscores'));
    })) passed++; else failed++;

    if (test('rejects alias with invalid characters (special chars)', () => {
      const result = aliases.setAlias('my@project!', '/path/to/session');
      assert.strictEqual(result.success, false);
    })) passed++; else failed++;

    if (test('accepts alias with dashes and underscores', () => {
      const result = aliases.setAlias('my_project-2', '/path/to/session');
      assert.strictEqual(result.success, true);
    })) passed++; else failed++;

    if (test('rejects reserved name: list', () => {
      const result = aliases.setAlias('list', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name: help', () => {
      const result = aliases.setAlias('help', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name: remove', () => {
      const result = aliases.setAlias('remove', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name: delete', () => {
      const result = aliases.setAlias('delete', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name: create', () => {
      const result = aliases.setAlias('create', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name: set', () => {
      const result = aliases.setAlias('set', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('rejects reserved name case-insensitively (LIST)', () => {
      const result = aliases.setAlias('LIST', '/path/to/session');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('reserved'));
    })) passed++; else failed++;

    if (test('creates alias without title (title defaults to null)', () => {
      const result = aliases.setAlias('no-title-alias', '/path/to/session');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.title, null);
    })) passed++; else failed++;

    // === resolveAlias tests ===
    console.log('\nresolveAlias:');

    clearAliasesFile();

    if (test('returns null for non-existent alias', () => {
      const result = aliases.resolveAlias('does-not-exist');
      assert.strictEqual(result, null);
    })) passed++; else failed++;

    if (test('returns null for alias with invalid characters', () => {
      const result = aliases.resolveAlias('has spaces');
      assert.strictEqual(result, null);
    })) passed++; else failed++;

    if (test('returns null for alias with special characters', () => {
      const result = aliases.resolveAlias('foo@bar');
      assert.strictEqual(result, null);
    })) passed++; else failed++;

    if (test('resolves an existing alias', () => {
      aliases.setAlias('resolve-test', '/path/to/resolve-session', 'Resolve Test');
      const result = aliases.resolveAlias('resolve-test');
      assert.ok(result, 'Should return alias data');
      assert.strictEqual(result.alias, 'resolve-test');
      assert.strictEqual(result.sessionPath, '/path/to/resolve-session');
      assert.strictEqual(result.title, 'Resolve Test');
      assert.ok(result.createdAt, 'Should have createdAt');
    })) passed++; else failed++;

    if (test('resolves alias without title (title is null)', () => {
      aliases.setAlias('no-title', '/path/to/session');
      const result = aliases.resolveAlias('no-title');
      assert.ok(result, 'Should return alias data');
      assert.strictEqual(result.title, null);
    })) passed++; else failed++;

    // === saveAliases tests ===
    console.log('\nsaveAliases:');

    clearAliasesFile();

    if (test('saves and loads aliases round-trip', () => {
      const data = {
        version: '1.0',
        aliases: {
          'test-save': {
            sessionPath: '/saved/path',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            title: 'Saved Alias'
          }
        },
        metadata: {
          totalCount: 1,
          lastUpdated: new Date().toISOString()
        }
      };
      const saved = aliases.saveAliases(data);
      assert.strictEqual(saved, true);

      const loaded = aliases.loadAliases();
      assert.ok(loaded.aliases['test-save'], 'Saved alias should be loadable');
      assert.strictEqual(loaded.aliases['test-save'].sessionPath, '/saved/path');
      assert.strictEqual(loaded.aliases['test-save'].title, 'Saved Alias');
    })) passed++; else failed++;

    if (test('saveAliases updates metadata totalCount', () => {
      const data = {
        version: '1.0',
        aliases: {
          'a1': { sessionPath: '/p1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), title: null },
          'a2': { sessionPath: '/p2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), title: null },
          'a3': { sessionPath: '/p3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), title: null }
        },
        metadata: {}
      };
      aliases.saveAliases(data);
      const loaded = aliases.loadAliases();
      assert.strictEqual(loaded.metadata.totalCount, 3, 'totalCount should reflect alias count');
    })) passed++; else failed++;

    // === listAliases tests ===
    console.log('\nlistAliases:');

    clearAliasesFile();

    if (test('returns empty array when no aliases exist', () => {
      const list = aliases.listAliases();
      assert.ok(Array.isArray(list), 'Should return an array');
      assert.strictEqual(list.length, 0);
    })) passed++; else failed++;

    // Set up aliases for list tests
    if (test('lists all aliases', () => {
      aliases.setAlias('alpha', '/path/alpha', 'Alpha Project');
      aliases.setAlias('beta', '/path/beta', 'Beta Service');
      aliases.setAlias('gamma', '/path/gamma', 'Gamma Tool');

      const list = aliases.listAliases();
      assert.strictEqual(list.length, 3);

      // Verify each alias has expected fields
      const names = list.map(a => a.name);
      assert.ok(names.includes('alpha'), 'Should include alpha');
      assert.ok(names.includes('beta'), 'Should include beta');
      assert.ok(names.includes('gamma'), 'Should include gamma');

      // Verify field structure
      const alpha = list.find(a => a.name === 'alpha');
      assert.strictEqual(alpha.sessionPath, '/path/alpha');
      assert.strictEqual(alpha.title, 'Alpha Project');
      assert.ok(alpha.createdAt, 'Should have createdAt');
      assert.ok(alpha.updatedAt, 'Should have updatedAt');
    })) passed++; else failed++;

    if (test('filters aliases by search (name match)', () => {
      const list = aliases.listAliases({ search: 'alp' });
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].name, 'alpha');
    })) passed++; else failed++;

    if (test('filters aliases by search (title match)', () => {
      const list = aliases.listAliases({ search: 'Service' });
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].name, 'beta');
    })) passed++; else failed++;

    if (test('search is case-insensitive', () => {
      const list = aliases.listAliases({ search: 'GAMMA' });
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].name, 'gamma');
    })) passed++; else failed++;

    if (test('search returns empty when no match', () => {
      const list = aliases.listAliases({ search: 'zzz-nonexistent' });
      assert.strictEqual(list.length, 0);
    })) passed++; else failed++;

    if (test('limits number of results', () => {
      const list = aliases.listAliases({ limit: 2 });
      assert.strictEqual(list.length, 2);
    })) passed++; else failed++;

    if (test('limit of 1 returns only one result', () => {
      const list = aliases.listAliases({ limit: 1 });
      assert.strictEqual(list.length, 1);
    })) passed++; else failed++;

    if (test('limit larger than total returns all results', () => {
      const list = aliases.listAliases({ limit: 100 });
      assert.strictEqual(list.length, 3);
    })) passed++; else failed++;

    if (test('search and limit work together', () => {
      // Add more aliases that match the search
      aliases.setAlias('alpha-2', '/path/alpha2', 'Alpha Two');
      aliases.setAlias('alpha-3', '/path/alpha3', 'Alpha Three');

      const list = aliases.listAliases({ search: 'alpha', limit: 2 });
      assert.strictEqual(list.length, 2);
      list.forEach(a => {
        assert.ok(a.name.includes('alpha') || (a.title && a.title.toLowerCase().includes('alpha')),
          'Each result should match search');
      });
    })) passed++; else failed++;

    if (test('results are sorted by updatedAt (newest first)', () => {
      const list = aliases.listAliases();
      for (let i = 1; i < list.length; i++) {
        const prevDate = new Date(list[i - 1].updatedAt || list[i - 1].createdAt);
        const currDate = new Date(list[i].updatedAt || list[i].createdAt);
        assert.ok(prevDate >= currDate,
          `Result ${i - 1} (${prevDate.toISOString()}) should be >= result ${i} (${currDate.toISOString()})`);
      }
    })) passed++; else failed++;

    // === deleteAlias tests ===
    console.log('\ndeleteAlias:');

    clearAliasesFile();

    if (test('deletes an existing alias', () => {
      aliases.setAlias('to-delete', '/path/to/delete', 'Delete Me');
      const result = aliases.deleteAlias('to-delete');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.alias, 'to-delete');
      assert.strictEqual(result.deletedSessionPath, '/path/to/delete');

      // Verify it is actually gone
      const resolved = aliases.resolveAlias('to-delete');
      assert.strictEqual(resolved, null, 'Alias should no longer resolve');
    })) passed++; else failed++;

    if (test('fails to delete non-existent alias', () => {
      const result = aliases.deleteAlias('never-existed');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not found'));
    })) passed++; else failed++;

    if (test('deleting one alias does not affect others', () => {
      aliases.setAlias('keep-me', '/path/keep', 'Keep');
      aliases.setAlias('remove-me', '/path/remove', 'Remove');

      aliases.deleteAlias('remove-me');

      const kept = aliases.resolveAlias('keep-me');
      assert.ok(kept, 'Other alias should still exist');
      assert.strictEqual(kept.sessionPath, '/path/keep');
    })) passed++; else failed++;

    // === renameAlias tests ===
    console.log('\nrenameAlias:');

    clearAliasesFile();

    if (test('renames an existing alias', () => {
      aliases.setAlias('old-name', '/path/to/session', 'Test Rename');

      const result = aliases.renameAlias('old-name', 'new-name');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.oldAlias, 'old-name');
      assert.strictEqual(result.newAlias, 'new-name');
      assert.strictEqual(result.sessionPath, '/path/to/session');

      // Old alias should not resolve
      const old = aliases.resolveAlias('old-name');
      assert.strictEqual(old, null, 'Old alias should not resolve');

      // New alias should resolve
      const renamed = aliases.resolveAlias('new-name');
      assert.ok(renamed, 'New alias should resolve');
      assert.strictEqual(renamed.sessionPath, '/path/to/session');
      assert.strictEqual(renamed.title, 'Test Rename');
    })) passed++; else failed++;

    if (test('fails to rename non-existent alias', () => {
      const result = aliases.renameAlias('nonexistent', 'something');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not found'));
    })) passed++; else failed++;

    if (test('fails to rename if target alias already exists', () => {
      aliases.setAlias('source', '/path/source');
      aliases.setAlias('target', '/path/target');

      const result = aliases.renameAlias('source', 'target');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('already exists'));

      // Source should still exist
      const source = aliases.resolveAlias('source');
      assert.ok(source, 'Source alias should still exist after failed rename');
    })) passed++; else failed++;

    if (test('fails to rename with invalid new name', () => {
      aliases.setAlias('valid-source', '/path/source');

      const result = aliases.renameAlias('valid-source', 'invalid name!');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('letters, numbers, dashes, and underscores'));
    })) passed++; else failed++;

    if (test('rename preserves session data (createdAt, title)', () => {
      clearAliasesFile();
      aliases.setAlias('original', '/path/original', 'Original Title');

      const before = aliases.resolveAlias('original');
      const originalCreatedAt = before.createdAt;

      aliases.renameAlias('original', 'renamed');

      const after = aliases.resolveAlias('renamed');
      assert.strictEqual(after.sessionPath, '/path/original');
      assert.strictEqual(after.title, 'Original Title');
      assert.strictEqual(after.createdAt, originalCreatedAt, 'createdAt should be preserved');
    })) passed++; else failed++;

    // === updateAliasTitle tests ===
    console.log('\nupdateAliasTitle:');

    clearAliasesFile();

    if (test('updates title of existing alias', () => {
      aliases.setAlias('titled-alias', '/path/to/session', 'Old Title');

      const result = aliases.updateAliasTitle('titled-alias', 'New Title');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.alias, 'titled-alias');
      assert.strictEqual(result.title, 'New Title');

      // Verify the title was actually updated
      const resolved = aliases.resolveAlias('titled-alias');
      assert.strictEqual(resolved.title, 'New Title');
    })) passed++; else failed++;

    if (test('fails to update title for non-existent alias', () => {
      const result = aliases.updateAliasTitle('no-such-alias', 'Some Title');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not found'));
    })) passed++; else failed++;

    if (test('can set title to null', () => {
      aliases.setAlias('nullable-title', '/path/to/session', 'Has Title');

      const result = aliases.updateAliasTitle('nullable-title', null);
      assert.strictEqual(result.success, true);

      const resolved = aliases.resolveAlias('nullable-title');
      assert.strictEqual(resolved.title, null);
    })) passed++; else failed++;

    // === getAliasesForSession tests ===
    console.log('\ngetAliasesForSession:');

    clearAliasesFile();

    if (test('finds all aliases pointing to same session', () => {
      const sessionPath = '/shared/session/path';
      aliases.setAlias('alias-one', sessionPath, 'First Alias');
      aliases.setAlias('alias-two', sessionPath, 'Second Alias');
      aliases.setAlias('different', '/other/path', 'Different');

      const found = aliases.getAliasesForSession(sessionPath);
      assert.strictEqual(found.length, 2);

      const names = found.map(a => a.name);
      assert.ok(names.includes('alias-one'), 'Should include alias-one');
      assert.ok(names.includes('alias-two'), 'Should include alias-two');
    })) passed++; else failed++;

    if (test('returns empty array when no aliases match session', () => {
      const found = aliases.getAliasesForSession('/nonexistent/session/path');
      assert.ok(Array.isArray(found), 'Should return an array');
      assert.strictEqual(found.length, 0);
    })) passed++; else failed++;

    if (test('returned alias objects have expected fields', () => {
      clearAliasesFile();
      aliases.setAlias('field-check', '/field/session', 'Field Check');

      const found = aliases.getAliasesForSession('/field/session');
      assert.strictEqual(found.length, 1);
      assert.strictEqual(found[0].name, 'field-check');
      assert.ok(found[0].createdAt, 'Should have createdAt');
      assert.strictEqual(found[0].title, 'Field Check');
    })) passed++; else failed++;

    // === cleanupAliases tests ===
    console.log('\ncleanupAliases:');

    clearAliasesFile();

    if (test('removes aliases for non-existent sessions', () => {
      aliases.setAlias('alive', '/alive/session');
      aliases.setAlias('dead-1', '/dead/session/1');
      aliases.setAlias('dead-2', '/dead/session/2');

      // Mock sessionExists: only /alive/session exists
      const sessionExists = (p) => p === '/alive/session';

      const result = aliases.cleanupAliases(sessionExists);
      assert.strictEqual(result.removed, 2);
      assert.strictEqual(result.totalChecked, 3);
      assert.strictEqual(result.removedAliases.length, 2);

      // Verify alive alias still exists
      const alive = aliases.resolveAlias('alive');
      assert.ok(alive, 'Alive alias should still exist');

      // Verify dead aliases are gone
      assert.strictEqual(aliases.resolveAlias('dead-1'), null, 'dead-1 should be removed');
      assert.strictEqual(aliases.resolveAlias('dead-2'), null, 'dead-2 should be removed');
    })) passed++; else failed++;

    if (test('does not remove any aliases when all sessions exist', () => {
      clearAliasesFile();
      aliases.setAlias('session-a', '/session/a');
      aliases.setAlias('session-b', '/session/b');

      const sessionExists = () => true;

      const result = aliases.cleanupAliases(sessionExists);
      assert.strictEqual(result.removed, 0);
      assert.strictEqual(result.totalChecked, 2);
    })) passed++; else failed++;

    if (test('removes all aliases when no sessions exist', () => {
      clearAliasesFile();
      aliases.setAlias('gone-1', '/gone/1');
      aliases.setAlias('gone-2', '/gone/2');

      const sessionExists = () => false;

      const result = aliases.cleanupAliases(sessionExists);
      assert.strictEqual(result.removed, 2);
      assert.strictEqual(result.totalChecked, 2);

      const list = aliases.listAliases();
      assert.strictEqual(list.length, 0, 'No aliases should remain');
    })) passed++; else failed++;

    if (test('cleanup with no aliases does nothing', () => {
      clearAliasesFile();

      const sessionExists = () => true;
      const result = aliases.cleanupAliases(sessionExists);
      assert.strictEqual(result.removed, 0);
      assert.strictEqual(result.totalChecked, 0);
    })) passed++; else failed++;

    if (test('cleanup removedAliases contains correct data', () => {
      clearAliasesFile();
      aliases.setAlias('cleanup-info', '/cleanup/path');

      const sessionExists = () => false;
      const result = aliases.cleanupAliases(sessionExists);

      assert.strictEqual(result.removedAliases.length, 1);
      assert.strictEqual(result.removedAliases[0].name, 'cleanup-info');
      assert.strictEqual(result.removedAliases[0].sessionPath, '/cleanup/path');
    })) passed++; else failed++;

    // === resolveSessionAlias tests ===
    console.log('\nresolveSessionAlias:');

    clearAliasesFile();

    if (test('resolves a known alias to its session path', () => {
      aliases.setAlias('resolve-me', '/resolved/session/path');

      const result = aliases.resolveSessionAlias('resolve-me');
      assert.strictEqual(result, '/resolved/session/path');
    })) passed++; else failed++;

    if (test('falls back to input when alias is not found', () => {
      const result = aliases.resolveSessionAlias('unknown-alias-or-id');
      assert.strictEqual(result, 'unknown-alias-or-id', 'Should return input as-is');
    })) passed++; else failed++;

    if (test('falls back to input for invalid characters (treated as session path)', () => {
      const result = aliases.resolveSessionAlias('some/session/path');
      assert.strictEqual(result, 'some/session/path');
    })) passed++; else failed++;

    if (test('resolves correct path when multiple aliases exist', () => {
      clearAliasesFile();
      aliases.setAlias('first', '/path/first');
      aliases.setAlias('second', '/path/second');

      assert.strictEqual(aliases.resolveSessionAlias('first'), '/path/first');
      assert.strictEqual(aliases.resolveSessionAlias('second'), '/path/second');
    })) passed++; else failed++;

    // === getAliasesPath tests ===
    console.log('\ngetAliasesPath:');

    if (test('returns a string path ending in session-aliases.json', () => {
      const p = aliases.getAliasesPath();
      assert.strictEqual(typeof p, 'string');
      assert.ok(p.endsWith('session-aliases.json'), `Should end with session-aliases.json, got ${p}`);
    })) passed++; else failed++;

    if (test('path is under the Claude directory', () => {
      const p = aliases.getAliasesPath();
      const claudeDir = getClaudeDir();
      assert.ok(p.startsWith(claudeDir), 'Aliases path should be under Claude dir');
    })) passed++; else failed++;

    // === Edge cases ===
    console.log('\nEdge Cases:');

    clearAliasesFile();

    if (test('multiple operations in sequence work correctly', () => {
      // Create
      aliases.setAlias('seq-test', '/path/seq', 'Sequential');
      assert.ok(aliases.resolveAlias('seq-test'));

      // Update title
      aliases.updateAliasTitle('seq-test', 'Updated Sequential');
      assert.strictEqual(aliases.resolveAlias('seq-test').title, 'Updated Sequential');

      // Rename
      aliases.renameAlias('seq-test', 'seq-renamed');
      assert.strictEqual(aliases.resolveAlias('seq-test'), null);
      assert.ok(aliases.resolveAlias('seq-renamed'));

      // Delete
      aliases.deleteAlias('seq-renamed');
      assert.strictEqual(aliases.resolveAlias('seq-renamed'), null);
    })) passed++; else failed++;

    if (test('alias names are case-sensitive for storage', () => {
      clearAliasesFile();
      aliases.setAlias('MyAlias', '/path/upper');
      aliases.setAlias('myalias', '/path/lower');

      const list = aliases.listAliases();
      assert.strictEqual(list.length, 2, 'Should store both case variants');

      assert.strictEqual(aliases.resolveAlias('MyAlias').sessionPath, '/path/upper');
      assert.strictEqual(aliases.resolveAlias('myalias').sessionPath, '/path/lower');
    })) passed++; else failed++;

    if (test('alias with numeric name works', () => {
      clearAliasesFile();
      const result = aliases.setAlias('123', '/path/numeric');
      assert.strictEqual(result.success, true);
      assert.strictEqual(aliases.resolveAlias('123').sessionPath, '/path/numeric');
    })) passed++; else failed++;

    if (test('alias with single character name works', () => {
      const result = aliases.setAlias('x', '/path/single');
      assert.strictEqual(result.success, true);
      assert.strictEqual(aliases.resolveAlias('x').sessionPath, '/path/single');
    })) passed++; else failed++;

    if (test('loadAliases adds version when missing', () => {
      ensureDir(path.dirname(aliasesPath));
      fs.writeFileSync(aliasesPath, JSON.stringify({
        aliases: { 'existing': { sessionPath: '/path', createdAt: new Date().toISOString() } }
      }), 'utf8');

      const data = aliases.loadAliases();
      assert.strictEqual(data.version, '1.0', 'Should add missing version');
    })) passed++; else failed++;

    if (test('loadAliases adds metadata when missing', () => {
      ensureDir(path.dirname(aliasesPath));
      fs.writeFileSync(aliasesPath, JSON.stringify({
        version: '1.0',
        aliases: { 'existing': { sessionPath: '/path', createdAt: new Date().toISOString() } }
      }), 'utf8');

      const data = aliases.loadAliases();
      assert.ok(data.metadata, 'Should add missing metadata');
      assert.strictEqual(data.metadata.totalCount, 1);
    })) passed++; else failed++;

  } finally {
    // Always restore the original aliases file
    restoreAliasesFile();
  }

  // Summary
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
