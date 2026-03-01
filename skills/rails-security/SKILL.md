---
name: rails-security
description: Use when reviewing or implementing security in Rails applications - covers OWASP guidelines and Rails-specific security patterns
---

# Rails Security

Comprehensive Ruby on Rails security patterns following OWASP guidelines and industry best practices for building secure web applications.

## OWASP Top 10 for Rails

### A01 - Broken Access Control

**Authorization with Pundit:**
```ruby
# app/policies/post_policy.rb
class PostPolicy < ApplicationPolicy
  def index?
    true  # Everyone can list posts
  end

  def show?
    record.published? || owner?
  end

  def create?
    user.present?
  end

  def update?
    owner? || user.admin?
  end

  def destroy?
    owner? || user.admin?
  end

  private

  def owner?
    user.present? && record.author_id == user.id
  end

  class Scope < Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user
        scope.where('published = ? OR author_id = ?', true, user.id)
      else
        scope.where(published: true)
      end
    end
  end
end

# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :edit, :update, :destroy]
  after_action :verify_authorized, except: [:index]
  after_action :verify_policy_scoped, only: [:index]

  def index
    @posts = policy_scope(Post)
  end

  def show
    authorize @post
  end

  def edit
    authorize @post
  end

  def update
    authorize @post
    if @post.update(post_params)
      redirect_to @post, notice: 'Post updated successfully'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @post
    @post.destroy
    redirect_to posts_url, notice: 'Post deleted successfully'
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:title, :body, :published)
  end
end
```

**Authorization with CanCanCan:**
```ruby
# app/models/ability.rb
class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new  # Guest user

    if user.admin?
      can :manage, :all
    elsif user.moderator?
      can :read, :all
      can :manage, Post, author_id: user.id
      can :update, Comment
    else
      can :read, Post, published: true
      can :create, Post
      can :manage, Post, author_id: user.id
      can :manage, Comment, author_id: user.id
    end

    # Prevent privilege escalation
    cannot :update, User do |u|
      u.admin? && !user.admin?
    end
  end
end

# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  load_and_authorize_resource

  def index
    # @posts already loaded and scoped by CanCanCan
  end

  def update
    # Authorization already checked by load_and_authorize_resource
    if @post.update(post_params)
      redirect_to @post
    else
      render :edit
    end
  end
end
```

**Custom Policy Objects:**
```ruby
# app/policies/admin/user_policy.rb
module Admin
  class UserPolicy
    attr_reader :current_user, :user

    def initialize(current_user, user)
      @current_user = current_user
      @user = user
    end

    def edit?
      current_user.admin? && !user.admin?
    end

    def destroy?
      current_user.admin? && !user.admin? && user != current_user
    end

    def promote_to_admin?
      current_user.super_admin?
    end
  end
end

# Usage in controller
class Admin::UsersController < Admin::BaseController
  def edit
    @user = User.find(params[:id])
    policy = Admin::UserPolicy.new(current_user, @user)

    unless policy.edit?
      redirect_to admin_users_path, alert: 'Not authorized'
    end
  end
end
```

### A02 - Cryptographic Failures

**Secure Password Storage:**
```ruby
# Use bcrypt for password hashing (built into Rails)
# Gemfile
gem 'bcrypt'

# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  validates :password, length: { minimum: 12 }, if: :password_required?
  validates :password, format: {
    with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    message: "must include uppercase, lowercase, number, and special character"
  }, if: :password_required?

  private

  def password_required?
    password_digest.nil? || password.present?
  end
end
```

**Encrypted Credentials:**
```ruby
# Store secrets in encrypted credentials
# config/credentials.yml.enc (encrypted)
rails credentials:edit

# Add secrets:
# stripe:
#   secret_key: sk_live_xxx
#   publishable_key: pk_live_xxx
# database:
#   production:
#     password: secure_password

# Access credentials
Rails.application.credentials.dig(:stripe, :secret_key)
Rails.application.credentials.database[:production][:password]

# Environment-specific credentials
rails credentials:edit --environment production
rails credentials:edit --environment staging

# config/environments/production.rb
Stripe.api_key = Rails.application.credentials.dig(:stripe, :secret_key)
```

