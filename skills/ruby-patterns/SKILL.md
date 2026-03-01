---
name: ruby-patterns
description: Use when writing Ruby code - provides idiomatic patterns, best practices, and community standards for maintainable Ruby
---

# Ruby Patterns

Expert guidance for writing idiomatic, maintainable Ruby code following best practices and community standards.

## Core Ruby Idioms

### Blocks, Procs, and Lambdas

**Blocks** - The Ruby Way of Iteration
```ruby
# Prefer blocks for iteration and callbacks
users.each { |user| user.activate! }

# Use do...end for multi-line blocks
users.select do |user|
  user.active? && user.verified?
end

# Implicit block with yield
def with_timing
  start = Time.now
  yield
  Time.now - start
end

# Explicit block parameter
def retry_on_failure(&block)
  block.call
rescue StandardError => e
  retry if retries < 3
end
```

**Procs** - Reusable Code Blocks
```ruby
# Procs don't enforce arity
greeting = Proc.new { |name| "Hello, #{name}!" }
greeting.call("Alice")  # => "Hello, Alice!"
greeting.call           # => "Hello, !" (no error)

# Use procs for flexible callbacks
class EventEmitter
  def on(event, &handler)
    @handlers ||= {}
    @handlers[event] = handler
  end

  def emit(event, *args)
    @handlers[event]&.call(*args)
  end
end
```

**Lambdas** - Strict Anonymous Functions
```ruby
# Lambdas enforce arity and have explicit returns
multiply = ->(x, y) { x * y }
multiply.call(3, 4)  # => 12
multiply.call(3)     # ArgumentError

# Use lambdas for strict validation
class Validator
  def initialize
    @rules = []
  end

  def add_rule(&rule)
    @rules << rule
  end

  def validate(value)
    @rules.all? { |rule| rule.call(value) }
  end
end

validator = Validator.new
validator.add_rule { |x| x.is_a?(String) }
validator.add_rule { |x| x.length > 3 }
```

### Symbols vs Strings

```ruby
# Use symbols for identifiers and keys
user = { name: "Alice", role: :admin }

# Use strings for data
message = "Hello, #{user[:name]}"

# Symbols are immutable and memory-efficient
:status.object_id == :status.object_id  # true
"status".object_id == "status".object_id # false

# Hash symbol key shorthand
def create_user(name:, email:, role: :member)
  { name: name, email: email, role: role }
end
```

## Gems and Bundler

### Gemfile Best Practices

```ruby
source 'https://rubygems.org'

ruby '3.2.0'

# Lock major versions
gem 'rails', '~> 7.0'
gem 'puma', '~> 6.0'

# Group dependencies appropriately
group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'factory_bot_rails', '~> 6.2'
  gem 'faker', '~> 3.2'
end

group :development do
  gem 'rubocop', '~> 1.50', require: false
  gem 'rubocop-rails', require: false
  gem 'bullet'
end

group :test do
  gem 'simplecov', require: false
  gem 'webmock', '~> 3.18'
end

# Pin specific versions for critical dependencies
gem 'devise', '4.9.2'

# Use git sources sparingly
gem 'custom_gem', git: 'https://github.com/org/custom_gem', branch: 'main'
```

### Bundler Commands

```bash
# Install dependencies
bundle install

# Update specific gem
bundle update rails

# Check for security vulnerabilities
bundle audit

# Show outdated gems
bundle outdated

# Execute in bundle context
bundle exec rake db:migrate
bundle exec rspec

# Create standalone binstubs
bundle binstubs rspec-core
```

## Style Guide (RuboCop Standards)

### Code Layout

```ruby
# Use 2-space indentation (never tabs)
class User
  def initialize(name)
    @name = name
  end
end

# Max line length: 120 characters
# Break long lines logically
user = User.create(
  name: "Alice",
  email: "alice@example.com",
  role: :admin
)

# Use trailing commas in multi-line collections
COLORS = [
  :red,
  :green,
  :blue,
]

# Align hash rockets or use new syntax
old_style = { :name => "Alice", :age => 30 }
new_style = { name: "Alice", age: 30 }
```

