# When to Use What - Superpower-ECC

This guide helps you choose the right tool for the job in Superpower-ECC (an integration of Superpowers by Jesse Vincent and Everything Claude Code by Affaan Mustafa).

## Three-Layer Architecture

Superpower-ECC integrates three complementary layers:

### Layer 1: Superpowers Systematic Workflows

**Purpose:** Structured, repeatable processes for complex development tasks

**When to use:** You want guidance through a complete workflow with checkpoints and validation

**Examples:**
- `superpowers:brainstorming` - Structured feature ideation
- `superpowers:writing-plans` - Systematic planning with Architecture Decision Records
- `superpowers:test-driven-development` - Full TDD cycle (red-green-refactor)
- `superpowers:requesting-code-review` - Prepare code for human review
- `superpowers:finishing-a-development-branch` - Complete branch workflow with pattern extraction

**Characteristics:**
- Multi-step guided workflows
- Built-in validation and checkpoints
- Educational prompts and context
- Automatic pattern learning on completion

### Layer 2: ECC Enhancements (Auto-Invoked)

**Purpose:** Intelligence baked into Layer 1 workflows

**When invoked:** Automatically called by superpowers workflows

**Examples:**
- `code-reviewer` agent - Pre-reviews code before human review
- `security-reviewer` agent - Checks for security issues
- `tdd-guide` agent - Provides TDD guidance during development
- `superpowers:extract-patterns` - Extracts learnings when finishing branches

**Characteristics:**
- Zero user action required
- Seamlessly integrated
- Enhance workflow quality
- Context-aware assistance

### Layer 3: ECC Quick Tools

**Purpose:** Direct access for experienced developers who know what they need

**When to use:** You have a specific task and want immediate execution

**Types:**

**Commands (slash commands):**
- `/sp-ecc:plan` - Generate implementation plan from spec
- `/sp-ecc:test-coverage` - Analyze test coverage gaps
- `/sp-ecc:e2e` - Generate end-to-end tests
- `/sp-ecc:build-fix` - Attempt to fix build errors
- `/sp-ecc:refactor-clean` - Remove dead code
- `/sp-ecc:code-review` - Spot code review
- `/sp-ecc:learn` - Extract patterns manually

**Agents (autonomous specialists):**
- `planner` - Autonomous planning
- `code-reviewer` - Autonomous code review
- `security-reviewer` - Security analysis
- `tdd-guide` - TDD guidance
- `worktree-manager` - Manage git worktrees

**Characteristics:**
- Single-purpose tools
- Immediate execution
- Expert-friendly
- Can be composed together

---

## Decision Trees

### Planning a Feature

```
Do you have a clear specification?
├─ NO → Use superpowers:brainstorming
│       Then: superpowers:writing-plans
│
└─ YES → Do you want guided ADR creation?
          ├─ YES → Use superpowers:writing-plans
          │
          └─ NO → Do you want autonomous planning?
                  ├─ YES → Use planner agent
                  │
                  └─ NO → Use /sp-ecc:plan command
```

**Examples:**
- **New feature, unclear requirements:** `superpowers:brainstorming` → `superpowers:writing-plans`
- **Clear spec, want ADR:** `superpowers:writing-plans`
- **Clear spec, want quick plan:** `/sp-ecc:plan`
- **Let AI handle it:** `planner` agent

### Testing Your Code

```
What testing approach do you need?
├─ Full TDD workflow → superpowers:test-driven-development
│
├─ Check coverage gaps → /sp-ecc:test-coverage
│
├─ Generate E2E tests → /sp-ecc:e2e
│
├─ Autonomous TDD guidance → tdd-guide agent
│
└─ Run tests → /sp-ecc:go-test or /sp-ecc:python-test
```

**Examples:**
- **Starting new feature with TDD:** `superpowers:test-driven-development`
- **Existing code needs tests:** `/sp-ecc:test-coverage` to identify gaps
- **Need integration tests:** `/sp-ecc:e2e` to generate scenarios
- **Want TDD coaching:** `tdd-guide` agent
- **Just run the tests:** `/sp-ecc:go-test` or `/sp-ecc:python-test`

### Code Review

```
What stage is your code at?
├─ Ready for human review → superpowers:requesting-code-review
│   (automatically invokes code-reviewer and security-reviewer agents)
│
├─ Want quick spot check → /sp-ecc:code-review
│
├─ Security-specific review → security-reviewer agent
│
└─ Autonomous full review → code-reviewer agent
```

