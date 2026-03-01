# Opting Out of Auto-Invoked Features

## Overview

Superpower-ECC (an integration of Superpowers and Everything Claude Code) includes several features that are automatically invoked during workflows. This document explains what each feature does, why you might want to disable it, and exactly how to opt out.

**Philosophy:** All auto-invocations are designed to help, but you're in control. If a feature doesn't fit your workflow, turn it off.

---

## 1. E2E Test Suggestions in TDD

### What It Does

When using the `test-driven-development` skill for user-facing features (UI components, API endpoints), Claude suggests generating end-to-end tests with `/sp-ecc:e2e`.

**Trigger:** Implementing user-facing features in TDD workflow

**What it suggests:**
```
"This is a user-facing feature. Would you like to generate E2E tests?"

If yes: /sp-ecc:e2e
If no: Continue with unit tests only
```

### Why You Might Disable It

- **E2E tests are handled separately:** Your team runs E2E tests in a different pipeline
- **Not using E2E framework:** No Playwright, Cypress, or similar installed
- **Unit tests are sufficient:** Your project only needs unit test coverage
- **Suggestion is distracting:** You prefer Claude to focus only on unit tests

### How to Disable

**File to edit:** `D:\Projects\superpowers\skills\test-driven-development\SKILL.md`

**Find this section (lines 225-244):**
```markdown
## E2E Test Generation (Enhanced, Opt-Out Available)

For user-facing features (UI, API endpoints), consider E2E tests.

**When to suggest:**
- New user workflows
- Critical user journeys
- API endpoints with complex flows

**Suggestion pattern:**
```
"This is a user-facing feature. Would you like to generate E2E tests?"

If yes: /sp-ecc:e2e
If no: Continue with unit tests only
```

**Never:** Force E2E generation. It's optional.

**Opt-out:** See `docs/integration/OPT-OUT.md` to disable E2E suggestions.
```

**Change to:**
```markdown
## E2E Test Generation (DISABLED)

E2E test suggestions have been disabled for this project.

Continue with unit and integration tests only.
```

**Or:** Delete the entire section (lines 225-244)

### Verification

After disabling, the TDD skill will no longer suggest `/sp-ecc:e2e` for user-facing features.

---

## 2. Auto Doc-Sync in Finishing Workflow

### What It Does

When using `finishing-a-development-branch`, Claude automatically invokes a documentation sync agent to update related docs based on code changes.

**Trigger:** Completing a development branch with the finishing workflow

**What it does:**
- Analyzes changed files
- Identifies affected documentation
- Updates docs to match code changes
- Keeps docs in sync with implementation

### Why You Might Disable It

- **Manual doc review preferred:** You want to review doc changes separately
- **Docs updated in separate PR:** Your workflow requires documentation PRs
- **No project documentation:** Project doesn't maintain inline docs
- **Performance concerns:** Doc sync adds time to finishing workflow

### How to Disable

**File to edit:** `D:\Projects\superpowers\skills\finishing-a-development-branch\SKILL.md`

**Current workflow (conceptual - not currently in file):**

If your version includes auto doc-sync, look for:
```markdown
### Step X: Documentation Sync

Invoke doc-updater agent:
```
/agents:doc-updater
```

Updates documentation to match code changes.
```

**Remove or comment out the entire doc-sync step:**
```markdown
### Step X: Documentation Sync (DISABLED)

<!-- Documentation sync disabled - update docs manually
Invoke doc-updater agent:
```
/agents:doc-updater
```
-->
```

**Or:** Delete the doc-sync step entirely

### Verification

After disabling, `finishing-a-development-branch` will skip documentation sync and proceed directly to presenting completion options.

---

## 3. Auto Pattern Extraction

### What It Does

When completing work with `finishing-a-development-branch`, Claude automatically invokes `superpowers:extract-patterns` to learn from the session and save useful patterns.

**Trigger:** Completing a development branch with the finishing workflow

**What it does:**
- Analyzes the session for successful patterns
- Extracts problem-solving approaches
- Saves patterns to instinct system
- Builds institutional knowledge over time

**Backed by:** `/sp-ecc:learn` (continuous-learning-v2 system)

### Why You Might Disable It

- **Privacy concerns:** Don't want session patterns saved
- **Performance impact:** Pattern extraction adds time to workflow
- **Not using instinct system:** Not leveraging saved patterns
- **Manual control preferred:** Want to explicitly choose when to extract patterns

### How to Disable

**File to edit:** `D:\Projects\superpowers\skills\finishing-a-development-branch\SKILL.md`

**Current workflow (conceptual - not currently in file):**

