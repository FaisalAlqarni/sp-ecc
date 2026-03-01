# Ruby Testing

> This file extends [common/testing.md](../common/testing.md) with Ruby specific content.

## Framework

Use **RSpec** as the testing framework.

## Coverage

```bash
# SimpleCov — 80% minimum
# Add to spec/spec_helper.rb:
require 'simplecov'
SimpleCov.start
```

## Test Organization

Use RSpec tags for categorization:

```ruby
RSpec.describe UserService, :unit do
  # ...
end

RSpec.describe "API Endpoints", :integration do
  # ...
end
```

## Fixtures

Use **FactoryBot** for test data — never raw SQL or fixtures files.

## Reference

See skill: `ruby-testing` for detailed RSpec patterns and test design.
