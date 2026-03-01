---
name: flutter-verification
description: Use when verifying Flutter applications - covers widget tests, integration tests, golden tests, performance testing, and build validation
---

# Flutter Verification and Testing

Comprehensive Flutter verification patterns covering widget tests, integration tests, golden tests, performance testing, platform verification, accessibility, build validation, asset verification, localization coverage, and code quality checks.

## Widget Testing Fundamentals

### Basic Widget Tests

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

void main() {
  group('CounterWidget', () {
    testWidgets('displays initial count', (WidgetTester tester) async {
      // Build the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: CounterWidget(initialCount: 5),
        ),
      );

      // Verify initial state
      expect(find.text('5'), findsOneWidget);
      expect(find.text('6'), findsNothing);
    });

    testWidgets('increments counter on button tap', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: CounterWidget(initialCount: 0),
        ),
      );

      // Find and tap the increment button
      final incrementButton = find.byIcon(Icons.add);
      await tester.tap(incrementButton);
      await tester.pump(); // Trigger rebuild

      // Verify updated state
      expect(find.text('1'), findsOneWidget);
    });

    testWidgets('enters text in input field', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: FormWidget(),
        ),
      );

      // Find text field
      final textField = find.byType(TextField);

      // Enter text
      await tester.enterText(textField, 'Hello Flutter');
      await tester.pump();

      // Verify text was entered
      expect(find.text('Hello Flutter'), findsOneWidget);
    });
  });
}
```

### Advanced Widget Finders

```dart
void main() {
  testWidgets('finds widgets using various finders', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          appBar: AppBar(title: const Text('Test App')),
          body: Column(
            children: [
              const Text('Welcome', key: Key('welcome-text')),
              ElevatedButton(
                onPressed: () {},
                child: const Text('Submit'),
              ),
              const Icon(Icons.home),
            ],
          ),
        ),
      ),
    );

    // Find by text
    expect(find.text('Welcome'), findsOneWidget);
    expect(find.text('Submit'), findsOneWidget);

    // Find by key
    expect(find.byKey(const Key('welcome-text')), findsOneWidget);

    // Find by type
    expect(find.byType(ElevatedButton), findsOneWidget);
    expect(find.byType(Icon), findsOneWidget);

    // Find by icon
    expect(find.byIcon(Icons.home), findsOneWidget);

    // Find by widget
    expect(find.byWidget(const Text('Welcome', key: Key('welcome-text'))), findsOneWidget);

    // Find descendant
    expect(
      find.descendant(
        of: find.byType(AppBar),
        matching: find.text('Test App'),
      ),
      findsOneWidget,
    );

    // Find ancestor
    expect(
      find.ancestor(
        of: find.text('Welcome'),
        matching: find.byType(Column),
      ),
      findsOneWidget,
    );

    // Find with predicate
    expect(
      find.byWidgetPredicate(
        (widget) => widget is Text && widget.data == 'Welcome',
      ),
      findsOneWidget,
    );
  });
}
```

### Testing User Interactions

```dart
void main() {
  testWidgets('handles complex user interactions', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: TodoApp()));

    // Enter text in todo input
    await tester.enterText(find.byType(TextField), 'Buy groceries');
    await tester.pump();

    // Tap add button
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Verify todo was added
    expect(find.text('Buy groceries'), findsOneWidget);

    // Long press on todo
    await tester.longPress(find.text('Buy groceries'));
    await tester.pumpAndSettle(); // Wait for animations

    // Verify context menu appeared
    expect(find.text('Delete'), findsOneWidget);

    // Tap delete
    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();

    // Verify todo was deleted
    expect(find.text('Buy groceries'), findsNothing);
  });

  testWidgets('handles scrolling', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ListView.builder(
            itemCount: 100,
            itemBuilder: (context, index) => ListTile(
              title: Text('Item $index'),
            ),
          ),
        ),
      ),
    );

    // Verify first item is visible
    expect(find.text('Item 0'), findsOneWidget);
    expect(find.text('Item 50'), findsNothing);

    // Scroll to item
    await tester.scrollUntilVisible(
      find.text('Item 50'),
      500.0, // Scroll delta
    );
    await tester.pumpAndSettle();

    // Verify item is now visible
    expect(find.text('Item 50'), findsOneWidget);

    // Drag to scroll
    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();
  });

  testWidgets('handles gestures', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: GestureTestWidget()));

    // Tap
    await tester.tap(find.byType(GestureDetector));
    await tester.pump();

    // Double tap
    await tester.tap(find.byType(GestureDetector));
    await tester.pump(const Duration(milliseconds: 50));
    await tester.tap(find.byType(GestureDetector));
    await tester.pumpAndSettle();

    // Drag
    await tester.drag(find.byType(GestureDetector), const Offset(100, 0));
    await tester.pumpAndSettle();

    // Fling
    await tester.fling(find.byType(GestureDetector), const Offset(0, -200), 1000);
    await tester.pumpAndSettle();
  });
}
```

### Testing Async Operations

```dart
void main() {
  testWidgets('handles async data loading', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AsyncDataWidget()));

    // Initially shows loading indicator
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Data loaded'), findsNothing);

    // Wait for async operation to complete
    await tester.pumpAndSettle();

    // Verify data is loaded
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.text('Data loaded'), findsOneWidget);
  });

  testWidgets('handles delayed animations', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AnimatedWidget()));

    // Pump frames for specific duration
    await tester.pump(const Duration(milliseconds: 100));
    await tester.pump(const Duration(milliseconds: 200));

    // Or pump until all animations complete
    await tester.pumpAndSettle();
  });

  testWidgets('tests with fake async', (WidgetTester tester) async {
    await tester.runAsync(() async {
      // Code that uses real async operations
      final response = await http.get(Uri.parse('https://api.example.com/data'));
      expect(response.statusCode, 200);
    });
  });
}
```

### Mocking Dependencies

```dart
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

