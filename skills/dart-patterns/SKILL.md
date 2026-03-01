---
name: dart-patterns
description: Use when writing Dart code - provides idiomatic patterns for null safety, async programming, collections, and error handling
---

# Dart Patterns

## Description
Expert guidance on Dart language idioms, patterns, and best practices for building robust, idiomatic Dart applications.

## Trigger
Use when:
- Writing or reviewing Dart code
- Working with Flutter or server-side Dart projects
- Implementing async patterns, null safety, or advanced language features
- Architecting Dart packages and libraries

## Instructions

### Core Language Features

#### Null Safety
Dart's sound null safety system eliminates null reference errors at compile time.

**Nullable vs Non-nullable Types:**
```dart
// Non-nullable (cannot be null)
String name = 'John';
int age = 25;

// Nullable (can be null)
String? nickname;
int? optionalAge;

// Null assertion operator (!) - use sparingly
String definitelyNotNull = nickname!; // Throws if null

// Null-aware operators
String displayName = nickname ?? 'Anonymous'; // Default value
int? length = nickname?.length; // Safe navigation

// Late variables (initialized later, but non-nullable)
late String initLater;
void initialize() {
  initLater = 'Now initialized';
}

// Late lazy initialization
late final String expensive = computeExpensive();
```

**Best Practices:**
- Prefer non-nullable types by default
- Use `?` only when null is a valid value
- Avoid `!` operator; prefer null checks or `??`
- Use `late` for two-phase initialization
- Use `late final` for lazy initialization

#### Async Programming

**Futures:**
```dart
// Basic Future usage
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Data loaded';
}

// Error handling
Future<String> fetchWithError() async {
  try {
    final result = await riskyOperation();
    return result;
  } on NetworkException catch (e) {
    print('Network error: ${e.message}');
    rethrow;
  } catch (e, stackTrace) {
    print('Error: $e\n$stackTrace');
    return 'default';
  } finally {
    cleanup();
  }
}

// Multiple futures
Future<void> loadMultiple() async {
  // Sequential
  final user = await fetchUser();
  final profile = await fetchProfile(user.id);

  // Parallel
  final results = await Future.wait([
    fetchUser(),
    fetchSettings(),
    fetchNotifications(),
  ]);

  // With error handling per future
  final resultsWithErrors = await Future.wait(
    [fetchUser(), fetchSettings()],
    eagerError: false, // Continue even if one fails
  );
}

// Timeout handling
Future<String> fetchWithTimeout() async {
  try {
    return await fetchData().timeout(
      Duration(seconds: 5),
      onTimeout: () => 'Timed out',
    );
  } on TimeoutException {
    return 'Request timed out';
  }
}
```

**Streams:**
```dart
// Creating streams
Stream<int> countStream() async* {
  for (int i = 1; i <= 5; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// Stream from iterable
Stream<int> fromList() => Stream.fromIterable([1, 2, 3, 4, 5]);

// Listening to streams
void listenToStream() {
  final subscription = countStream().listen(
    (data) => print('Received: $data'),
    onError: (error) => print('Error: $error'),
    onDone: () => print('Stream closed'),
    cancelOnError: false,
  );

  // Cancel subscription
  subscription.cancel();
}

// Async iteration
Future<void> processStream() async {
  await for (final value in countStream()) {
    print(value);
    if (value == 3) break; // Exit early
  }
}

// Stream transformations
Stream<String> transformStream(Stream<int> input) {
  return input
    .where((n) => n.isEven)
    .map((n) => 'Number: $n')
    .take(10)
    .distinct()
    .handleError((error) => print('Error: $error'));
}

// Broadcast streams (multiple listeners)
Stream<int> createBroadcast() {
  final controller = StreamController<int>.broadcast();

  // Add data
  controller.add(1);
  controller.add(2);

  // Close when done
  controller.close();

  return controller.stream;
}

// Stream controller with error handling
class DataStream {
  final _controller = StreamController<String>();

  Stream<String> get stream => _controller.stream;

  void addData(String data) {
    if (!_controller.isClosed) {
      _controller.add(data);
    }
  }

  void addError(Object error) {
    if (!_controller.isClosed) {
      _controller.addError(error);
    }
  }

  void dispose() {
    _controller.close();
  }
}
```