### Naming Conventions

```ruby
# Classes and modules: PascalCase
class UserAccount; end
module PaymentProcessor; end

# Methods and variables: snake_case
def calculate_total_price; end
user_name = "Alice"

# Constants: SCREAMING_SNAKE_CASE
MAX_RETRIES = 3
API_ENDPOINT = "https://api.example.com"

# Predicates end with ?
def active?
  @status == :active
end

# Dangerous methods end with !
def save!
  raise ValidationError unless valid?
  persist
end

# Private methods start with _ (optional convention)
private

def _internal_calculation
  # ...
end
```

### Method Organization

```ruby
class User
  # Constants first
  VALID_ROLES = [:admin, :member, :guest].freeze

  # Class methods
  def self.find_active
    where(active: true)
  end

  # Initializer
  def initialize(name)
    @name = name
  end

  # Public methods
  def activate!
    @active = true
  end

  def active?
    @active
  end

  # Protected methods
  protected

  def validate_role
    VALID_ROLES.include?(@role)
  end

  # Private methods
  private

  def sanitize_name
    @name.strip.downcase
  end
end
```

## Performance Patterns

### Memory Optimization

```ruby
# Use symbols for repeated strings
# Bad
users.map { |u| u["name"] }

# Good
users.map { |u| u[:name] }

# Freeze strings to prevent mutation
ERROR_MESSAGE = "Something went wrong".freeze

# Use heredocs for large strings
TEMPLATE = <<~HTML
  <div class="user">
    <h1>#{name}</h1>
  </div>
HTML

# Avoid creating unnecessary objects
# Bad
10.times { User.new.process }

# Good
user = User.new
10.times { user.process }
```

### Efficient Iteration

```ruby
# Use each instead of for
# Bad
for item in items
  process(item)
end

# Good
items.each { |item| process(item) }

# Use map for transformations
names = users.map(&:name)

# Use select/reject for filtering
active_users = users.select(&:active?)
inactive_users = users.reject(&:active?)

# Use reduce for aggregation
total = numbers.reduce(0, :+)
total = numbers.reduce(0) { |sum, n| sum + n }

# Lazy evaluation for large collections
(1..Float::INFINITY)
  .lazy
  .select { |n| n % 3 == 0 }
  .take(10)
  .to_a
```

### String Performance

```ruby
# Use string interpolation instead of concatenation
# Bad
message = "Hello, " + name + "!"

# Good
message = "Hello, #{name}!"

# Use << for building strings in loops
# Bad
result = ""
items.each { |item| result += item.to_s }

# Good
result = ""
items.each { |item| result << item.to_s }

# Or use join
result = items.map(&:to_s).join
```

### Memoization

```ruby
# Cache expensive computations
class Report
  def total
    @total ||= calculate_total
  end

  # For boolean values, use defined?
  def valid?
    return @valid if defined?(@valid)
    @valid = perform_validation
  end

  # For nil-safe memoization
  def cached_value
    return @cached_value if instance_variable_defined?(:@cached_value)
    @cached_value = expensive_operation
  end
end
```

## Error Handling

### Exception Hierarchy

```ruby
# Custom exceptions inherit from StandardError
class PaymentError < StandardError; end
class InsufficientFundsError < PaymentError; end
class InvalidCardError < PaymentError; end

# Add context with custom exceptions
class ValidationError < StandardError
  attr_reader :field, :value

  def initialize(field, value, message = nil)
    @field = field
    @value = value
    super(message || "Invalid #{field}: #{value}")
  end
end

raise ValidationError.new(:email, "invalid", "Email format is incorrect")
```

### Rescue Best Practices

