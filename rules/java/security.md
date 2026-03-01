# Java Security

> This file extends [common/security.md](../common/security.md) with Java specific content.

## Input Validation

Use **Bean Validation** on all controller inputs:

```java
public record CreateUserRequest(
    @NotBlank String name,
    @Email String email,
    @Min(0) @Max(150) int age
) {}
```

## Query Safety

```java
// NEVER: String concatenation in JPQL
em.createQuery("SELECT u FROM User u WHERE u.name = '" + name + "'");

// ALWAYS: Parameterized queries
em.createQuery("SELECT u FROM User u WHERE u.name = :name")
  .setParameter("name", name);
```

## Error Handling

Never use `catch (Exception e) {}` — always handle or rethrow specific exceptions.

## Dependency Scanning

Use **OWASP dependency-check** plugin in build pipeline.

## Secret Management

Use environment variables or **HashiCorp Vault**. Never hardcode credentials.

## Reference

See skill: `springboot-security` for comprehensive Java/Spring security guidelines.