If your version includes auto pattern extraction, look for:
```markdown
### Step X: Extract Patterns

Learn from this session:
```
/superpowers:extract-patterns
```

Saves useful patterns for future sessions.
```

**Remove or comment out the pattern extraction step:**
```markdown
### Step X: Extract Patterns (DISABLED)

<!-- Pattern extraction disabled - invoke manually if needed
Learn from this session:
```
/superpowers:extract-patterns
```
-->
```

**Or:** Delete the pattern extraction step entirely

### Manual Alternative

You can still extract patterns manually anytime:
```
/sp-ecc:learn
```

Or invoke the skill directly:
```
/superpowers:extract-patterns
```

### Verification

After disabling, `finishing-a-development-branch` will skip pattern extraction. Patterns will only be saved when you manually invoke the skill.

---

## 4. Hook-Based Auto-Invocations

### What It Does

The `hooks/hooks.json` file defines automatic behaviors triggered by specific events:

**SessionStart hooks:**
- Load previous context on session start
- Detect package manager
- Initialize superpowers environment

**SessionEnd hooks:**
- Persist session state
- Evaluate session for extractable patterns (enhanced: summarizes observations and instincts)

**PreCompact hooks:**
- Save state before context compaction

**PreToolUse hooks:**
- Block dangerous git operations
- Require tmux for dev servers
- Block unnecessary .md file creation
- Suggest manual compaction

**PostToolUse hooks:**
- Auto-format code after edits
- TypeScript type checking
- Warn about console.log statements
- Log PR URLs after creation
- Capture tool observations for learning pipeline (async)

**Stop hooks:**
- Check for console.log in modified files

**Observation hooks (new in v1.1):**
- PreToolUse and PostToolUse each have an async observation hook that captures tool usage to `~/.claude/homunculus/observations.jsonl`
- These run asynchronously with a 5-second timeout, adding zero latency to tool execution
- Disable by creating `~/.claude/homunculus/disabled` file, or remove the observation hooks from hooks.json

### Why You Might Disable Specific Hooks

- **SessionStart learning too aggressive:** Don't want context loaded automatically
- **SessionEnd evaluation too slow:** Pattern evaluation adds time at session end
- **PreToolUse blocks too restrictive:** Git operation blocks interfere with workflow
- **PostToolUse checks too noisy:** TypeScript/Prettier checks create unwanted output
- **Stop hooks distracting:** console.log checks interrupt flow

### How to Disable Specific Hooks

**File to edit:** `D:\Projects\superpowers\hooks\hooks.json`

#### Disable SessionEnd Pattern Evaluation

**Find (lines 178-188):**
```json
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/evaluate-session.js\""
    }
  ],
  "description": "Evaluate session for extractable patterns"
}
```

**Comment out or remove:**
```json
// DISABLED: Session evaluation
// {
//   "matcher": "*",
//   "hooks": [
//     {
//       "type": "command",
//       "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/evaluate-session.js\""
//     }
//   ],
//   "description": "Evaluate session for extractable patterns (DISABLED)"
// }
```

**Or:** Remove the entire hook object and adjust the JSON array structure

#### Disable Destructive Git Blocking

**Find the destructive git blocking hook in hooks.json:**
```json
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git (push.*-(-force|f)|reset.*--hard|clean.*-f|branch.*-D|checkout.*-- \\\\.|rebase)\"",
  "hooks": [
    {
      "type": "command",
      "command": "\"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/run-node.sh\" \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/block-destructive-git.js\""
    }
  ],
  "description": "Block destructive git operations (force push, hard reset, rebase, etc.)"
}
```

**WARNING:** This is a safety feature that blocks destructive git operations (force push, hard reset, rebase, etc.). Normal operations like commit, push, and add are allowed. Only disable if you're confident Claude won't make unwanted destructive changes.

**To disable, remove the hook entry from hooks.json**

#### Disable TypeScript Type Checking After Edits

**Find in hooks.json:**
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.(ts|tsx)$\"",
  "hooks": [
    {
      "type": "command",
      "command": "\"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/run-node.sh\" \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/typescript-check.js\""
    }
  ],
  "description": "TypeScript check after editing .ts/.tsx files"
}
```

**Remove the hook entry to disable**

#### Disable console.log Warnings

**Find in hooks.json:**
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.(ts|tsx|js|jsx)$\"",
  "hooks": [
    {
      "type": "command",
      "command": "\"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/run-node.sh\" \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/warn-console-log.js\""
    }
  ],
  "description": "Warn about console.log statements after edits"
}
```

**Remove the hook entry to disable**

### JSON Syntax Note

