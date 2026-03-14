---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for review, delivery, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Present options → Execute choice.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 0: Check Pipeline State (if applicable)

If this branch was created via `sp-ecc:subagent-driven-development`:

1. Read `docs/plans/*-pipeline-state.md` for this feature
2. Check that all required stages are marked complete
3. If any required stages are unchecked:

```
Cannot finish — pipeline stages incomplete:

- [ ] <list unchecked required stages>

Complete these stages before finishing.
```

Stop. Don't proceed to Step 1.

If no pipeline-state file exists (non-pipeline usage), skip this step.

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Summarize Work Done

Prepare a summary of what was implemented:

- **Files changed:** List all created, modified, and deleted files
- **Features added:** Bullet list of what's new
- **Tests added/updated:** Count and brief description
- **Verification status:** Test results, lint status, build status

### Step 2.5: Extract Patterns (optional, ask user)

Ask the user: "Would you like me to extract learned patterns from this session before finishing?"

- If **yes**: Invoke `sp-ecc:extract-patterns` to save useful patterns to the instinct system
- If **no**: Skip and continue to Step 3

**Do not auto-invoke.** Always ask first.

### Step 3: Present Options

Present exactly these 4 options:

```
Implementation complete. All tests passing. What would you like to do?

1. Merge locally (merge this branch into main/target branch)
2. Push and create PR (push branch to remote, open pull request)
3. Keep as-is (leave branch for later, continue working)
4. Discard this work (delete branch and revert)

Which option?
```

**Don't add explanation** - keep options concise.

### Step 4: Execute Choice

#### Option 1: Merge Locally

```bash
# Switch to target branch
git checkout main

# Merge the feature branch
git merge <feature-branch> --no-ff -m "Merge: <summary>"

# Delete the feature branch
git branch -d <feature-branch>
```

If in a worktree, clean up:
```bash
# Remove the worktree
git worktree remove <worktree-path>
```

If pipeline-state file exists, delete it (pipeline complete).

Report: what was merged, target branch, and cleanup status.

#### Option 2: Push and Create PR

```bash
# Push branch to remote
git push -u origin <feature-branch>

# Create PR using gh CLI
gh pr create --title "<summary>" --body "<description>"
```

If in a worktree, clean up:
```bash
# Remove the worktree (branch stays on remote)
git worktree remove <worktree-path>
```

If pipeline-state file exists, delete it (pipeline complete).

Report: PR URL, branch name, and cleanup status.

#### Option 3: Keep As-Is

Report: "Understood. Branch `<branch-name>` preserved. Continuing development. Let me know what to work on next."

**Don't change anything.** Stay in current session context.

#### Option 4: Discard

**Confirm first:**
```
This will delete branch <branch-name> and all uncommitted changes:

Files modified:
- <list of files>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
# Switch to main
git checkout main

# Delete the branch
git branch -D <feature-branch>

# If in a worktree, remove it
git worktree remove <worktree-path> --force
```

If pipeline-state file exists, delete it (pipeline discarded).

Report what was cleaned up.

## Quick Reference

| Option | Action | Git Operations | Worktree Cleanup |
|--------|--------|---------------|-----------------|
| 1. Merge locally | Merge into main | merge, branch -d | worktree remove |
| 2. Push & PR | Push, create PR | push -u, gh pr create | worktree remove |
| 3. Keep as-is | Continue working | None | None |
| 4. Discard | Delete branch | checkout main, branch -D | worktree remove --force |

## Common Mistakes

**Skipping test verification**
- **Problem:** Mark work complete when tests are broken
- **Fix:** Always verify tests before offering options

**Open-ended questions**
- **Problem:** "What should I do next?" → ambiguous
- **Fix:** Present exactly 4 structured options

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## Red Flags

**Never:**
- Proceed with failing tests
- Delete work without confirmation
- Assume which branch or remote to target
- Force push to main/master

**Always:**
- Verify tests before offering options
- Present exactly 4 options
- Get typed confirmation for Option 4
- Clean up worktrees after merge/discard

## Integration

**Called by:**
- **subagent-driven-development** (Step 6: Finish) - After all tasks and reviews complete
- **executing-plans** (Step 5) - After all batches complete

**Works with:**
- **using-git-worktrees** - Handles worktree cleanup for all options
- **requesting-code-review** - Can be invoked before choosing an option
