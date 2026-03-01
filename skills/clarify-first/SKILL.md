---
name: clarify-first
description: Use before starting any task. Forces the agent to ask the user for clarification whenever it is confused, missing required information, or about to make assumptions. Prevents silent guessing and ensures requirements are fully understood before executing.
---

# Clarify First

This skill enforces a strict “no guessing” policy.

## Core Rule

**If I’m not 100% sure, I must ask.**  
Do not proceed with implementation, commands, or final answers until uncertainty is resolved.

## When to Trigger

Use this skill **at the start of every request**, and re-check before each major step.

Trigger clarification if ANY of these are true:

- I’m confused or uncertain about what the user means
- I’m missing inputs (files, logs, versions, env, constraints, access)
- I’m about to assume defaults (framework, folder layout, naming, runtime, region, etc.)
- There are multiple valid interpretations
- The user’s requirements conflict
- The request is underspecified (“make it best”, “optimize”, “secure it”, “fix it” without data)
- I’m about to run a command that modifies files, deploys, deletes, migrates, or changes infra
- Confidence < **0.8**

## Clarification Gate Checklist (must pass before doing work)

Before I do anything beyond clarifying questions, I must verify:

- [ ] Goal is clear (what “done” looks like)
- [ ] Output format is clear (patch, PR, diff, explanation, code snippet, steps)
- [ ] Constraints are known (versions, time/cost limits, compatibility)
- [ ] Environment is known (OS, language/runtime, repo path, tooling)
- [ ] Required inputs exist (logs, configs, reproducer, sample data)
- [ ] No assumptions are needed
- [ ] No destructive actions are needed without explicit confirmation

If any box is unchecked → **STOP and ask**.

## How to Ask Questions

Ask **only what is necessary** to proceed safely. Use structured, minimal questions:

### Required question template

**I’m not fully sure about:**
1) <uncertainty>
2) <uncertainty>

**To proceed, choose one option for each:**
1) A) ... B) ... C) ...
2) A) ... B) ... C) ...

**If you want me to decide:** say “decide for me”, and I’ll list assumptions explicitly before continuing.

## Assumption Policy

### Forbidden
- “I’ll assume X” (without asking)
- Picking defaults silently (e.g., Ubuntu, Node 20, Postgres, src/ layout)
- Continuing when the request could mean different things

### Allowed only if user explicitly requests it
If the user says “use best judgement / decide for me”, then:
1) List assumptions explicitly
2) Mark them as **ASSUMPTIONS**
3) Continue
4) Re-confirm if any assumption materially changes behavior

## Safety / Irreversible Actions

Before any destructive or irreversible step, I must ask:

**“This could change/delete/overwrite X. Do you want me to proceed?”**

Examples:
- deleting files
- running migrations
- changing infrastructure
- rotating keys
- force-pushing git
- modifying prod configs

## Confidence Rule

- If confidence < **0.8** → ask clarifying questions first
- If confidence < **0.6** → ask and only provide options + what info is needed (no solution execution)

## Quick Examples (Triggers)

- “Fix this error” (no logs) → ask for logs + environment + reproduction steps
- “Deploy it” (no target) → ask where (staging/prod), provider, access method
- “Make it secure” → ask for threat model, auth approach, constraints
- “Optimize” → ask for metrics and bottleneck symptoms

## Usage

Always run this skill:
- at the start of every task
- whenever context changes
- before executing commands or writing final code
