# Flutter Security

> This file extends [common/security.md](../common/security.md) with Flutter specific content.

## Sensitive Data Storage

Use `flutter_secure_storage` for tokens, credentials, and sensitive data. Never use `SharedPreferences` for secrets.

## Network Security

- Enable certificate pinning for production API calls
- Reject self-signed certificates in release builds

## Build Security

- Enable obfuscation for release builds: `flutter build --obfuscate --split-debug-info=debug-info/`
- Never include API keys or secrets in source code
- Use `--dart-define` for compile-time configuration

## Platform Permissions

Request only necessary permissions. Explain permission usage in platform-specific privacy manifests.
