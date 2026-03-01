# Dart Security

> This file extends [common/security.md](../common/security.md) with Dart specific content.

## Secret Management

```dart
// NEVER: Hardcoded secrets
const apiKey = 'sk-xxxxx';

// CORRECT: Compile-time definitions
const apiKey = String.fromEnvironment('API_KEY');
```

Use `--dart-define=API_KEY=value` at build time.

## Dependency Auditing

Review `pubspec.yaml` dependencies regularly. Check for known vulnerabilities in pub.dev advisories.

## HTTP Security

- Always use HTTPS — reject HTTP connections
- Validate SSL certificates in production
- Set timeouts on all HTTP clients