**Encryption at Rest:**
```ruby
# Gemfile
gem 'attr_encrypted'

# app/models/user.rb
class User < ApplicationRecord
  attr_encrypted :ssn, key: Rails.application.credentials.encryption_key

  # ActiveRecord Encryption (Rails 7+)
  encrypts :ssn
  encrypts :credit_card, deterministic: true  # For searching
end

# config/application.rb
config.active_record.encryption.primary_key = Rails.application.credentials.active_record_encryption[:primary_key]
config.active_record.encryption.deterministic_key = Rails.application.credentials.active_record_encryption[:deterministic_key]
config.active_record.encryption.key_derivation_salt = Rails.application.credentials.active_record_encryption[:key_derivation_salt]
```

**Secure Token Generation:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_token :auth_token
  has_secure_token :reset_password_token

  def generate_password_reset_token!
    self.reset_password_token = SecureRandom.urlsafe_base64(32)
    self.reset_password_sent_at = Time.current
    save!
  end

  def password_reset_expired?
    reset_password_sent_at < 2.hours.ago
  end
end

# Generate secure random values
SecureRandom.hex(32)           # 64-character hex string
SecureRandom.urlsafe_base64(32) # URL-safe base64 string
SecureRandom.uuid              # UUID v4
```

### A03 - Injection

**SQL Injection Prevention:**
```ruby
# BAD: String interpolation/concatenation
User.where("email = '#{params[:email]}'")  # VULNERABLE!
User.where("name LIKE '%#{params[:query]}%'")  # VULNERABLE!

# GOOD: Parameterized queries
User.where("email = ?", params[:email])
User.where(email: params[:email])
User.where("name LIKE ?", "%#{params[:query]}%")

# Multiple parameters
User.where("created_at > ? AND status = ?", 1.week.ago, 'active')
User.where("email = :email AND status = :status", email: params[:email], status: 'active')

# Array conditions
User.where(["email = ? OR username = ?", params[:email], params[:username]])

# Hash conditions (safest for equality)
User.where(email: params[:email], status: 'active')

# Dynamic conditions with sanitization
column = sanitize_sql_for_conditions(params[:column])
User.where("#{column} = ?", params[:value])

# Use Arel for complex queries
users = User.arel_table
User.where(users[:email].matches("%#{params[:query]}%"))
```

**Safe Query Building:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  ALLOWED_SORT_COLUMNS = %w[created_at updated_at name email].freeze
  ALLOWED_SORT_DIRECTIONS = %w[asc desc].freeze

  def self.search(params)
    scope = all

    if params[:query].present?
      scope = scope.where("name ILIKE ? OR email ILIKE ?",
                          "%#{sanitize_sql_like(params[:query])}%",
                          "%#{sanitize_sql_like(params[:query])}%")
    end

    if params[:status].present? && %w[active inactive].include?(params[:status])
      scope = scope.where(status: params[:status])
    end

    if params[:sort].present? && ALLOWED_SORT_COLUMNS.include?(params[:sort])
      direction = params[:direction].in?(ALLOWED_SORT_DIRECTIONS) ? params[:direction] : 'asc'
      scope = scope.order("#{params[:sort]} #{direction}")
    end

    scope
  end
end
```

**Command Injection Prevention:**
```ruby
# BAD: Shell command injection
system("convert #{params[:file]} output.png")  # VULNERABLE!
`cat #{params[:filename]}`  # VULNERABLE!

# GOOD: Use array syntax (no shell interpretation)
system("convert", params[:file], "output.png")
system(["convert", "convert"], params[:file], "output.png")  # [command, argv[0]]

# Use shellwords for proper escaping
require 'shellwords'
file = Shellwords.escape(params[:file])
system("convert #{file} output.png")

# Better: Use Ruby libraries instead of shell commands
require 'mini_magick'
image = MiniMagick::Image.open(params[:file])
image.format('png')
image.write('output.png')

# File operations - use File/FileUtils
FileUtils.cp(source, destination)
File.read(filepath)
```

**NoSQL Injection Prevention:**
```ruby
# MongoDB with Mongoid
# BAD: Passing user input directly
User.where(eval("{ email: '#{params[:email]}' }"))  # VULNERABLE!

# GOOD: Use parameterized queries
User.where(email: params[:email])
User.where(:created_at.gte => params[:start_date])

# Sanitize operators
ALLOWED_OPERATORS = %w[gt gte lt lte ne in nin].freeze

def build_query(field, operator, value)
  return {} unless ALLOWED_OPERATORS.include?(operator)
  { field.to_sym.send(operator) => value }
end
```

### A04 - Insecure Design

**Rate Limiting:**
```ruby
# Gemfile
gem 'rack-attack'

