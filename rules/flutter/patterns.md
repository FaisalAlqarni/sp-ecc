# Flutter Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Flutter specific content.

## State Management

Choose based on app complexity:
- **Provider**: Simple apps, dependency injection
- **Riverpod**: Type-safe, testable, no context dependency
- **Bloc/Cubit**: Event-driven, complex state machines

## Repository Pattern

```dart
abstract class UserRepository {
  Future<User> getById(String id);
  Future<List<User>> getAll();
  Future<void> save(User user);
}

class ApiUserRepository implements UserRepository {
  // Implementation with HTTP client
}
```

## Dependency Injection

Use constructor injection. Register dependencies at app startup.

## Navigation

Use **GoRouter** for declarative, type-safe routing.

## Reference

See skill: `flutter-patterns` for comprehensive state management and architecture patterns.
