# Skill & Rules Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate 3 new capabilities (frontend-design, clarify-first, model-routing) as rule+skill pairs, extract CLAUDE.md Workflow Orchestration into always-active rules, generalize frontend-patterns, add 7 missing language rule directories, and cherry-pick Tiger Style universals.

**Architecture:** Modular Integration — new rules in `rules/common/`, new skills in `skills/`, enhanced existing files where concepts naturally extend them. Language rules follow established 5-file pattern (coding-style, testing, patterns, hooks, security). Each language rule is ~30-50 lines referencing existing skills.

**Tech Stack:** Markdown files only. No code changes. Tests via existing `tests/run-all.js` framework.

**Complexity:** High (46 file operations across 41 new + 5 modified files)

**Risks:**
- HIGH: Large file count — mitigate by batching language rules per directory and using subagents
- MEDIUM: Inconsistent tone/format across 35 language rules — mitigate by following exact pattern from typescript/ and python/ examples

**Testing:** Integration tests to verify all new files exist and follow correct format

**Depends on:** Completed ECC 1.7 integration (105/105 tests passing)

---

## Task 1: Create 3 New Common Rules

**Files:**
- Create: `rules/common/workflow-orchestration.md`
- Create: `rules/common/clarify-first.md`
- Create: `rules/common/model-routing.md`

**Step 1: Create `rules/common/workflow-orchestration.md`**

```markdown
# Workflow Orchestration

> Always-active behavioral principles for disciplined development.

## Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- Write detailed specs upfront to reduce ambiguity
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building

## Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

## Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

## Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

## Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Self-Improvement Loop

- After ANY correction from the user: capture the pattern as a lesson
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate until mistake rate drops
- Review lessons at session start for relevant project

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Impact minimal code.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.
```

**Step 2: Create `rules/common/clarify-first.md`**

```markdown
# Clarify First

> If not 100% sure, ask. Never guess silently.

## Core Rule

Do not proceed with implementation until uncertainty is resolved.

## Trigger Conditions

Ask when ANY of these are true:
- Confused or uncertain about user intent
- Missing inputs (files, logs, env, constraints)
- About to assume defaults (framework, layout, naming)
- Multiple valid interpretations exist
- Requirements conflict or are underspecified
- About to run destructive/irreversible commands
- Confidence < 0.8

## How to Ask

- Ask only what's necessary to proceed safely
- Offer structured options (A/B/C) when possible
- Offer "decide for me" option — then list assumptions explicitly before continuing
- One question at a time — don't overwhelm

## Safety Gate

Before destructive or irreversible steps, always confirm:
"This could change/delete/overwrite X. Do you want me to proceed?"

## Reference

For detailed checklists, confidence thresholds, and examples → `skills/clarify-first/SKILL.md`
```

**Step 3: Create `rules/common/model-routing.md`**

```markdown
# Model Routing

> Route tasks to the most cost-effective model tier.

## Tier Summary

| Tier | Use For |
|------|---------|
| **Opus** | Architecture, planning, complex bugs (4+ signals), security analysis |
| **Sonnet** | Implementation, standard debugging, tests, refactoring |
| **Haiku** | Docs, formatting, boilerplate, mechanical changes |

## Quick Decision

1. "Do I need to THINK deeply?" → **Opus**
2. "Do I need to BUILD something?" → **Sonnet**
3. "Do I need to APPLY changes mechanically?" → **Haiku**

Default to Sonnet when uncertain.

## Bug Escalation

- Start all bugs on Sonnet
- Escalate to Opus after: 3+ failed fixes, circular investigation, scope expansion to 5+ files
- Self-check after each attempt: Fixes tried [N] | Files touched [N] | Confidence [H/M/L]

## Agent Model Tiers

Agent files specify their model tier. Respect these assignments when dispatching subagents.

## Reference

For detailed scoring, decision trees, and examples → `skills/model-routing/SKILL.md`
```

**Step 4: Verify files exist**

Run: `ls -la rules/common/workflow-orchestration.md rules/common/clarify-first.md rules/common/model-routing.md`
Expected: All 3 files exist.

---

## Task 2: Create 3 New Skills

**Files:**
- Create: `skills/frontend-design/SKILL.md`
- Create: `skills/clarify-first/SKILL.md`
- Create: `skills/model-routing/SKILL.md`