// Generate mocks
@GenerateMocks([UserRepository, AuthService])
void main() {
  late MockUserRepository mockUserRepository;
  late MockAuthService mockAuthService;

  setUp(() {
    mockUserRepository = MockUserRepository();
    mockAuthService = MockAuthService();
  });

  testWidgets('displays user data from repository', (WidgetTester tester) async {
    // Setup mock
    when(mockUserRepository.getUser('123'))
        .thenAnswer((_) async => User(id: '123', name: 'John Doe'));

    // Build widget with mock
    await tester.pumpWidget(
      MaterialApp(
        home: UserProfilePage(
          userId: '123',
          repository: mockUserRepository,
        ),
      ),
    );

    // Wait for async operation
    await tester.pumpAndSettle();

    // Verify user data is displayed
    expect(find.text('John Doe'), findsOneWidget);

    // Verify repository was called
    verify(mockUserRepository.getUser('123')).called(1);
  });

  testWidgets('handles authentication errors', (WidgetTester tester) async {
    // Setup mock to throw error
    when(mockAuthService.login(any, any))
        .thenThrow(AuthException('Invalid credentials'));

    await tester.pumpWidget(
      MaterialApp(
        home: LoginPage(authService: mockAuthService),
      ),
    );

    // Enter credentials
    await tester.enterText(find.byKey(const Key('email')), 'test@example.com');
    await tester.enterText(find.byKey(const Key('password')), 'wrong_password');

    // Tap login
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Verify error message is shown
    expect(find.text('Invalid credentials'), findsOneWidget);

    // Verify login was attempted
    verify(mockAuthService.login('test@example.com', 'wrong_password')).called(1);
  });
}
```

## Integration Testing

### Full App Integration Tests

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('end-to-end test', () {
    testWidgets('complete user flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Verify splash screen or initial page
      expect(find.text('Welcome'), findsOneWidget);

      // Navigate to login
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(find.byType(TextField).first, 'test@example.com');
      await tester.enterText(find.byType(TextField).at(1), 'password123');

      // Submit login
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify home page
      expect(find.text('Home'), findsOneWidget);

      // Navigate through app
      await tester.tap(find.byIcon(Icons.settings));
      await tester.pumpAndSettle();

      expect(find.text('Settings'), findsOneWidget);

      // Logout
      await tester.tap(find.text('Logout'));
      await tester.pumpAndSettle();

      // Verify back at welcome screen
      expect(find.text('Welcome'), findsOneWidget);
    });

    testWidgets('data persistence across app restarts', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Add data
      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), 'Test item');
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      // Verify data exists
      expect(find.text('Test item'), findsOneWidget);

      // Restart app
      await tester.restartAndRestore();

      // Verify data persisted
      expect(find.text('Test item'), findsOneWidget);
    });
  });

  group('navigation flow', () {
    testWidgets('deep linking works correctly', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Simulate deep link
      // This depends on your routing setup
      await tester.tap(find.text('Open Product'));
      await tester.pumpAndSettle();

      expect(find.text('Product Details'), findsOneWidget);
    });

    testWidgets('back button navigation', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate forward
      await tester.tap(find.text('Next Page'));
      await tester.pumpAndSettle();

      // Press back
      await tester.pageBack();
      await tester.pumpAndSettle();

      // Verify returned to previous page
      expect(find.text('Home'), findsOneWidget);
    });
  });
}
```

### Multi-Screen Integration Tests

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('e-commerce checkout flow', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Browse products
    expect(find.text('Products'), findsOneWidget);

    // Add item to cart
    await tester.tap(find.text('Add to Cart').first);
    await tester.pumpAndSettle();

    // Verify cart badge
    expect(find.text('1'), findsOneWidget);

    // Go to cart
    await tester.tap(find.byIcon(Icons.shopping_cart));
    await tester.pumpAndSettle();

    // Verify item in cart
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Product Name'), findsOneWidget);

    // Proceed to checkout
    await tester.tap(find.text('Checkout'));
    await tester.pumpAndSettle();

    // Fill shipping info
    await tester.enterText(find.byKey(const Key('address')), '123 Main St');
    await tester.enterText(find.byKey(const Key('city')), 'Springfield');
    await tester.enterText(find.byKey(const Key('zip')), '12345');

    // Continue to payment
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();

    // Enter payment details
    await tester.enterText(find.byKey(const Key('card_number')), '4242424242424242');
    await tester.enterText(find.byKey(const Key('expiry')), '12/25');
    await tester.enterText(find.byKey(const Key('cvv')), '123');

    // Complete purchase
    await tester.tap(find.text('Place Order'));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    // Verify order confirmation
    expect(find.text('Order Confirmed'), findsOneWidget);
    expect(find.textContaining('Order #'), findsOneWidget);
  });
}
```

### Testing with Real APIs (Optional)

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('API integration tests', () {
    testWidgets('fetches and displays real data', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Wait for API call to complete
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Verify data from API is displayed
      expect(find.byType(ListTile), findsWidgets);
    });

    testWidgets('handles network errors gracefully', (WidgetTester tester) async {
      // Configure app to use invalid API endpoint
      app.main(apiUrl: 'https://invalid-url-that-will-fail.com');
      await tester.pumpAndSettle();

      // Wait for error state
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Verify error message is shown
      expect(find.text('Unable to load data'), findsOneWidget);

      // Test retry functionality
      await tester.tap(find.text('Retry'));
      await tester.pumpAndSettle(const Duration(seconds: 5));
    });
  });
}
```

