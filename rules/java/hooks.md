# Java Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Java specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Google Java Format / Spotless**: Auto-format `.java` files after edit
- **Build check**: Run `mvn compile` or `gradle build` after edits
- **Static analysis**: SpotBugs or Error Prone for bug detection