**Examples:**
- **Preparing PR for team:** `superpowers:requesting-code-review`
- **Quick self-check during development:** `/sp-ecc:code-review`
- **Security-focused review:** `security-reviewer` agent
- **Autonomous pre-commit review:** `code-reviewer` agent

### Fixing Build Errors

```
How complex is the build error?
├─ Simple/common error → /sp-ecc:build-fix
│   (pattern-matching for known issues)
│
├─ Complex/unclear error → superpowers:systematic-debugging
│   (full diagnostic workflow)
│
└─ Language-specific → /sp-ecc:go-build (Go projects)
```

**Examples:**
- **"Cannot find symbol" in Go:** `/sp-ecc:go-build` or `/sp-ecc:build-fix`
- **Weird interaction between components:** `superpowers:systematic-debugging`
- **Quick fix attempt:** `/sp-ecc:build-fix`

### Refactoring Code

```
What's the scope of refactoring?
├─ Major refactoring (architecture changes)
│   → superpowers:brainstorming → superpowers:writing-plans
│   → Implement with superpowers:test-driven-development
│
├─ Remove dead code → /sp-ecc:refactor-clean
│
└─ Code quality improvements → /sp-ecc:code-review first
    Then: Manual refactoring
    Then: /sp-ecc:test-coverage to verify
```

**Examples:**
- **Restructuring module architecture:** Use full workflow (brainstorm → plan → TDD)
- **Cleaning up unused functions:** `/sp-ecc:refactor-clean`
- **Improving code quality:** `/sp-ecc:code-review` → refactor → `/sp-ecc:test-coverage`

### Learning and Pattern Extraction

```
When do you want to extract patterns?
├─ Automatically when finishing → superpowers:finishing-a-development-branch
│   (calls superpowers:extract-patterns automatically)
│
├─ Manually anytime → /sp-ecc:learn
│
├─ Check learned patterns → /sp-ecc:instinct-status
│
├─ Export patterns → /sp-ecc:instinct-export
│
└─ Import patterns → /sp-ecc:instinct-import
```

**Examples:**
- **Finishing a feature branch:** `superpowers:finishing-a-development-branch` (auto-extracts)
- **Just learned something useful:** `/sp-ecc:learn` to capture it
- **See what patterns exist:** `/sp-ecc:instinct-status`
- **Share patterns with team:** `/sp-ecc:instinct-export`
- **Use team patterns:** `/sp-ecc:instinct-import`

### Multi-Step Workflows

```
Need to coordinate multiple operations?
├─ Frontend + Backend changes → /sp-ecc:multi-frontend and /sp-ecc:multi-backend
│
├─ Execute across services → /sp-ecc:multi-execute
│
├─ Complex orchestration → /sp-ecc:multi-workflow
│
└─ Full planning across services → /sp-ecc:multi-plan
```

**Examples:**
- **API change affecting frontend:** `/sp-ecc:multi-backend` then `/sp-ecc:multi-frontend`
- **Update all microservices:** `/sp-ecc:multi-execute`
- **Coordinate complex release:** `/sp-ecc:multi-workflow`

---

## Naming Conventions Reference

| Pattern | Type | Example | Purpose |
|---------|------|---------|---------|
| `superpowers:name` | Systematic Workflow | `superpowers:test-driven-development` | Guided multi-step process |
| `/sp-ecc:name` | Quick Command | `/sp-ecc:build-fix` | Single-purpose tool |
| `agent-name` | Autonomous Agent | `code-reviewer` | Specialist that works independently |
| `superpowers:name-mode` | Behavior Modifier | `superpowers:pairing-mode` | Changes how workflows operate |

### Invoking Each Type

**Systematic Workflows:**
```
# In Claude Code
> Can you help me with test-driven development?
# Claude invokes: superpowers:test-driven-development
```

**Quick Commands:**
```
# In Claude Code
> /sp-ecc:test-coverage
# Direct invocation of command
```

**Autonomous Agents:**
```
# In Claude Code
> Can you review this code?
# Claude may invoke: code-reviewer agent

# Or explicitly:
> Use the code-reviewer agent
```

**Behavior Modes:**
```
# In Claude Code
> Enable pairing mode
# Claude invokes: superpowers:pairing-mode
```

---

## When You're a Beginner vs Expert

### If You're New to the Codebase

**Recommended approach:** Use Layer 1 (Systematic Workflows)