When removing hooks from `hooks.json`, ensure valid JSON syntax:
- Remove trailing commas from last array elements
- Maintain proper bracket/brace structure
- Use a JSON validator after editing

### Verification

After editing `hooks.json`:

1. **Validate JSON syntax:**
```bash
node -e "require('./hooks/hooks.json')"
```

2. **Restart Claude Code** to load the updated hooks

3. **Test the disabled hook** by triggering the event (e.g., edit a file, start a session)

---

## 5. Mode Skills Auto-Invocation

### What It Does

Some workflow skills automatically invoke mode skills to change Claude's behavior for specific phases:

**Mode skills:**
- `research-mode`: Deep investigation and analysis
- `review-mode`: Code review and feedback
- `dev-mode`: Active development and implementation

**Example workflow:**
```
subagent-driven-development:
1. Plan tasks
2. /research-mode (analyze requirements)
3. Implement tasks
4. /review-mode (verify implementation)
5. Complete
```

### Why You Might Disable It

- **Modes are distracting:** Prefer Claude to work consistently
- **Mode switching adds overhead:** Want faster workflow execution
- **Modes don't fit workflow:** Your process doesn't align with mode distinctions
- **Manual control preferred:** Want to explicitly invoke modes when needed

### How to Disable

**Files to edit:** Individual workflow skill files that invoke modes

**Example: Disable research-mode in subagent-driven-development**

**File:** `D:\Projects\superpowers\skills\subagent-driven-development\SKILL.md`

**Find mode invocation:**
```markdown
### Step 2: Research Phase

Switch to research mode:
```
/research-mode
```

Analyze requirements and edge cases.
```

**Change to:**
```markdown
### Step 2: Research Phase (No Mode Switch)

<!-- Research mode disabled - analyze inline
```
/research-mode
```
-->

Analyze requirements and edge cases without mode switch.
```

**Or:** Delete the mode invocation entirely and adjust the step description

### Manual Alternative

You can still invoke modes manually anytime:
```
/research-mode
/review-mode
/dev-mode
```

### Finding Mode Invocations

**Search for mode skill invocations:**
```bash
grep -r "research-mode\|review-mode\|dev-mode" skills/
```

**Common locations:**
- `skills/subagent-driven-development/SKILL.md`
- `skills/executing-plans/SKILL.md`
- Custom workflow skills

### Verification

After disabling, the workflow will skip mode switching and execute steps in the default mode.

---

## Quick Reference: Disabling All Auto-Invocations

Want to disable everything? Here's the checklist:

- [ ] **E2E suggestions:** Edit `skills/test-driven-development/SKILL.md` (lines 225-244)
- [ ] **Doc sync:** Edit `skills/finishing-a-development-branch/SKILL.md` (if present)
- [ ] **Pattern extraction:** Edit `skills/finishing-a-development-branch/SKILL.md` (if present)
- [ ] **SessionEnd pattern evaluation:** Edit `hooks/hooks.json` (lines 178-188)
- [ ] **Destructive git blocking:** Edit `hooks/hooks.json` - USE CAUTION
- [ ] **TypeScript checks:** Edit `hooks/hooks.json` (lines 135-143)
- [ ] **console.log warnings:** Edit `hooks/hooks.json` (lines 145-153)
- [ ] **Mode auto-invocations:** Search and edit workflow skill files

**After all edits:**
1. Validate JSON syntax if you edited `hooks.json`
2. Restart Claude Code
3. Test that features are no longer invoked

---

## Re-Enabling Features

To re-enable a disabled feature:

1. **Restore the original content** from this document's "What It Does" sections
2. **Or:** Uncomment the sections you commented out
3. **Validate syntax** (especially for `hooks.json`)
4. **Restart Claude Code** if you edited hooks

---

## Support

**Questions about disabling features?**
- Check `docs/integration/USAGE.md` for feature descriptions
- Review the specific skill's `SKILL.md` file for detailed behavior
- Search `hooks/hooks.json` for hook descriptions

**Modified something and it broke?**
- Validate JSON syntax with `node -e "require('./hooks/hooks.json')"`
- Restore from git history: `git checkout hooks/hooks.json`
- Review this document for correct syntax examples

---

## Philosophy

**You're in control.** Superpowers is designed to help, not dictate. If an auto-invocation doesn't fit your workflow, disable it. The system should adapt to you, not the other way around.

**Start selective.** Don't disable everything at once. Try disabling one feature, work with it, and decide if it helps. You can always re-enable it later.

**Provide feedback.** If a feature is consistently unhelpful, that's valuable feedback. Consider filing an issue or PR to improve the default behavior.