```ruby
# Be specific with rescue
# Bad
begin
  risky_operation
rescue
  handle_error
end

# Good
begin
  risky_operation
rescue StandardError => e
  handle_error(e)
end

# Rescue specific exceptions
begin
  payment.process!
rescue InsufficientFundsError => e
  notify_user("Insufficient funds")
rescue InvalidCardError => e
  notify_user("Invalid card")
rescue PaymentError => e
  log_error(e)
  notify_admin(e)
end

# Use rescue modifier for simple cases
result = risky_operation rescue default_value

# Ensure cleanup happens
def process_file(path)
  file = File.open(path)
  process(file)
ensure
  file.close if file
end

# Retry with limit
def fetch_data
  retries = 0
  begin
    api.fetch
  rescue NetworkError => e
    retries += 1
    retry if retries < 3
    raise
  end
end
```

### Fail Fast

```ruby
# Validate early
def process_payment(amount, card)
  raise ArgumentError, "Amount must be positive" if amount <= 0
  raise ArgumentError, "Card required" if card.nil?

  # Process payment
end

# Use guard clauses
def calculate_discount(user, amount)
  return 0 unless user.active?
  return 0 if amount < 10

  amount * user.discount_rate
end
```

## Module and Class Organization

### Module Mixins

```ruby
# Use modules for shared behavior
module Timestampable
  def touch
    @updated_at = Time.now
  end

  def created_at
    @created_at ||= Time.now
  end
end

class User
  include Timestampable
end

# Use extend for class methods
module Findable
  def find_by_name(name)
    all.find { |item| item.name == name }
  end
end

class User
  extend Findable
end

# ActiveSupport::Concern pattern
module Trackable
  extend ActiveSupport::Concern

  included do
    before_save :update_timestamp
  end

  class_methods do
    def recent
      where("created_at > ?", 1.day.ago)
    end
  end

  def update_timestamp
    self.updated_at = Time.now
  end
end
```

### Inheritance vs Composition

```ruby
# Prefer composition over inheritance
# Bad
class AdminUser < User
  def delete_user(user)
    user.destroy
  end
end

# Good
class User
  attr_reader :role

  def initialize(role:)
    @role = role
  end

  def can_delete_users?
    role.can?(:delete_users)
  end
end

class Role
  def initialize(permissions)
    @permissions = permissions
  end

  def can?(action)
    @permissions.include?(action)
  end
end

# Use inheritance for "is-a" relationships
class Animal
  def breathe
    # ...
  end
end

class Dog < Animal
  def bark
    # ...
  end
end
```

### Namespacing

```ruby
# Organize related classes in modules
module Payment
  class Processor
    def process(amount)
      # ...
    end
  end

  class Validator
    def valid?(card)
      # ...
    end
  end

  class Error < StandardError; end
end

# Use in code
processor = Payment::Processor.new
processor.process(100)

# Avoid deep nesting (max 2-3 levels)
module Company
  module Payment
    module CreditCard
      class Processor  # Getting too deep
      end
    end
  end
end
```

## Common Patterns

### Service Objects

```ruby
# Encapsulate complex business logic
class UserRegistration
  def initialize(user_params)
    @user_params = user_params
  end

  def call
    validate!
    user = create_user
    send_welcome_email(user)
    notify_admin(user)
    user
  rescue => e
    handle_error(e)
    nil
  end

  private

  attr_reader :user_params

  def validate!
    raise ValidationError unless valid_email?
  end

  def create_user
    User.create!(user_params)
  end

  def send_welcome_email(user)
    UserMailer.welcome(user).deliver_later
  end

  def notify_admin(user)
    AdminNotifier.new_user(user).notify
  end

  def valid_email?
    user_params[:email] =~ URI::MailTo::EMAIL_REGEXP
  end

  def handle_error(error)
    Logger.error("Registration failed: #{error.message}")
  end
end

# Usage
result = UserRegistration.new(params).call
```

### Form Objects