**Why:**
- Guidance through each step
- Context and explanation provided
- Validation at checkpoints
- Learning built into the process

**Start with:**
1. `superpowers:brainstorming` - Understand the problem space
2. `superpowers:writing-plans` - Create structured plan with ADRs
3. `superpowers:test-driven-development` - Implement with TDD
4. `superpowers:requesting-code-review` - Prepare for review
5. `superpowers:finishing-a-development-branch` - Complete and learn

**Benefits:**
- Builds understanding of the codebase
- Captures decisions in ADRs
- Extracts patterns for future reference
- Reduces mistakes through validation

### If You're an Experienced Developer

**Recommended approach:** Use Layer 3 (Quick Tools) + Layer 2 (Auto-enhancements)

**Why:**
- Direct access to specific functionality
- No overhead of guided steps
- Compose tools for custom workflows
- Still get automatic enhancements

**Common workflows:**
1. `/sp-ecc:plan` - Quick planning
2. `/sp-ecc:test-coverage` - Check test gaps
3. Implement code
4. `/sp-ecc:code-review` - Quick check
5. `superpowers:finishing-a-development-branch` - Extract patterns

**Or fully autonomous:**
1. `planner` agent - Let AI plan
2. Implement with `tdd-guide` agent support
3. `code-reviewer` agent - Automated review
4. `/sp-ecc:learn` - Manual pattern extraction

**Benefits:**
- Faster execution
- Less interruption
- Still capture learnings
- Flexibility to compose tools

### If You're on a Team

**Recommended approach:** Mix both layers based on task complexity

**For complex features:**
- Use Layer 1 for planning and design (captures ADRs for team)
- Use Layer 3 for implementation (faster iteration)
- Use Layer 1 for finishing (extracts patterns for team)

**For maintenance tasks:**
- Use Layer 3 exclusively (quick fixes)
- Use `/sp-ecc:learn` to share insights

**For knowledge sharing:**
- Use `/sp-ecc:instinct-export` to share patterns
- Use `/sp-ecc:instinct-import` to load team patterns
- Use `superpowers:finishing-a-development-branch` to ensure patterns are captured

**Benefits:**
- Team alignment through ADRs
- Shared pattern library
- Flexibility for individual work styles
- Consistent code review process

---

## Common Scenarios and Recommendations

### Scenario: Starting a New Feature

**Beginner:**
```
1. superpowers:brainstorming
   - Explore requirements and edge cases
2. superpowers:writing-plans
   - Create ADR and implementation plan
3. superpowers:test-driven-development
   - Implement with TDD workflow
```

**Expert:**
```
1. /sp-ecc:plan
   - Generate quick implementation plan
2. /sp-ecc:test-coverage (optional)
   - Check existing test baseline
3. Implement manually with tdd-guide agent support
4. /sp-ecc:code-review
   - Quick self-review
```

### Scenario: Bug Fix

**Simple bug:**
```
1. /sp-ecc:build-fix or manual fix
2. /sp-ecc:test-coverage
   - Ensure bug is tested
3. /sp-ecc:code-review
   - Quick verification
```

**Complex bug:**
```
1. superpowers:systematic-debugging
   - Guided diagnostic workflow
2. superpowers:test-driven-development
   - Fix with test coverage
3. superpowers:requesting-code-review
   - Full review process
```

### Scenario: Security Review

**Before commit:**
```
# Automatic via superpowers:requesting-code-review
1. superpowers:requesting-code-review
   - Automatically invokes security-reviewer agent
```

**Ad-hoc review:**
```
# Direct invocation
1. security-reviewer agent
   - Full security analysis
```

### Scenario: Performance Optimization

**Approach:**
```
1. superpowers:brainstorming
   - Identify optimization opportunities
2. superpowers:writing-plans
   - Plan optimization strategy with ADR
3. superpowers:test-driven-development
   - Implement with performance tests
4. /sp-ecc:test-coverage
   - Verify no regression
5. superpowers:finishing-a-development-branch
   - Extract performance patterns
```

### Scenario: Documentation Updates

**Quick update:**
```
1. Edit documentation
2. /sp-ecc:update-docs
   - Validate documentation quality
```

**Major documentation:**
```
1. superpowers:brainstorming
   - Plan documentation structure
2. superpowers:writing-plans
   - Create documentation plan
3. Manual implementation
4. /sp-ecc:update-docs
   - Validation
```

