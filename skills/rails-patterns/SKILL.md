---
name: rails-patterns
description: Use when working with Ruby on Rails projects - provides patterns for models, controllers, services, and Rails Engines architecture
---

# Rails Patterns Skill

**Authority:** FINAL

## Purpose
Master Ruby on Rails development patterns, architecture, and best practices with deep expertise in Rails Engines for modular application development.

## Core Principles

1. **Convention Over Configuration** - Follow Rails conventions for consistency
2. **DRY (Don't Repeat Yourself)** - Extract common patterns into reusable components
3. **Fat Models, Skinny Controllers** - Business logic in models, controllers coordinate
4. **Service Objects for Complex Logic** - Extract multi-model operations
5. **Modularity with Engines** - Build maintainable, isolated components

---

## Rails Engines (CRITICAL SECTION)

Rails Engines are mini-applications that provide functionality to their host applications. They are the foundation for building modular, maintainable Rails applications and for creating reusable gems like Devise, Spree, and others.

### Engine Types

#### Mountable Engine
A mountable engine is isolated from the host application with its own namespace. It acts like a completely separate application.

**Creation:**
```bash
rails plugin new my_engine --mountable
```

**Characteristics:**
- Isolated namespace with `isolate_namespace`
- Own routes mounted at a specific path
- Own models, controllers, views in namespaced directories
- Database tables prefixed with engine name
- Independent from parent app (minimal coupling)

**Directory Structure:**
```
my_engine/
├── app/
│   ├── controllers/
│   │   └── my_engine/
│   │       ├── application_controller.rb
│   │       └── posts_controller.rb
│   ├── models/
│   │   └── my_engine/
│   │       └── post.rb
│   └── views/
│       └── my_engine/
│           └── posts/
├── config/
│   └── routes.rb
├── db/
│   └── migrate/
├── lib/
│   ├── my_engine/
│   │   ├── engine.rb
│   │   └── version.rb
│   └── my_engine.rb
├── test/
└── my_engine.gemspec
```

**When to Use:**
- Building reusable functionality for multiple applications
- Creating admin panels or CMS systems
- Isolating large features for team organization
- Planning to extract functionality into a gem
- Need complete isolation from parent app

#### Full Engine
A full engine shares the namespace with the host application, providing less isolation.

**Creation:**
```bash
rails plugin new my_engine --full
```

**Characteristics:**
- Shares namespace with parent app
- Models/controllers not automatically namespaced
- More tightly coupled to parent app
- Easier access to parent app functionality
- Simpler for internal modularization

**Directory Structure:**
```
my_engine/
├── app/
│   ├── controllers/
│   │   └── posts_controller.rb  # No namespace
│   ├── models/
│   │   └── post.rb  # No namespace
│   └── views/
│       └── posts/
├── config/
│   └── routes.rb
├── lib/
│   ├── my_engine/
│   │   └── engine.rb
│   └── my_engine.rb
└── my_engine.gemspec
```

**When to Use:**
- Internal modularization only
- Need easy access to parent app classes
- Don't need strict isolation
- Won't distribute as a gem
- Prototyping engine functionality

#### Comparison Table

| Feature | Mountable Engine | Full Engine |
|---------|------------------|-------------|
| Namespace Isolation | Yes (`isolate_namespace`) | No |
| Route Mounting | Required | Optional |
| Table Prefixes | Yes (`my_engine_posts`) | No (`posts`) |
| Distribution as Gem | Ideal | Possible but not ideal |
| Access to Parent App | Indirect (configuration) | Direct |
| Complexity | Higher | Lower |
| Reusability | High | Medium |

### Engine Structure and Organization

#### Engine Class Definition

**lib/my_engine/engine.rb:**
```ruby
module MyEngine
  class Engine < ::Rails::Engine
    isolate_namespace MyEngine

    # Engine configuration
    config.generators do |g|
      g.test_framework :rspec
      g.fixture_replacement :factory_bot
      g.factory_bot dir: 'spec/factories'
    end

    # Load decorators from parent app
    config.to_prepare do
      Dir.glob(Engine.root.join("app", "decorators", "**", "*_decorator*.rb")).each do |c|
        Rails.configuration.cache_classes ? require(c) : load(c)
      end
    end

    # Precompile engine assets
    initializer "my_engine.assets.precompile" do |app|
      app.config.assets.precompile += %w( my_engine/application.js my_engine/application.css )
    end

    # Add engine paths to parent app
    initializer "my_engine.add_middleware" do |app|
      app.middleware.use MyEngine::Middleware::CustomMiddleware
    end
  end
end
```

#### Namespace Isolation

**What `isolate_namespace` does:**
```ruby
module MyEngine
  class Engine < ::Rails::Engine
    isolate_namespace MyEngine
  end
end
```

**Effects:**
1. **Routes:** All routes are namespaced under MyEngine
2. **Tables:** Database tables prefixed with `my_engine_`
3. **Controllers:** Inherit from `MyEngine::ApplicationController`
4. **Models:** Contained in `MyEngine` module
5. **Helpers:** Namespaced under `MyEngine`
6. **URL Helpers:** Prefixed with engine name

#### Engine Configuration

**config/initializers/my_engine.rb in parent app:**
```ruby
MyEngine.configure do |config|
  config.default_locale = :en
  config.max_items_per_page = 25
  config.enable_caching = Rails.env.production?

  # Provide parent app models/controllers
  config.user_class = "User"
  config.admin_class = "Admin"

  # Callbacks
  config.after_create_post = ->(post) { NotificationService.notify(post) }
end
```

**lib/my_engine.rb:**
```ruby
require "my_engine/engine"

module MyEngine
  mattr_accessor :default_locale, :max_items_per_page, :enable_caching
  mattr_accessor :user_class, :admin_class, :after_create_post

  def self.configure
    yield self
  end

  # Resolve configured class names
  def self.user_class_constant
    user_class.constantize
  end

  def self.admin_class_constant
    admin_class.constantize
  end
end
```

### Mounting Engines

#### Routes Configuration

**Parent app config/routes.rb:**
```ruby
Rails.application.routes.draw do
  # Mount at root path
  mount MyEngine::Engine => "/"

  # Mount at specific path
  mount MyEngine::Engine => "/blog", as: "blog"

  # Mount with constraints
  mount MyEngine::Engine => "/admin", constraints: { subdomain: "admin" }

  # Multiple mounts
  mount BlogEngine::Engine => "/blog"
  mount ForumEngine::Engine => "/forum"
  mount ShopEngine::Engine => "/shop"
end
```

#### Engine Routes

**Engine config/routes.rb:**
```ruby
MyEngine::Engine.routes.draw do
  root to: "posts#index"

  resources :posts do
    resources :comments
    member do
      post :publish
      post :archive
    end
  end

  resources :categories, only: [:index, :show]

  namespace :admin do
    resources :posts
    resources :settings
  end

  # Direct routes to parent app (use main_app)
  get "/profile", to: redirect { |params, request|
    main_app.profile_path
  }
end
```

#### Route Helpers

**Accessing engine routes from parent app:**
```erb
<!-- Parent app views -->
<%= link_to "Blog", my_engine.root_path %>
<%= link_to "New Post", my_engine.new_post_path %>
<%= link_to "Post", my_engine.post_path(@post) %>

<!-- With mount path -->
<%= link_to "Blog", blog.root_path %>
<%= link_to "All Posts", blog.posts_path %>
```

**Accessing parent app routes from engine:**
```erb
<!-- Engine views -->
<%= link_to "Home", main_app.root_path %>
<%= link_to "User Profile", main_app.user_path(@user) %>
<%= link_to "Settings", main_app.settings_path %>
```

**In controllers:**
```ruby
module MyEngine
  class PostsController < ApplicationController
    def create
      @post = Post.create(post_params)
      if @post.persisted?
        redirect_to @post  # Engine route
      else
        render :new
      end
    end

    def back_to_app
      redirect_to main_app.root_path  # Parent app route
    end
  end
end
```

**URL generation:**
```ruby
# In parent app
MyEngine::Engine.routes.url_helpers.post_path(post)
blog.post_path(post)  # If mounted as 'blog'

# In engine
main_app.user_path(user)
MyEngine::Engine.routes.url_helpers.post_path(post)
```

### Isolation and Shared Resources

#### Accessing Parent App from Engine

**Referencing parent app models:**
```ruby
module MyEngine
  class Post < ApplicationRecord
    # Option 1: Direct reference (breaks isolation)
    belongs_to :user, class_name: "::User"

    # Option 2: Configured class (better)
    def user_class
      MyEngine.user_class_constant
    end

    def user
      user_class.find(user_id)
    end
  end
end
```

**Calling parent app services:**
```ruby
module MyEngine
  class PostsController < ApplicationController
    def create
      @post = Post.create(post_params)

      # Call parent app service
      ::NotificationService.notify_new_post(@post)

      # Or use configured callback
      MyEngine.after_create_post&.call(@post)

      redirect_to @post
    end
  end
end
```

**Using parent app helpers:**
```ruby
module MyEngine
  class ApplicationController < ActionController::Base
    helper_method :current_user

    def current_user
      # Delegate to parent app
      main_app.current_user if main_app.respond_to?(:current_user)
    end
  end
end
```

#### Accessing Engine from Parent App

**Using engine models:**
```ruby
# Parent app controller
class DashboardController < ApplicationController
  def index
    @recent_posts = MyEngine::Post.recent.limit(5)
    @post_count = MyEngine::Post.count
  end
end
```

**Overriding engine controllers:**
```ruby
# Parent app: app/controllers/my_engine/posts_controller.rb
module MyEngine
  class PostsController < MyEngine::PostsController
    # Override specific action
    def index
      @posts = Post.where(published: true).by_user(current_user)
      render "my_engine/posts/index"
    end

    # Add new action
    def featured
      @posts = Post.featured
    end
  end
end
```

**Decorating engine models:**
```ruby
# Parent app: app/decorators/my_engine/post_decorator.rb
MyEngine::Post.class_eval do
  # Add associations
  has_many :likes, class_name: "::Like", as: :likeable

  # Add methods
  def featured?
    featured_at.present? && featured_at > 30.days.ago
  end

  # Override methods
  def display_title
    published? ? title : "[Draft] #{title}"
  end
end
```

**Loading decorators in engine:**
```ruby
# Engine: lib/my_engine/engine.rb
module MyEngine
  class Engine < ::Rails::Engine
    config.to_prepare do
      # Load parent app decorators
      decorator_path = Rails.root.join("app", "decorators", "my_engine")
      if decorator_path.exist?
        Dir.glob(decorator_path.join("**", "*_decorator.rb")).each do |file|
          Rails.configuration.cache_classes ? require(file) : load(file)
        end
      end
    end
  end
end
```

#### Shared Concerns

**Engine concern:**
```ruby
# Engine: app/models/concerns/my_engine/publishable.rb
module MyEngine
  module Publishable
    extend ActiveSupport::Concern

    included do
      scope :published, -> { where.not(published_at: nil) }
      scope :draft, -> { where(published_at: nil) }
    end

    def publish!
      update(published_at: Time.current)
    end

    def published?
      published_at.present?
    end
  end
end
```

**Using in parent app:**
```ruby
# Parent app model
class Article < ApplicationRecord
  include MyEngine::Publishable

  # Article now has publish!, published?, published, draft scopes
end
```

### Migrations

#### Creating Migrations

**Generate migration in engine:**
```bash
cd engines/my_engine
rails generate migration CreatePosts title:string body:text published:boolean
```

**Generated migration:**
```ruby
# engines/my_engine/db/migrate/20260206120000_create_my_engine_posts.rb
class CreateMyEnginePosts < ActiveRecord::Migration[7.0]
  def change
    create_table :my_engine_posts do |t|
      t.string :title
      t.text :body
      t.boolean :published, default: false

      t.timestamps
    end

    add_index :my_engine_posts, :published
  end
end
```

#### Installing Migrations

**Copy migrations to parent app:**
```bash
# From parent app directory
rake my_engine:install:migrations

# Or for all engines
rake railties:install:migrations
```

**What happens:**
- Copies migrations from engine to parent app `db/migrate/`
- Prefixes with timestamp to maintain order
- Adds scope comment to track origin

**Result:**
```ruby
# Parent app: db/migrate/20260206120000_create_my_engine_posts.my_engine.rb
# This migration comes from my_engine (originally 20260206120000)
class CreateMyEnginePosts < ActiveRecord::Migration[7.0]
  def change
    create_table :my_engine_posts do |t|
      t.string :title
      t.text :body
      t.boolean :published, default: false

      t.timestamps
    end

    add_index :my_engine_posts, :published
  end
end
```

**Run migrations:**
```bash
rake db:migrate
```

#### Migration Conflicts

**Problem: Same migration copied twice**

**Solution 1: Check before copying**
```bash
# Skip if already copied
rake my_engine:install:migrations SKIP_EXISTING=true
```

**Solution 2: Use version control**
```ruby
# Engine: lib/tasks/install.rake
namespace :my_engine do
  namespace :install do
    desc "Install MyEngine migrations"
    task :migrations_with_check do
      # Check if migrations already installed
      existing = Dir.glob(Rails.root.join("db/migrate/*my_engine.rb"))
      if existing.any?
        puts "Migrations already installed. Skipping."
      else
        Rake::Task["my_engine:install:migrations"].invoke
      end
    end
  end
end
```

#### Referencing Parent App Tables

**Foreign keys to parent app:**
```ruby
class AddUserRefToMyEnginePosts < ActiveRecord::Migration[7.0]
  def change
    add_reference :my_engine_posts, :user, foreign_key: true
  end
end
```

**Polymorphic associations:**
```ruby
class CreateMyEngineComments < ActiveRecord::Migration[7.0]
  def change
    create_table :my_engine_comments do |t|
      t.references :commentable, polymorphic: true, null: false
      t.text :body

      t.timestamps
    end
  end
end
```

#### Rollback Strategies

**Rolling back engine migrations:**
```bash
# Rollback last migration
rake db:rollback

# Rollback specific version
rake db:migrate:down VERSION=20260206120000

# Rollback all engine migrations
rake db:migrate:down VERSION=<first_engine_migration_version>
```

**Tracking migration status:**
```bash
rake db:migrate:status
```

### Generators

#### Custom Generators

**Engine generator structure:**
```
engines/my_engine/lib/generators/
└── my_engine/
    ├── install/
    │   ├── install_generator.rb
    │   └── templates/
    │       └── initializer.rb
    └── post/
        ├── post_generator.rb
        └── templates/
            └── post.rb.erb
```

#### Install Generator

**engines/my_engine/lib/generators/my_engine/install/install_generator.rb:**
```ruby
module MyEngine
  module Generators
    class InstallGenerator < Rails::Generators::Base
      source_root File.expand_path("templates", __dir__)

      desc "Creates MyEngine initializer and copies migrations"

      def copy_initializer
        template "initializer.rb", "config/initializers/my_engine.rb"
      end

      def copy_migrations
        rake "my_engine:install:migrations"
      end

      def mount_engine
        route 'mount MyEngine::Engine => "/blog"'
      end

      def show_readme
        readme "README" if behavior == :invoke
      end
    end
  end
end
```

**templates/initializer.rb:**
```ruby
MyEngine.configure do |config|
  # Configure user class
  config.user_class = "User"

  # Configure pagination
  config.max_items_per_page = 25

  # Configure callbacks
  # config.after_create_post = ->(post) {
  #   # Your custom logic here
  # }
end
```

**Usage:**
```bash
rails generate my_engine:install
```

#### Model Generator

**engines/my_engine/lib/generators/my_engine/post/post_generator.rb:**
```ruby
module MyEngine
  module Generators
    class PostGenerator < Rails::Generators::NamedBase
      source_root File.expand_path("templates", __dir__)

      argument :attributes, type: :array, default: [], banner: "field:type field:type"

      def create_model_file
        template "post.rb.erb", "app/models/my_engine/#{file_name}.rb"
      end

      def create_migration_file
        migration_template "migration.rb.erb",
                          "db/migrate/create_my_engine_#{table_name}.rb",
                          migration_version: migration_version
      end

      private

      def migration_version
        "[#{Rails::VERSION::MAJOR}.#{Rails::VERSION::MINOR}]"
      end

      def attributes_hash
        return "{}" if attributes.empty?
        attributes.map { |attr| "#{attr.name}: #{attr.type}" }.join(", ")
      end
    end
  end
end
```

**templates/post.rb.erb:**
```erb
module MyEngine
  class <%= class_name %> < ApplicationRecord
    # Validations
    validates :title, presence: true

    # Associations
    belongs_to :user, class_name: MyEngine.user_class

    # Scopes
    scope :recent, -> { order(created_at: :desc) }

    # Instance methods
    def to_s
      title
    end
  end
end
```

**Usage:**
```bash
rails generate my_engine:post Article title:string body:text
```

#### Scaffold Generator

**engines/my_engine/lib/generators/my_engine/scaffold/scaffold_generator.rb:**
```ruby
module MyEngine
  module Generators
    class ScaffoldGenerator < Rails::Generators::NamedBase
      source_root File.expand_path("templates", __dir__)

      argument :attributes, type: :array, default: []

      def create_model
        invoke "my_engine:post", [name] + attributes.map(&:to_s)
      end

      def create_controller
        template "controller.rb.erb",
                 "app/controllers/my_engine/#{file_name.pluralize}_controller.rb"
      end

      def create_views
        %w[index show new edit _form].each do |view|
          template "views/#{view}.html.erb",
                   "app/views/my_engine/#{file_name.pluralize}/#{view}.html.erb"
        end
      end

      def add_routes
        route "resources :#{file_name.pluralize}"
      end
    end
  end
end
```

#### Generator Hooks

**Customize generator behavior:**
```ruby
module MyEngine
  class Engine < ::Rails::Engine
    config.generators do |g|
      g.test_framework :rspec, fixture: false
      g.fixture_replacement :factory_bot, dir: "spec/factories"
      g.assets false
      g.helper false
    end
  end
end
```

### Testing Engines

#### Test Structure

**Engine test directory:**
```
engines/my_engine/
├── spec/
│   ├── controllers/
│   │   └── my_engine/
│   ├── models/
│   │   └── my_engine/
│   ├── features/
│   ├── factories/
│   ├── support/
│   ├── rails_helper.rb
│   └── spec_helper.rb
└── test/
    └── dummy/  # Dummy Rails app for testing
        ├── app/
        ├── config/
        └── db/
```

#### Dummy Application

**test/dummy/config/application.rb:**
```ruby
module Dummy
  class Application < Rails::Application
    config.load_defaults 7.0

    # Configure for testing
    config.eager_load = false
    config.consider_all_requests_local = true
    config.action_controller.perform_caching = false
  end
end
```

**test/dummy/config/routes.rb:**
```ruby
Rails.application.routes.draw do
  mount MyEngine::Engine => "/my_engine"
end
```

#### RSpec Configuration

**spec/rails_helper.rb:**
```ruby
ENV['RAILS_ENV'] ||= 'test'

require File.expand_path('../test/dummy/config/environment', __dir__)

abort("Running in production mode!") if Rails.env.production?

require 'rspec/rails'
require 'factory_bot_rails'
require 'capybara/rspec'

# Load support files
Dir[MyEngine::Engine.root.join('spec/support/**/*.rb')].each { |f| require f }

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  # FactoryBot
  config.include FactoryBot::Syntax::Methods

  # Engine routes
  config.include MyEngine::Engine.routes.url_helpers

  # Dummy app routes
  config.include Rails.application.routes.url_helpers, type: :controller
end
```

#### Model Specs

**spec/models/my_engine/post_spec.rb:**
```ruby
require 'rails_helper'

module MyEngine
  RSpec.describe Post, type: :model do
    describe "validations" do
      it { should validate_presence_of(:title) }
      it { should validate_presence_of(:body) }
    end

    describe "associations" do
      it { should belong_to(:user) }
      it { should have_many(:comments) }
    end

    describe "scopes" do
      let!(:published_post) { create(:my_engine_post, published_at: 1.day.ago) }
      let!(:draft_post) { create(:my_engine_post, published_at: nil) }

      describe ".published" do
        it "returns only published posts" do
          expect(Post.published).to include(published_post)
          expect(Post.published).not_to include(draft_post)
        end
      end

      describe ".draft" do
        it "returns only draft posts" do
          expect(Post.draft).to include(draft_post)
          expect(Post.draft).not_to include(published_post)
        end
      end
    end

    describe "#publish!" do
      let(:post) { create(:my_engine_post, published_at: nil) }

      it "sets published_at" do
        expect { post.publish! }.to change { post.published_at }.from(nil)
      end

      it "marks post as published" do
        post.publish!
        expect(post).to be_published
      end
    end
  end
end
```

#### Controller Specs

**spec/controllers/my_engine/posts_controller_spec.rb:**
```ruby
require 'rails_helper'

module MyEngine
  RSpec.describe PostsController, type: :controller do
    routes { MyEngine::Engine.routes }

    let(:user) { create(:user) }
    let(:post_attrs) { attributes_for(:my_engine_post) }

    before { sign_in user }

    describe "GET #index" do
      let!(:posts) { create_list(:my_engine_post, 3) }

      it "returns success response" do
        get :index
        expect(response).to be_successful
      end

      it "assigns @posts" do
        get :index
        expect(assigns(:posts)).to match_array(posts)
      end
    end

    describe "GET #show" do
      let(:post) { create(:my_engine_post) }

      it "returns success response" do
        get :show, params: { id: post.id }
        expect(response).to be_successful
      end
    end

    describe "POST #create" do
      context "with valid params" do
        it "creates a new Post" do
          expect {
            post :create, params: { post: post_attrs }
          }.to change(Post, :count).by(1)
        end

        it "redirects to the created post" do
          post :create, params: { post: post_attrs }
          expect(response).to redirect_to(Post.last)
        end
      end

      context "with invalid params" do
        let(:invalid_attrs) { { title: "" } }

        it "does not create post" do
          expect {
            post :create, params: { post: invalid_attrs }
          }.not_to change(Post, :count)
        end

        it "renders new template" do
          post :create, params: { post: invalid_attrs }
          expect(response).to render_template(:new)
        end
      end
    end
  end
end
```

#### Feature Specs

**spec/features/my_engine/posts_spec.rb:**
```ruby
require 'rails_helper'

module MyEngine
  RSpec.feature "Posts", type: :feature do
    let(:user) { create(:user) }

    before { login_as(user) }

    scenario "User creates a new post" do
      visit my_engine.root_path
      click_link "New Post"

      fill_in "Title", with: "My First Post"
      fill_in "Body", with: "This is the post body"
      click_button "Create Post"

      expect(page).to have_content("Post was successfully created")
      expect(page).to have_content("My First Post")
    end

    scenario "User edits a post" do
      post = create(:my_engine_post, user: user)

      visit my_engine.post_path(post)
      click_link "Edit"

      fill_in "Title", with: "Updated Title"
      click_button "Update Post"

      expect(page).to have_content("Post was successfully updated")
      expect(page).to have_content("Updated Title")
    end

    scenario "User publishes a draft post" do
      post = create(:my_engine_post, user: user, published_at: nil)

      visit my_engine.post_path(post)
      click_button "Publish"

      expect(page).to have_content("Post published")
      expect(post.reload).to be_published
    end
  end
end
```

#### Testing with Parent App

**Integration testing:**
```ruby
# Parent app: spec/features/blog_integration_spec.rb
require 'rails_helper'

RSpec.feature "Blog Integration", type: :feature do
  let(:user) { create(:user) }

  scenario "User navigates from home to blog" do
    visit root_path
    click_link "Blog"

    expect(current_path).to eq(blog.root_path)
    expect(page).to have_content("Blog Posts")
  end

  scenario "Creating post sends notification" do
    login_as(user)

    expect(NotificationService).to receive(:notify_new_post)

    visit blog.new_post_path
    fill_in "Title", with: "Test Post"
    fill_in "Body", with: "Test body"
    click_button "Create Post"
  end
end
```

#### Factory Bot Setup

**spec/factories/my_engine/posts.rb:**
```ruby
FactoryBot.define do
  factory :my_engine_post, class: 'MyEngine::Post' do
    sequence(:title) { |n| "Post #{n}" }
    body { "This is the post body" }
    published_at { 1.day.ago }
    association :user

    trait :draft do
      published_at { nil }
    end

    trait :with_comments do
      after(:create) do |post|
        create_list(:my_engine_comment, 3, post: post)
      end
    end
  end
end
```

### Dependencies Management

#### Gemspec Configuration

**my_engine.gemspec:**
```ruby
$:.push File.expand_path("lib", __dir__)

require "my_engine/version"

Gem::Specification.new do |spec|
  spec.name        = "my_engine"
  spec.version     = MyEngine::VERSION
  spec.authors     = ["Your Name"]
  spec.email       = ["your.email@example.com"]
  spec.homepage    = "https://github.com/yourname/my_engine"
  spec.summary     = "A Rails engine for blog functionality"
  spec.description = "Provides blog posts, comments, and categories"
  spec.license     = "MIT"

  spec.files = Dir[
    "{app,config,db,lib}/**/*",
    "MIT-LICENSE",
    "Rakefile",
    "README.md"
  ]

  # Rails dependency
  spec.add_dependency "rails", ">= 7.0.0"

  # Additional dependencies
  spec.add_dependency "kaminari", "~> 1.2"  # Pagination
  spec.add_dependency "redcarpet", "~> 3.5"  # Markdown
  spec.add_dependency "pundit", "~> 2.3"  # Authorization

  # Development dependencies
  spec.add_development_dependency "rspec-rails", "~> 6.0"
  spec.add_development_dependency "factory_bot_rails", "~> 6.2"
  spec.add_development_dependency "capybara", "~> 3.39"
  spec.add_development_dependency "sqlite3", "~> 1.6"
  spec.add_development_dependency "puma", "~> 6.0"
end
```

#### Parent App Requirements

**Parent app Gemfile:**
```ruby
# Local development
gem 'my_engine', path: 'engines/my_engine'

# Git repository
gem 'my_engine', git: 'https://github.com/yourname/my_engine.git'

# Rubygems (published)
gem 'my_engine', '~> 1.0'

# Multiple engines
gem 'blog_engine', path: 'engines/blog_engine'
gem 'forum_engine', path: 'engines/forum_engine'
gem 'shop_engine', path: 'engines/shop_engine'
```

#### Inter-Engine Dependencies

**Engine depending on another engine:**
```ruby
# shop_engine.gemspec
spec.add_dependency "blog_engine", "~> 1.0"
```

**Using shared engine:**
```ruby
# In shop_engine
module ShopEngine
  class Product < ApplicationRecord
    # Use blog engine for product articles
    has_many :blog_posts,
             class_name: "BlogEngine::Post",
             foreign_key: :product_id
  end
end
```

**Shared configuration:**
```ruby
# lib/my_engine/engine.rb
module MyEngine
  class Engine < ::Rails::Engine
    # Require other engines
    require 'shared_engine'

    config.after_initialize do
      # Ensure other engines are loaded
      unless defined?(SharedEngine::Engine)
        raise "MyEngine requires SharedEngine"
      end
    end
  end
end
```

### Configuration and Initialization

#### Initializers

**Engine initializers:**
```ruby
# lib/my_engine/engine.rb
module MyEngine
  class Engine < ::Rails::Engine
    isolate_namespace MyEngine

    # Run before other initializers
    initializer "my_engine.early_setup", before: :load_config_initializers do
      # Setup early configuration
    end

    # Assets precompilation
    initializer "my_engine.assets.precompile" do |app|
      app.config.assets.precompile += %w(
        my_engine/application.js
        my_engine/application.css
        my_engine/admin.js
        my_engine/admin.css
      )
    end

    # Load decorators
    initializer "my_engine.load_decorators" do
      config.to_prepare do
        Dir.glob(Engine.root.join("app", "decorators", "**", "*_decorator.rb")).each do |c|
          Rails.configuration.cache_classes ? require(c) : load(c)
        end
      end
    end

    # Add middleware
    initializer "my_engine.middleware" do |app|
      app.middleware.use MyEngine::Middleware::TrackingMiddleware
    end

    # Register mime types
    initializer "my_engine.mime_types" do
      Mime::Type.register "application/vnd.my_engine+json", :my_engine_json
    end

    # Subscribe to ActiveSupport notifications
    initializer "my_engine.notifications" do
      ActiveSupport::Notifications.subscribe("post.created") do |*args|
        event = ActiveSupport::Notifications::Event.new(*args)
        # Handle event
      end
    end
  end
end
```

#### Environment-Specific Config

**Engine configuration per environment:**
```ruby
# lib/my_engine/engine.rb
module MyEngine
  class Engine < ::Rails::Engine
    config.before_configuration do
      # Load environment-specific config
      config_file = Engine.root.join("config", "environments", "#{Rails.env}.rb")
      load(config_file) if File.exist?(config_file)
    end
  end
end
```

**config/environments/production.rb:**
```ruby
MyEngine.configure do |config|
  config.enable_caching = true
  config.cache_store = :redis_cache_store
  config.log_level = :info
end
```

**config/environments/development.rb:**
```ruby
MyEngine.configure do |config|
  config.enable_caching = false
  config.log_level = :debug
end
```

#### Secrets and Credentials

**Accessing parent app credentials:**
```ruby
module MyEngine
  class ApiClient
    def api_key
      Rails.application.credentials.my_engine[:api_key]
    end
  end
end
```

**Parent app credentials.yml.enc:**
```yaml
my_engine:
  api_key: abc123xyz
  api_secret: secret456
```

### When to Use Engines

#### Use Cases for Engines

**1. Reusable Components**
- Authentication systems (like Devise)
- Admin panels (like ActiveAdmin)
- CMS functionality
- E-commerce platforms
- Forum systems
- Multi-tenancy

**2. Application Modularization**
- Large monolith breakup
- Feature-based organization
- Team-based code ownership
- Gradual microservices transition

**3. Client Customization**
- White-label products
- Configurable base functionality
- Client-specific overrides

**4. Multi-Application Sharing**
- Common functionality across apps
- Company-wide components
- API clients as engines

#### Engines vs Gems

**When to use Engine:**
- Needs Rails integration (models, controllers, views)
- Requires database tables
- Has routes and UI
- Needs to be mounted in parent app
- Tightly coupled with Rails

**When to use Gem:**
- Pure Ruby functionality
- No Rails dependencies needed
- Utility functions
- Service clients
- No database interaction

**Example decisions:**

| Requirement | Solution |
|-------------|----------|
| Add blog to app | Engine (models, controllers, views) |
| HTTP client | Gem (no Rails needed) |
| Admin dashboard | Engine (routes, UI, models) |
| Date formatting | Gem (utility function) |
| Forum system | Engine (complex Rails features) |
| API wrapper | Gem (unless needs AR models) |

#### Anti-Patterns

**Don't use engines when:**

1. **Single app, small feature** - Just use regular Rails structure
2. **No reusability planned** - Overhead not worth it
3. **Frequently changing boundaries** - Modular Rails folders sufficient
4. **Tight coupling required** - Engine isolation becomes burden
5. **Simple gem would work** - Don't add Rails overhead unnecessarily

**Warning signs of over-engineering:**
```ruby
# Bad: Too many small engines
engines/
├── user_profile_engine/  # Just 1 model
├── settings_engine/      # Just 1 controller
├── notification_engine/  # Could be a service object
└── email_engine/         # Could be ActionMailer

# Better: Reasonable engine boundaries
engines/
├── accounts_engine/      # User management, profiles, settings
└── messaging_engine/     # Notifications, emails, chat
```

**Good engine boundaries:**
- Clear domain boundary
- Minimal coupling with parent app
- Self-contained functionality
- Reusable or extractable
- Team ownership alignment

---

## MVC Architecture

### Models (Active Record)

#### Model Basics

**Basic model:**
```ruby
class User < ApplicationRecord
  # Validations
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :age, numericality: { greater_than: 0 }

  # Associations
  has_many :posts, dependent: :destroy
  has_many :comments
  has_one :profile, dependent: :destroy

  # Callbacks
  before_save :normalize_email
  after_create :send_welcome_email

  # Scopes
  scope :active, -> { where(active: true) }
  scope :recent, -> { order(created_at: :desc) }

  private

  def normalize_email
    self.email = email.downcase.strip
  end

  def send_welcome_email
    UserMailer.welcome(self).deliver_later
  end
end
```

#### Associations

**All association types:**
```ruby
class User < ApplicationRecord
  # One-to-many
  has_many :posts
  has_many :comments

  # One-to-many with options
  has_many :published_posts,
           -> { where(published: true) },
           class_name: "Post"

  # Many-to-many with join table
  has_many :group_memberships
  has_many :groups, through: :group_memberships

  # One-to-one
  has_one :profile, dependent: :destroy
  has_one :address, through: :profile

  # Polymorphic
  has_many :comments, as: :commentable
end

class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :taggings
  has_many :tags, through: :taggings
end

class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :commentable, polymorphic: true
end
```

#### Validations

**Common validations:**
```ruby
class User < ApplicationRecord
  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }

  validates :password,
            length: { minimum: 8 },
            if: :password_required?

  validates :age,
            numericality: {
              greater_than_or_equal_to: 18,
              less_than: 120
            }

  validates :username,
            presence: true,
            uniqueness: true,
            length: { in: 3..20 },
            format: {
              with: /\A[a-zA-Z0-9_]+\z/,
              message: "only letters, numbers, and underscores"
            }

  validates :terms_of_service,
            acceptance: true

  validates :role,
            inclusion: { in: %w[admin user guest] }

  validate :custom_validation

  private

  def password_required?
    new_record? || password.present?
  end

  def custom_validation
    if username.present? && username.start_with?("admin")
      errors.add(:username, "cannot start with 'admin'")
    end
  end
end
```

#### Callbacks

**Callback order:**
```ruby
class Post < ApplicationRecord
  # Creation callbacks
  before_validation :set_defaults
  after_validation :log_validation
  before_save :prepare_content
  around_save :log_save
  before_create :set_publication_date
  after_create :notify_subscribers
  after_save :clear_cache
  after_commit :index_for_search, on: :create

  # Update callbacks
  before_update :check_changes
  after_update :notify_if_published

  # Destruction callbacks
  before_destroy :check_dependencies
  after_destroy :cleanup_assets

  private

  def set_defaults
    self.status ||= "draft"
  end

  def prepare_content
    self.content = ContentProcessor.process(content)
  end

  def log_save
    Rails.logger.info "Saving post #{id}"
    yield
    Rails.logger.info "Saved post #{id}"
  end

  def notify_subscribers
    NotificationJob.perform_later(id)
  end
end
```

#### Scopes and Queries

**Scope patterns:**
```ruby
class Post < ApplicationRecord
  # Basic scopes
  scope :published, -> { where(published: true) }
  scope :draft, -> { where(published: false) }
  scope :recent, -> { order(created_at: :desc) }

  # Scopes with parameters
  scope :by_author, ->(author) { where(author: author) }
  scope :created_after, ->(date) { where("created_at > ?", date) }
  scope :with_tag, ->(tag) { joins(:tags).where(tags: { name: tag }) }

  # Chainable scopes
  scope :popular, -> { where("views > ?", 1000) }
  scope :recent_popular, -> { recent.popular }

  # Default scope (use cautiously)
  default_scope { where(deleted_at: nil) }

  # Class methods as scopes
  def self.search(query)
    where("title LIKE ? OR content LIKE ?", "%#{query}%", "%#{query}%")
  end
end

# Usage
Post.published.recent.limit(10)
Post.by_author("John").created_after(1.week.ago)
```

### Controllers

#### Controller Basics

**RESTful controller:**
```ruby
class PostsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_post, only: [:show, :edit, :update, :destroy]
  before_action :authorize_post, only: [:edit, :update, :destroy]

  def index
    @posts = Post.published.recent.page(params[:page])
  end

  def show
    @comments = @post.comments.includes(:user)
  end

  def new
    @post = current_user.posts.build
  end

  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      redirect_to @post, notice: "Post created successfully"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @post.update(post_params)
      redirect_to @post, notice: "Post updated successfully"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_url, notice: "Post deleted successfully"
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def authorize_post
    unless @post.user == current_user || current_user.admin?
      redirect_to root_path, alert: "Not authorized"
    end
  end

  def post_params
    params.require(:post).permit(:title, :content, :published, tag_ids: [])
  end
end
```

#### Concerns

**Controller concern:**
```ruby
# app/controllers/concerns/paginatable.rb
module Paginatable
  extend ActiveSupport::Concern

  included do
    helper_method :page, :per_page
  end

  def page
    params[:page] || 1
  end

  def per_page
    params[:per_page] || 25
  end

  def paginate(collection)
    collection.page(page).per(per_page)
  end
end

# Usage in controller
class PostsController < ApplicationController
  include Paginatable

  def index
    @posts = paginate(Post.published)
  end
end
```

#### Strong Parameters

**Nested parameters:**
```ruby
class PostsController < ApplicationController
  private

  def post_params
    params.require(:post).permit(
      :title,
      :content,
      :published,
      tag_ids: [],
      comments_attributes: [:id, :body, :_destroy],
      metadata: [:description, :keywords]
    )
  end
end
```

### Views

#### View Helpers

**Custom helpers:**
```ruby
# app/helpers/application_helper.rb
module ApplicationHelper
  def formatted_date(date)
    date.strftime("%B %d, %Y") if date
  end

  def user_avatar(user, size: 40)
    image_tag user.avatar_url, size: "#{size}x#{size}", class: "avatar"
  end

  def markdown(text)
    return "" unless text

    markdown = Redcarpet::Markdown.new(
      Redcarpet::Render::HTML,
      autolink: true,
      tables: true
    )
    markdown.render(text).html_safe
  end
end
```

#### Partials

**Using partials:**
```erb
<!-- app/views/posts/index.html.erb -->
<h1>Posts</h1>

<div class="posts">
  <%= render @posts %>
</div>

<!-- app/views/posts/_post.html.erb -->
<div class="post">
  <h2><%= link_to post.title, post %></h2>
  <p><%= post.excerpt %></p>
  <%= render "shared/post_meta", post: post %>
</div>

<!-- app/views/shared/_post_meta.html.erb -->
<div class="post-meta">
  <span>By <%= post.author.name %></span>
  <span><%= formatted_date(post.created_at) %></span>
</div>
```

---

## Query Optimization

### N+1 Queries

**Problem:**
```ruby
# Bad - N+1 queries
@posts = Post.all
@posts.each do |post|
  puts post.user.name  # Additional query for each post
end
```

**Solution:**
```ruby
# Good - Eager loading
@posts = Post.includes(:user)
@posts.each do |post|
  puts post.user.name  # No additional queries
end
```

### Eager Loading

**Different loading strategies:**
```ruby
# includes - Uses LEFT OUTER JOIN or separate queries
Post.includes(:user, :comments)

# preload - Always uses separate queries
Post.preload(:user, :comments)

# eager_load - Always uses LEFT OUTER JOIN
Post.eager_load(:user, :comments)

# Nested associations
Post.includes(comments: :user)

# Multiple associations
Post.includes(:user, :tags, comments: [:user, :likes])
```

### Select and Pluck

**Optimize queries:**
```ruby
# Select specific columns
Post.select(:id, :title, :created_at)

# Pluck for single values
Post.pluck(:title)  # Returns array of titles
Post.pluck(:id, :title)  # Returns array of arrays

# Distinct
Post.select(:author_id).distinct

# Count without loading records
Post.where(published: true).count
```

### Indexes

**Migration with indexes:**
```ruby
class AddIndexesToPosts < ActiveRecord::Migration[7.0]
  def change
    add_index :posts, :user_id
    add_index :posts, :published
    add_index :posts, [:user_id, :created_at]
    add_index :posts, :title, unique: true
  end
end
```

---

## Service Objects

**When to use service objects:**
- Complex business logic spanning multiple models
- Operations requiring external API calls
- Multi-step processes with transactions
- Logic that doesn't fit cleanly in models/controllers

**Service object pattern:**
```ruby
# app/services/posts/publish_service.rb
module Posts
  class PublishService
    def initialize(post, user)
      @post = post
      @user = user
    end

    def call
      return failure("Already published") if @post.published?
      return failure("Not authorized") unless can_publish?

      ActiveRecord::Base.transaction do
        @post.update!(published: true, published_at: Time.current)
        notify_subscribers
        index_for_search
      end

      success(@post)
    rescue => e
      failure(e.message)
    end

    private

    def can_publish?
      @user.admin? || @post.user == @user
    end

    def notify_subscribers
      NotificationJob.perform_later(@post.id)
    end

    def index_for_search
      SearchIndexJob.perform_later(@post.id)
    end

    def success(data)
      OpenStruct.new(success?: true, data: data, error: nil)
    end

    def failure(error)
      OpenStruct.new(success?: false, data: nil, error: error)
    end
  end
end

# Usage in controller
def publish
  result = Posts::PublishService.new(@post, current_user).call

  if result.success?
    redirect_to result.data, notice: "Published successfully"
  else
    redirect_to @post, alert: result.error
  end
end
```

---

## Form Objects

**Complex form handling:**
```ruby
# app/forms/user_registration_form.rb
class UserRegistrationForm
  include ActiveModel::Model

  attr_accessor :email, :password, :password_confirmation
  attr_accessor :company_name, :company_address

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 8 }
  validates :password_confirmation, presence: true
  validates :company_name, presence: true

  validate :passwords_match

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      @user = User.create!(
        email: email,
        password: password
      )

      @company = Company.create!(
        name: company_name,
        address: company_address,
        owner: @user
      )

      @user.update!(company: @company)
    end

    true
  rescue => e
    errors.add(:base, e.message)
    false
  end

  attr_reader :user, :company

  private

  def passwords_match
    if password != password_confirmation
      errors.add(:password_confirmation, "doesn't match password")
    end
  end
end

# Controller
def create
  @form = UserRegistrationForm.new(registration_params)

  if @form.save
    redirect_to @form.user, notice: "Registration successful"
  else
    render :new
  end
end
```

---

## Decorators/Presenters

**Decorator pattern:**
```ruby
# app/decorators/post_decorator.rb
class PostDecorator < SimpleDelegator
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::UrlHelper

  def formatted_date
    created_at.strftime("%B %d, %Y")
  end

  def excerpt(length: 200)
    truncate(content, length: length)
  end

  def author_link
    link_to author.name, author
  end

  def status_badge
    published? ? "Published" : "Draft"
  end

  def reading_time
    words = content.split.size
    minutes = (words / 200.0).ceil
    "#{minutes} min read"
  end
end

# Usage
@post = PostDecorator.new(Post.find(params[:id]))
```

---

## Background Jobs

### ActiveJob

**Job structure:**
```ruby
# app/jobs/notification_job.rb
class NotificationJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: 5.seconds, attempts: 3
  discard_on ActiveJob::DeserializationError

  def perform(post_id)
    post = Post.find(post_id)
    post.subscribers.each do |subscriber|
      UserMailer.new_post(subscriber, post).deliver_now
    end
  end
end

# Enqueue job
NotificationJob.perform_later(post.id)
NotificationJob.set(wait: 1.hour).perform_later(post.id)
NotificationJob.set(queue: :urgent).perform_later(post.id)
```

### Sidekiq

**Sidekiq worker:**
```ruby
class HardWorker
  include Sidekiq::Worker
  sidekiq_options retry: 5, queue: :default

  def perform(post_id, user_id)
    post = Post.find(post_id)
    user = User.find(user_id)

    # Process heavy work
  end
end

# Enqueue
HardWorker.perform_async(post.id, user.id)
HardWorker.perform_in(1.hour, post.id, user.id)
HardWorker.perform_at(Time.now + 1.day, post.id, user.id)
```

---

## Routing

### Resources

**RESTful routes:**
```ruby
Rails.application.routes.draw do
  # Standard resources
  resources :posts

  # Nested resources
  resources :posts do
    resources :comments
  end

  # Limited actions
  resources :posts, only: [:index, :show]
  resources :posts, except: [:destroy]

  # Member and collection routes
  resources :posts do
    member do
      post :publish
      post :archive
    end

    collection do
      get :search
      get :featured
    end
  end

  # Shallow nesting
  resources :posts, shallow: true do
    resources :comments
  end

  # Concerns
  concern :commentable do
    resources :comments
  end

  resources :posts, concerns: :commentable
  resources :articles, concerns: :commentable
end
```

---

## Caching

**Fragment caching:**
```erb
<% cache @post do %>
  <div class="post">
    <h2><%= @post.title %></h2>
    <%= markdown @post.content %>
  </div>
<% end %>
```

**Russian doll caching:**
```erb
<% cache @post do %>
  <div class="post">
    <h2><%= @post.title %></h2>

    <% cache @post.comments do %>
      <% @post.comments.each do |comment| %>
        <% cache comment do %>
          <%= render comment %>
        <% end %>
      <% end %>
    <% end %>
  </div>
<% end %>
```

---

## Security

**Mass assignment protection:**
```ruby
params.require(:user).permit(:email, :name)
```

**SQL injection prevention:**
```ruby
# Bad
User.where("name = '#{params[:name]}'")

# Good
User.where("name = ?", params[:name])
User.where(name: params[:name])
```

**XSS prevention:**
```erb
<!-- Escaped by default -->
<%= @post.title %>

<!-- Raw HTML (dangerous) -->
<%== @post.html_content %>
<%= raw @post.html_content %>
<%= @post.html_content.html_safe %>
```

**CSRF protection:**
```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
end
```

---

## API Patterns

**API controller:**
```ruby
module Api
  module V1
    class PostsController < ApiController
      def index
        @posts = Post.published.page(params[:page])
        render json: @posts, each_serializer: PostSerializer
      end

      def show
        @post = Post.find(params[:id])
        render json: @post, serializer: PostDetailSerializer
      end

      def create
        @post = current_user.posts.build(post_params)

        if @post.save
          render json: @post, status: :created
        else
          render json: { errors: @post.errors }, status: :unprocessable_entity
        end
      end
    end
  end
end
```

**Serializer:**
```ruby
class PostSerializer < ActiveModel::Serializer
  attributes :id, :title, :excerpt, :created_at

  belongs_to :user
  has_many :tags

  def excerpt
    object.content.truncate(200)
  end
end
```

---

## Best Practices

1. **Keep controllers thin** - Move logic to models/services
2. **Use concerns for shared behavior** - DRY across models/controllers
3. **Eager load associations** - Avoid N+1 queries
4. **Use background jobs** - For slow/external operations
5. **Cache aggressively** - Fragment and Russian doll caching
6. **Index database columns** - For frequently queried fields
7. **Validate at multiple levels** - Database, model, and form
8. **Use transactions** - For multi-step operations
9. **Write tests** - Models, controllers, features
10. **Follow REST conventions** - Standard resource routing

---

## Anti-Patterns to Avoid

1. **Fat controllers** - Business logic in controllers
2. **God objects** - Models doing too much
3. **Callback hell** - Too many interdependent callbacks
4. **N+1 queries** - Missing eager loading
5. **Skipping validations** - Using `save(validate: false)`
6. **Hard-coding** - Magic numbers/strings instead of constants
7. **Ignoring security** - Raw SQL, mass assignment
8. **Missing indexes** - Slow queries on foreign keys
9. **Premature optimization** - Over-engineering simple features
10. **Inconsistent naming** - Breaking Rails conventions

---

## Summary

Rails patterns provide structure for building maintainable applications. Rails Engines enable modular architecture for large applications and reusable components. Follow conventions, optimize queries, extract complex logic, and leverage Rails' powerful features for clean, efficient code.

The Rails Engines section provides comprehensive coverage of:
- Creating mountable vs full engines
- Engine structure and namespace isolation
- Mounting engines and route configuration
- Sharing functionality between engines and parent apps
- Migration management and installation
- Custom generators for engine components
- Comprehensive testing strategies with RSpec
- Dependency management in gemspecs
- Configuration and initialization patterns
- Decision frameworks for when to use engines

Use this knowledge to build modular, maintainable Rails applications and create powerful, reusable components.