# config/initializers/rack_attack.rb
class Rack::Attack
  # Throttle login attempts by IP
  throttle('limit_login_attempts_per_ip', limit: 5, period: 60.seconds) do |req|
    if req.path == '/login' && req.post?
      req.ip
    end
  end

  # Throttle login attempts by email
  throttle('limit_login_attempts_per_email', limit: 5, period: 60.seconds) do |req|
    if req.path == '/login' && req.post?
      req.params['email']&.downcase
    end
  end

  # Throttle API requests
  throttle('api_requests', limit: 100, period: 15.minutes) do |req|
    req.env['HTTP_AUTHORIZATION'] if req.path.start_with?('/api/')
  end

  # Block suspicious requests
  blocklist('block_bad_ips') do |req|
    BadIp.exists?(ip: req.ip)
  end

  # Custom response for throttled requests
  self.throttled_responder = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      { 'Content-Type' => 'application/json', 'Retry-After' => retry_after.to_s },
      [{ error: 'Rate limit exceeded. Try again later.' }.to_json]
    ]
  end
end

# config/application.rb
config.middleware.use Rack::Attack
```

**Session Management:**
```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: '_myapp_session',
  httponly: true,     # Prevent JavaScript access
  secure: Rails.env.production?,  # HTTPS only in production
  same_site: :lax     # CSRF protection

# config/application.rb
config.session_store :cookie_store,
  key: '_myapp_session',
  expire_after: 4.hours

# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :validate_session

  private

  def validate_session
    if session[:expires_at] && session[:expires_at] < Time.current
      reset_session
      redirect_to login_path, alert: 'Session expired'
    else
      session[:expires_at] = 4.hours.from_now
    end
  end

  # Regenerate session on login (prevent session fixation)
  def create_user_session(user)
    reset_session  # Clear old session
    session[:user_id] = user.id
    session[:expires_at] = 4.hours.from_now
    session[:ip_address] = request.remote_ip
    session[:user_agent] = request.user_agent
  end

  # Validate session consistency
  def validate_session_consistency
    if session[:ip_address] != request.remote_ip ||
       session[:user_agent] != request.user_agent
      reset_session
      redirect_to login_path, alert: 'Session invalid'
    end
  end
end
```

### A05 - Security Misconfiguration

**Security Headers:**
```ruby
# Gemfile
gem 'secure_headers'