### Scenario: Continuous Learning

**After every branch:**
```
1. superpowers:finishing-a-development-branch
   - Automatically extracts patterns
   - Updates instinct library
```

**Manual learning:**
```
1. /sp-ecc:learn
   - Extract specific patterns anytime
2. /sp-ecc:instinct-status
   - Check what's been learned
3. /sp-ecc:instinct-export
   - Share with team
```

---

## Best Practices

### 1. Start Systematic, Then Accelerate

- Use Layer 1 (workflows) when learning
- Graduate to Layer 3 (quick tools) when proficient
- Always use Layer 1 for finishing branches (pattern extraction)

### 2. Let Auto-Enhancements Work for You

- Don't manually invoke `code-reviewer` agent if using `superpowers:requesting-code-review`
- Let workflows handle the orchestration
- Trust the automatic pattern extraction

### 3. Compose Quick Tools

Quick tools are designed to work together:
```
/sp-ecc:plan → implement → /sp-ecc:test-coverage → /sp-ecc:code-review → /sp-ecc:learn
```

### 4. Use Behavior Modes Strategically

- `superpowers:pairing-mode` - When you want conversational guidance
- `superpowers:focused-mode` - When you want minimal interruption
- `superpowers:learning-mode` - When you want maximum explanation

### 5. Capture Knowledge Continuously

- Use `/sp-ecc:learn` whenever you solve something non-obvious
- Use `superpowers:finishing-a-development-branch` to capture comprehensive patterns
- Use `/sp-ecc:instinct-export` to share with team regularly

### 6. Match Tool to Task Complexity

| Task Complexity | Recommended Layer |
|-----------------|-------------------|
| Simple fix | Layer 3 (Quick tool) |
| Medium feature | Layer 3 + Layer 2 (Quick + Auto) |
| Complex feature | Layer 1 (Systematic workflow) |
| Learning phase | Layer 1 (Systematic workflow) |
| Teaching others | Layer 1 (Systematic workflow) |

---

## Quick Reference

### Most Common Commands

| Task | Beginner | Expert |
|------|----------|--------|
| Plan feature | `superpowers:writing-plans` | `/sp-ecc:plan` |
| Implement with tests | `superpowers:test-driven-development` | `/sp-ecc:test-coverage` |
| Code review | `superpowers:requesting-code-review` | `/sp-ecc:code-review` |
| Fix build | `superpowers:systematic-debugging` | `/sp-ecc:build-fix` |
| Finish branch | `superpowers:finishing-a-development-branch` | `superpowers:finishing-a-development-branch` |
| Learn patterns | Auto via finishing | `/sp-ecc:learn` |
| Check patterns | `/sp-ecc:instinct-status` | `/sp-ecc:instinct-status` |

### When in Doubt

**Ask yourself:**

1. **Do I need guidance?** → Use Layer 1 (Systematic Workflow)
2. **Do I know exactly what I need?** → Use Layer 3 (Quick Tool)
3. **Do I want AI to handle it?** → Use Layer 3 (Agent)
4. **Is this complex and important?** → Use Layer 1 (Systematic Workflow)
5. **Am I finishing work?** → Use `superpowers:finishing-a-development-branch`

**Default recommendation:**
- When learning: Always start with Layer 1
- When proficient: Use Layer 3 for speed, Layer 1 for finishing
- When teaching: Always use Layer 1
- When in doubt: Use Layer 1

---

## Summary

Superpower-ECC gives you three ways to work:

1. **Systematic workflows** (Layer 1) - Guided, educational, comprehensive
2. **Auto-enhancements** (Layer 2) - Transparent, integrated, automatic
3. **Quick tools** (Layer 3) - Direct, fast, composable

**The integration means:**
- You never lose systematic rigor (Layer 2 enhances Layer 1)
- You gain expert speed (Layer 3 available when needed)
- You continuously learn (pattern extraction built-in)

**Choose based on:**
- Your experience level
- Task complexity
- Time constraints
- Learning goals

**Remember:**
- Beginners should start with Layer 1
- Experts can use Layer 3
- Everyone should finish branches with `superpowers:finishing-a-development-branch`
- Pattern extraction is the key to continuous improvement

---

*For more information, see:*
- `docs/integration/ARCHITECTURE.md` - System architecture
- `docs/integration/MIGRATION.md` - Migration from v4.x
- `docs/integration/WORKFLOWS.md` - Detailed workflow documentation
