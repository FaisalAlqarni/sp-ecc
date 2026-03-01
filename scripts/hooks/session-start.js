#!/usr/bin/env node
/**
 * SessionStart Hook - Load previous context on new session
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs when a new Claude session starts. Checks for recent session
 * files, learned skills, instinct patterns, and notifies Claude of
 * available context to load.
 *
 * Also initializes the homunculus directory structure on first run.
 */

const path = require('path');
const fs = require('fs');
const {
  getHomeDir,
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  readFile,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');
const { listAliases } = require('../lib/session-aliases');

/**
 * Initialize the homunculus directory structure.
 * Silent if directories already exist.
 */
function initHomunculus() {
  const homeDir = getHomeDir();
  const homunculusDir = path.join(homeDir, '.claude', 'homunculus');

  const dirs = [
    homunculusDir,
    path.join(homunculusDir, 'observations.archive'),
    path.join(homunculusDir, 'instincts', 'personal'),
    path.join(homunculusDir, 'instincts', 'inherited'),
    path.join(homunculusDir, 'evolved', 'agents'),
    path.join(homunculusDir, 'evolved', 'skills'),
    path.join(homunculusDir, 'evolved', 'commands')
  ];

  for (const dir of dirs) {
    ensureDir(dir);
  }

  return homunculusDir;
}

/**
 * Summarize learned skills from ~/.claude/skills/learned/
 */
function summarizeLearnedSkills(learnedDir) {
  const skillFiles = findFiles(learnedDir, '*.md');

  if (skillFiles.length === 0) return;

  const skillNames = skillFiles.map(f => {
    const name = path.basename(f.path, '.md');
    return name;
  });

  log(`[SessionStart] ${skillFiles.length} learned skill(s): ${skillNames.join(', ')}`);

  // Output file paths so Claude can reference them if relevant
  for (const skill of skillFiles) {
    log(`[SessionStart]   ${skill.path}`);
  }
}

/**
 * Summarize instinct patterns from ~/.claude/homunculus/instincts/personal/
 */
function summarizeInstincts(homunculusDir) {
  const instinctsDir = path.join(homunculusDir, 'instincts', 'personal');

  if (!fs.existsSync(instinctsDir)) return;

  const instinctFiles = findFiles(instinctsDir, '*.yaml');

  if (instinctFiles.length === 0) return;

  // Group by domain (filename convention: domain-name.yaml)
  const domains = {};
  for (const f of instinctFiles) {
    const name = path.basename(f.path, '.yaml');
    const domain = name.split('-')[0] || 'general';
    domains[domain] = (domains[domain] || 0) + 1;
  }

  const domainSummary = Object.entries(domains)
    .map(([d, c]) => `${d}: ${c}`)
    .join(', ');

  log(`[SessionStart] ${instinctFiles.length} instinct(s) across ${Object.keys(domains).length} domain(s) (${domainSummary})`);
  log(`[SessionStart] Use /sp-ecc:instinct-status for details`);
}

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // Ensure directories exist
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // Initialize homunculus directory structure
  const homunculusDir = initHomunculus();

  // Check for recent session files (last 7 days)
  // Match both old format (YYYY-MM-DD-session.tmp) and new format (YYYY-MM-DD-shortid-session.tmp)
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
  }

  // Summarize learned skills (with file paths for Claude to reference)
  summarizeLearnedSkills(learnedDir);

  // Summarize instinct patterns
  summarizeInstincts(homunculusDir);

  // Check for available session aliases
  const aliases = listAliases({ limit: 5 });

  if (aliases.length > 0) {
    const aliasNames = aliases.map(a => a.name).join(', ');
    log(`[SessionStart] ${aliases.length} session alias(es) available: ${aliasNames}`);
    log(`[SessionStart] Use /sessions load <alias> to continue a previous session`);
  }

  // Detect and report package manager
  const pm = getPackageManager();
  log(`[SessionStart] Package manager: ${pm.name} (${pm.source})`);

  // If package manager was detected via fallback, show selection prompt
  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[SessionStart] No package manager preference found.');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // Don't block on errors
});