## Golden Tests (Visual Regression Testing)

### Basic Golden Tests

```dart
void main() {
  testWidgets('matches golden file', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Hello World'),
          ),
        ),
      ),
    );

    // Compare against golden file
    await expectLater(
      find.byType(MaterialApp),
      matchesGoldenFile('golden/hello_world.png'),
    );
  });

  testWidgets('matches golden with custom size', (WidgetTester tester) async {
    // Set specific screen size
    await tester.binding.setSurfaceSize(const Size(400, 600));

    await tester.pumpWidget(
      MaterialApp(
        home: ProductCard(
          title: 'Test Product',
          price: '\$99.99',
          imageUrl: 'https://example.com/image.jpg',
        ),
      ),
    );

    await expectLater(
      find.byType(ProductCard),
      matchesGoldenFile('golden/product_card.png'),
    );

    // Reset size
    await tester.binding.setSurfaceSize(null);
  });
}
```

### Golden Tests for Different States

```dart
void main() {
  group('button states golden tests', () {
    testWidgets('default state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ElevatedButton(
            onPressed: () {},
            child: const Text('Click Me'),
          ),
        ),
      );

      await expectLater(
        find.byType(ElevatedButton),
        matchesGoldenFile('golden/button_default.png'),
      );
    });

    testWidgets('disabled state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ElevatedButton(
            onPressed: null,
            child: Text('Click Me'),
          ),
        ),
      );

      await expectLater(
        find.byType(ElevatedButton),
        matchesGoldenFile('golden/button_disabled.png'),
      );
    });

    testWidgets('hover state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ElevatedButton(
            onPressed: () {},
            child: const Text('Click Me'),
          ),
        ),
      );

      // Simulate hover
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);
      await tester.pump();

      await gesture.moveTo(tester.getCenter(find.byType(ElevatedButton)));
      await tester.pumpAndSettle();

      await expectLater(
        find.byType(ElevatedButton),
        matchesGoldenFile('golden/button_hover.png'),
      );
    });
  });
}
```

### Golden Tests for Themes

```dart
void main() {
  group('theme golden tests', () {
    testWidgets('light theme', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: const HomePage(),
        ),
      );

      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('golden/home_page_light.png'),
      );
    });

    testWidgets('dark theme', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: const HomePage(),
        ),
      );

      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('golden/home_page_dark.png'),
      );
    });
  });
}
```

### Golden Tests for Responsive Layouts

```dart
void main() {
  group('responsive layout golden tests', () {
    testWidgets('mobile layout', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 667)); // iPhone SE

      await tester.pumpWidget(
        const MaterialApp(home: ResponsivePage()),
      );

      await expectLater(
        find.byType(ResponsivePage),
        matchesGoldenFile('golden/responsive_mobile.png'),
      );
    });

    testWidgets('tablet layout', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(768, 1024)); // iPad

      await tester.pumpWidget(
        const MaterialApp(home: ResponsivePage()),
      );

      await expectLater(
        find.byType(ResponsivePage),
        matchesGoldenFile('golden/responsive_tablet.png'),
      );
    });

    testWidgets('desktop layout', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1920, 1080));

      await tester.pumpWidget(
        const MaterialApp(home: ResponsivePage()),
      );

      await expectLater(
        find.byType(ResponsivePage),
        matchesGoldenFile('golden/responsive_desktop.png'),
      );
    });

    tearDown(() async {
      await tester.binding.setSurfaceSize(null);
    });
  });
}
```

## Performance Testing

### Frame Rendering Performance

```dart
import 'package:flutter/scheduler.dart';

void main() {
  testWidgets('measures frame rendering performance', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: PerformanceTestPage()));

    // Start performance tracking
    final timeline = await tester.binding.traceAction(() async {
      // Perform action that triggers animations
      await tester.tap(find.byIcon(Icons.play_arrow));

      // Let animation run for 2 seconds
      await tester.pumpAndSettle(const Duration(seconds: 2));
    });

    // Analyze timeline
    final summary = TimelineSummary.summarize(timeline);

    // Assert performance metrics
    expect(summary.countFrames(), greaterThan(0));

    // Check for frame drops (frames taking longer than 16ms)
    final frameTimes = summary.computeFrameTimes();
    final droppedFrames = frameTimes.where((time) => time > const Duration(milliseconds: 16));

    expect(droppedFrames.length, lessThan(frameTimes.length * 0.1)); // Less than 10% dropped frames
  });

  testWidgets('tests scrolling performance', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ListView.builder(
            itemCount: 10000,
            itemBuilder: (context, index) => ListTile(
              title: Text('Item $index'),
              leading: const CircleAvatar(),
              subtitle: Text('Subtitle $index'),
            ),
          ),
        ),
      ),
    );

    final timeline = await tester.binding.traceAction(() async {
      // Perform fast scroll
      await tester.fling(
        find.byType(ListView),
        const Offset(0, -5000),
        5000,
      );
      await tester.pumpAndSettle();
    });

    final summary = TimelineSummary.summarize(timeline);

    // Verify smooth scrolling
    expect(summary.countFrames(), greaterThan(30)); // At least 30 frames

    final avgFrameTime = summary.computeAverageFrameTime();
    expect(avgFrameTime.inMilliseconds, lessThan(16)); // Under 60fps threshold
  });
}
```

