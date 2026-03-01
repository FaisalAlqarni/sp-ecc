# Django Testing

> This file extends [common/testing.md](../common/testing.md) with Django specific content.

## Framework

Use **pytest-django** as the testing framework.

## Database Access

```python
import pytest

@pytest.mark.django_db
def test_create_user():
    user = User.objects.create(name="Test")
    assert user.pk is not None
```

## DRF Testing

```python
from rest_framework.test import APIClient

def test_list_users(db):
    client = APIClient()
    response = client.get("/api/users/")
    assert response.status_code == 200
```

## Fixtures

Use **factory_boy** for test data:

```python
import factory

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    name = factory.Faker("name")
    email = factory.Faker("email")
```

## Coverage

```bash
pytest --cov=apps --cov-report=term-missing
```

## Reference

See skill: `django-tdd` for comprehensive Django TDD patterns.
