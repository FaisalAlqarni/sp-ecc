---
name: skill-stocktake
description: Audit all installed skills, commands, agents, and hooks for quality, freshness, and duplication. Use periodically to maintain a clean plugin.
---

# Skill Stocktake

Audit Claude skills and commands through quality assessment.

## Operating Modes

- **Quick Scan** — Recently modified skills only (5-10 minutes). Activates when results cache exists.
- **Full Stocktake** — Comprehensive review of everything (20-30 minutes). Runs when cache is absent or explicitly requested.

## Scanning Scope

- Global skills: `~/.claude/skills/`
- Project skills: `{cwd}/.claude/skills/`
- Plugin skills: current plugin's `skills/` directory
- Commands: current plugin's `commands/` directory
- Agents: current plugin's `agents/` directory

## Evaluation Process

### Phase 1: Inventory
Scan all skill files, extract metadata (name, description, origin, modification date).

### Phase 2: Evaluate
For each skill, assess against this checklist:
- **Content overlap** — Does this duplicate another skill?
- **Technical freshness** — Are referenced tools/APIs/patterns current?
- **Usage patterns** — Is this skill actually invoked by workflows?
- **Uniqueness** — Does this provide value no other skill covers?

### Phase 3: Summarize
Present results in a table with verdicts.

### Phase 4: Recommend
Consolidate findings with actionable recommendations.

## Verdict Categories

| Verdict | Meaning |
|---------|---------|
| **Keep** | Useful and current |
| **Improve** | Worth retaining with specific enhancements |
| **Update** | Outdated references need refreshing |
| **Retire** | Low value — name what replaces it |
| **Merge into [target]** | Substantial duplication — name the target |

Reason fields must be evidence-based, restating specific defects rather than generic labels.

## Results Cache

Results stored at `~/.claude/skills/skill-stocktake/results.json`:
- Evaluation timestamp (UTC)
- Mode (quick/full)
- Per-skill verdicts with reasoning

## When to Run

- After adding new skills or commands
- Quarterly maintenance
- When workflows feel slow or bloated
- After upgrading plugin versions
