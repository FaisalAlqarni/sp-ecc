# Dart Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Dart specific content.

## Result/Either Pattern

```dart
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T value;
  const Success(this.value);
}

class Failure<T> extends Result<T> {
  final String message;
  const Failure(this.message);
}
```

## Sealed Classes

Use sealed classes for exhaustive pattern matching:

```dart
sealed class AuthState {}
class Authenticated extends AuthState { final User user; Authenticated(this.user); }
class Unauthenticated extends AuthState {}
class Loading extends AuthState {}
```

## Immutability

Use `copyWith` pattern for immutable updates:

```dart
class User {
  final String name;
  final String email;
  const User({required this.name, required this.email});

  User copyWith({String? name, String? email}) =>
    User(name: name ?? this.name, email: email ?? this.email);
}
```

## Reference

See skill: `dart-patterns` for comprehensive patterns including extension methods and factory constructors.
