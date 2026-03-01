# Rails Testing

> This file extends [common/testing.md](../common/testing.md) with Rails specific content.

## Framework

Use **RSpec-Rails** + **FactoryBot** + **Capybara**.

## Test Types

- **Request specs** over controller specs (test full stack)
- **System tests** with Capybara for E2E user flows
- **Model specs** for validations and business logic

## Database Strategy

- `:transaction` for unit/request specs (fast rollback)
- `:truncation` for system tests (Capybara runs in separate thread)

## Factories

```ruby
FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    email { Faker::Internet.email }
  end
end
```

## Reference

See skill: `rails-tdd` for comprehensive Rails TDD patterns.