### Collections

**Idiomatic Collection Usage:**
```dart
// List operations
final numbers = [1, 2, 3, 4, 5];
final doubled = numbers.map((n) => n * 2).toList();
final evens = numbers.where((n) => n.isEven).toList();
final sum = numbers.reduce((a, b) => a + b);
final total = numbers.fold(0, (sum, n) => sum + n);

// List patterns
final [first, second, ...rest] = numbers;
final [head, ...middle, last] = numbers;

// Spread operator
final combined = [...numbers, 6, 7, ...doubled];
final nullSafe = [...?nullableList];

// Set operations
final uniqueNumbers = {1, 2, 3, 2, 1}; // {1, 2, 3}
final union = set1.union(set2);
final intersection = set1.intersection(set2);
final difference = set1.difference(set2);

// Map operations
final userMap = {
  'name': 'John',
  'age': 30,
  'email': 'john@example.com',
};

// Map transformation
final uppercased = userMap.map(
  (key, value) => MapEntry(key.toUpperCase(), value),
);

// Null-aware map access
final email = userMap['email'] ?? 'no-email';

// Collection if/for
final list = [
  1,
  2,
  if (includeThree) 3,
  for (var i in [4, 5, 6]) i * 2,
];
```

### Object-Oriented Patterns

**Classes and Constructors:**
```dart
// Standard class
class User {
  final String id;
  final String name;
  final int age;

  // Named constructor
  User({
    required this.id,
    required this.name,
    required this.age,
  });

  // Factory constructor
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      age: json['age'] as int,
    );
  }

  // Named constructor with defaults
  User.guest()
    : id = 'guest',
      name = 'Guest User',
      age = 0;

  // Copy with method
  User copyWith({
    String? id,
    String? name,
    int? age,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      age: age ?? this.age,
    );
  }

  @override
  String toString() => 'User(id: $id, name: $name, age: $age)';

  @override
  bool operator ==(Object other) =>
    identical(this, other) ||
    other is User &&
    runtimeType == other.runtimeType &&
    id == other.id;

  @override
  int get hashCode => id.hashCode;
}

// Immutable data class pattern
class ImmutableUser {
  const ImmutableUser({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;
}
```

**Mixins:**
```dart
// Mixin definition
mixin Logging {
  void log(String message) {
    print('[${DateTime.now()}] $message');
  }
}

mixin Validation {
  bool validate(String input) {
    return input.isNotEmpty && input.length >= 3;
  }
}

// Restricted mixin (can only be applied to specific types)
mixin Serializable on Object {
  Map<String, dynamic> toJson();
}

// Using mixins
class UserService with Logging, Validation {
  void createUser(String name) {
    if (validate(name)) {
      log('Creating user: $name');
      // Create user logic
    }
  }
}
```

**Abstract Classes and Interfaces:**
```dart
// Abstract class
abstract class Animal {
  String get name;
  void makeSound();

  // Concrete method
  void move() {
    print('$name is moving');
  }
}

// Interface pattern (every class is an interface)
class Flyable {
  void fly() {}
}

class Swimmable {
  void swim() {}
}

// Multiple interface implementation
class Duck extends Animal implements Flyable, Swimmable {
  @override
  String get name => 'Duck';

  @override
  void makeSound() => print('Quack');

  @override
  void fly() => print('Duck is flying');

  @override
  void swim() => print('Duck is swimming');
}
```

