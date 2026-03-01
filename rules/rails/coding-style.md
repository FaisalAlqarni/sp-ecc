# Rails Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Rails specific content.

## Conventions

- Follow Rails conventions — convention over configuration
- Fat models, skinny controllers
- Use **strong parameters** for all controller inputs
- Enforce with `rubocop-rails` cops
- RESTful routing — 7 standard actions, custom routes only when necessary

## Controller Pattern

```ruby
# WRONG: Business logic in controller
def create
  @user = User.new(user_params)
  @user.send_welcome_email if @user.save
end

# CORRECT: Delegate to service
def create
  result = CreateUser.call(user_params)
  # Handle result
end
```

## Concerns

Use concerns for shared behavior across models/controllers. Keep them focused — one responsibility per concern.

## Reference

See skill: `rails-patterns` for comprehensive Rails patterns including engines, service layer, and form objects.
