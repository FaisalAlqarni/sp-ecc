# Flutter Testing

> This file extends [common/testing.md](../common/testing.md) with Flutter specific content.

## Test Types

- **Unit tests**: Business logic, services, models
- **Widget tests**: `testWidgets()` for component behavior
- **Integration tests**: `integration_test` package for full app flows
- **Golden tests**: Snapshot visual regression testing

## Widget Testing

```dart
testWidgets('shows greeting', (tester) async {
  await tester.pumpWidget(const MyApp());
  expect(find.text('Hello'), findsOneWidget);
});
```

## Mock Navigation

Use mock `NavigatorObserver` or GoRouter test helpers for navigation testing.

## Reference

See skill: `flutter-verification` for comprehensive Flutter testing strategies.
