# Java Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Java specific content.

## Builder Pattern

```java
public record Config(String host, int port, boolean ssl) {
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String host = "localhost";
        private int port = 8080;
        private boolean ssl = false;

        public Builder host(String host) { this.host = host; return this; }
        public Builder port(int port) { this.port = port; return this; }
        public Builder ssl(boolean ssl) { this.ssl = ssl; return this; }
        public Config build() { return new Config(host, port, ssl); }
    }
}
```

## Sealed Interfaces

```java
public sealed interface Shape permits Circle, Rectangle {
    double area();
}
public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}
```

## Dependency Injection

Always use constructor injection — no field injection.

## Reference

See skill: `jpa-patterns` for comprehensive JPA/Hibernate patterns.
