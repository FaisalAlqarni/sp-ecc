---
description: Extract, evaluate, and save learned patterns with a quality gate. Extends /learn with 5-dimension scoring.
---

# /learn-eval — Quality-Gated Learning

Extends `/sp-ecc:learn` with a quality gate and save-location decision before writing any skill file.

## What to Extract

1. **Error Resolution Patterns** — root cause + fix + reusability
2. **Debugging Techniques** — non-obvious steps, tool combinations
3. **Workarounds** — library quirks, API limitations, version-specific fixes
4. **Project-Specific Patterns** — conventions, architecture decisions, integration patterns

## Process

1. Review the session for extractable patterns
2. Identify the most valuable/reusable insight

3. **Determine save location:**
   - Ask: "Would this pattern be useful in a different project?"
   - **Global** (`~/.claude/skills/learned/`): Generic patterns usable across 2+ projects
   - **Project** (`.claude/skills/learned/`): Project-specific knowledge
   - When in doubt, choose Global

4. Draft the skill file:

```yaml
---
name: pattern-name
description: "Under 130 characters"
user-invocable: false
origin: auto-extracted
---
```

```markdown
# [Descriptive Pattern Name]

**Extracted:** [Date]
**Context:** [When this applies]

## Problem
[What problem this solves — be specific]

## Solution
[The pattern/technique — with code examples]

## When to Use
[Trigger conditions]
```

5. **Self-evaluate before saving:**

   | Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
   |-----------|----------|--------------|----------------|
   | Specificity | Abstract principles only | Representative code example | Rich examples covering all patterns |
   | Actionability | Unclear what to do | Main steps understandable | Immediately actionable, edge cases covered |
   | Scope Fit | Too broad or narrow | Mostly appropriate | Name, trigger, content aligned |
   | Non-redundancy | Nearly identical to another skill | Some overlap, unique perspective | Completely unique value |
   | Coverage | Fraction of target task | Main cases covered | Main + edge cases + pitfalls |

   - Score each dimension 1-5
   - If any dimension scores 1-2, improve and re-score until all >= 3
   - Show scores table and final draft to user

6. Ask user to confirm before saving

## Don't Extract

- Trivial fixes (typos, syntax errors)
- One-time issues (specific API outages)
- Already-known patterns (check existing skills first)

Keep skills focused — one pattern per skill.