### Memory Profiling

```dart
void main() {
  testWidgets('monitors memory usage', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: MemoryTestPage()));

    // Get initial memory
    final initialMemory = tester.binding.window.physicalSize.width *
                          tester.binding.window.physicalSize.height * 4;

    // Perform memory-intensive operations
    for (int i = 0; i < 100; i++) {
      await tester.tap(find.text('Add Image'));
      await tester.pump();
    }

    await tester.pumpAndSettle();

    // Check for memory leaks by ensuring widgets are properly disposed
    // This is a simplified check - use DevTools for detailed memory profiling
    await tester.pumpWidget(Container());
    await tester.pump();

    // Verify no lingering state
  });

  testWidgets('checks for widget rebuild efficiency', (WidgetTester tester) async {
    int buildCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: StatefulBuilder(
          builder: (context, setState) {
            buildCount++;
            return Column(
              children: [
                const Text('Static Widget'),
                ElevatedButton(
                  onPressed: () => setState(() {}),
                  child: const Text('Rebuild'),
                ),
              ],
            );
          },
        ),
      ),
    );

    final initialBuildCount = buildCount;

    // Trigger rebuild
    await tester.tap(find.text('Rebuild'));
    await tester.pump();

    // Should only rebuild once
    expect(buildCount, equals(initialBuildCount + 1));
  });
}
```

### Timeline Analysis

```dart
import 'dart:convert';
import 'dart:io';

void main() {
  testWidgets('generates performance report', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: TestPage()));

    final timeline = await tester.binding.traceAction(() async {
      // Complex UI operations
      await tester.tap(find.text('Load Data'));
      await tester.pumpAndSettle();

      await tester.drag(find.byType(ListView), const Offset(0, -500));
      await tester.pumpAndSettle();
    });

    final summary = TimelineSummary.summarize(timeline);

    // Write summary to file
    await summary.writeSummaryToFile('performance_summary', pretty: true);
    await summary.writeTimelineToFile('timeline', pretty: true);

    // Analyze specific events
    final buildEvents = timeline.events!
        .where((event) => event.name == 'Frame')
        .toList();

    print('Total frames: ${buildEvents.length}');

    // Check for expensive operations
    final expensiveEvents = timeline.events!
        .where((event) => event.duration != null && event.duration!.inMilliseconds > 100)
        .toList();

    expect(expensiveEvents, isEmpty, reason: 'Found expensive operations');
  });
}
```

## Platform Testing

### iOS and Android Build Verification

```bash
# In your test script or CI/CD pipeline

# Android build verification
flutter build apk --debug
flutter build apk --release --no-shrink
flutter build appbundle --release

# iOS build verification (requires macOS)
flutter build ios --debug --no-codesign
flutter build ios --release --no-codesign

# Verify build outputs exist
test -f build/app/outputs/flutter-apk/app-release.apk
test -f build/app/outputs/bundle/release/app-release.aab
test -d build/ios/iphoneos/Runner.app
```

### Platform-Specific Tests

```dart
import 'dart:io';

void main() {
  group('platform-specific tests', () {
    testWidgets('iOS specific behavior', (WidgetTester tester) async {
      // Skip on non-iOS platforms
      if (!Platform.isIOS) {
        return;
      }

      await tester.pumpWidget(const MaterialApp(home: PlatformTestPage()));

      // Test iOS-specific features
      expect(find.byType(CupertinoNavigationBar), findsOneWidget);
    }, skip: !Platform.isIOS);

    testWidgets('Android specific behavior', (WidgetTester tester) async {
      if (!Platform.isAndroid) {
        return;
      }

      await tester.pumpWidget(const MaterialApp(home: PlatformTestPage()));

      // Test Android-specific features
      expect(find.byType(AppBar), findsOneWidget);
    }, skip: !Platform.isAndroid);
  });

  testWidgets('tests platform adaptive widgets', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AdaptiveWidget()));

    if (Platform.isIOS) {
      expect(find.byType(CupertinoButton), findsOneWidget);
    } else {
      expect(find.byType(ElevatedButton), findsOneWidget);
    }
  });
}
```

### Testing Platform Channels

```dart
import 'package:flutter/services.dart';

void main() {
  const channel = MethodChannel('com.example.app/native');

  setUp(() {
    // Mock method channel
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (MethodCall call) async {
      switch (call.method) {
        case 'getBatteryLevel':
          return 85;
        case 'getDeviceInfo':
          return {
            'model': 'Test Device',
            'os': 'Test OS',
            'version': '1.0.0',
          };
        default:
          throw MissingPluginException();
      }
    });
  });

  tearDown(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, null);
  });

  testWidgets('calls native platform method', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: BatteryWidget()));

    // Trigger platform method call
    await tester.tap(find.text('Get Battery Level'));
    await tester.pumpAndSettle();

    // Verify result
    expect(find.text('Battery: 85%'), findsOneWidget);
  });

  test('handles platform exceptions', () async {
    expect(
      () async => await channel.invokeMethod('invalidMethod'),
      throwsA(isA<MissingPluginException>()),
    );
  });
}
```

## Accessibility Verification

### Semantic Labels

