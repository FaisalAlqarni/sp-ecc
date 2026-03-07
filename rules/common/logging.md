# Logging Best Practices

## Core Principle: Wide Events

Strive for a single, rich log event per request or unit of work — a "wide event" (canonical log line).
This is a goal to work toward, not an absolute rule. Start by consolidating scattered logs into fewer, richer events.

## What Every Wide Event Must Include

- Request/operation identifier (trace ID, request ID)
- Timing information (duration_ms)
- Outcome (status, success/failure, error class)
- Business context relevant to the operation (user ID, resource ID, action performed)

## Structural Rules

- **Single logger instance** — one logger per service/class, not ad-hoc loggers
- **Middleware-based context** — attach shared fields (request ID, user, timing) in middleware, not scattered through handlers
- **JSON output** — structured, machine-parseable format in production
- **Two log levels** — INFO for wide events, ERROR for unexpected failures. Avoid DEBUG/TRACE in production
- **Consistent field names** — use the same keys across services (e.g., `duration_ms`, `user_id`, `status`)

## Safety

- Always emit the wide event in a `finally`/`ensure` block so it fires even on failure
- Wrap logger calls defensively — a logging failure must never crash the application
- **Never log secrets, tokens, passwords, or PII** — redact or omit sensitive fields

## Anti-Patterns

- Scattered `console.log` / `puts` / `Debug.WriteLine` throughout handler code
- Multiple logger instances in the same service
- Missing context — logs that lack IDs, timing, or outcome
- Unstructured string interpolation instead of structured key-value pairs
- Logging at many granular levels (TRACE, DEBUG, INFO, WARN, ERROR) in production
