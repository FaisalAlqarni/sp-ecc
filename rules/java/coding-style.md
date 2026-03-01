# Java Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Java specific content.

## Standards

- Use Java 17+ features: records, sealed classes, pattern matching
- `PascalCase` for classes, `camelCase` for methods/variables, `UPPER_SNAKE_CASE` for constants
- Prefer `final` fields — immutability by default
- Use `Optional` only as return type, never as field or parameter

## Records as DTOs

```java
// WRONG: Mutable class with getters/setters
public class UserDto {
    private String name;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

// CORRECT: Immutable record
public record UserDto(String name, String email) {}
```

## Formatting

Use **Google Java Format** or **Spotless** for consistent formatting.

## Reference

See skill: `java-coding-standards` for comprehensive Java coding standards.
