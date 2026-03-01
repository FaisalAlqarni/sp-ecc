# Django Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Django specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **black/ruff**: Auto-format `.py` files after edit (`ruff format` or `black`)
- **Model check**: Run `python manage.py check` after editing model files
- **Migration check**: Run `python manage.py makemigrations --check` after model field changes

## Warnings

- Warn about `print()` statements (use `logging` module instead)
- Warn about `import pdb` / `breakpoint()` debugger statements