```ruby
# Handle complex form logic
class UserRegistrationForm
  include ActiveModel::Model

  attr_accessor :first_name, :last_name, :email, :password, :terms_accepted

  validates :first_name, :last_name, :email, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }
  validates :terms_accepted, acceptance: true

  def save
    return false unless valid?

    user = User.new(user_attributes)
    user.save!
  end

  private

  def user_attributes
    {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password
    }
  end
end

# Usage
form = UserRegistrationForm.new(params)
if form.save
  redirect_to root_path
else
  render :new, status: :unprocessable_entity
end
```

### Decorators (Presenters)

```ruby
# Add presentation logic without polluting models
class UserDecorator
  def initialize(user)
    @user = user
  end

  def full_name
    "#{@user.first_name} #{@user.last_name}"
  end

  def formatted_created_at
    @user.created_at.strftime("%B %d, %Y")
  end

  def status_badge
    case @user.status
    when :active then '<span class="badge-success">Active</span>'
    when :inactive then '<span class="badge-warning">Inactive</span>'
    else '<span class="badge-secondary">Unknown</span>'
    end
  end

  # Delegate missing methods to user
  def method_missing(method, *args, &block)
    if @user.respond_to?(method)
      @user.send(method, *args, &block)
    else
      super
    end
  end

  def respond_to_missing?(method, include_private = false)
    @user.respond_to?(method) || super
  end
end

# Usage in view
user = UserDecorator.new(User.find(params[:id]))
user.full_name
user.formatted_created_at
```

### Query Objects

```ruby
# Encapsulate complex queries
class ActiveUsersQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call
    @relation
      .where(active: true)
      .where("last_login_at > ?", 30.days.ago)
      .order(created_at: :desc)
  end
end

class UserSearchQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call(search_params)
    result = @relation
    result = by_name(result, search_params[:name]) if search_params[:name]
    result = by_role(result, search_params[:role]) if search_params[:role]
    result = by_status(result, search_params[:status]) if search_params[:status]
    result
  end

  private

  def by_name(relation, name)
    relation.where("name ILIKE ?", "%#{name}%")
  end

  def by_role(relation, role)
    relation.where(role: role)
  end

  def by_status(relation, status)
    relation.where(status: status)
  end
end

# Usage
ActiveUsersQuery.new.call
UserSearchQuery.new.call(name: "Alice", role: :admin)
```

### Policy Objects

```ruby
# Encapsulate authorization logic
class UserPolicy
  def initialize(user, record)
    @user = user
    @record = record
  end

  def edit?
    user_is_owner? || user_is_admin?
  end

  def destroy?
    user_is_admin? && !record_is_self?
  end

  def update?
    edit?
  end

  private

  attr_reader :user, :record

  def user_is_owner?
    @user.id == @record.id
  end

  def user_is_admin?
    @user.role == :admin
  end

  def record_is_self?
    @user.id == @record.id
  end
end

# Usage
policy = UserPolicy.new(current_user, @user)
if policy.edit?
  # Allow edit
else
  # Deny access
end
```

### Value Objects

```ruby
# Represent simple domain concepts
class Money
  include Comparable

  attr_reader :amount, :currency

  def initialize(amount, currency = 'USD')
    @amount = amount.to_f
    @currency = currency
  end

  def +(other)
    raise CurrencyMismatch unless same_currency?(other)
    Money.new(@amount + other.amount, @currency)
  end

  def -(other)
    raise CurrencyMismatch unless same_currency?(other)
    Money.new(@amount - other.amount, @currency)
  end

  def *(multiplier)
    Money.new(@amount * multiplier, @currency)
  end

  def <=>(other)
    return nil unless same_currency?(other)
    @amount <=> other.amount
  end

  def to_s
    format("%.2f %s", @amount, @currency)
  end

  private

  def same_currency?(other)
    @currency == other.currency
  end

  class CurrencyMismatch < StandardError; end
end

# Usage
price = Money.new(10.50)
tax = Money.new(2.10)
total = price + tax
```

## Anti-Patterns to Avoid

### God Objects

