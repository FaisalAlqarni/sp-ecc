# Migrating to Superpower-ECC

## Overview

Superpower-ECC v1.0 is an integration project that combines:
- [Superpowers v4.1.1](https://github.com/obra/superpowers) by Jesse Vincent
- [Everything Claude Code v1.4.1](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa
- Integration work by Faisal Alqarni

Repository: https://github.com/FaisalAlqarni/sp-ecc

This guide helps you migrate from either original project to this integrated version.

**TL;DR**: All v4.x workflows still work. New features are additive. Read "What Changed" section if upgrading.

## Quick Migration Checklist

- [ ] Read "Breaking Changes" section (only 2 minor changes)
- [ ] Install Node.js 24.13.0+ for npm dependencies (optional, for linting)
- [ ] Review new git policy (destructive git operations are blocked)
- [ ] Explore new Layer 3 tools (/sp-ecc: commands and agents)
- [ ] Try enhanced TDD workflow with coverage tracking
- [ ] Check opt-out documentation if auto-features are too proactive
- [ ] Update any custom skills/commands that interact with git
- [ ] Read language-specific docs (RUBY-RAILS.md, DART-FLUTTER.md) if relevant

## Version Comparison

| Feature | Superpowers 4.1.1 | Superpower-ECC 1.0.0 |
|---------|--------|--------|
| Systematic workflows | ✓ | ✓ (unchanged) |
| Git worktrees workflow | ✓ | ✓ (unchanged) |
| TDD workflow | ✓ | ✓ (enhanced) |
| Debugging workflow | ✓ | ✓ (unchanged) |
| Quick commands | ✗ | ✓ (26 new /sp-ecc: commands) |
| Specialist agents | ✗ | ✓ (13 new agents) |
| Mode skills | ✗ | ✓ (3 new modes) |
| Pattern extraction | ✗ | ✓ (auto-invoked) |
| Destructive git blocking | ✗ | ✓ (enforced) |
| Ruby/Rails support | ✗ | ✓ (4 skills, Rails Engines focus) |
| Dart/Flutter support | ✗ | ✓ (4 skills, state management focus) |
| Python/Django support | ✓ | ✓ (unchanged) |
| Go support | ✓ | ✓ (unchanged) |
| Java/Spring Boot support | ✓ | ✓ (unchanged) |
| Hooks system | ✗ | ✓ (6 hook types) |
| Documentation | Basic | Comprehensive |

## Breaking Changes

### 1. Destructive Git Operations Blocked

**What Changed**: Only destructive git operations are blocked. Normal git operations (commit, push, merge, etc.) are now allowed.

**Why**: Safety without friction. Prevents irreversible damage while enabling productive workflows.

**Impact**:
- AI can commit, push, merge, create branches normally
- Only truly destructive operations are blocked
- Co-Authored-By lines are automatically stripped from commits

**Allowed Operations**:
```bash
git commit          # Allowed
git push            # Allowed
git add             # Allowed
git checkout        # Allowed
git branch          # Allowed
git merge           # Allowed
git pull / fetch    # Allowed
git status / diff   # Allowed
```

**Blocked Operations** (destructive only):
```bash
git push --force    # Blocked (rewrites remote history)
git reset --hard    # Blocked (discards uncommitted changes)
git clean -f        # Blocked (permanently deletes untracked files)
git branch -D       # Blocked (force deletes branch)
git rebase          # Blocked (rewrites commit history)
git checkout -- .   # Blocked (discards all working changes)
```

**Hook Enforcement**: `scripts/hooks/block-destructive-git.js` enforces this policy.

**Opt-Out**: You can disable the destructive git blocker hook. See OPT-OUT.md.

### 2. Auto-Invoked Features

**What Changed**: Some features now auto-invoke:
- E2E test suggestions during TDD
- Pattern extraction after finishing development
- Mode skills during workflows

**Why**: Ensure useful features aren't forgotten.

**Impact**:
- TDD workflow now suggests E2E tests after unit tests pass
- finishing-a-development-branch extracts patterns automatically
- Workflows invoke appropriate mode skills (research-mode, dev-mode, etc.)

**Migration**:
- If too proactive: See docs/integration/OPT-OUT.md
- All auto-features can be disabled
- Defaults work well for most users

## What's New in sp-ecc v1.0

### Layer 3: Quick Tools (New)

**Commands** (`/sp-ecc:*`):
```bash
# Quick fixes
/sp-ecc:build-fix          # Fix build errors quickly
/sp-ecc:refactor-clean     # Clean up code

# Testing
/sp-ecc:test-coverage      # Check test coverage
/sp-ecc:e2e                # Generate E2E tests

# Code quality
/sp-ecc:update-docs        # Sync code and docs
/sp-ecc:verify             # Pre-commit verification

# Development
/sp-ecc:go-test            # Go-specific testing
/sp-ecc:python-review      # Python code review

# Workflows
/sp-ecc:multi-plan         # Multi-agent planning
/sp-ecc:multi-execute      # Multi-agent execution
```

**When to Use**:
- Quick, focused tasks
- No workflow overhead needed
- You know exactly what you need
- Single operation, not multi-step

**Agents** (`agent-*` or `@agent-name`):
```
build-error-resolver        # Fix build errors
test-failure-analyzer       # Investigate test failures
security-auditor            # Security review
performance-optimizer       # Performance analysis
code-reviewer               # Code review
refactoring-assistant       # Refactoring help
documentation-writer        # Documentation
api-designer                # API design
database-optimizer          # Database queries
deployment-helper           # Deployment issues
```

**When to Use**:
- Need specialist expertise
- Focused, scoped task
- Want fast resolution
- Don't need full workflow

### Layer 2: Enhancements (New)

**Mode Skills** (invoked BY workflows):
```
superpowers-research-mode   # Deep codebase exploration
superpowers-review-mode     # Critical code review
superpowers-dev-mode        # Implementation focus
```

**Not User-Invocable**: These are invoked automatically by Layer 1 workflows when appropriate.

**Pattern Extraction**:
```
superpowers:extract-patterns
```

**Auto-Invoked By**: `superpowers:finishing-a-development-branch`

**What It Does**: Extracts learned patterns to instinct memory for future use.

**Opt-Out**: See OPT-OUT.md if you don't want pattern extraction.

### Layer 1: Enhanced (Updated)

**TDD Workflow Enhanced**:
```
New in sp-ecc v1.0:
  ├─> Coverage tracking (uses /sp-ecc:test-coverage)
  ├─> E2E test generation (uses /sp-ecc:e2e)
  └─> Same TDD cycle (Red-Green-Refactor)

Still works exactly as before, with optional enhancements
```

**Opt-Out**: Comment lines 225-244 in `skills/test-driven-development/SKILL.md` to disable E2E suggestions.

**All Other Workflows**: Unchanged from v4.x.

### New Language Support

**Ruby on Rails** (4 skills):
- `ruby-patterns` - Ruby language patterns
- `ruby-testing` - RSpec, Minitest, Test::Unit
- `rails-patterns` - Rails patterns (1,404 lines on Rails Engines)
- `rails-security` - OWASP Top 10 for Rails
- `rails-tdd` - TDD workflow for Rails
- `rails-verification` - Pre-deployment checklist

**Dart and Flutter** (4 skills):
- `dart-patterns` - Dart language patterns
- `dart-testing` - Dart testing
- `flutter-patterns` - Flutter patterns (state management decision matrices)
- `flutter-verification` - Comprehensive verification (2,022 lines)

**Auto-Loading**: Automatically loaded when working in relevant files.

**Documentation**: See RUBY-RAILS.md and DART-FLUTTER.md for details.

### Hooks System (New)

**6 Hook Types**:
1. PreToolUse - Before tool execution (destructive git blocker here)
2. PostToolUse - After tool execution
3. SessionStart - At session start
4. SessionEnd - At session end (evaluation hook here)
5. PreCompact - Before context compression
6. Stop - On conversation stop

**Configuration**: `hooks/hooks.json`

**Scripts**: `scripts/hooks/*.js`

**Example Hooks**:
- Destructive git blocker (safety)
- Session evaluation (learning)
- TypeScript checking (quality)
- Console.log warnings (quality)

**Opt-Out**: See OPT-OUT.md for disabling specific hooks.

## Migration Paths

### From Superpowers v4.x to Superpower-ECC v1.0

**Step 1: Backup** (Optional but recommended)
```bash
# If you have local changes to Superpowers plugin
cd ~/.claude/plugins/cache/claude-plugins-official/superpowers/4.2.0
tar -czf ~/superpowers-4.2-backup.tar.gz .
```

**Step 2: Install sp-ecc v1.0**
```bash
# Claude Code will automatically download sp-ecc v1.0
# when you invoke a Superpowers skill
```

**Step 3: Install Dependencies** (Optional, for linting)
```bash
cd ~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.0
npm install  # Requires Node.js 24.13.0+
```

**Step 4: Test Existing Workflows**
```
# Try your most-used workflow
# Example: superpowers:test-driven-development

# Should work identically to v4.x
# New features are additive
```

**Step 5: Explore New Features**
```
# Try a quick command
/sp-ecc:test-coverage

# Try an agent
@build-error-resolver

# Read documentation
docs/integration/USAGE.md
```

**Step 6: Adjust if Needed**
```
# If auto-features are too proactive:
docs/integration/OPT-OUT.md

# If destructive git blocker interferes:
# Review your workflow - you may be relying on destructive git operations
# Consider: Is manual git control actually better?
```

### From Everything Claude Code v1.x to Superpower-ECC v1.0

**If You're Using Everything Claude Code**:

sp-ecc v1.0 is a "best of both worlds" integration. You get:
- ECC's quick tools (/sp-ecc:commands and agents)
- Superpowers' systematic workflows
- Both can be used independently

**What's Different**:
1. **Git Policy**: Read-only for AI (ECC allowed writes)
2. **Naming**: /sp-ecc: prefix on commands (was /command-name)
3. **Hooks**: Merged configuration (may have different matchers)
4. **Contexts**: Now "mode skills" invoked BY workflows (not standalone)
5. **Workflows**: Superpowers workflows are primary (ECC multi-* as alternatives)

**Migration**:
```
ECC Usage -> sp-ecc v1.0 Equivalent

/build-fix -> /sp-ecc:build-fix
/test-coverage -> /sp-ecc:test-coverage
@agent-name -> Still works (agent-name or @agent-name)
contexts/research -> superpowers-research-mode (invoked by brainstorming)
continuous-learning-v2 -> superpowers:extract-patterns (auto-invoked)

Git operations -> Must do manually now (safety)
```

**Advantages of Switch**:
- Systematic workflows for complex features
- Proven TDD and debugging processes
- Git worktrees workflow
- Still have all your quick tools
- Better integration between layers

**Disadvantages**:
- More ceremony for simple tasks (but quick tools available)
- Destructive git operations blocked (but safer)
- Learning curve for workflows (but documentation is comprehensive)

### From Scratch (New User)

**If You're New to Superpowers**:

**Start Here**:
1. Read `docs/integration/USAGE.md` - How to use three layers
2. Try `superpowers:brainstorming` - Your first workflow
3. Read `docs/integration/ARCHITECTURE.md` - Understand the system

**Learning Path**:
```
Week 1: Layer 1 Workflows
  └─> superpowers:brainstorming
  └─> superpowers:writing-plans
  └─> superpowers:executing-plans
  └─> superpowers:test-driven-development

Week 2: Layer 3 Quick Tools
  └─> /sp-ecc:build-fix
  └─> /sp-ecc:test-coverage
  └─> @build-error-resolver

Week 3: Advanced Workflows
  └─> superpowers:systematic-debugging
  └─> superpowers:subagent-driven-development
  └─> superpowers:finishing-a-development-branch

Week 4: Language-Specific
  └─> Ruby/Rails: Read RUBY-RAILS.md
  └─> Dart/Flutter: Read DART-FLUTTER.md
  └─> Python/Django, Go, Java/Spring Boot: Already familiar
```

**Don't Need to Learn Everything**: Use what you need when you need it.

## Common Migration Issues

### Issue 1: "Destructive git operation blocked"

**Symptoms**:
```
[Hook] BLOCKED: Destructive git operation detected
[Hook] Reason: Force push (rewrites remote history)
```

**Cause**: AI attempted a destructive git operation (force push, reset --hard, rebase, etc.).

**Solution**: Use a non-destructive alternative.
```bash
# Instead of: git push --force
# Use: git push (normal push)

# Instead of: git reset --hard
# Use: git stash (to save changes) or git checkout <file> (to restore specific files)
```

**Why This Happens**: sp-ecc blocks only destructive operations for safety. Normal git operations work fine.

**Disable** (not recommended): See OPT-OUT.md for disabling the destructive git blocker.

### Issue 2: E2E tests suggested unexpectedly

**Symptoms**: After unit tests pass, AI suggests E2E tests.

**Cause**: TDD workflow enhanced with E2E generation in sp-ecc v1.0.

**Solution Option 1** (embrace it):
```
AI suggests E2E tests -> Review suggestions -> Implement if useful
```

**Solution Option 2** (opt-out):
```
Edit: skills/test-driven-development/SKILL.md
Comment out lines 225-244 (E2E Test Generation section)
```

**Why This Happens**: E2E tests are valuable for integration testing. Auto-suggestion ensures they're not forgotten.

### Issue 3: Pattern extraction runs automatically

**Symptoms**: After finishing development, AI extracts patterns to instinct memory.

**Cause**: `superpowers:finishing-a-development-branch` auto-invokes pattern extraction in sp-ecc v1.0.

**Solution Option 1** (embrace it):
```
Let it run -> Review extracted patterns -> Export with /sp-ecc:instinct-export
```

**Solution Option 2** (opt-out):
```
Edit: skills/finishing-a-development-branch/SKILL.md
Remove superpowers:extract-patterns invocation
See OPT-OUT.md for exact lines
```

**Why This Happens**: Pattern extraction learns from your work. Future sessions benefit from accumulated patterns.

### Issue 4: Mode skills not user-invocable

**Symptoms**: Try to invoke `superpowers-research-mode` directly, doesn't work.

**Cause**: Mode skills are invoked BY Layer 1 workflows, not directly.

**Solution**: Use the workflow that invokes the mode.
```
Want research mode? -> Use superpowers:brainstorming
Want dev mode? -> Use superpowers:executing-plans
Want review mode? -> Use superpowers:requesting-code-review
```

**Why This Works**: Modes are behavioral modifiers, not standalone workflows. They're contextual.

### Issue 5: Can't find v4.x workflows

**Symptoms**: Looking for old workflow, can't find it.

**Cause**: All v4.x workflows still exist in sp-ecc v1.0, naming unchanged.

**Solution**: Same names, same invocations.
```
superpowers:brainstorming           # Still exists
superpowers:test-driven-development # Still exists
superpowers:systematic-debugging    # Still exists
superpowers:executing-plans         # Still exists
# All v4.x workflows unchanged
```

**Check**: If workflow seems different, verify you're not confusing with Layer 3 tools or mode skills.

### Issue 6: npm install fails

**Symptoms**:
```bash
npm install
# Error: Node.js version too old
```

**Cause**: package.json requires Node.js 24.13.0+ for modern dependencies.

**Solution**: Install Node.js 24.13.0+
```bash
# Check version
node --version

# If < 24.13.0, install from:
# https://nodejs.org/
```

**Why**: Modern linting tools (ESLint 9.x, markdownlint) require newer Node.js.

**Optional**: npm dependencies are only for linting (optional). Superpowers works without them.

### Issue 7: Custom skills/commands use destructive git operations

**Symptoms**: Your custom skill/command tries to force push or hard reset, gets blocked.

**Cause**: Destructive git blocker applies to all AI operations, including custom skills.

**Solution Option 1** (recommended): Update custom skill to use non-destructive alternatives.
```markdown
# Before:
"Force push to override remote: git push --force"

# After:
"Push changes: git push"
```

**Solution Option 2** (not recommended): Disable destructive git blocker (see OPT-OUT.md).

**Why**: Destructive operations can cause irreversible damage. Normal git operations are always allowed.

### Issue 8: Hooks interfering with workflow

**Symptoms**: Session end evaluation takes too long, or TypeScript checks annoying.

**Cause**: Hooks run automatically at specific lifecycle events.

**Solution**: Disable specific hooks (see OPT-OUT.md).
```json
// hooks/hooks.json
// Comment out unwanted hooks:
{
  "SessionEnd": [
    // { "src": "scripts/hooks/session-end-evaluation.js" }  // Disabled
  ]
}
```

**Why**: Hooks are optional quality gates. Keep what helps, disable what hinders.

## Compatibility

### Backward Compatibility

**v4.x Workflows**: 100% compatible, unchanged
**v4.x Skills**: 100% compatible, unchanged
**Custom Skills**: Compatible (destructive git ops will be blocked)
**Custom Commands**: Compatible (destructive git ops will be blocked)

**Breaking**: Only destructive git operations blocked (safety policy)

### Forward Compatibility

**v5.x Features**: Will be maintained in v6.x+ (semantic versioning)
**Layer Architecture**: Foundational design, will persist
**Naming Conventions**: Stable (superpowers:, /sp-ecc:, agent-)
**Hooks System**: May expand, will remain compatible

### Platform Compatibility

**Windows**: Fully supported (tested on Windows)
**macOS**: Fully supported
**Linux**: Fully supported

**Node.js**: Requires 24.13.0+ for npm dependencies (optional)

## Performance Impact

### Token Usage

**v4.2**: Baseline
**sp-ecc v1.0**: ~25% more tokens initially

**Why More Tokens**:
- More skills loaded (Ruby/Rails, Dart/Flutter)
- Mode skills provide additional context
- Agents have deep domain expertise
- Pattern extraction stores learnings

**Is It Worth It**:
- Higher quality output
- Fewer iterations
- Better code
- Long-term: Pattern extraction reduces repeated explanations

**Optimization**:
- Use Layer 3 for quick tasks (lower token usage)
- Opt-out of unused features
- Pattern extraction pays off over time

### Latency

**Workflows**: Similar to v4.x (same process)
**Commands**: Fast (single operation)
**Agents**: Fast (focused task)
**Hooks**: Minimal overhead (<100ms per hook)

**Noticeable Impact**: Session end evaluation (if enabled). Disable if too slow (see OPT-OUT.md).

## Rollback Procedure

**If sp-ecc v1.0 Doesn't Work for You**:

**Step 1: Identify Issue**
```
# What's not working?
# - Destructive git blocker too restrictive?
# - Auto-features too proactive?
# - Workflows different?

# Try fixes first:
# - OPT-OUT.md for disabling features
# - ARCHITECTURE.md for understanding changes
# - This guide for migration issues
```

**Step 2: Rollback to v4.2** (if needed)
```bash
# Remove sp-ecc v1.0 cache
rm -rf ~/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.0

# Restore v4.2 from backup (if you made one)
cd ~/.claude/plugins/cache/claude-plugins-official/superpowers/
tar -xzf ~/superpowers-4.2-backup.tar.gz -C 4.2.0/

# Or: Claude Code will re-download v4.2 if you specify version
```

**Step 3: Report Issue**
```
# Help improve sp-ecc v1.0:
# https://github.com/obra/superpowers/issues

# Include:
# - What didn't work
# - What you expected
# - What you tried from OPT-OUT.md
# - Your use case
```

## Best Practices After Migration

### 1. Start with Layer 1 Workflows

**Recommended**: Use systematic workflows for feature development.
```
superpowers:brainstorming
  └─> superpowers:writing-plans
      └─> superpowers:executing-plans
          └─> superpowers:finishing-a-development-branch
```

**Why**: Proven process, quality gates, comprehensive.

**Layer 3 tools**: Use for quick fixes and focused tasks.

### 2. Normal Git Operations Work

**Pattern**:
```
AI commits code, pushes branches, creates PRs as part of workflows.
Destructive operations (force push, hard reset, rebase) are blocked.
```

**Why**: Productive workflows with safety guardrails.

### 3. Use Git Worktrees for Features

**Workflow**:
```
superpowers:using-git-worktrees
  └─> Create isolated workspace
  └─> Develop feature
  └─> superpowers:finishing-a-development-branch
  └─> You merge manually
```

**Why**: Isolation, safety, parallel development.

### 4. Embrace Pattern Extraction

**Let it Run**:
```
superpowers:finishing-a-development-branch
  └─> Auto-invokes superpowers:extract-patterns
  └─> Extracts learned patterns
  └─> Stores in instinct memory
```

**Benefit**: Future sessions benefit from accumulated knowledge.

**Export Periodically**:
```
/sp-ecc:instinct-export
# Backs up patterns to file
```

### 5. Explore Language-Specific Skills

**If You Use Ruby/Rails**:
```
Read: docs/integration/RUBY-RAILS.md
Focus: Rails Engines (1,404 lines of coverage)
Try: Rails TDD workflow
```

**If You Use Dart/Flutter**:
```
Read: docs/integration/DART-FLUTTER.md
Focus: State management decision matrices
Try: Flutter verification checklist (2,022 lines)
```

### 6. Review Opt-Out Options

**Periodically Check**:
```
Read: docs/integration/OPT-OUT.md
Consider: Which auto-features help? Which hinder?
Adjust: Comment out features you don't want
```

**Remember**: All auto-features can be disabled. Defaults work for most, but customize to your preference.

### 7. Use Decision Trees

**When Unsure Which Tool**:
```
Read: docs/integration/USAGE.md
Review: Decision trees for common scenarios
Example: "I have a bug" -> "Quick fix or investigation?"
```

**Helps**: Choose right layer for the task.

## FAQ

### Do I have to use Layer 3 tools?

No. Layer 1 workflows work exactly as before. Layer 3 tools are optional shortcuts.

### Can I disable destructive git blocker?

Yes, but not recommended. See OPT-OUT.md. The blocker only prevents destructive operations.

### Will v4.x workflows be maintained?

Yes. Layer 1 workflows are foundational. sp-ecc v1.0 enhanced them, not replaced them.

### Can I use ECC and Superpowers separately?

No. sp-ecc v1.0 is an integration. ECC features are now part of Superpowers as Layer 3.

### What if I only want quick tools (Layer 3)?

You can use Layer 3 independently. Layer 1 workflows are optional (but recommended for complex tasks).

### How do I know which layer to use?

Read USAGE.md decision trees. Generally: Layer 1 for features, Layer 3 for quick fixes.

### Are mode skills necessary?

No. They're invoked automatically by workflows. You don't interact with them directly.

### What's the learning curve?

**Layer 1**: Same as v4.x (if you know v4.x, you know this)
**Layer 2**: Automatic, no learning needed
**Layer 3**: Quick reference, learn as you need

### Can I contribute new skills/commands/agents?

Yes. See ARCHITECTURE.md "Extension Points" section. Follow patterns from existing skills.

### What if a hook breaks my workflow?

Disable it (see OPT-OUT.md). Report issue on GitHub so we can fix it.

### Is sp-ecc v1.0 stable for production?

Yes. Extensively tested. Destructive git blocker makes it safer than v4.x for production.

### How do I get help?

1. Read docs: USAGE.md, ARCHITECTURE.md, OPT-OUT.md
2. Check this MIGRATION.md
3. GitHub issues: https://github.com/obra/superpowers/issues
4. Language-specific: RUBY-RAILS.md, DART-FLUTTER.md

## Changelog Highlights

**sp-ecc v1.0.0 (2026-02-06)**:

**Added**:
- 26 quick commands (/sp-ecc:*)
- 13 specialist agents (agent-*)
- 3 mode skills (superpowers-*-mode)
- Pattern extraction (superpowers:extract-patterns)
- Ruby/Rails support (4 skills, Rails Engines focus)
- Dart/Flutter support (4 skills, state management focus)
- Hooks system (6 hook types, destructive git blocker, co-author stripping)
- Comprehensive documentation (USAGE, ARCHITECTURE, OPT-OUT, RUBY-RAILS, DART-FLUTTER, MIGRATION)

**Enhanced**:
- TDD workflow (coverage tracking, E2E generation)
- finishing-a-development-branch (auto pattern extraction)

**Changed**:
- Git operations: Read-only for AI (security policy)
- Some features auto-invoke (opt-out available)

**Security**:
- Destructive git blocker (PreToolUse hook)
- Co-author stripping (PreToolUse hook)
- All agents have git safety guidelines

**See Also**:
- Full changelog: CHANGELOG.md (if exists)
- GitHub releases: https://github.com/obra/superpowers/releases

## Next Steps

**After Migration**:

1. **Verify Everything Works**
   ```
   Try your most-used workflow
   Confirm destructive git blocker works (try git push --force from AI)
   Test a quick command (/sp-ecc:test-coverage)
   ```

2. **Explore New Features**
   ```
   Read USAGE.md decision trees
   Try an agent (@build-error-resolver)
   Review pattern extraction output
   ```

3. **Customize**
   ```
   Read OPT-OUT.md
   Disable unwanted features
   Keep what helps
   ```

4. **Learn Language-Specific**
   ```
   Ruby/Rails: RUBY-RAILS.md
   Dart/Flutter: DART-FLUTTER.md
   Python/Django, Go, Java: Existing skills
   ```

5. **Provide Feedback**
   ```
   What works well?
   What's confusing?
   What's missing?
   GitHub issues: https://github.com/obra/superpowers/issues
   ```

## Support

**Documentation**:
- **USAGE.md** - How to use three layers
- **ARCHITECTURE.md** - Deep dive on architecture
- **OPT-OUT.md** - How to disable features
- **RUBY-RAILS.md** - Ruby/Rails language guide
- **DART-FLUTTER.md** - Dart/Flutter language guide
- **MIGRATION.md** - This document

**Community**:
- GitHub Issues: https://github.com/obra/superpowers/issues
- Discussions: https://github.com/obra/superpowers/discussions

**Quick Help**:
- Stuck? Read USAGE.md decision trees
- Feature too proactive? Read OPT-OUT.md
- Git blocked? Read "Destructive Git Operations Blocked" section above
- Language-specific? Read RUBY-RAILS.md or DART-FLUTTER.md

---

**Document Version**: 1.0.0
**Last Updated**: 2026-02-06
**Related Docs**: USAGE.md, ARCHITECTURE.md, OPT-OUT.md