**Step 1: Create `skills/frontend-design/SKILL.md`**

Port the upstream frontend-design skill. Frontmatter:
```yaml
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---
```

Full content includes:
- **Design Thinking** — Purpose, Tone (pick an extreme aesthetic direction), Constraints, Differentiation
- **Frontend Aesthetics Guidelines** — Typography (distinctive fonts, avoid Inter/Roboto/Arial), Color & Theme (CSS variables, dominant + accent), Motion (staggered reveals, scroll-triggering, CSS-first), Spatial Composition (asymmetry, grid-breaking, overlap), Backgrounds & Visual Details (gradients, noise, textures, grain overlays)
- **Anti-patterns** — Never use generic AI aesthetics: overused fonts, cliched purple-gradient-on-white, predictable layouts
- **Key directive:** Match implementation complexity to the aesthetic vision. Bold maximalism and refined minimalism both work — the key is intentionality.

Source reference: `https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md`

**Step 2: Create `skills/clarify-first/SKILL.md`**

Frontmatter:
```yaml
---
name: clarify-first
description: Detailed clarification framework. Forces asking before guessing. Provides checklists, question templates, confidence thresholds, and assumption policies.
---
```

Full content from `/development/.claude/skills/clarify-first/SKILL.md` including:
- Core Rule ("If not 100% sure, ask")
- When to Trigger (8 conditions)
- Clarification Gate Checklist (7-item: Goal, Output format, Constraints, Environment, Inputs, No assumptions, No destructive actions)
- Question Template (structured with options + "decide for me")
- Assumption Policy (Forbidden: silent assumptions. Allowed only when user says "decide for me" — list assumptions explicitly, mark as ASSUMPTIONS)
- Safety/Irreversible Actions (explicit confirmation before destructive steps)
- Confidence Rule (<0.8 ask, <0.6 only options)
- Quick Examples (triggers for common ambiguous requests)

**Step 3: Create `skills/model-routing/SKILL.md`**

Frontmatter:
```yaml
---
name: model-routing
description: Detailed model routing framework. Provides task classification, bug complexity scoring, escalation triggers, and cost optimization patterns for Opus/Sonnet/Haiku tiers.
---
```

Full content from `/development/.claude/skills/tiered-model-router/SKILL.md` including:
- Model Tiers table (Opus/Sonnet/Haiku with cost indicators)
- Task Classification (detailed lists per tier)
- Bug Complexity Decision (6 signals, scoring 0-1/2-3/4+)
- Escalation Rule (6 triggers with thresholds)
- Haiku Tasks list
- Decision Flow diagram (ASCII)
- Implementation Pattern (Opus→Sonnet→Haiku phases)
- Cost Savings Examples table
- Quick Reference (3 questions)
- Anti-Patterns list

**Step 4: Verify files exist**

Run: `ls -la skills/frontend-design/SKILL.md skills/clarify-first/SKILL.md skills/model-routing/SKILL.md`
Expected: All 3 files exist.

---

## Task 3: Enhance Existing Common Rules

**Files:**
- Modify: `rules/common/agents.md` (append section)
- Modify: `rules/common/coding-style.md` (append sections)
- Modify: `rules/common/performance.md` (append sections)

**Step 1: Add Subagent Strategy to `rules/common/agents.md`**

Append after the existing "Multi-Perspective Analysis" section:

```markdown
## Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research and exploration to subagents — not just implementation
- For complex problems, throw more compute at it — dispatch parallel agents
- When in doubt, dispatch a subagent rather than polluting main context
- Each subagent gets one focused task for clean execution
```

**Step 2: Add Elegance + Minimal Impact + Tiger Style to `rules/common/coding-style.md`**

Append after the existing "Code Quality Checklist" section:

