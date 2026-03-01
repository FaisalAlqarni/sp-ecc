# Ruby Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Ruby specific content.

## Standards

- Follow community Ruby style, enforce with **RuboCop**
- 2-space indentation
- `snake_case` for methods and variables, `PascalCase` for classes and modules
- Add `# frozen_string_literal: true` to all files

## Immutability

```ruby
# WRONG: Mutation
def update_user(user, name)
  user.name = name  # MUTATION!
  user
end

# CORRECT: Immutability
def update_user(user, name)
  user.dup.tap { |u| u.name = name }
end
```

## Idioms

- Prefer `&:method` shorthand: `users.map(&:name)` over `users.map { |u| u.name }`
- Prefer `each` over `for`
- Use guard clauses for early returns

## Reference

See skill: `ruby-patterns` for comprehensive Ruby idioms and patterns.
