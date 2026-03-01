# Model Routing

> Route tasks to the most cost-effective model tier.

## Tier Summary

| Tier | Use For |
|------|---------|
| **Opus** | Architecture, planning, complex bugs (4+ signals), security analysis |
| **Sonnet** | Implementation, standard debugging, tests, refactoring |
| **Haiku** | Docs, formatting, boilerplate, mechanical changes |

## Quick Decision

1. "Do I need to THINK deeply?" → **Opus**
2. "Do I need to BUILD something?" → **Sonnet**
3. "Do I need to APPLY changes mechanically?" → **Haiku**

Default to Sonnet when uncertain.

## Bug Escalation

- Start all bugs on Sonnet
- Escalate to Opus after: 3+ failed fixes, circular investigation, scope expansion to 5+ files
- Self-check after each attempt: Fixes tried [N] | Files touched [N] | Confidence [H/M/L]

## Agent Model Tiers

Agent files specify their model tier. Respect these assignments when dispatching subagents.

## Reference

For detailed scoring, decision trees, and examples → `skills/model-routing/SKILL.md`