# config/initializers/secure_headers.rb
SecureHeaders::Configuration.default do |config|
  config.x_frame_options = "DENY"
  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = %w[origin-when-cross-origin strict-origin-when-cross-origin]

  # Content Security Policy
  config.csp = {
    default_src: %w['self'],
    script_src: %w['self' 'unsafe-inline' https://cdn.example.com],
    style_src: %w['self' 'unsafe-inline' https://cdn.example.com],
    img_src: %w['self' data: https:],
    font_src: %w['self' data: https://fonts.gstatic.com],
    connect_src: %w['self' https://api.example.com],
    frame_ancestors: %w['none'],
    base_uri: %w['self'],
    form_action: %w['self'],
    upgrade_insecure_requests: true
  }

  # Strict Transport Security
  config.hsts = "max-age=31536000; includeSubDomains; preload"
end

# Override CSP for specific controller
class WidgetsController < ApplicationController
  content_security_policy do |policy|
    policy.script_src :self, :https, 'https://widget-cdn.example.com'
  end
end
```

**Environment Configuration:**
```ruby
# config/environments/production.rb
Rails.application.configure do
  # Force SSL
  config.force_ssl = true
  config.ssl_options = {
    hsts: { subdomains: true, preload: true, expires: 1.year }
  }

  # Disable debug mode
  config.consider_all_requests_local = false
  config.debug_exception_response_format = :api

  # Secure cookies
  config.session_store :cookie_store,
    key: '_myapp_session',
    secure: true,
    httponly: true,
    same_site: :strict

  # Disable unnecessary features
  config.public_file_server.enabled = false

  # Use secure random secret key base
  config.secret_key_base = Rails.application.credentials.secret_key_base

  # Log security events
  config.log_level = :info
end

# config/environments/development.rb
Rails.application.configure do
  # Show detailed errors in development
  config.consider_all_requests_local = true

  # Don't require SSL in development
  config.force_ssl = false

  # Use different session key
  config.session_store :cookie_store,
    key: '_myapp_session_dev'
end
```

### A06 - Vulnerable Components

**Dependency Management:**
```ruby
# Gemfile - Pin versions
gem 'rails', '~> 7.1.0'
gem 'devise', '~> 4.9'
gem 'pundit', '~> 2.3'

# Avoid using git sources in production
# gem 'some_gem', git: 'https://github.com/user/repo'  # Avoid

# Use Bundler audit
# Gemfile
group :development do
  gem 'bundler-audit'
end

# Check for vulnerabilities
bundle audit check --update

# Add to CI/CD
# .github/workflows/security.yml
# - name: Security audit
#   run: |
#     gem install bundler-audit
#     bundle audit check --update

# Auto-update dependencies with Dependabot
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "bundler"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Keep Rails Updated:**
```bash
# Check for Rails security updates
gem list rails

# Update Rails
bundle update rails

# Check for security announcements
# Subscribe to: https://groups.google.com/g/rubyonrails-security
```

### A07 - Authentication Failures

**Devise Configuration:**
```ruby
# config/initializers/devise.rb
Devise.setup do |config|
  # Strong password requirements
  config.password_length = 12..128

  # Lock account after failed attempts
  config.lock_strategy = :failed_attempts
  config.unlock_strategy = :time
  config.maximum_attempts = 5
  config.unlock_in = 1.hour

  # Timeout sessions
  config.timeout_in = 30.minutes

  # Require email confirmation
  config.reconfirmable = true

  # Use bcrypt
  config.stretches = Rails.env.test? ? 1 : 12

  # Paranoid mode (don't reveal if email exists)
  config.paranoid = true

  # Email regex
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
end

# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :lockable, :timeoutable,
         :trackable, :omniauthable

  validates :password, password_strength: true
end
```

**Custom Authentication:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 12 }, allow_nil: true

  # Track failed login attempts
  def increment_failed_attempts!
    increment!(:failed_attempts)
    lock_account! if failed_attempts >= 5
  end

  def reset_failed_attempts!
    update!(failed_attempts: 0, locked_at: nil)
  end

  def lock_account!
    update!(locked_at: Time.current)
  end

  def locked?
    locked_at.present? && locked_at > 1.hour.ago
  end

  # Password reset with expiration
  def send_password_reset!
    self.reset_password_token = SecureRandom.urlsafe_base64(32)
    self.reset_password_sent_at = Time.current
    save!
    UserMailer.password_reset(self).deliver_later
  end

  def password_reset_valid?
    reset_password_sent_at.present? && reset_password_sent_at > 2.hours.ago
  end
end

# app/controllers/sessions_controller.rb
class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email]&.downcase)

    if user&.locked?
      flash.now[:alert] = 'Account is locked. Please try again later.'
      render :new, status: :unprocessable_entity
      return
    end

    if user&.authenticate(params[:password])
      user.reset_failed_attempts!
      create_user_session(user)
      redirect_to root_path, notice: 'Logged in successfully'
    else
      user&.increment_failed_attempts!
      flash.now[:alert] = 'Invalid email or password'
      render :new, status: :unprocessable_entity
    end
  end

  private

  def create_user_session(user)
    reset_session
    session[:user_id] = user.id
    session[:expires_at] = 4.hours.from_now
  end
end
```

**Multi-Factor Authentication:**
```ruby
# Gemfile
gem 'rotp'  # TOTP
gem 'rqrcode'  # QR code generation

# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  def enable_two_factor!
    self.otp_secret = ROTP::Base32.random
    save!
  end

  def verify_otp(code)
    return false if otp_secret.blank?
    totp = ROTP::TOTP.new(otp_secret)
    totp.verify(code, drift_behind: 30, drift_ahead: 30)
  end

  def provisioning_uri
    totp = ROTP::TOTP.new(otp_secret, issuer: 'MyApp')
    totp.provisioning_uri(email)
  end

  def qr_code
    RQRCode::QRCode.new(provisioning_uri)
  end
end

# app/controllers/two_factor_controller.rb
class TwoFactorController < ApplicationController
  before_action :authenticate_user!

  def setup
    current_user.enable_two_factor!
    @qr_code = current_user.qr_code
  end

  def verify
    if current_user.verify_otp(params[:code])
      current_user.update!(two_factor_enabled: true)
      redirect_to root_path, notice: '2FA enabled successfully'
    else
      flash.now[:alert] = 'Invalid code'
      render :setup
    end
  end
end

# app/controllers/sessions_controller.rb
class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      if user.two_factor_enabled?
        session[:pending_2fa_user_id] = user.id
        redirect_to two_factor_verify_path
      else
        create_user_session(user)
        redirect_to root_path
      end
    else
      flash.now[:alert] = 'Invalid credentials'
      render :new
    end
  end

  def verify_two_factor
    user = User.find(session[:pending_2fa_user_id])

    if user.verify_otp(params[:code])
      session.delete(:pending_2fa_user_id)
      create_user_session(user)
      redirect_to root_path
    else
      flash.now[:alert] = 'Invalid 2FA code'
      render :two_factor
    end
  end
end
```

### A08 - Software and Data Integrity

**Secure File Uploads with Active Storage:**
```ruby
# config/storage.yml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: myapp-uploads

# config/environments/production.rb
config.active_storage.service = :amazon

# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar
  has_many_attached :documents

  validates :avatar, content_type: ['image/png', 'image/jpeg'],
                     size: { less_than: 5.megabytes }
end

# Custom validator
# app/validators/file_content_type_validator.rb
class FileContentTypeValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    allowed_types = options[:in]

    if value.attached?
      unless allowed_types.include?(value.content_type)
        record.errors.add(attribute, "must be one of: #{allowed_types.join(', ')}")
      end
    end
  end
end

# app/models/document.rb
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, presence: true,
                   file_content_type: { in: %w[application/pdf image/png image/jpeg] },
                   file_size: { less_than: 10.megabytes }

  # Scan for malware (using ClamAV)
  before_save :scan_for_malware

  private

  def scan_for_malware
    return unless file.attached?

    scanner = ClamAV::Scanner.new
    result = file.open { |f| scanner.scan(f) }

    if result.virus?
      errors.add(:file, 'contains malware')
      throw :abort
    end
  end
end

# Secure direct uploads
# app/controllers/direct_uploads_controller.rb
class DirectUploadsController < ActiveStorage::DirectUploadsController
  before_action :authenticate_user!

  def create
    # Validate before creating signed URL
    unless valid_content_type?(params[:blob][:content_type])
      render json: { error: 'Invalid file type' }, status: :unprocessable_entity
      return
    end

    unless valid_file_size?(params[:blob][:byte_size])
      render json: { error: 'File too large' }, status: :unprocessable_entity
      return
    end

    super
  end

  private

  def valid_content_type?(content_type)
    %w[image/png image/jpeg application/pdf].include?(content_type)
  end

  def valid_file_size?(size)
    size <= 10.megabytes
  end
end
```

**Image Processing Security:**
```ruby
# Gemfile
gem 'image_processing'

# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar do |attachable|
    attachable.variant :thumb, resize_to_limit: [100, 100]
    attachable.variant :medium, resize_to_limit: [300, 300]
  end

  # Process and strip metadata
  after_commit :process_avatar, on: [:create, :update]

  private

  def process_avatar
    return unless avatar.attached?

    ImageProcessingJob.perform_later(avatar)
  end
end

# app/jobs/image_processing_job.rb
class ImageProcessingJob < ApplicationJob
  def perform(attachment)
    return unless attachment.image?

    # Strip EXIF data and metadata
    attachment.open do |file|
      image = MiniMagick::Image.new(file.path)
      image.auto_orient  # Fix orientation
      image.strip        # Remove metadata
      image.write(file.path)
    end
  end
end
```

### A09 - Security Logging Failures

**Comprehensive Logging:**
```ruby
# config/application.rb
config.log_level = :info
config.log_tags = [:request_id, :remote_ip]

# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :log_request_info
  after_action :log_response_info

  private

  def log_request_info
    Rails.logger.info({
      request_id: request.uuid,
      method: request.method,
      path: request.path,
      ip: request.remote_ip,
      user_id: current_user&.id,
      user_agent: request.user_agent,
      timestamp: Time.current
    }.to_json)
  end

  def log_response_info
    Rails.logger.info({
      request_id: request.uuid,
      status: response.status,
      duration: request_duration
    }.to_json)
  end

  # Log authentication events
  def log_authentication_event(event, user, success:, reason: nil)
    Rails.logger.info({
      event: event,
      user_id: user&.id,
      email: user&.email,
      success: success,
      reason: reason,
      ip: request.remote_ip,
      user_agent: request.user_agent,
      timestamp: Time.current
    }.to_json)
  end

  # Log authorization failures
  rescue_from Pundit::NotAuthorizedError do |exception|
    Rails.logger.warn({
      event: 'authorization_failure',
      user_id: current_user&.id,
      policy: exception.policy.class.name,
      query: exception.query,
      record: exception.record.class.name,
      ip: request.remote_ip,
      timestamp: Time.current
    }.to_json)

    redirect_to root_path, alert: 'Not authorized'
  end
end

# app/controllers/sessions_controller.rb
class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      log_authentication_event('login', user, success: true)
      create_user_session(user)
      redirect_to root_path
    else
      log_authentication_event('login', user, success: false, reason: 'invalid_credentials')
      flash.now[:alert] = 'Invalid credentials'
      render :new
    end
  end

  def destroy
    log_authentication_event('logout', current_user, success: true)
    reset_session
    redirect_to root_path
  end
end
```

**Security Monitoring:**
```ruby
# app/models/security_event.rb
class SecurityEvent < ApplicationRecord
  EVENTS = %w[
    login_success login_failure logout
    password_reset_request password_reset_success
    account_locked account_unlocked
    authorization_failure
    suspicious_activity
  ].freeze

  validates :event_type, inclusion: { in: EVENTS }

  scope :recent, -> { where('created_at > ?', 1.week.ago) }
  scope :failures, -> { where('event_type LIKE ?', '%failure%') }

  def self.log_event(event_type, user_id: nil, ip_address: nil, metadata: {})
    create!(
      event_type: event_type,
      user_id: user_id,
      ip_address: ip_address,
      metadata: metadata,
      created_at: Time.current
    )
  end

  def self.detect_brute_force(ip_address)
    failures.where(ip_address: ip_address)
            .where('created_at > ?', 10.minutes.ago)
            .count > 10
  end
end

# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :check_for_suspicious_activity

  private

  def check_for_suspicious_activity
    if SecurityEvent.detect_brute_force(request.remote_ip)
      SecurityEvent.log_event('suspicious_activity', ip_address: request.remote_ip)
      render plain: 'Access denied', status: :forbidden
    end
  end
end
```

### A10 - Server-Side Request Forgery (SSRF)

**URL Validation:**
```ruby
# app/services/url_fetcher.rb
class UrlFetcher
  ALLOWED_SCHEMES = %w[http https].freeze
  BLOCKED_IPS = [
    IPAddr.new('127.0.0.0/8'),    # Localhost
    IPAddr.new('10.0.0.0/8'),     # Private
    IPAddr.new('172.16.0.0/12'),  # Private
    IPAddr.new('192.168.0.0/16'), # Private
    IPAddr.new('169.254.0.0/16'), # Link-local
    IPAddr.new('::1'),            # IPv6 localhost
    IPAddr.new('fc00::/7')        # IPv6 private
  ].freeze

  def self.fetch(url)
    uri = URI.parse(url)

    # Validate scheme
    unless ALLOWED_SCHEMES.include?(uri.scheme)
      raise SecurityError, "Invalid URL scheme: #{uri.scheme}"
    end

    # Validate host
    validate_host!(uri.host)

    # Fetch with timeout
    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: uri.scheme == 'https',
      open_timeout: 5,
      read_timeout: 10
    ) do |http|
      http.get(uri.request_uri)
    end

    response.body
  rescue => e
    Rails.logger.error("URL fetch failed: #{e.message}")
    raise
  end

  def self.validate_host!(host)
    # Resolve hostname to IP
    addresses = Resolv.getaddresses(host)

    # Check if any resolved IP is blocked
    addresses.each do |address|
      ip = IPAddr.new(address)

      BLOCKED_IPS.each do |blocked|
        if blocked.include?(ip)
          raise SecurityError, "Access to #{address} is not allowed"
        end
      end
    end
  rescue Resolv::ResolvError => e
    raise SecurityError, "Cannot resolve hostname: #{host}"
  end
