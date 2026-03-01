# Spring Boot Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Spring Boot specific content.

## Dependency Injection

```java
// WRONG: Field injection
@Autowired
private UserService userService;

// CORRECT: Constructor injection
private final UserService userService;

public UserController(UserService userService) {
    this.userService = userService;
}
```

## Controllers

Keep controllers thin — delegate to services:

```java
@PostMapping("/users")
public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserRequest request) {
    return ResponseEntity.ok(userService.create(request));
}
```

## Transactions

Use `@Transactional(readOnly = true)` for read-only queries. Only use `@Transactional` (writable) for mutations.

## Error Handling

Use `@ControllerAdvice` for centralized exception handling — no try-catch in controllers.

## Reference

See skill: `springboot-patterns` for comprehensive Spring Boot patterns.
