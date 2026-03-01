# Spring Boot Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Spring Boot specific content.

## Layered Architecture

```
Controller → Service → Repository
     ↓           ↓          ↓
   DTOs    Business   Entity/DB
            Logic
```

## Caching

```java
@Cacheable("users")
public UserDto findById(String id) { ... }

@CacheEvict(value = "users", key = "#id")
public void update(String id, UpdateRequest request) { ... }
```

## Async Processing

```java
@Async
public CompletableFuture<Report> generateReport(String id) { ... }
```

## Pagination

```java
@GetMapping("/users")
public Page<UserDto> list(Pageable pageable) {
    return userService.findAll(pageable);
}
```

## Specification API

Use JPA Specifications for dynamic filtering.

## Reference

See skill: `springboot-patterns` for comprehensive patterns including event-driven architecture.