```dart
void main() {
  testWidgets('verifies semantic labels', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          appBar: AppBar(title: const Text('Test')),
          body: Column(
            children: [
              IconButton(
                icon: const Icon(Icons.home),
                onPressed: () {},
                tooltip: 'Go to home',
              ),
              const Text('Welcome'),
              Image.asset(
                'assets/logo.png',
                semanticLabel: 'Company logo',
              ),
            ],
          ),
        ),
      ),
    );

    // Verify semantic labels exist
    expect(
      tester.getSemantics(find.byType(IconButton)),
      matchesSemantics(
        label: 'Go to home',
        isButton: true,
      ),
    );

    expect(
      tester.getSemantics(find.byType(Image)),
      matchesSemantics(label: 'Company logo'),
    );
  });

  testWidgets('ensures all interactive elements are accessible', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AccessibilityTestPage()));

    // Find all interactive widgets
    final buttons = find.byType(ElevatedButton);
    final iconButtons = find.byType(IconButton);
    final textFields = find.byType(TextField);

    // Verify each has semantic label or tooltip
    for (final finder in [buttons, iconButtons, textFields]) {
      final count = tester.widgetList(finder).length;
      for (int i = 0; i < count; i++) {
        final semantics = tester.getSemantics(finder.at(i));
        expect(
          semantics.label,
          isNotEmpty,
          reason: 'Interactive element at index $i missing semantic label',
        );
      }
    }
  });
}
```

### Screen Reader Testing

```dart
void main() {
  testWidgets('tests screen reader navigation order', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Semantics(
          sortKey: const OrdinalSortKey(0),
          child: Column(
            children: [
              Semantics(
                sortKey: const OrdinalSortKey(1),
                child: const Text('First'),
              ),
              Semantics(
                sortKey: const OrdinalSortKey(2),
                child: const Text('Second'),
              ),
              Semantics(
                sortKey: const OrdinalSortKey(3),
                child: const Text('Third'),
              ),
            ],
          ),
        ),
      ),
    );

    // Verify semantic order
    final semantics = tester.getSemantics(find.byType(Column));
    // Verify reading order matches intended order
  });

  testWidgets('verifies live regions for dynamic content', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Semantics(
          liveRegion: true,
          child: const DynamicContentWidget(),
        ),
      ),
    );

    // Trigger content update
    await tester.tap(find.text('Update'));
    await tester.pumpAndSettle();

    // Verify screen reader is notified
    final semantics = tester.getSemantics(find.byType(DynamicContentWidget));
    expect(semantics.hasFlag(SemanticsFlag.isLiveRegion), isTrue);
  });
}
```

### Contrast and Text Scaling

```dart
void main() {
  testWidgets('verifies text scales correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(textScaleFactor: 1.0),
        child: MaterialApp(
          home: const Text('Normal Text'),
        ),
      ),
    );

    final normalSize = tester.getSize(find.text('Normal Text'));

    // Test with large text
    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(textScaleFactor: 2.0),
        child: MaterialApp(
          home: const Text('Normal Text'),
        ),
      ),
    );

    final largeSize = tester.getSize(find.text('Normal Text'));

    // Verify text scales
    expect(largeSize.height, greaterThan(normalSize.height));
  });

  testWidgets('verifies sufficient color contrast', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Container(
          color: Colors.black,
          child: const Text(
            'White on Black',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ),
    );

    // Manual contrast checking (in real tests, use contrast calculation)
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    // White on black has 21:1 ratio - excellent contrast
  });
}
```

## Build Verification

### Build Configuration Tests

```dart
// test/build_config_test.dart
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:yaml/yaml.dart';

void main() {
  test('pubspec.yaml has correct version', () {
    final file = File('pubspec.yaml');
    final yaml = loadYaml(file.readAsStringSync());

    expect(yaml['version'], matches(RegExp(r'^\d+\.\d+\.\d+\+\d+$')));
  });

  test('android build.gradle has correct settings', () {
    final file = File('android/app/build.gradle');
    final content = file.readAsStringSync();

    expect(content, contains('minSdkVersion 21'));
    expect(content, contains('targetSdkVersion 33'));
    expect(content, contains('compileSdkVersion 33'));
  });

  test('iOS Podfile has correct platform version', () {
    final file = File('ios/Podfile');
    final content = file.readAsStringSync();

    expect(content, contains("platform :ios, '12.0'"));
  });

  test('release builds have correct signing config', () {
    final androidFile = File('android/app/build.gradle');
    final androidContent = androidFile.readAsStringSync();

    expect(androidContent, contains('signingConfig signingConfigs.release'));

    // For iOS, check in project.pbxproj or export options
    final iosFile = File('ios/Runner.xcodeproj/project.pbxproj');
    if (iosFile.existsSync()) {
      final iosContent = iosFile.readAsStringSync();
      expect(iosContent, contains('CODE_SIGN_IDENTITY'));
    }
  });
}
```

### App Signing Verification

```bash
#!/bin/bash
# verify_signing.sh

# Android APK verification
echo "Verifying Android APK signing..."
apksigner verify --verbose build/app/outputs/flutter-apk/app-release.apk

if [ $? -eq 0 ]; then
    echo "Android APK signing verified"
else
    echo "Android APK signing failed"
    exit 1
fi

# Android Bundle verification
echo "Verifying Android Bundle signing..."
jarsigner -verify -verbose -certs build/app/outputs/bundle/release/app-release.aab

if [ $? -eq 0 ]; then
    echo "Android Bundle signing verified"
else
    echo "Android Bundle signing failed"
    exit 1
fi

# iOS IPA verification (requires macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Verifying iOS IPA signing..."
    codesign -dv --verbose=4 build/ios/iphoneos/Runner.app

    if [ $? -eq 0 ]; then
        echo "iOS app signing verified"
    else
        echo "iOS app signing failed"
        exit 1
    fi
fi
```

