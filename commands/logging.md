---
description: "Audit, plan, and refactor logging code to follow wide events best practices"
disable-model-invocation: true
---

Invoke the **logging-reviewer** agent to audit and improve logging in this codebase.

## Pipeline

Run these phases in order. If `$ARGUMENTS` specifies a phase, jump directly to it.

### Phase 1: Audit

Scan the codebase for:
- Scattered log statements (console.log, puts, Rails.logger, Debug.WriteLine, print, logging.*)
- Multiple logger instances in the same service
- Missing context (no request ID, no timing, no outcome)
- Unstructured string interpolation in log calls
- Secrets, tokens, or PII in log output
- Log calls outside finally/ensure blocks for request-level events

Output a summary table of violations grouped by file.

### Phase 2: Plan

For each group of violations, propose a migration to the wide events pattern:
- Which middleware should capture shared context
- What fields belong in the wide event
- Where the wide event should be emitted (finally/ensure block)
- What scattered logs can be removed vs. kept as debug-only

### Phase 3: Refactor

Implement the plan from Phase 2 following the **logging-best-practices** skill.

### Phase 4: Verify

- Re-run the Phase 1 audit to confirm violations are resolved
- Invoke the **code-reviewer** agent on all modified files
- Report final status

## Arguments

`$ARGUMENTS` can be:
- `audit` — Phase 1 only
- `plan` — Phases 1-2
- `refactor` — Phases 1-3
- `full` — All phases (default)
- A file path or glob — scope the audit to specific files
