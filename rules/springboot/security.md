# Spring Boot Security

> This file extends [common/security.md](../common/security.md) with Spring Boot specific content.

## Security Configuration

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .build();
}
```

## Method Security

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(String id) { ... }
```

## JWT Authentication

Implement a custom `OncePerRequestFilter` for JWT validation. Never store JWTs in localStorage — use httpOnly cookies.

## CORS

Configure explicit origins — never use `allowedOrigins("*")` in production.

## Rate Limiting

Use **Bucket4j** for API rate limiting.

## Reference

See skill: `springboot-security` for comprehensive Spring Security patterns.