```markdown
## Elegance Check (Non-Trivial Changes Only)

- Pause after implementation: "Is there a more elegant way?"
- If fix feels hacky: rewrite with full context — "Knowing everything I know now, implement the elegant solution"
- Skip for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

## Minimal Impact

- Changes should only touch what's necessary
- No "while I'm here" improvements outside the task scope
- Avoid introducing bugs by limiting blast radius

## Function Length

- Target ~70 lines per function — longer is a code smell
- Consider splitting, but use judgment for edge cases (switch statements, test setup)
- Split strategy: parent handles control flow, helpers handle computation
- "Push ifs up, fors down"

## Variable Scope

- Declare at smallest possible scope
- Calculate and check variables close to where they are used
- Don't introduce variables before they are needed

## Naming Discipline

- No abbreviations unless primitive loop counters
- Add units and qualifiers last, sorted by descending significance (`latency_ms_max` not `max_latency_ms`)
- Get nouns and verbs right — great names capture what a thing is or does

## Error Handling (Strengthened)

- All errors must be handled — no swallowed exceptions, no empty catch blocks
- Assert pre/postconditions at function boundaries
- Validate arguments and return values at system boundaries

## Comments

- Explain "why", not "what" — the code shows what, comments show reasoning
- Always motivate decisions — explain the rationale
- Comments are well-written sentences, not scribblings in the margin

## Zero Technical Debt

- Code shipped is solid — features may be incomplete, but what exists meets quality standards
- Problems discovered early cost less — fix now, not later
- No deferred fixes in production code paths
```

**Step 3: Add Tiger Style performance principles to `rules/common/performance.md`**

Append after the existing "Build Troubleshooting" section:

```markdown
## Design-Phase Performance Thinking

- Think about performance from the outset — the biggest wins (1000x) come in design, not profiling
- Perform back-of-envelope sketches for network, disk, memory, and CPU costs before implementing
- Sketches are cheap — use them to land within 90% of the optimal solution

## Batch Operations

- Amortize network, disk, memory, and CPU costs by batching
- Don't do one-at-a-time when you can batch
- Batching improves throughput and reduces context-switching overhead

## Resource Priority

- Optimize for slowest resources first: Network → Disk → Memory → CPU
- Compensate for frequency — a cheap operation done 1000x may cost more than an expensive one done once
- Distinguish between control plane (setup, config) and data plane (hot path) — optimize the data plane
```

**Step 4: Verify modifications**

Run: `grep -c "Subagent Strategy" rules/common/agents.md && grep -c "Elegance Check" rules/common/coding-style.md && grep -c "Design-Phase" rules/common/performance.md`
Expected: Each returns `1`.

---

## Task 4: Update Rules README

**Files:**
- Modify: `rules/README.md`

**Step 1: Update directory structure and installation**

Update the structure diagram to include all 10 directories (common + 3 existing + 7 new):

```
rules/
├── common/          # Language-agnostic principles (always install)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   ├── security.md
│   ├── workflow-orchestration.md   # NEW
│   ├── clarify-first.md            # NEW
│   └── model-routing.md            # NEW
├── typescript/      # TypeScript/JavaScript specific
├── python/          # Python specific
├── golang/          # Go specific
├── ruby/            # Ruby specific          # NEW
├── rails/           # Ruby on Rails specific  # NEW
├── dart/            # Dart specific           # NEW
├── flutter/         # Flutter specific        # NEW
├── django/          # Django specific         # NEW
├── java/            # Java specific           # NEW
└── springboot/      # Spring Boot specific    # NEW
```

Update installation section to include new languages. Update the "Adding a New Language" section to note there are now 10 language directories as examples.

**Step 2: Verify**

Run: `grep -c "ruby/" rules/README.md && grep -c "workflow-orchestration" rules/README.md`
Expected: Each returns at least `1`.

---

## Task 5: Generalize `skills/frontend-patterns/SKILL.md`

**Files:**
- Modify: `skills/frontend-patterns/SKILL.md`

**Step 1: Rewrite as framework-agnostic UI patterns**

Replace the entire file. New frontmatter:
```yaml
---
name: frontend-patterns
description: Framework-agnostic UI development patterns for component composition, state management, data fetching, forms, accessibility, performance, and animation. Applies to React, Vue, Svelte, Rails views, Flutter, and any UI framework.
---
```

New structure — universal principles with concept-level examples (not framework-specific API calls):

**Component Composition** — Small, single-responsibility, composable units. Prefer composition over inheritance. Compound components share state through context/providers. Slot-based composition for flexible layouts.

**State Management** — Three categories: Local state (component-scoped), Shared state (app-wide store/context), Server state (cached API data with loading/error/stale). Choose the simplest option that works. Don't over-architect state.

