# Java Testing

> This file extends [common/testing.md](../common/testing.md) with Java specific content.

## Framework

Use **JUnit 5** + **AssertJ** for assertions + **Mockito** for mocking.

## Naming Convention

```java
@Test
void shouldReturnUser_whenValidIdProvided() {
    // Arrange, Act, Assert
}
```

## Parameterized Tests

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "  "})
void shouldRejectBlankInput(String input) {
    assertThatThrownBy(() -> service.process(input))
        .isInstanceOf(IllegalArgumentException.class);
}
```

## Coverage

Use **JaCoCo** for coverage — 80% minimum.

## Reference

See skill: `springboot-tdd` for comprehensive Java/Spring testing patterns.
