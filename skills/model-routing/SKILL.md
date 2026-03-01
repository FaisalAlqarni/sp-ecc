---
name: model-routing
description: Detailed model routing framework. Provides task classification, bug complexity scoring, escalation triggers, and cost optimization patterns for Opus/Sonnet/Haiku tiers.
---

# Model Routing

Route tasks to the most cost-effective model while maintaining quality.

## Model Tiers

| Tier | Model | Cost | Use For |
|------|-------|------|---------|
| **Opus** | claude-opus-4-6 | $$$ | Complex reasoning, architecture, planning |
| **Sonnet** | claude-sonnet-4-6 | $$ | Implementation, code execution, debugging |
| **Haiku** | claude-haiku-4-5 | $ | Simple edits, docs, formatting, boilerplate |

## Task Classification

### Opus Tasks (Think/Plan)
Use Opus ONLY for:
- System architecture and design decisions
- Complex algorithm design
- Multi-file refactoring strategy
- **Complex bugs** (see criteria below)
- Security vulnerability analysis
- Performance optimization planning
- Code review requiring deep reasoning
- Breaking down ambiguous requirements

### Sonnet Tasks (Execute/Build)
Use Sonnet for:
- Writing new functions/classes/modules
- Implementing planned features
- **Most debugging** (start here, escalate if stuck)
- Writing tests
- Code refactoring (executing a plan)
- API integrations
- Database queries and migrations
- Most day-to-day coding work

## Bug Complexity Decision

**Default to Sonnet for bugs.** Escalate to Opus only when needed.

### Quick Bug Scoring

Count these complexity signals (+1 each):

| Signal | Example |
|--------|---------|
| Multi-file | Spans 3+ files/services |
| No stack trace | No clear error location |
| Intermittent | Doesn't always reproduce |
| Concurrency | Race conditions, async issues |
| State-dependent | Needs specific event sequence |
| Performance | Memory leak, CPU spike |

**Scoring:**
- 0-1 → **Sonnet**
- 2-3 → **Sonnet first**, escalate if stuck after 2-3 attempts
- 4+ → **Opus**

### Escalation Rule

**Escalate to Opus when ANY trigger fires:**

| Trigger | Threshold |
|---------|-----------|
| Failed fixes | ≥3 attempts didn't resolve |
| Circular investigation | Revisiting same files 2+ times |
| Scope expansion | Started with 1-2 files, now 5+ |
| Hypotheses disproven | 3+ theories tested and failed |
| Mystery fix | Fixed it but don't know why |
| Complexity discovered | Found race condition/state issue |

**Self-check after each attempt:**
```
Fixes tried: [N] | Files touched: [N] | Confidence: [H/M/L]
If confidence=LOW and fixes≥2 → Opus
```

### Haiku Tasks (Simple/Apply)
Use Haiku for:
- Adding/updating comments and docstrings
- Formatting and linting fixes
- Renaming variables/functions
- Simple boilerplate generation
- Applying documentation templates
- Repetitive mechanical changes
- Copy-paste adaptations
- Import statement organization
- Simple find-and-replace operations
- Generating standard config files

## Decision Flow

```
┌─────────────────────────────────────┐
│         Incoming Task               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Does it require deep reasoning,     │
│ planning, or architecture?          │
└──────────────┬──────────────────────┘
               │
        Yes    │    No
     ┌─────────┴─────────┐
     ▼                   ▼
┌─────────┐    ┌─────────────────────┐
│  OPUS   │    │ Is it mechanical,   │
│ (Plan)  │    │ repetitive, or      │
└─────────┘    │ documentation-only? │
               └──────────┬──────────┘
                          │
                   Yes    │    No
                ┌─────────┴─────────┐
                ▼                   ▼
           ┌─────────┐        ┌─────────┐
           │  HAIKU  │        │ SONNET  │
           │ (Apply) │        │ (Build) │
           └─────────┘        └─────────┘
```

## Implementation Pattern

When given a complex task, decompose it:

```
1. OPUS PHASE: Analyze and plan
   - Understand requirements
   - Use brainstorm skill if needed to be fully aligned with the user
   - Design architecture
   - Create implementation steps
   - Identify edge cases

2. SONNET PHASE: Execute the plan
   - Write core logic
   - Review code, return to previous step if found issue
   - Implement features
   - Review again, return to previous step if found issue, or to Write core logic if needed. make it a loop until the reviews are passed successfuly
   - Write tests
   - Debug issues
   - again, final review

3. HAIKU PHASE: Polish and finalize
   - Add docstrings
   - Format code
   - Update README
   - Apply boilerplate
```

## Cost Savings Examples

| Task | Without Routing | With Routing | Savings |
|------|-----------------|--------------|---------|
| Plan + Build feature | All Opus | Opus→Sonnet | ~60% |
| Build + Document | All Opus | Sonnet→Haiku | ~80% |
| Full workflow | All Opus | Opus→Sonnet→Haiku | ~70% |

## Quick Reference

**Ask yourself:**

1. "Do I need to THINK deeply?" → **Opus**
2. "Do I need to BUILD something?" → **Sonnet**
3. "Do I need to APPLY changes mechanically?" → **Haiku**

**Default to Sonnet** when uncertain—it handles most tasks well at moderate cost.

## Anti-Patterns

Avoid these costly mistakes:

- ❌ Using Opus for simple code formatting
- ❌ Using Opus to add docstrings
- ❌ Using Sonnet for mechanical find-replace
- ❌ Using Haiku for complex debugging
- ❌ Using Haiku to design architecture