## Asset Verification

### Asset Existence Tests

```dart
// test/asset_test.dart
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:yaml/yaml.dart';

void main() {
  group('asset verification', () {
    test('all declared assets exist', () {
      final pubspec = File('pubspec.yaml');
      final yaml = loadYaml(pubspec.readAsStringSync());

      final assets = yaml['flutter']?['assets'] as List?;
      if (assets != null) {
        for (final asset in assets) {
          final assetPath = asset.toString();

          if (assetPath.endsWith('/')) {
            // Directory - check it exists
            final dir = Directory(assetPath);
            expect(dir.existsSync(), isTrue, reason: 'Asset directory $assetPath does not exist');
          } else {
            // File - check it exists
            final file = File(assetPath);
            expect(file.existsSync(), isTrue, reason: 'Asset file $assetPath does not exist');
          }
        }
      }
    });

    test('no unused assets in project', () {
      // Find all asset references in code
      final assetReferences = <String>{};

      // Scan lib directory for asset references
      final libDir = Directory('lib');
      libDir.listSync(recursive: true).forEach((entity) {
        if (entity is File && entity.path.endsWith('.dart')) {
          final content = entity.readAsStringSync();
          final regex = RegExp(r"['\"]assets/[^'\"]+['\"]");
          final matches = regex.allMatches(content);
          for (final match in matches) {
            assetReferences.add(match.group(0)!.replaceAll("'", '').replaceAll('"', ''));
          }
        }
      });

      // Check all assets are referenced
      final pubspec = File('pubspec.yaml');
      final yaml = loadYaml(pubspec.readAsStringSync());
      final assets = yaml['flutter']?['assets'] as List?;

      if (assets != null) {
        for (final asset in assets) {
          if (!asset.toString().endsWith('/')) {
            expect(
              assetReferences.contains(asset.toString()),
              isTrue,
              reason: 'Asset $asset is declared but never used',
            );
          }
        }
      }
    });

    test('images have appropriate sizes', () {
      final imageDir = Directory('assets/images');
      if (!imageDir.existsSync()) return;

      imageDir.listSync(recursive: true).forEach((entity) {
        if (entity is File &&
            (entity.path.endsWith('.png') ||
             entity.path.endsWith('.jpg') ||
             entity.path.endsWith('.jpeg'))) {
          final size = entity.lengthSync();

          // Warn if image is larger than 1MB
          expect(
            size,
            lessThan(1024 * 1024),
            reason: 'Image ${entity.path} is larger than 1MB (${size} bytes). Consider compressing.',
          );
        }
      });
    });
  });
}
```

### Font Verification

```dart
void main() {
  test('all declared fonts exist', () {
    final pubspec = File('pubspec.yaml');
    final yaml = loadYaml(pubspec.readAsStringSync());

    final fonts = yaml['flutter']?['fonts'] as List?;
    if (fonts != null) {
      for (final fontFamily in fonts) {
        final fontList = fontFamily['fonts'] as List;
        for (final font in fontList) {
          final fontPath = font['asset'].toString();
          final file = File(fontPath);
          expect(
            file.existsSync(),
            isTrue,
            reason: 'Font file $fontPath does not exist',
          );
        }
      }
    }
  });

  testWidgets('custom fonts load correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: const Text(
          'Custom Font',
          style: TextStyle(fontFamily: 'CustomFont'),
        ),
      ),
    );

    // Verify text renders without errors
    expect(find.text('Custom Font'), findsOneWidget);
  });
}
```

## Localization Coverage

### ARB File Completeness

```dart
// test/localization_test.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('localization coverage', () {
    test('all locales have same keys as template', () {
      final l10nDir = Directory('lib/l10n');
      if (!l10nDir.existsSync()) return;

      // Load template ARB (usually English)
      final templateFile = File('lib/l10n/app_en.arb');
      final templateContent = json.decode(templateFile.readAsStringSync()) as Map<String, dynamic>;

      // Get all translation keys (excluding metadata keys starting with @)
      final templateKeys = templateContent.keys
          .where((key) => !key.startsWith('@'))
          .toSet();

      // Check each locale
      l10nDir.listSync().forEach((entity) {
        if (entity is File &&
            entity.path.endsWith('.arb') &&
            !entity.path.endsWith('app_en.arb')) {

          final localeContent = json.decode(entity.readAsStringSync()) as Map<String, dynamic>;
          final localeKeys = localeContent.keys
              .where((key) => !key.startsWith('@'))
              .toSet();

          // Check for missing keys
          final missingKeys = templateKeys.difference(localeKeys);
          expect(
            missingKeys,
            isEmpty,
            reason: 'Locale ${entity.path} is missing keys: $missingKeys',
          );

          // Check for extra keys
          final extraKeys = localeKeys.difference(templateKeys);
          expect(
            extraKeys,
            isEmpty,
            reason: 'Locale ${entity.path} has unexpected keys: $extraKeys',
          );
        }
      });
    });

    test('no placeholder mismatches', () {
      final l10nDir = Directory('lib/l10n');
      if (!l10nDir.existsSync()) return;

      l10nDir.listSync().forEach((entity) {
        if (entity is File && entity.path.endsWith('.arb')) {
          final content = json.decode(entity.readAsStringSync()) as Map<String, dynamic>;

          content.forEach((key, value) {
            if (!key.startsWith('@') && value is String) {
              // Find placeholders in format {placeholder}
              final placeholders = RegExp(r'\{(\w+)\}')
                  .allMatches(value)
                  .map((m) => m.group(1))
                  .toSet();

              // Check metadata has matching placeholders
              final metadata = content['@$key'];
              if (metadata is Map && placeholders.isNotEmpty) {
                final declaredPlaceholders =
                    (metadata['placeholders'] as Map?)?.keys.toSet() ?? {};

                expect(
                  placeholders,
                  equals(declaredPlaceholders),
                  reason: 'Placeholder mismatch in key "$key" of ${entity.path}',
                );
              }
            }
          });
        }
      });
    });

    testWidgets('all supported locales load correctly', (WidgetTester tester) async {
      final supportedLocales = [
        const Locale('en'),
        const Locale('es'),
        const Locale('fr'),
      ];

      for (final locale in supportedLocales) {
        await tester.pumpWidget(
          MaterialApp(
            locale: locale,
            localizationsDelegates: const [
              // Your localization delegates
            ],
            home: const TestPage(),
          ),
        );

        // Verify no errors loading locale
        expect(tester.takeException(), isNull);
      }
    });
  });
}
```

