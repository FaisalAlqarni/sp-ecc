# Dart Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Dart specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **dart format**: Auto-format `.dart` files after edit
- **dart analyze**: Run analysis after editing `.dart` files
- **dart fix**: Apply auto-fixes with `dart fix --apply`

## Warnings

- Warn about `print()` statements in production code (use `logging` package instead)
