# Spring Boot Testing

> This file extends [common/testing.md](../common/testing.md) with Spring Boot specific content.

## Test Slices

Use the narrowest test slice possible:

| Annotation | Tests | Loads |
|-----------|-------|-------|
| `@WebMvcTest` | Controllers | Web layer only |
| `@DataJpaTest` | Repositories | JPA layer only |
| `@SpringBootTest` | Integration | Full context |

## Request Testing

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockitoBean UserService userService;

    @Test
    void shouldReturnUser() throws Exception {
        when(userService.findById("1")).thenReturn(new UserDto("Alice", "alice@test.com"));

        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```

## Database Testing

Use **Testcontainers** for integration tests with real databases.

## Reference

See skill: `springboot-tdd` for comprehensive Spring Boot testing patterns.
