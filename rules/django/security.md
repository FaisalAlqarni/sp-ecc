# Django Security

> This file extends [common/security.md](../common/security.md) with Django specific content.

## Deployment Checklist

```bash
python manage.py check --deploy
```

## Settings Checklist

Ensure these are set in production:
- `SECURE_SSL_REDIRECT = True`
- `SECURE_HSTS_SECONDS = 31536000`
- `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`

## ORM Security

```python
# NEVER: String formatting in queries
User.objects.raw(f"SELECT * FROM user WHERE name = '{name}'")

# ALWAYS: Parameterized queries
User.objects.filter(name=name)
```

## Brute-Force Protection

Use **django-axes** for login attempt limiting.

## Secret Management

Use environment variables. Never commit secrets to `.env` files in version control.

## Reference

See skill: `django-security` for comprehensive Django security guidelines.