## Code Quality Checks

### Flutter Analyze

```bash
#!/bin/bash
# Run in CI/CD pipeline

# Run Flutter analyze
echo "Running Flutter analyze..."
flutter analyze > analyze_output.txt 2>&1

if [ $? -eq 0 ]; then
    echo "Flutter analyze passed"
else
    echo "Flutter analyze found issues:"
    cat analyze_output.txt
    exit 1
fi

# Check for specific issues
if grep -q "error •" analyze_output.txt; then
    echo "Errors found!"
    exit 1
fi

if grep -q "warning •" analyze_output.txt; then
    echo "Warnings found!"
    # Decide if warnings should fail the build
fi

echo "Code analysis complete"
```

### Custom Lint Rules

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

  errors:
    # Treat missing required parameters as error
    missing_required_param: error

    # Treat missing return as error
    missing_return: error

    # Dead code
    dead_code: warning
    unused_import: error
    unused_local_variable: warning

  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    # Error rules
    - always_use_package_imports
    - avoid_print
    - avoid_relative_lib_imports
    - avoid_slow_async_io
    - avoid_types_as_parameter_names
    - cancel_subscriptions
    - close_sinks
    - valid_regexps

    # Style rules
    - always_declare_return_types
    - always_require_non_null_named_parameters
    - annotate_overrides
    - avoid_init_to_null
    - avoid_null_checks_in_equality_operators
    - avoid_return_types_on_setters
    - avoid_unnecessary_containers
    - await_only_futures
    - camel_case_types
    - constant_identifier_names
    - empty_constructor_bodies
    - file_names
    - implementation_imports
    - library_names
    - library_prefixes
    - non_constant_identifier_names
    - package_api_docs
    - prefer_adjacent_string_concatenation
    - prefer_collection_literals
    - prefer_conditional_assignment
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_const_literals_to_create_immutables
    - prefer_final_fields
    - prefer_final_locals
    - prefer_is_empty
    - prefer_is_not_empty
    - prefer_single_quotes
    - sort_constructors_first
    - unnecessary_brace_in_string_interps
    - unnecessary_const
    - unnecessary_new
    - unnecessary_this
    - use_full_hex_values_for_flutter_colors
    - use_function_type_syntax_for_parameters
    - use_key_in_widget_constructors
    - use_rethrow_when_possible
```

### Custom Static Analysis

```dart
// tool/check_code_quality.dart
import 'dart:io';

void main() {
  print('Running custom code quality checks...');

  var hasErrors = false;

  // Check for TODO comments
  hasErrors |= checkTodoComments();

  // Check for print statements
  hasErrors |= checkPrintStatements();

  // Check for large files
  hasErrors |= checkFileSize();

  // Check for proper widget keys
  hasErrors |= checkWidgetKeys();

  if (hasErrors) {
    print('\nCode quality checks failed!');
    exit(1);
  } else {
    print('\nAll code quality checks passed!');
  }
}

bool checkTodoComments() {
  print('Checking for TODO comments...');
  var found = false;

  final libDir = Directory('lib');
  libDir.listSync(recursive: true).forEach((entity) {
    if (entity is File && entity.path.endsWith('.dart')) {
      final lines = entity.readAsLinesSync();
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].contains('TODO') || lines[i].contains('FIXME')) {
          print('  ${entity.path}:${i + 1}: ${lines[i].trim()}');
          found = true;
        }
      }
    }
  });

  return found;
}

bool checkPrintStatements() {
  print('Checking for print statements...');
  var found = false;

  final libDir = Directory('lib');
  libDir.listSync(recursive: true).forEach((entity) {
    if (entity is File && entity.path.endsWith('.dart')) {
      final content = entity.readAsStringSync();
      if (content.contains(RegExp(r'\bprint\('))) {
        print('  ${entity.path}: Contains print statement');
        found = true;
      }
    }
  });

  return found;
}