**Extension Methods:**
```dart
// String extensions
extension StringExtensions on String {
  bool get isValidEmail {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
  }

  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  String truncate(int maxLength) {
    return length <= maxLength ? this : '${substring(0, maxLength)}...';
  }
}

// List extensions
extension ListExtensions<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull => isEmpty ? null : last;

  List<T> distinctBy<K>(K Function(T) selector) {
    final seen = <K>{};
    return where((item) => seen.add(selector(item))).toList();
  }
}

// Nullable extensions
extension NullableStringExtensions on String? {
  bool get isNullOrEmpty => this == null || this!.isEmpty;
}

// Usage
void main() {
  final email = 'test@example.com';
  print(email.isValidEmail); // true

  final name = 'john';
  print(name.capitalize()); // John

  final users = [
    User(id: '1', name: 'Alice', age: 25),
    User(id: '1', name: 'Alice', age: 25),
    User(id: '2', name: 'Bob', age: 30),
  ];
  final distinct = users.distinctBy((u) => u.id);
}
```

### Generics

**Generic Classes and Methods:**
```dart
// Generic class
class Box<T> {
  final T value;
  const Box(this.value);

  R transform<R>(R Function(T) transformer) {
    return transformer(value);
  }
}

// Generic with constraints
class Repository<T extends Identifiable> {
  final Map<String, T> _cache = {};

  void save(T item) {
    _cache[item.id] = item;
  }

  T? findById(String id) {
    return _cache[id];
  }

  List<T> findAll() {
    return _cache.values.toList();
  }
}

abstract class Identifiable {
  String get id;
}

// Generic methods
T firstWhere<T>(List<T> list, bool Function(T) predicate, {required T orElse}) {
  for (final item in list) {
    if (predicate(item)) return item;
  }
  return orElse;
}

// Multiple type parameters
class Pair<K, V> {
  final K key;
  final V value;

  const Pair(this.key, this.value);

  @override
  String toString() => '($key, $value)';
}

// Covariant generics
class Animal {}
class Dog extends Animal {}

// This works because List is covariant
List<Animal> animals = <Dog>[];
```

### Error Handling

**Exception Patterns:**
```dart
// Custom exceptions
class NetworkException implements Exception {
  final String message;
  final int? statusCode;

  NetworkException(this.message, [this.statusCode]);

  @override
  String toString() => 'NetworkException: $message (status: $statusCode)';
}

class ValidationException implements Exception {
  final Map<String, String> errors;

  ValidationException(this.errors);

  @override
  String toString() => 'ValidationException: $errors';
}

// Result pattern
class Result<T, E> {
  final T? value;
  final E? error;
  final bool isSuccess;

  const Result.success(this.value)
    : error = null,
      isSuccess = true;

  const Result.failure(this.error)
    : value = null,
      isSuccess = false;

  R when<R>({
    required R Function(T) success,
    required R Function(E) failure,
  }) {
    return isSuccess ? success(value as T) : failure(error as E);
  }
}

// Usage
Future<Result<User, String>> fetchUser(String id) async {
  try {
    final user = await api.getUser(id);
    return Result.success(user);
  } catch (e) {
    return Result.failure('Failed to fetch user: $e');
  }
}

// Option/Maybe pattern
sealed class Option<T> {
  const Option();
}

class Some<T> extends Option<T> {
  final T value;
  const Some(this.value);
}

class None<T> extends Option<T> {
  const None();
}

// Pattern matching with sealed classes
String greet(Option<String> name) {
  return switch (name) {
    Some(value: final n) => 'Hello, $n!',
    None() => 'Hello, stranger!',
  };
}
```

### Package Structure

**Standard Project Layout:**
```
my_package/
├── lib/
│   ├── src/           # Private implementation
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── my_package.dart # Public API
├── test/
│   ├── src/
│   │   └── models_test.dart
│   └── my_package_test.dart
├── example/
│   └── main.dart
├── pubspec.yaml
├── README.md
├── CHANGELOG.md
└── LICENSE
```

