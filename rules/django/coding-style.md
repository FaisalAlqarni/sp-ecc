# Django Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Django specific content.

## Settings

Use split settings pattern:

```
settings/
├── base.py      # Shared settings
├── dev.py       # Development overrides
├── prod.py      # Production overrides
└── test.py      # Test overrides
```

## App Naming

- Use lowercase, singular app names: `user`, `payment`, `notification`
- Each app owns one bounded context

## Model Field Ordering

1. Primary key (if custom)
2. ForeignKey / OneToOneField
3. CharField, TextField, etc.
4. DateTimeField (created_at, updated_at)
5. Meta class

## DRF Serializers

- Use `ModelSerializer` for CRUD, `Serializer` for custom logic
- Validate at serializer level, not in views

## Reference

See skill: `django-patterns` for comprehensive Django patterns.
