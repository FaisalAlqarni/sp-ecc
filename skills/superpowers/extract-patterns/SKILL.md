---
name: superpowers-extract-patterns
description: Extract learned patterns from session - invoked automatically by finishing-a-development-branch or manually anytime
---

# Extract Patterns

## Overview

Wraps ECC's continuous-learning-v2 system to extract and save useful patterns from development sessions.

**Auto-invoked by:** finishing-a-development-branch skill
**Can be invoked:** Manually anytime to save learning
**Purpose:** Build institutional knowledge over time

**Announce at start:** "I'm using the extract-patterns skill to learn from this session."

## The Process

### Step 1: Invoke Pattern Extraction

Use `/sp-ecc:learn` command to extract patterns:

```
/sp-ecc:learn
```

This analyzes the current session for:
- Successful problem-solving approaches
- Useful code patterns
- Effective debugging strategies
- Language/framework insights
- Common mistake avoidance

### Step 2: Review Extracted Patterns

The learning system will show patterns with confidence scores.

**Review criteria:**
- Is the pattern actually useful?
- Is the confidence score appropriate?
- Would this help in future sessions?

### Step 3: Save to Instinct System

Patterns are automatically saved to the instinct system.

**View saved patterns:**
```
/sp-ecc:instinct-status
```

### Step 4: Optional - Evolve into Skills

For mature patterns (high confidence, multiple uses):

```
/sp-ecc:evolve
```

This clusters related patterns into reusable skills.

## Integration with Workflow

**Auto-Invoked:**
```
finishing-a-development-branch:
1. Verify tests pass
2. Sync documentation
3. Extract patterns (THIS SKILL) ← Auto-invoked
4. Generate changelist
5. Present options
```

**Manual Invocation:**
```
Any time during development:
- "Can you extract patterns from what we just did?"
- Skill invoked
- Patterns saved for future
```

## Opt-Out

To disable auto-invocation in finishing workflow:

See: `docs/integration/OPT-OUT.md`

## Exporting/Importing Patterns

**Export patterns to file:**
```
/sp-ecc:instinct-export
```

**Import patterns from file:**
```
/sp-ecc:instinct-import
```

Useful for:
- Sharing patterns across teams
- Backing up learned knowledge
- Transferring patterns between projects

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/sp-ecc:learn` | Extract patterns from session |
| `/sp-ecc:instinct-status` | View saved patterns |
| `/sp-ecc:instinct-export` | Export to file |
| `/sp-ecc:instinct-import` | Import from file |
| `/sp-ecc:evolve` | Cluster patterns into skills |

## Remember

- Patterns accumulate over time
- Higher confidence = more proven
- Export periodically for backup
- Share successful patterns with team

---

**Remember:** This builds institutional knowledge. The more you use it, the smarter the system becomes.