**Public API Pattern (lib/my_package.dart):**
```dart
library my_package;

// Export public API
export 'src/models/user.dart';
export 'src/services/user_service.dart';

// Hide internal implementation
export 'src/utils/helpers.dart' hide internalHelper;

// Show only specific members
export 'src/utils/validators.dart' show validateEmail, validatePhone;
```

**pubspec.yaml Best Practices:**
```yaml
name: my_package
description: A clear, concise description
version: 1.0.0
homepage: https://github.com/username/my_package

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  # Use version constraints properly
  http: ^1.0.0          # Compatible with 1.x.x
  path: '>=1.8.0 <2.0.0' # Explicit range

dev_dependencies:
  test: ^1.24.0
  lints: ^3.0.0

# Optional: Declare supported platforms
platforms:
  android:
  ios:
  linux:
  macos:
  web:
  windows:
```

### Performance Patterns

**Optimization Techniques:**
```dart
// Const constructors for immutable objects
class Config {
  const Config({
    required this.apiUrl,
    required this.timeout,
  });

  final String apiUrl;
  final Duration timeout;
}

// Use const where possible
const config = Config(
  apiUrl: 'https://api.example.com',
  timeout: Duration(seconds: 30),
);

// Lazy initialization
class ExpensiveResource {
  static ExpensiveResource? _instance;

  factory ExpensiveResource() {
    return _instance ??= ExpensiveResource._internal();
  }

  ExpensiveResource._internal() {
    // Expensive initialization
  }
}

// Efficient string building
String buildLargeString(List<String> parts) {
  final buffer = StringBuffer();
  for (final part in parts) {
    buffer.write(part);
  }
  return buffer.toString();
}

// Avoid unnecessary rebuilds/recomputations
class DataProcessor {
  List<int>? _cachedResult;
  List<int> _lastInput = [];

  List<int> process(List<int> input) {
    // Return cached if input hasn't changed
    if (_cachedResult != null && _listEquals(input, _lastInput)) {
      return _cachedResult!;
    }

    _lastInput = List.from(input);
    _cachedResult = _expensiveComputation(input);
    return _cachedResult!;
  }

  bool _listEquals(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  List<int> _expensiveComputation(List<int> input) {
    // Heavy computation
    return input.map((x) => x * x).toList();
  }
}

// Isolates for CPU-intensive work
import 'dart:isolate';

Future<int> computeInBackground(int n) async {
  final receivePort = ReceivePort();
  await Isolate.spawn(_heavyComputation, receivePort.sendPort);

  final sendPort = await receivePort.first as SendPort;
  final responsePort = ReceivePort();
  sendPort.send([n, responsePort.sendPort]);

  return await responsePort.first as int;
}

void _heavyComputation(SendPort sendPort) async {
  final receivePort = ReceivePort();
  sendPort.send(receivePort.sendPort);

  await for (final message in receivePort) {
    final data = message as List;
    final n = data[0] as int;
    final replyPort = data[1] as SendPort;

    // Heavy work
    int result = 0;
    for (int i = 0; i < n; i++) {
      result += i;
    }

    replyPort.send(result);
    break;
  }
}
```

### Effective Dart Guidelines

**Style:**
- Use `lowerCamelCase` for variables, methods, and parameters
- Use `UpperCamelCase` for types (classes, enums, typedefs)
- Use `lowercase_with_underscores` for libraries and file names
- Prefer `final` over `var` when variable won't be reassigned
- Use `const` for compile-time constants
- Avoid explicit type annotations for local variables when obvious
- Use trailing commas for better formatting

**Documentation:**
```dart
/// Fetches user data from the API.
///
/// Returns a [User] object if successful, or throws a [NetworkException]
/// if the request fails.
///
/// Example:
/// ```dart
/// final user = await fetchUser('user-123');
/// print(user.name);
/// ```
Future<User> fetchUser(String id) async {
  // Implementation
}

/// Configuration for API client.
///
/// {@template api_config}
/// This class holds all configuration needed to initialize
/// the API client, including base URL and authentication.
/// {@endtemplate}
class ApiConfig {
  /// Creates an API configuration.
  ///
  /// {@macro api_config}
  const ApiConfig({
    required this.baseUrl,
    this.timeout = const Duration(seconds: 30),
  });

