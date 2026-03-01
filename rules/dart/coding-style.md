# Dart Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Dart specific content.

## Standards

- Follow **Effective Dart** guidelines
- Run `dart format` on all files (mandatory)
- `lowerCamelCase` for variables, functions, parameters
- `UpperCamelCase` for classes, enums, type aliases
- Prefer `final` and `const` — mutability only when necessary

## Null Safety

```dart
// WRONG: Force unwrap
String name = nullableName!;

// CORRECT: Handle null explicitly
String name = nullableName ?? 'Unknown';
// or
if (nullableName case final name?) {
  use(name);
}
```

## Analysis

Enable strict mode in `analysis_options.yaml`:

```yaml
analyzer:
  strict-casts: true
  strict-inference: true
  strict-raw-types: true
```

## Reference

See skill: `dart-patterns` for comprehensive Dart idioms and patterns.
