# Dart Testing

> This file extends [common/testing.md](../common/testing.md) with Dart specific content.

## Framework

Use the built-in `dart test` framework.

## Coverage

```bash
dart test --coverage=coverage
dart pub global run coverage:format_coverage --lcov -i coverage -o coverage/lcov.info
```

## Test Organization

Mirror `lib/src/` structure in `test/`:

```
lib/src/services/auth_service.dart
test/services/auth_service_test.dart
```

## Mocking

Use `package:mockito` with code generation:

```dart
@GenerateNiceMocks([MockSpec<AuthService>()])
import 'auth_service_test.mocks.dart';
```

## Reference

See skill: `dart-testing` for detailed Dart testing patterns.
