# Checkpoint Command

Create or verify a checkpoint in your workflow.

## Usage

`/sp-ecc:checkpoint [create|verify|list] [name]`

## Create Checkpoint

When creating a checkpoint:

1. Run `/sp-ecc:verify quick` to ensure current state is clean
2. Log checkpoint to `.claude/checkpoints.log`:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

3. Report checkpoint created with note: "User should create git stash or commit manually if desired"

## Verify Checkpoint

When verifying against a checkpoint:

1. Read checkpoint from log
2. Compare current state to checkpoint:
   - Files added since checkpoint
   - Files modified since checkpoint
   - Test pass rate now vs then
   - Coverage now vs then

3. Report:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## List Checkpoints

Show all checkpoints with:
- Name
- Timestamp
- Git SHA
- Status (current, behind, ahead)

## Workflow

Typical checkpoint flow:

```
[Start] --> /sp-ecc:checkpoint create "feature-start"
   |
[Implement] --> /sp-ecc:checkpoint create "core-done"
   |
[Test] --> /sp-ecc:checkpoint verify "core-done"
   |
[Refactor] --> /sp-ecc:checkpoint create "refactor-done"
   |
[PR] --> /sp-ecc:checkpoint verify "feature-start"
```

## Arguments

$ARGUMENTS:
- `create <name>` - Create named checkpoint
- `verify <name>` - Verify against named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keeps last 5)

## Git Policy

This command uses git for context only (status, diff, log).
No git write operations are performed.
You remain in your current directory and branch.