end

# app/controllers/webhooks_controller.rb
class WebhooksController < ApplicationController
  def create
    url = params[:callback_url]

    # Validate URL before making request
    begin
      UrlFetcher.fetch(url)
      render json: { success: true }
    rescue SecurityError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
```

## Cross-Site Scripting (XSS) Prevention

### Output Escaping

**Safe Rendering:**
```ruby
# ERB automatically escapes HTML
<%# SAFE: Escapes HTML by default %>
<%= @user.name %>
<%= @post.title %>

# DANGEROUS: html_safe bypasses escaping
<%# VULNERABLE! %>
<%= @user.bio.html_safe %>
<%= raw @post.content %>

# GOOD: Sanitize before rendering
<%= sanitize @post.content %>
<%= sanitize @post.content, tags: %w[p br strong em], attributes: %w[href] %>

# Custom sanitizer
class ApplicationSanitizer < Rails::Html::SafeListSanitizer
  def allowed_tags
    %w[p br strong em ul ol li a]
  end

  def allowed_attributes
    %w[href title]
  end
end

<%= ApplicationSanitizer.new.sanitize(@post.content) %>
```

**Safe Helpers:**
```ruby
# app/helpers/application_helper.rb
module ApplicationHelper
  # Use content_tag instead of raw HTML
  def user_badge(user)
    content_tag :span, user.name, class: 'badge'
  end

  # Safe link helper
  def safe_link_to(text, url, options = {})
    # Validate URL scheme
    uri = URI.parse(url)
    return content_tag(:span, text) unless %w[http https mailto].include?(uri.scheme)

    link_to text, url, options
  rescue URI::InvalidURIError
    content_tag(:span, text)
  end

  # Markdown with sanitization
  def safe_markdown(text)
    markdown = Redcarpet::Markdown.new(
      Redcarpet::Render::HTML.new(filter_html: true, hard_wrap: true),
      autolink: true,
      space_after_headers: true,
      fenced_code_blocks: true,
      no_intra_emphasis: true
    )

    sanitize markdown.render(text),
             tags: %w[p br strong em ul ol li code pre a h1 h2 h3],
             attributes: %w[href]
  end
