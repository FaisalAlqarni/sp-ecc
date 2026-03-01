# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level — no swallowed exceptions, no empty catch blocks
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (~70 lines target)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)

## Elegance Check (Non-Trivial Changes Only)

- Pause after implementation: "Is there a more elegant way?"
- If fix feels hacky: rewrite with full context — "Knowing everything I know now, implement the elegant solution"
- Skip for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

## Minimal Impact

- Changes should only touch what's necessary
- No "while I'm here" improvements outside the task scope
- Avoid introducing bugs by limiting blast radius

## Function Length

- Target ~70 lines per function — longer is a code smell
- Consider splitting, but use judgment for edge cases (switch statements, test setup)
- Split strategy: parent handles control flow, helpers handle computation
- "Push ifs up, fors down"

## Variable Scope

- Declare at smallest possible scope
- Calculate and check variables close to where they are used
- Don't introduce variables before they are needed

## Naming Discipline

- No abbreviations unless primitive loop counters
- Add units and qualifiers last, sorted by descending significance (`latency_ms_max` not `max_latency_ms`)
- Get nouns and verbs right — great names capture what a thing is or does

## Assertions

- Assert pre/postconditions at function boundaries
- Validate arguments and return values at system boundaries

## Comments

- Explain "why", not "what" — the code shows what, comments show reasoning
- Always motivate decisions — explain the rationale
- Comments are well-written sentences, not scribblings in the margin

## Zero Technical Debt

- Code shipped is solid — features may be incomplete, but what exists meets quality standards
- Problems discovered early cost less — fix now, not later
- No deferred fixes in production code paths
