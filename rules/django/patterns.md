# Django Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Django specific content.

## Service Layer

```python
# WRONG: Business logic in views
class UserView(APIView):
    def post(self, request):
        user = User.objects.create(**request.data)
        send_welcome_email(user)  # Business logic in view!

# CORRECT: Delegate to service
class UserView(APIView):
    def post(self, request):
        user = UserService.create(request.data)
```

## Custom QuerySets

```python
class ActiveUserManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)
```

## Signals vs Explicit Calls

Prefer explicit service calls over signals. Signals make control flow invisible and debugging harder. Use signals only for truly decoupled cross-cutting concerns.

## Caching

Use `@cache_page` for view caching, `cache.get`/`cache.set` for manual caching. Always set TTL.

## Reference

See skill: `django-patterns` for comprehensive patterns including middleware and async views.
