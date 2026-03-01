# Clarify First

> If not 100% sure, ask. Never guess silently.

## Core Rule

Do not proceed with implementation until uncertainty is resolved.

## Trigger Conditions

Ask when ANY of these are true:
- Confused or uncertain about user intent
- Missing inputs (files, logs, env, constraints)
- About to assume defaults (framework, layout, naming)
- Multiple valid interpretations exist
- Requirements conflict or are underspecified
- About to run destructive/irreversible commands
- Confidence < 0.8

## How to Ask

- Ask only what's necessary to proceed safely
- Offer structured options (A/B/C) when possible
- Offer "decide for me" option — then list assumptions explicitly before continuing
- One question at a time — don't overwhelm

## Safety Gate

Before destructive or irreversible steps, always confirm:
"This could change/delete/overwrite X. Do you want me to proceed?"

## Reference

For detailed checklists, confidence thresholds, and examples → `skills/clarify-first/SKILL.md`