end
```

**JavaScript Context:**
```erb
<%# BAD: Interpolating into JavaScript %>
<script>
  var name = '<%= @user.name %>';  // VULNERABLE!
</script>

<%# GOOD: Use JSON encoding %>
<script>
  var user = <%= raw @user.to_json %>;
  var name = <%= @user.name.to_json %>;
</script>

<%# Better: Use data attributes %>
<div id="user-widget" data-user="<%= @user.to_json %>"></div>
<script>
  var userData = JSON.parse(document.getElementById('user-widget').dataset.user);
</script>
```

### Content Security Policy

```ruby
# config/initializers/content_security_policy.rb
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :none
    policy.script_src  :self, :unsafe_inline  # Avoid unsafe_inline in production
    policy.style_src   :self, :unsafe_inline
    policy.img_src     :self, :data, :https
    policy.font_src    :self, :data
    policy.connect_src :self
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self
  end

  # Generate nonce for inline scripts
  config.content_security_policy_nonce_generator = -> request { SecureRandom.base64(16) }
  config.content_security_policy_nonce_directives = %w[script-src]

  # Report violations
  config.content_security_policy_report_only = false
  config.content_security_policy_report_uri = '/csp-violations'
end

# Use nonce in views
<script nonce="<%= content_security_policy_nonce %>">
  // Inline script
