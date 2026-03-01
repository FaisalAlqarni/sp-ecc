# Spring Boot Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Spring Boot specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Spotless / Google Java Format**: Auto-format `.java` files after edit
- **Build check**: Run `mvn compile` after edits
- **Integration tests**: Run `mvn verify` after changes to test files
