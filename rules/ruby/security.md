# Ruby Security

> This file extends [common/security.md](../common/security.md) with Ruby specific content.

## Static Analysis

Use **Brakeman** for security scanning:

```bash
brakeman --no-pager
```

## Dependency Auditing

```bash
bundle audit check --update
```

## Secret Management

```ruby
# NEVER: Hardcoded secrets
api_key = "sk-xxxxx"

# ALWAYS: Environment variables
api_key = ENV.fetch("API_KEY")
```

Use `dotenv` for development, environment variables in production.

## Reference

See skill: `ruby-patterns` for comprehensive security guidelines.