</script>
```

## Cross-Site Request Forgery (CSRF)

### Rails CSRF Protection

```ruby
# Enabled by default in ApplicationController
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
end

# Forms automatically include CSRF token
<%= form_with model: @post do |f| %>
  <%# CSRF token automatically included %>
<% end %>

# Manual CSRF token
<meta name="csrf-token" content="<%= form_authenticity_token %>">

# JavaScript fetch with CSRF
const csrfToken = document.querySelector('[name="csrf-token"]').content;

fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

# API controllers - use null_session
class Api::BaseController < ActionController::Base
  protect_from_forgery with: :null_session
end

# Skip CSRF for specific actions (use with caution!)
class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]
  before_action :verify_webhook_signature, only: [:create]

  private

  def verify_webhook_signature
    signature = request.headers['X-Webhook-Signature']
    expected = OpenSSL::HMAC.hexdigest('SHA256', webhook_secret, request.body.read)

    unless Rack::Utils.secure_compare(signature, expected)
      head :unauthorized
    end
  end
end
```

## API Security

### JWT Authentication

```ruby
# Gemfile
gem 'jwt'

# app/services/json_web_token.rb
class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, algorithm: 'HS256')[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError => e
    nil
  end
end

# app/controllers/api/v1/authentication_controller.rb
class Api::V1::AuthenticationController < Api::BaseController
  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: { token: token, user: user }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end
end

# app/controllers/api/base_controller.rb
class Api::BaseController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    decoded = JsonWebToken.decode(token)

    if decoded
      @current_user = User.find(decoded[:user_id])
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  attr_reader :current_user
end
```

### API Rate Limiting

```ruby
# See Rack::Attack configuration above

# Per-user rate limiting
throttle('api_per_user', limit: 1000, period: 1.hour) do |req|
  if req.path.start_with?('/api/') && req.env['current_user']
    req.env['current_user'].id
  end
end

# Different limits for different endpoints
throttle('api_expensive_endpoint', limit: 10, period: 1.hour) do |req|
  if req.path == '/api/v1/reports' && req.post?
    req.env['current_user']&.id || req.ip
  end
end
```

### API Versioning

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :posts
  end

  namespace :v2 do
    resources :posts
  end
end

# app/controllers/api/v1/posts_controller.rb
module Api
  module V1
    class PostsController < Api::BaseController
      def index
        posts = Post.all
        render json: posts, each_serializer: Api::V1::PostSerializer
      end
    end
  end
end
```

## Secrets Management

### Encrypted Credentials

```bash
# Edit credentials
rails credentials:edit

# Environment-specific
rails credentials:edit --environment production
rails credentials:edit --environment staging

# Store in credentials.yml.enc:
# aws:
#   access_key_id: xxx
#   secret_access_key: xxx
# stripe:
#   secret_key: sk_live_xxx
# database:
#   production:
#     password: xxx
```

**Access Credentials:**
```ruby
# config/initializers/stripe.rb
Stripe.api_key = Rails.application.credentials.dig(:stripe, :secret_key)

# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>

# In code
Rails.application.credentials.database[:production][:password]
```

### Environment Variables

```ruby
# Use dotenv for development
# Gemfile
gem 'dotenv-rails', groups: [:development, :test]

# .env (don't commit!)
DATABASE_URL=postgresql://localhost/myapp
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_xxx

# .env.example (commit this)
DATABASE_URL=
REDIS_URL=
STRIPE_SECRET_KEY=

# Access in code
ENV['STRIPE_SECRET_KEY']
ENV.fetch('REDIS_URL', 'redis://localhost:6379')

# Validate required env vars
# config/initializers/env_validator.rb
required_env_vars = %w[
  DATABASE_URL
  SECRET_KEY_BASE
  STRIPE_SECRET_KEY
]

required_env_vars.each do |var|
  unless ENV[var].present?
    raise "Missing required environment variable: #{var}"
  end
end
```

## Best Practices Summary

### Security Checklist

- [ ] Use strong parameters for all controller actions
- [ ] Implement authentication and authorization
- [ ] Enable CSRF protection (default)
- [ ] Configure security headers
- [ ] Use parameterized SQL queries
- [ ] Sanitize user input before rendering
- [ ] Validate file uploads (type, size, content)
- [ ] Enable rate limiting
- [ ] Implement secure session management
- [ ] Use HTTPS in production (force_ssl)
- [ ] Store secrets in encrypted credentials
- [ ] Keep Rails and gems updated
- [ ] Log security events
- [ ] Implement account lockout after failed attempts
- [ ] Use secure password hashing (bcrypt)
- [ ] Set secure cookie flags (httponly, secure, samesite)
- [ ] Validate and sanitize URLs for SSRF prevention
- [ ] Implement Content Security Policy
- [ ] Use API authentication (JWT/OAuth)
- [ ] Regular security audits (bundle audit)

### Security Anti-Patterns to Avoid

1. Using `raw` or `html_safe` without sanitization
2. String interpolation in SQL queries
3. Disabling CSRF protection without alternative
4. Storing secrets in code or version control
5. Not validating file uploads
6. Missing rate limiting on authentication endpoints
7. Weak password requirements
8. Not logging security events
9. Exposing detailed error messages in production
10. Using outdated dependencies

### Regular Security Tasks

```bash
# Weekly
bundle audit check --update

# Monthly
bundle update --conservative
rails security:audit

# Quarterly
- Review authorization policies
- Audit user permissions
- Review security logs
- Update security dependencies
```

## Additional Resources

- Rails Security Guide: https://guides.rubyonrails.org/security.html
- OWASP Rails Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Ruby_on_Rails_Cheat_Sheet.html
- Ruby Security Mailing List: https://groups.google.com/g/ruby-security-ann
- Rails Security Mailing List: https://groups.google.com/g/rubyonrails-security