bool checkFileSize() {
  print('Checking file sizes...');
  var found = false;
  const maxLines = 500;

  final libDir = Directory('lib');
  libDir.listSync(recursive: true).forEach((entity) {
    if (entity is File && entity.path.endsWith('.dart')) {
      final lines = entity.readAsLinesSync().length;
      if (lines > maxLines) {
        print('  ${entity.path}: $lines lines (max $maxLines)');
        found = true;
      }
    }
  });

  return found;
}

bool checkWidgetKeys() {
  print('Checking widget keys in tests...');
  var found = false;

  final testDir = Directory('test');
  if (!testDir.existsSync()) return false;

  testDir.listSync(recursive: true).forEach((entity) {
    if (entity is File && entity.path.endsWith('_test.dart')) {
      final content = entity.readAsStringSync();

      // Check if test uses find.byType without keys
      if (content.contains('find.byType') &&
          !content.contains('Key(') &&
          content.contains('testWidgets')) {
        print('  ${entity.path}: Consider using keys for more reliable tests');
        // This is a warning, not an error
      }
    }
  });

  return found;
}
```

## Test Coverage Goals

### Measuring Coverage

```bash
#!/bin/bash
# Run tests with coverage

echo "Running tests with coverage..."
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Check coverage threshold
COVERAGE=$(lcov --summary coverage/lcov.info | grep "lines" | grep -o '[0-9.]*%' | head -n1 | sed 's/%//')

echo "Current coverage: $COVERAGE%"

THRESHOLD=80

if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
    echo "Coverage $COVERAGE% is below threshold $THRESHOLD%"
    exit 1
else
    echo "Coverage threshold met!"
fi
```

### Coverage Configuration

```dart
// test/test_config.dart
import 'package:flutter_test/flutter_test.dart';

void configureCoverage() {
  // Exclude generated files from coverage
  TestWidgetsFlutterBinding.ensureInitialized();

  // Can be configured in coverage.yaml or analysis_options.yaml
}
```

```yaml
# coverage.yaml
exclude:
  - "**/*.g.dart"
  - "**/*.freezed.dart"
  - "**/main.dart"
  - "test/**"

include:
  - "lib/**"
```

### Coverage Targets by Category

```yaml
# .github/workflows/test.yml or similar
coverage_targets:
  overall: 80%

  by_directory:
    lib/models: 90%
    lib/services: 85%
    lib/widgets: 75%
    lib/screens: 70%
    lib/utils: 95%
```

## Complete Test Suite Example

```dart
// test/complete_test_suite.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Complete Test Suite', () {
    group('Unit Tests', () {
      // Model tests
      // Service tests
      // Util tests
    });

    group('Widget Tests', () {
      testWidgets('basic widget tests', (tester) async {
        // Widget rendering tests
      });

      testWidgets('interaction tests', (tester) async {
        // User interaction tests
      });
    });

    group('Integration Tests', () {
      testWidgets('user flow tests', (tester) async {
        // End-to-end user flows
      });
    });

    group('Golden Tests', () {
      testWidgets('visual regression tests', (tester) async {
        // Golden file comparisons
      });
    });

    group('Performance Tests', () {
      testWidgets('frame rate tests', (tester) async {
        // Performance benchmarks
      });
    });

    group('Accessibility Tests', () {
      testWidgets('semantic tests', (tester) async {
        // Accessibility verification
      });
    });
  });
}
```

## CI/CD Integration

```yaml
# .github/workflows/flutter_ci.yml
name: Flutter CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        channel: 'stable'

    - name: Install dependencies
      run: flutter pub get

    - name: Verify formatting
      run: flutter format --set-exit-if-changed .

    - name: Analyze code
      run: flutter analyze

    - name: Run unit tests
      run: flutter test --coverage

    - name: Check coverage
      run: |
        dart pub global activate coverage
        dart pub global run coverage:format_coverage --lcov --in=coverage --out=coverage/lcov.info

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: coverage/lcov.info

    - name: Build Android APK
      run: flutter build apk --debug

    - name: Build iOS (no-codesign)
      run: flutter build ios --debug --no-codesign
      if: runner.os == 'macOS'

  integration_test:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v3

    - uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'

    - name: Install dependencies
      run: flutter pub get

    - name: Run integration tests
      run: flutter test integration_test/
```

## Summary

**Widget Testing:**
- Use testWidgets for UI tests
- Find widgets with various finders
- Test user interactions (tap, enterText, scroll)
- Mock dependencies with mockito
- Use pumpAndSettle for async operations

**Integration Testing:**
- Test complete user flows
- Verify navigation and state
- Test with real or mocked backends
- Use IntegrationTestWidgetsFlutterBinding

**Golden Tests:**
- Visual regression testing
- Test different states and themes
- Test responsive layouts
- Compare against golden files

**Performance Testing:**
- Monitor frame rendering
- Track memory usage
- Analyze timelines
- Set performance thresholds

**Platform Testing:**
- Verify iOS and Android builds
- Test platform-specific features
- Mock platform channels
- Test adaptive widgets

**Accessibility:**
- Verify semantic labels
- Test screen reader support
- Check text scaling
- Verify color contrast

**Build Verification:**
- Validate build configurations
- Verify app signing
- Check release settings

**Asset Verification:**
- Ensure all assets exist
- Check image sizes
- Verify fonts load
- Remove unused assets

**Localization:**
- Check ARB file completeness
- Verify placeholder consistency
- Test locale switching

**Code Quality:**
- Run flutter analyze
- Use custom lint rules
- Set coverage goals (80%+)
- Automate in CI/CD

These verification patterns ensure Flutter applications are thoroughly tested, performant, accessible, and production-ready.
