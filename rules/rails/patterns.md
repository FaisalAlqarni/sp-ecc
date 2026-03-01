# Rails Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Rails specific content.

## Service Layer

Keep business logic in service objects, not controllers or models.

## Query Objects

```ruby
class ActiveUsersQuery
  def self.call(scope = User.all)
    scope.where(active: true).where("last_login_at > ?", 30.days.ago)
  end
end
```

## N+1 Prevention

```ruby
# WRONG: N+1 query
users.each { |u| u.posts.count }

# CORRECT: Eager loading
users = User.includes(:posts).all
```

Use `includes`, `eager_load`, or `preload` depending on the query pattern.

## Engines

For large apps, use Rails engines to isolate bounded contexts. Each engine has its own models, controllers, routes, and tests.

## Reference

See skill: `rails-patterns` for comprehensive Rails patterns including form objects and scoping.
