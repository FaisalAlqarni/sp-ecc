# Flutter Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Flutter specific content.

## Widget Principles

- Prefer `StatelessWidget` over `StatefulWidget` when possible
- Use `const` constructors for all stateless widgets
- Provide `Key` parameters for list items and animated widgets
- Extract widgets when nesting exceeds 3-4 levels

## Structure

```dart
// WRONG: Deep nesting
Widget build(context) => Scaffold(
  body: Center(
    child: Column(
      children: [
        // 10+ nested widgets...
      ],
    ),
  ),
);

// CORRECT: Extract sub-widgets
Widget build(context) => Scaffold(body: _buildContent());

Widget _buildContent() => Center(child: Column(children: [...]));
```

## Linting

Use `flutter_lints` package for comprehensive lint rules.

## Reference

See skill: `flutter-patterns` for comprehensive Flutter patterns and widget composition.
