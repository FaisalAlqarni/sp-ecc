# Ruby Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Ruby specific content.

## Service Objects

```ruby
class CreateUser
  def self.call(params)
    new(params).call
  end

  def initialize(params)
    @params = params
  end

  def call
    # Business logic here
  end
end
```

Convention: single public method `.call`, class named as verb phrase.

## Value Objects

Use `Struct` or `Data` (Ruby 3.2+) for immutable value types:

```ruby
Point = Data.define(:x, :y)
point = Point.new(x: 1, y: 2)
```

## Composition Over Inheritance

Prefer modules and delegation over deep class hierarchies.

## Reference

See skill: `ruby-patterns` for comprehensive patterns including query objects, decorators, and presenters.