**Data Fetching** — Every fetch has 3 states: loading, success, error. Handle all 3. Cache responses when appropriate. Optimistic updates for better UX. Debounce search inputs.

**Form Handling** — Controlled forms with explicit state. Validate on submit (not on every keystroke unless UX requires it). Show errors near the field. Clear errors when user starts correcting. Handle submission states (idle, submitting, success, error).

**Accessibility** — Semantic HTML first (button, nav, main, article — not div for everything). ARIA attributes when semantics aren't enough. Keyboard navigation (arrow keys in lists, Escape to close, Enter to confirm). Focus management (trap focus in modals, restore on close). Color contrast (WCAG AA minimum).

**Performance** — Lazy load heavy components. Virtualize long lists (don't render 1000 items). Memoize expensive computations. Code-split by route. Avoid unnecessary re-renders.

**Animation** — CSS transitions for simple state changes. Scroll-triggered animations for engagement. Staggered reveals for lists (delay per item). Micro-interactions on hover/focus for polish. Prefer CSS-only solutions; use framework animation libraries for complex sequences.

Each section: 1 paragraph of principle + concise conceptual pseudocode (no framework-specific imports).

**Step 2: Verify**

Run: `grep -c "React" skills/frontend-patterns/SKILL.md`
Expected: `0` (no React-specific references remain).

---

## Task 6: Create Ruby & Rails Rules

**Files:**
- Create: `rules/ruby/coding-style.md`
- Create: `rules/ruby/testing.md`
- Create: `rules/ruby/patterns.md`
- Create: `rules/ruby/hooks.md`
- Create: `rules/ruby/security.md`
- Create: `rules/rails/coding-style.md`
- Create: `rules/rails/testing.md`
- Create: `rules/rails/patterns.md`
- Create: `rules/rails/hooks.md`
- Create: `rules/rails/security.md`

Each file follows the established pattern:
- Title: `# Ruby {Topic}` or `# Rails {Topic}`
- Cross-reference: `> This file extends [common/{topic}.md](../common/{topic}.md) with Ruby/Rails specific content.`
- 20-50 lines of concise, prescriptive content
- Code examples use `# WRONG` / `# CORRECT` annotation style
- Reference section pointing to existing skills

**Ruby rules content per file:**

`ruby/coding-style.md`: RuboCop enforcement, 2-space indent, snake_case methods/variables, PascalCase classes/modules, freeze string literals (`# frozen_string_literal: true`), prefer `&:method` shorthand, prefer `each` over `for`. Ref: `ruby-patterns` skill.

`ruby/testing.md`: RSpec framework, SimpleCov 80%+ coverage, FactoryBot for test data, `rspec --format documentation`, test tags (`:unit`, `:integration`). Ref: `ruby-testing` skill.

`ruby/patterns.md`: Service objects (`.call` convention), value objects (frozen), query objects, decorator/presenter pattern, composition over inheritance. Ref: `ruby-patterns` skill.

`ruby/hooks.md`: PostToolUse: `rubocop -a` auto-correct on `.rb` files. Warnings: `puts`/`pp`/`p` debug statements in production code.

`ruby/security.md`: Brakeman for static analysis, `bundle audit` for gem vulnerabilities, env-based secrets via `dotenv-rails` or `credentials.yml.enc`. Ref: `ruby-patterns` skill.

**Rails rules content per file:**

`rails/coding-style.md`: Convention over configuration, fat models/skinny controllers, strong parameters, `rubocop-rails` cops, RESTful routing, concerns for shared behavior. Ref: `rails-patterns` skill.

`rails/testing.md`: RSpec-Rails + FactoryBot + Capybara, request specs over controller specs, system tests for E2E, database cleaner strategy (`:transaction` for unit, `:truncation` for system). Ref: `rails-tdd` skill.

`rails/patterns.md`: Engines architecture, service layer for business logic, form objects, query objects, N+1 prevention (`includes`/`eager_load`/`preload`), scopes for common queries. Ref: `rails-patterns` skill.

`rails/hooks.md`: PostToolUse: `rubocop-rails -a` on `.rb` files, `rails routes` check after route edits, `rails db:migrate:status` after migration changes.

`rails/security.md`: Brakeman scan, CSRF protection (verify_authenticity_token), strong parameters, Pundit/CanCanCan authorization, `credentials.yml.enc` for secrets, `config.force_ssl` in production. Ref: `rails-security` skill.

**Verify:**

Run: `find rules/ruby rules/rails -name "*.md" | wc -l`
Expected: `10`

---

## Task 7: Create Dart & Flutter Rules

**Files:**
- Create: `rules/dart/coding-style.md`
- Create: `rules/dart/testing.md`
- Create: `rules/dart/patterns.md`
- Create: `rules/dart/hooks.md`
- Create: `rules/dart/security.md`
- Create: `rules/flutter/coding-style.md`
- Create: `rules/flutter/testing.md`
- Create: `rules/flutter/patterns.md`
- Create: `rules/flutter/hooks.md`
- Create: `rules/flutter/security.md`

Same format as Task 6.

**Dart rules content per file:**

`dart/coding-style.md`: Effective Dart guidelines, `dart format` (mandatory), `lowerCamelCase` variables/functions, `UpperCamelCase` classes, prefer `final`/`const`, null safety (avoid `!` operator), strict `analysis_options.yaml`. Ref: `dart-patterns` skill.

`dart/testing.md`: `dart test` framework, `package:mockito` for mocking, coverage via `dart test --coverage`, test directory mirrors `lib/src/` structure. Ref: `dart-testing` skill.

`dart/patterns.md`: Result/Either pattern for error handling, sealed classes for exhaustive matching, extension methods, factory constructors, `copyWith` for immutability. Ref: `dart-patterns` skill.

`dart/hooks.md`: PostToolUse: `dart format` on `.dart` files, `dart analyze` after edits, `dart fix --apply` for auto-fixes.

`dart/security.md`: No hardcoded API keys in source, `--dart-define` for compile-time secrets, pubspec dependency auditing, HTTPS enforcement in HTTP clients.

**Flutter rules content per file:**

`flutter/coding-style.md`: Widget composition principles, const constructors, `Key` usage, prefer `StatelessWidget`, avoid deep widget nesting (extract widgets), `flutter_lints` package. Ref: `flutter-patterns` skill.

`flutter/testing.md`: `testWidgets` for widget tests, unit tests for business logic, `integration_test` package for integration, golden image tests, mock navigation/routing. Ref: `flutter-verification` skill.

`flutter/patterns.md`: State management selection (Bloc/Cubit, Riverpod, Provider), repository pattern for data layer, dependency injection, navigation (GoRouter). Ref: `flutter-patterns` skill.

`flutter/hooks.md`: PostToolUse: `dart format` on `.dart` files, `flutter analyze` after edits, `flutter test` on modified test files.

`flutter/security.md`: `flutter_secure_storage` for sensitive data, certificate pinning, obfuscation flags for release builds, no secrets in source, platform-specific permission handling.

**Verify:**

Run: `find rules/dart rules/flutter -name "*.md" | wc -l`
Expected: `10`

---

## Task 8: Create Django Rules

**Files:**
- Create: `rules/django/coding-style.md`
- Create: `rules/django/testing.md`
- Create: `rules/django/patterns.md`
- Create: `rules/django/hooks.md`
- Create: `rules/django/security.md`

`django/coding-style.md`: Split settings pattern (base/dev/prod/test), app naming conventions, model field ordering (pk, ForeignKey, CharField, DateTimeField, Meta), DRF serializer conventions. Ref: `django-patterns` skill.

`django/testing.md`: pytest-django as framework, `@pytest.mark.django_db` decorator, `APIClient` for DRF endpoint tests, factory_boy for fixtures, `pytest-cov` for coverage. Ref: `django-tdd` skill.

`django/patterns.md`: Service layer for business logic (not in views), custom QuerySets/Managers, signals guidelines (prefer explicit service calls over signals), middleware patterns, caching strategies (`cache_page`, `@cache_control`). Ref: `django-patterns` skill.

`django/hooks.md`: PostToolUse: `black`/`ruff format` on `.py` files, `python manage.py check` after model changes, `python manage.py makemigrations --check` after model field edits.

`django/security.md`: `SECURE_*` settings checklist (SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS, etc.), CSRF middleware enforcement, parameterized ORM queries (never raw SQL with string formatting), `django-axes` for brute-force protection, `python manage.py check --deploy` for deployment readiness. Ref: `django-security` skill.

**Verify:**

Run: `find rules/django -name "*.md" | wc -l`
Expected: `5`

---

## Task 9: Create Java & Spring Boot Rules

**Files:**
- Create: `rules/java/coding-style.md`
- Create: `rules/java/testing.md`
- Create: `rules/java/patterns.md`
- Create: `rules/java/hooks.md`
- Create: `rules/java/security.md`
- Create: `rules/springboot/coding-style.md`
- Create: `rules/springboot/testing.md`
- Create: `rules/springboot/patterns.md`
- Create: `rules/springboot/hooks.md`
- Create: `rules/springboot/security.md`

**Java rules content per file:**

`java/coding-style.md`: Java 17+ features (records, sealed classes, pattern matching), PascalCase classes, camelCase methods/variables, UPPER_SNAKE_CASE constants, `final` fields by default, Optional usage rules (never as field/parameter, only as return type). Ref: `java-coding-standards` skill.

`java/testing.md`: JUnit 5 + AssertJ for assertions, Mockito for mocking, `@ParameterizedTest` for table-driven tests, JaCoCo 80%+ coverage, naming convention `shouldDoX_whenY`. Ref: `springboot-tdd` skill.

`java/patterns.md`: Records as DTOs (immutable, compact), Builder pattern for complex construction, sealed interfaces for domain modeling, constructor injection (no field injection), repository interface pattern. Ref: `jpa-patterns` skill.

`java/hooks.md`: PostToolUse: Google Java Format or Spotless on `.java` files, `mvn compile`/`gradle build` after edits, SpotBugs/Error Prone for static analysis.

`java/security.md`: Bean Validation (`@Valid`, `@NotNull`, `@Size`) on all controller inputs, OWASP dependency-check plugin, no `catch(Exception)` swallowing, parameterized JPQL queries (never string concatenation), secrets via environment variables or Vault. Ref: `springboot-security` skill.

**Spring Boot rules content per file:**

`springboot/coding-style.md`: Constructor injection (no `@Autowired` on fields), thin controllers (delegate to services), `@Transactional(readOnly = true)` for queries, record-based DTOs, `@ControllerAdvice` for centralized error handling. Ref: `springboot-patterns` skill.

`springboot/testing.md`: `@SpringBootTest` for integration, `@WebMvcTest` for controller layer, `@DataJpaTest` for repository layer, Testcontainers for database tests, `MockMvc` for request testing. Ref: `springboot-tdd` skill.

`springboot/patterns.md`: Layered architecture (Controller → Service → Repository), `@Cacheable`/`@CacheEvict` for caching, `@Async` for background processing, pagination with `Pageable`, filter pattern with Specification API. Ref: `springboot-patterns` skill.

`springboot/hooks.md`: PostToolUse: Spotless/Google Java Format on `.java` files, `mvn compile` after edits, `mvn verify` for integration test changes.

`springboot/security.md`: Spring Security filter chain configuration, `@PreAuthorize` method security, JWT authentication filter pattern, CORS configuration with explicit origins, rate limiting with Bucket4j, `ForwardedHeaderFilter` for proxy setups. Ref: `springboot-security` skill.

**Verify:**

Run: `find rules/java rules/springboot -name "*.md" | wc -l`
Expected: `10`

---

## Task 10: Add Integration Tests

**Files:**
- Modify: `tests/integration/hooks.test.js`

**Step 1: Add tests for new common rules**

```javascript
// New common rules exist
describe('New Common Rules', () => {
  const commonRules = [
    'workflow-orchestration.md',
    'clarify-first.md',
    'model-routing.md'
  ];

  commonRules.forEach(rule => {
    it(`common rule ${rule} exists`, () => {
      const rulePath = path.join(rootDir, 'rules', 'common', rule);
      assert(fs.existsSync(rulePath), `Missing: rules/common/${rule}`);
    });
  });
});
```

**Step 2: Add tests for new skills**

```javascript
describe('New Skills', () => {
  const newSkills = ['frontend-design', 'clarify-first', 'model-routing'];

  newSkills.forEach(skill => {
    it(`skill ${skill} SKILL.md exists`, () => {
      const skillPath = path.join(rootDir, 'skills', skill, 'SKILL.md');
      assert(fs.existsSync(skillPath), `Missing: skills/${skill}/SKILL.md`);
    });
  });
});
```

**Step 3: Add tests for language rule directories**

```javascript
describe('Language Rule Directories', () => {
  const languages = ['ruby', 'rails', 'dart', 'flutter', 'django', 'java', 'springboot'];
  const ruleFiles = ['coding-style.md', 'testing.md', 'patterns.md', 'hooks.md', 'security.md'];

  languages.forEach(lang => {
    it(`rules/${lang}/ has all 5 required files`, () => {
      ruleFiles.forEach(file => {
        const filePath = path.join(rootDir, 'rules', lang, file);
        assert(fs.existsSync(filePath), `Missing: rules/${lang}/${file}`);
      });
    });

    it(`rules/${lang}/ files have correct cross-reference header`, () => {
      ruleFiles.forEach(file => {
        const filePath = path.join(rootDir, 'rules', lang, file);
        const content = fs.readFileSync(filePath, 'utf8');
        assert(content.includes('This file extends'), `Missing cross-reference in rules/${lang}/${file}`);
      });
    });
  });
});
```

**Step 4: Add tests for enhanced common rules**

```javascript
describe('Enhanced Common Rules', () => {
  it('agents.md has Subagent Strategy section', () => {
    const content = fs.readFileSync(path.join(rootDir, 'rules', 'common', 'agents.md'), 'utf8');
    assert(content.includes('Subagent Strategy'), 'Missing Subagent Strategy in agents.md');
  });

  it('coding-style.md has Elegance Check section', () => {
    const content = fs.readFileSync(path.join(rootDir, 'rules', 'common', 'coding-style.md'), 'utf8');
    assert(content.includes('Elegance Check'), 'Missing Elegance Check in coding-style.md');
  });

  it('coding-style.md has Function Length section', () => {
    const content = fs.readFileSync(path.join(rootDir, 'rules', 'common', 'coding-style.md'), 'utf8');
    assert(content.includes('Function Length'), 'Missing Function Length in coding-style.md');
  });

  it('performance.md has Design-Phase Performance section', () => {
    const content = fs.readFileSync(path.join(rootDir, 'rules', 'common', 'performance.md'), 'utf8');
    assert(content.includes('Design-Phase Performance'), 'Missing Design-Phase Performance in performance.md');
  });
});
```

**Step 5: Add test for generalized frontend-patterns**

```javascript
describe('Generalized Frontend Patterns', () => {
  it('frontend-patterns skill is framework-agnostic', () => {
    const content = fs.readFileSync(path.join(rootDir, 'skills', 'frontend-patterns', 'SKILL.md'), 'utf8');
    assert(!content.includes('React.'), 'frontend-patterns should be framework-agnostic (found React.)');
    assert(!content.includes('import {'), 'frontend-patterns should be framework-agnostic (found import)');
    assert(content.includes('framework-agnostic') || content.includes('Framework-agnostic') || content.includes('any UI framework'),
      'frontend-patterns should mention framework-agnostic nature');
  });
});
```

**Step 6: Run all tests**

Run: `node tests/run-all.js`
Expected: All tests pass (previous 105 + new tests).

---

## Completion Checklist

After all tasks:

- [ ] `ls rules/common/workflow-orchestration.md rules/common/clarify-first.md rules/common/model-routing.md` — all exist
- [ ] `ls skills/frontend-design/SKILL.md skills/clarify-first/SKILL.md skills/model-routing/SKILL.md` — all exist
- [ ] `grep "Subagent Strategy" rules/common/agents.md` — found
- [ ] `grep "Elegance Check" rules/common/coding-style.md` — found
- [ ] `grep "Design-Phase" rules/common/performance.md` — found
- [ ] `grep "ruby/" rules/README.md` — found
- [ ] `find rules/ruby rules/rails rules/dart rules/flutter rules/django rules/java rules/springboot -name "*.md" | wc -l` — returns `35`
- [ ] `grep -c "React" skills/frontend-patterns/SKILL.md` — returns `0`
- [ ] `node tests/run-all.js` — all pass
