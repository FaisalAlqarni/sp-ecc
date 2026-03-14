# SP-ECC

**An integration project combining [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent and [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa.**

This project merges the systematic workflows from Superpowers with the battle-tested production tools from Everything Claude Code, creating a comprehensive development toolkit for Claude Code with a three-layer architecture.

## Credits

- **Jesse Vincent** - Original [Superpowers v4.1.1](https://github.com/obra/superpowers) author (systematic workflows, TDD, debugging)
- **Affaan Mustafa** - Original [Everything Claude Code v1.7.0](https://github.com/affaan-m/everything-claude-code) author (agents, commands, hooks, patterns)
- **Faisal Alqarni** - Integration work and enhancements

**Source Versions:** Superpowers 4.1.1 + Everything Claude Code 1.7.0

## What This Project Provides

**Three-Layer Architecture:**
- **Layer 1** (from Superpowers): Systematic workflows (brainstorming → planning → execution → review)
- **Layer 2** (integrated): Mode skills and pattern extraction (auto-invoked by workflows)
- **Layer 3** (from ECC): Quick tools (26 commands, 13 specialist agents)

**Enhanced Language Support:**
- Ruby/Rails with **1,404 lines on Rails Engines** (added in this integration)
- Dart/Flutter with **state management decision matrices** (added in this integration)
- Python/Django, Go, Java/Spring Boot (from both projects)

**Git Safety** (from ECC): Destructive git operations (force push, reset --hard, rebase) are blocked. Normal operations allowed.

**Opt-Out-Able** (integrated): All auto-features can be disabled. See `docs/integration/OPT-OUT.md`.

## How It Works

**For Complex Features** (Layer 1 Workflows):

It starts from the moment you fire up your coding agent. As soon as it sees that you're building something, it *doesn't* just jump into trying to write code. Instead, it steps back and asks you what you're really trying to do.

Once it's teased a spec out of the conversation, it shows it to you in chunks short enough to actually read and digest. After the design is presented, you choose from four options: **Ready** (proceed to planning), **Revise** (refine the design), **Save & exit** (bookmark for later), or **Discard & start fresh**.

After you've signed off on the design, your agent puts together an implementation plan that's clear enough for an enthusiastic junior engineer with poor taste, no judgement, no project context, and an aversion to testing to follow. It emphasizes true red/green TDD, YAGNI (You Aren't Gonna Need It), and DRY.

Next up, once you say "go", it launches a *subagent-driven-development* process, having agents work through each engineering task. Each task passes through a **multi-stage review pipeline** — spec compliance, code quality, and security checks, with a conditional gate before proceeding. After all tasks complete, **after-all-tasks stages** run automatically: E2E test generation, doc updates, a verification loop, final review, and refactor cleanup.

It's not uncommon for Claude to be able to work autonomously for a couple hours at a time without deviating from the plan you put together. See `docs/integration/ARCHITECTURE.md` for the full pipeline details.

**For Quick Tasks** (Layer 3 Tools):

Need to fix a build error? `/sp-ecc:build-fix`
Want test coverage? `/sp-ecc:test-coverage`
Security audit needed? `@security-auditor`

Quick, focused, no ceremony. Use when you know exactly what you need.

**Best of Both Worlds:** Systematic workflows when you need structure. Quick tools when workflow is overkill.


## Support the Original Authors

This project builds on the excellent work of:

**Superpowers by Jesse Vincent:**
- Sponsor: [github.com/sponsors/obra](https://github.com/sponsors/obra)
- Project: [github.com/obra/superpowers](https://github.com/obra/superpowers)

**Everything Claude Code by Affaan Mustafa:**
- Project: [github.com/affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- Twitter: [@affaanmustafa](https://x.com/affaanmustafa)


## Installation

### Quick Install (Recommended)

In Claude Code, run these two commands:

```bash
# 1. Register the marketplace
/plugin marketplace add FaisalAlqarni/sp-ecc

# 2. Install the plugin
/plugin install sp-ecc@sp-ecc
```

That's it! The plugin will be installed automatically.

### Manual Installation (Alternative)

If you prefer manual installation:

**1. Clone the repository:**
```bash
git clone https://github.com/FaisalAlqarni/sp-ecc
cd sp-ecc
```

**2. Install dependencies (optional, for linting):**
```bash
npm install
```

**3. Create symlink to Claude Code plugins directory:**

**Windows:**
```bash
mklink /D "%USERPROFILE%\.claude\plugins\sp-ecc" "D:\path\to\sp-ecc"
```

**macOS/Linux:**
```bash
ln -s /path/to/sp-ecc ~/.claude/plugins/sp-ecc
```

**4. Restart Claude Code**

### Verify Installation

Start a new Claude Code session and try:
- Ask: "help me plan this feature" → Should trigger `sp-ecc:brainstorming`
- Type: `/sp-ecc:test-coverage` → Should show the command
- Use: `@build-error-resolver` → Should load the agent

### Updating

**If installed via marketplace:**
```bash
/plugin update sp-ecc
```

**If installed manually:**
```bash
cd /path/to/sp-ecc
git pull
```

### Original Projects

For the individual source projects:
- **Superpowers v4.1.1**: [github.com/obra/superpowers](https://github.com/obra/superpowers)
- **Everything Claude Code v1.7.0**: [github.com/affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)


## Layer 1: The Systematic Workflow

1. **brainstorming** - Activates before writing code. Refines rough ideas through questions, explores alternatives, presents design in sections for validation. Saves design document.

2. **using-git-worktrees** - Activates after design approval. Creates isolated workspace (you create branch manually), runs project setup, verifies clean test baseline.

3. **writing-plans** - Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task has exact file paths, complete code, verification steps.

4. **subagent-driven-development** or **executing-plans** - Activates with plan. Dispatches fresh subagent per task with multi-stage review pipeline (spec → quality → security → conditional gate), plus after-all-tasks stages (e2e, doc-updater, verification-loop, final review, refactor-cleaner). Or executes in batches with human checkpoints.

5. **test-driven-development** - Activates during implementation. Enforces RED-GREEN-REFACTOR: write failing test, watch it fail, write minimal code, watch it pass. **Enhanced with coverage tracking and E2E generation.**

6. **requesting-code-review** - Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

7. **finishing-a-development-branch** - Activates when tasks complete. Verifies tests, **extracts learned patterns**, presents options (merge/PR/keep/discard - you execute), cleans up worktree.

**The agent checks for relevant skills before any task.** Mandatory workflows, not suggestions.

## Layer 2: Quick Tools

**Commands** (`/sp-ecc:*`):
```
/sp-ecc:build-fix          Fix build errors
/sp-ecc:test-coverage      Check test coverage
/sp-ecc:e2e                Generate E2E tests
/sp-ecc:refactor-clean     Clean up code
/sp-ecc:update-docs        Sync code and docs
/sp-ecc:verify             Pre-commit verification
... 20 more commands
```

**Agents** (`agent-*` or `@agent-name`):
```
build-error-resolver        Fix build errors
test-failure-analyzer       Investigate test failures
security-auditor            Security review
performance-optimizer       Performance analysis
code-reviewer               Code review
... 8 more agents
```

**Decision Tree:** See `docs/integration/USAGE.md` for "which tool when" guide.

## What's Inside

### Layer 1: Systematic Workflows

**Testing**
- **test-driven-development** - RED-GREEN-REFACTOR cycle with coverage tracking and E2E generation

**Debugging**
- **systematic-debugging** - 4-phase root cause process with escalation to specialist agents
- **verification-before-completion** - Ensure it's actually fixed

**Collaboration**
- **brainstorming** - Socratic design refinement
- **writing-plans** - Detailed implementation plans
- **executing-plans** - Batch execution with checkpoints
- **subagent-driven-development** - Fast iteration with multi-stage review pipeline and after-all-tasks stages
- **dispatching-parallel-agents** - Concurrent subagent workflows
- **requesting-code-review** - Pre-review checklist
- **receiving-code-review** - Responding to feedback
- **using-git-worktrees** - Parallel development branches (you create, AI guides)
- **finishing-a-development-branch** - Merge/PR decision workflow

**Meta**
- **writing-skills** - Create new skills following best practices
- **using-sp-ecc** - Introduction to the skills system

### Layer 2: Quick Tools

**26 Commands** (`/sp-ecc:*`): Build fixes, testing, code quality, development workflows

**13 Agents** (`agent-*`): Build errors, test failures, security, performance, code review, refactoring, documentation, API design, database, deployment

**Full List:** See `docs/integration/USAGE.md`

### Language & Framework Skills

**Ruby/Rails** (1,404 lines on Rails Engines):
- ruby-patterns, ruby-testing
- rails-patterns, rails-security, rails-tdd, rails-verification

**Dart/Flutter** (state management focus):
- dart-patterns, dart-testing
- flutter-patterns, flutter-verification (2,022 lines)

**Python/Django:**
- python-patterns, python-testing
- django-patterns, django-security, django-tdd, django-verification

**Go:**
- golang-patterns, golang-testing

**Java/Spring Boot:**
- java-coding-standards, jpa-patterns
- springboot-patterns, springboot-security, springboot-tdd, springboot-verification

**Databases:**
- postgres-patterns, clickhouse-io

### Hooks System

**6 Hook Types:** PreToolUse, PostToolUse, SessionStart, SessionEnd, PreCompact, Stop

**Key Hooks:**
- **Destructive git blocker** - Blocks force push, reset --hard, rebase, clean -f (safety)
- **Session evaluation** - Learn from completed sessions
- **TypeScript checking** - Type safety validation
- **Console.log warnings** - Code quality

**Configure:** `hooks/hooks.json`
**Opt-Out:** `docs/integration/OPT-OUT.md`

## Philosophy

- **Test-Driven Development** - Write tests first, always
- **Systematic over ad-hoc** - Process over guessing
- **Complexity reduction** - Simplicity as primary goal
- **Evidence over claims** - Verify before declaring success
- **User control** - Destructive git operations blocked, normal operations allowed
- **Opt-out-able** - All auto-features can be disabled

Read more: [Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

## Documentation

**Getting Started:**
- **USAGE.md** - How to use three layers, decision trees for "which tool when"
- **MIGRATION.md** - Upgrading from v4.x or Everything Claude Code

**Deep Dives:**
- **ARCHITECTURE.md** - Three-layer architecture, git restrictions, hooks, security model

**Customization:**
- **OPT-OUT.md** - Disable E2E suggestions, pattern extraction, specific hooks

All docs: `docs/integration/`

## Contributing

Skills live directly in this repository. To contribute:

1. Create your feature branch
2. Create a branch for your skill
3. Follow the `writing-skills` skill for creating and testing new skills
4. Submit a PR

See `skills/writing-skills/SKILL.md` for the complete guide.

## Updating

Pull the latest changes from this repository:

```bash
cd path/to/sp-ecc
git pull origin main
```

**Coming from Superpowers or ECC?** See `docs/integration/MIGRATION.md` for:
- What's changed in this integration
- How to use the three-layer architecture
- Migration paths from either project
- Common issues and solutions

## License

MIT License - see LICENSE file for details

## Support

**This Project:**
- Repository: https://github.com/FaisalAlqarni/sp-ecc
- Issues: https://github.com/FaisalAlqarni/sp-ecc/issues

**Original Projects:**
- Superpowers v4.1.1: https://github.com/obra/superpowers
- Everything Claude Code v1.7.0: https://github.com/affaan-m/everything-claude-code