  /// The base URL for all API requests.
  final String baseUrl;

  /// Request timeout duration.
  final Duration timeout;
}
```

**Usage:**
- Prefer `=>` for simple single-expression functions
- Use `if` instead of conditional expressions for void returns
- Prefer `async`/`await` over raw futures
- Don't explicitly initialize variables to `null`
- Use interpolation to compose strings: `'Hello, $name!'`
- Avoid using `.length` to check if collection is empty; use `.isEmpty`
- Use `whereType<T>()` to filter collections by type
- Prefer function declarations over assigning lambdas to variables

**Design:**
- Make classes immutable when possible
- Provide factory constructors for complex object creation
- Use named constructors for clarity
- Prefer composition over inheritance
- Keep classes focused (Single Responsibility)
- Use enums for fixed sets of values
- Leverage sealed classes for exhaustive pattern matching

### Modern Dart Patterns (3.0+)

**Records:**
```dart
// Record syntax
(int, String) getPair() => (42, 'answer');

// Named fields
({int age, String name}) getUser() => (age: 30, name: 'John');

// Pattern matching with records
final (x, y) = getPoint();
final {:name, :age} = getUser();

// Function returning multiple values
(int min, int max) findRange(List<int> numbers) {
  return (numbers.reduce(min), numbers.reduce(max));
}
```

**Pattern Matching:**
```dart
// Switch expressions
String describe(Object obj) => switch (obj) {
  int() => 'An integer',
  String() => 'A string',
  List(isEmpty: true) => 'Empty list',
  List(length: 1) => 'List with one element',
  {'key': var value} => 'Map with key: $value',
  _ => 'Something else',
};

// Destructuring
final [first, ...middle, last] = [1, 2, 3, 4, 5];

// If-case
if (value case int x when x > 0) {
  print('Positive integer: $x');
}
```

**Sealed Classes:**
```dart
sealed class ApiResponse<T> {}

class Success<T> extends ApiResponse<T> {
  final T data;
  Success(this.data);
}

class Error<T> extends ApiResponse<T> {
  final String message;
  Error(this.message);
}

class Loading<T> extends ApiResponse<T> {}

// Exhaustive pattern matching
String handle(ApiResponse<String> response) {
  return switch (response) {
    Success(data: final d) => 'Got data: $d',
    Error(message: final m) => 'Error: $m',
    Loading() => 'Loading...',
    // Compiler ensures all cases are covered
  };
}
```

## Anti-Patterns

Avoid these common mistakes:

1. **Overusing null assertion operator (!)**
   ```dart
   // Bad
   String name = user!.profile!.name!;

   // Good
   String name = user?.profile?.name ?? 'Unknown';
   ```

2. **Not using named parameters for clarity**
   ```dart
   // Bad
   createUser('John', 30, true, 'john@example.com');

   // Good
   createUser(
     name: 'John',
     age: 30,
     isActive: true,
     email: 'john@example.com',
   );
   ```

3. **Ignoring async errors**
   ```dart
   // Bad
   fetchData(); // Fire and forget

   // Good
   unawaited(fetchData().catchError((e) => log('Error: $e')));
   ```

4. **Using dynamic unnecessarily**
   ```dart
   // Bad
   dynamic processData(dynamic data) => data;

   // Good
   T processData<T>(T data) => data;
   ```

5. **Not disposing resources**
   ```dart
   // Bad
   class DataService {
     final StreamController _controller = StreamController();
   }

   // Good
   class DataService {
     final StreamController _controller = StreamController();

     void dispose() {
       _controller.close();
     }
   }
   ```

## References
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Dart API Reference](https://api.dart.dev/)
- [pub.dev](https://pub.dev/) - Official Dart package repository
- [Dart Lint Rules](https://dart.dev/tools/linter-rules)
