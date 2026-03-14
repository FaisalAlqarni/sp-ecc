---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by brainstorming skill).

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Requirements Restatement (Step 1 of Every Plan)

Before writing any plan content, always output:

**Requirements as I understand them:**
- [Requirement 1 — in your own words]
- [Requirement 2]
- [Assumption 1]

Wait for human confirmation before investing in plan detail. Misunderstandings caught here save hours of wasted implementation.

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use sp-ecc:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Complexity:** High / Medium / Low

**Risks:**
- HIGH: [risk — mitigation]
- MEDIUM: [risk — mitigation]

**Testing:** Unit: [what], Integration: [what], E2E: [if applicable]

---
```

## Task Structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Depends on:** Task N (if applicable, omit if none)

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax
- DRY, YAGNI, TDD, frequent commits

## Phasing Large Features

For features spanning 10+ tasks, phase into independently shippable slices:
- **MVP:** Smallest slice that provides value
- **Core:** Complete happy path
- **Hardening:** Edge cases, error handling
- **Polish:** Optimization, monitoring

Each phase should be mergeable on its own.

## Plan Quality Red Flags

Before presenting the plan, check:
- [ ] Every task has exact file paths
- [ ] Testing strategy is included
- [ ] Dependencies between tasks are noted
- [ ] Each phase can ship independently (for large features)
- [ ] No steps say "add validation" — complete code is provided

## Execution Handoff

After saving the plan, ask for approval:

End every plan document with:

---
**READY?** Proceed / Modify: [changes] / Different approach: [alternative]

**"Plan complete and saved to `docs/plans/<filename>.md`. Ready to execute?"**

**If approved:**
- **REQUIRED SUB-SKILL:** Use sp-ecc:subagent-driven-development
- Stay in this session
- Fresh subagent per task + multi-stage review (spec, quality, security, verification gate)
