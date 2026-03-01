# Rails Security

> This file extends [common/security.md](../common/security.md) with Rails specific content.

## Static Analysis

Run **Brakeman** for Rails-specific security scanning:

```bash
brakeman --no-pager -q
```

## Built-in Protections

- CSRF: `verify_authenticity_token` (enabled by default)
- XSS: Output escaping in ERB (enabled by default)
- SQLi: Parameterized queries via ActiveRecord (always use)

## Authorization

Use **Pundit** or **CanCanCan** for authorization. Never rely on controller-level checks alone.

## Secrets

Use `credentials.yml.enc` for secrets:

```bash
rails credentials:edit
```

Enable `config.force_ssl = true` in production.

## Reference

See skill: `rails-security` for comprehensive Rails security guidelines.