```ruby
# Bad: One class doing everything
class User
  def authenticate; end
  def send_email; end
  def process_payment; end
  def generate_report; end
  def export_to_csv; end
end

# Good: Single responsibility
class User
  def authenticate; end
end

class UserMailer
  def send_welcome_email(user); end
end

class PaymentProcessor
  def process(user, amount); end
end
```

### Callback Hell

```ruby
# Bad: Complex callbacks
class User
  before_validation :normalize_email
  after_create :send_welcome_email
  after_create :create_profile
  after_create :notify_admin
  after_create :track_signup
  after_commit :sync_to_crm
end

# Good: Explicit service object
class UserRegistration
  def call
    user = User.create!(params)
    send_welcome_email(user)
    create_profile(user)
    notify_admin(user)
    track_signup(user)
    sync_to_crm(user)
    user
  end
end
```

### Long Parameter Lists

```ruby
# Bad
def create_user(first_name, last_name, email, password, role, department, manager_id)
  # ...
end

# Good: Use hash or object
def create_user(attributes)
  # ...
end

# Or value object
class UserAttributes
  attr_accessor :first_name, :last_name, :email, :password, :role, :department, :manager_id

  def initialize(**attrs)
    attrs.each { |key, value| send("#{key}=", value) }
  end
end
```

### Primitive Obsession

```ruby
# Bad: Using primitives everywhere
def charge_customer(customer_id, amount, currency)
  # ...
end

# Good: Use value objects
def charge_customer(customer, money)
  # money is a Money object
end
```

### Feature Envy

```ruby
# Bad: Method uses another object's data too much
class Invoice
  def total
    line_items.sum { |item| item.quantity * item.unit_price }
  end
end

# Good: Tell, don't ask
class LineItem
  def total
    quantity * unit_price
  end
end

class Invoice
  def total
    line_items.sum(&:total)
  end
end
```

### Excessive Method Chaining

```ruby
# Bad: Hard to debug and fragile
user.posts.published.recent.with_comments.first.comments.approved.map(&:author)

# Good: Break into steps
published_posts = user.posts.published.recent.with_comments
first_post = published_posts.first
return [] unless first_post

approved_comments = first_post.comments.approved
approved_comments.map(&:author)
```

## Testing Patterns

```ruby
# Use RSpec best practices
RSpec.describe UserRegistration do
  describe '#call' do
    let(:valid_params) { { email: 'test@example.com', password: 'password123' } }

    context 'with valid parameters' do
      it 'creates a user' do
        expect { described_class.new(valid_params).call }
          .to change(User, :count).by(1)
      end

      it 'sends welcome email' do
        expect(UserMailer).to receive(:welcome).and_call_original
        described_class.new(valid_params).call
      end
    end

    context 'with invalid email' do
      let(:invalid_params) { valid_params.merge(email: 'invalid') }

      it 'does not create user' do
        expect { described_class.new(invalid_params).call }
          .not_to change(User, :count)
      end
    end
  end
end
```

## Key Principles

1. **Follow the Ruby Way**: Embrace blocks, duck typing, and metaprogramming judiciously
2. **Keep It Simple**: Prefer clarity over cleverness
3. **Single Responsibility**: Each class/method should have one reason to change
4. **Use Descriptive Names**: Code should read like natural language
5. **Test Your Code**: Write tests first with RSpec or Minitest
6. **Follow Community Standards**: Use RuboCop and follow the Ruby Style Guide
7. **Optimize Wisely**: Profile first, optimize bottlenecks only
8. **Handle Errors Gracefully**: Use specific exceptions and fail fast
9. **Document Public APIs**: Use YARD or RDoc for library code
10. **Keep Dependencies Updated**: Regularly update gems and fix security issues

## Resources

- [Ruby Style Guide](https://rubystyle.guide/)
- [RuboCop](https://rubocop.org/)
- [Bundler Documentation](https://bundler.io/)
- [Ruby Documentation](https://ruby-doc.org/)
- [Practicing Ruby](https://practicingruby.com/)
- [Confident Ruby](http://www.confidentruby.com/)
- [Eloquent Ruby](http://eloquentruby.com/)
