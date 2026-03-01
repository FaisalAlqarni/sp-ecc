# Ruby Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Ruby specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **RuboCop**: Auto-correct `.rb` files after edit (`rubocop -a`)
- **Sorbet/Steep**: Run type checking after editing `.rb` files (if configured)

## Warnings

- Warn about `puts`, `pp`, `p` debug statements in production code
- Warn about `binding.pry` / `byebug` debugger statements
