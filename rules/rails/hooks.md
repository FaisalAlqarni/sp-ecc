# Rails Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Rails specific content.

## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **RuboCop-Rails**: Auto-correct `.rb` files after edit (`rubocop -a --require rubocop-rails`)
- **Route check**: Run `rails routes` after editing `config/routes.rb`
- **Migration check**: Run `rails db:migrate:status` after editing migration files
