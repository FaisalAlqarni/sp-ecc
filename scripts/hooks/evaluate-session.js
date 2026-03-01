#!/usr/bin/env node
/**
 * Continuous Learning - Session Evaluator
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs on SessionEnd to evaluate sessions for extractable patterns.
 * Enhanced to check for observations and summarize instinct state.
 *
 * The hook signals that patterns are available — actual extraction
 * happens via /sp-ecc:learn or the extract-patterns skill.
 */

const path = require('path');
const fs = require('fs');
const {
  getHomeDir,
  getLearnedSkillsDir,
  ensureDir,
  readFile,
  countInFile,
  findFiles,
  log
} = require('../lib/utils');

async function main() {
  // Get script directory to find config
  const scriptDir = __dirname;
  const configFile = path.join(scriptDir, '..', '..', 'skills', 'continuous-learning-v2', 'config.json');

  // Default configuration
  let minSessionLength = 10;
  let learnedSkillsPath = getLearnedSkillsDir();

  // Load config if exists
  const configContent = readFile(configFile);
  if (configContent) {
    try {
      const config = JSON.parse(configContent);
      minSessionLength = config.min_session_length || 10;

      if (config.learned_skills_path) {
        // Handle ~ in path
        learnedSkillsPath = config.learned_skills_path.replace(/^~/, require('os').homedir());
      }
    } catch {
      // Invalid config, use defaults
    }
  }

  // Ensure learned skills directory exists
  ensureDir(learnedSkillsPath);

  // Get transcript path from environment (set by Claude Code)
  const transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  // Count user messages in session
  const messageCount = countInFile(transcriptPath, /"type":"user"/g);

  // Skip short sessions
  if (messageCount < minSessionLength) {
    log(`[ContinuousLearning] Session too short (${messageCount} messages), skipping`);
    process.exit(0);
  }

  // Signal to Claude that session should be evaluated for extractable patterns
  log(`[ContinuousLearning] Session has ${messageCount} messages - evaluate for extractable patterns`);
  log(`[ContinuousLearning] Save learned skills to: ${learnedSkillsPath}`);

  // Check for observations from this session
  const homeDir = getHomeDir();
  const observationsFile = path.join(homeDir, '.claude', 'homunculus', 'observations.jsonl');

  if (fs.existsSync(observationsFile)) {
    try {
      const content = readFile(observationsFile);
      if (content) {
        const lines = content.trim().split('\n').filter(Boolean);
        log(`[ContinuousLearning] ${lines.length} observation(s) captured`);
      }
    } catch {
      // Ignore read errors
    }
  }

  // Summarize instinct state
  const instinctsDir = path.join(homeDir, '.claude', 'homunculus', 'instincts', 'personal');
  if (fs.existsSync(instinctsDir)) {
    const instinctFiles = findFiles(instinctsDir, '*.yaml');
    if (instinctFiles.length > 0) {
      log(`[ContinuousLearning] ${instinctFiles.length} instinct(s) available`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[ContinuousLearning] Error:', err.message);
  process.exit(0);
});
