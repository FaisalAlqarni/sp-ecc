# Skill & Rules Integration Design

> **Approach:** Modular Integration — new concepts get their natural home (rules for always-active principles, skills for detailed reference), existing files enhanced where concepts naturally extend them.

> **Philosophy:** Rules are always active. Skills are invoked when needed. The split ensures behavioral principles (clarify first, model routing, workflow discipline) are never skipped, while detailed frameworks remain accessible as reference material.

**Date:** 2026-03-01
**Scope:** 3 new common rules, 3 new skills, 4 modified common rules, 1 generalized skill, 7 new language rule directories (35 files), Tiger Style cherry-picks

---

## 1. New Common Rules (Always Active)

### 1a. `rules/common/workflow-orchestration.md`

Always-active behavioral principles extracted from CLAUDE.md Workflow Orchestration + gap analysis. These were previously only embedded in skills that may not trigger — now they're always in context.

**Sections:**
- **Plan Mode Default** — Enter plan mode for 3+ step tasks. STOP and re-plan if things go sideways.
- **Subagent Strategy** — Use liberally for context window hygiene. Offload research/exploration.
- **Verification Before Done** — Prove it works. Diff against main. Staff engineer quality bar.
- **Demand Elegance (Balanced)** — Self-reflection for non-trivial changes. Skip for simple fixes.
- **Autonomous Bug Fixing** — Just fix it. Zero user context-switching.
- **Self-Improvement Loop** — Capture lessons after corrections. Write preventive rules.
- **Core Principles** — Simplicity first. No laziness. Minimal impact.

### 1b. `rules/common/clarify-first.md`

Concise always-active "no guessing" rule:
- Trigger conditions (confused, missing inputs, multiple interpretations, confidence < 0.8)
- How to ask (structured options, "decide for me" escape hatch)
- References `skills/clarify-first/SKILL.md` for detailed checklists

### 1c. `rules/common/model-routing.md`

Concise always-active model tier routing:
- Quick decision: Think → Opus, Build → Sonnet, Apply → Haiku
- Bug escalation summary (3+ failures → Opus)
- Agent model tiers: respect per-agent assignments
- References `skills/model-routing/SKILL.md` for detailed scoring

---

## 2. New Skills (Detailed Reference)

### 2a. `skills/frontend-design/SKILL.md`

Port of upstream frontend-design skill — design aesthetics guidance:
- **Design Thinking** — Purpose, Tone (bold aesthetic direction), Constraints, Differentiation
- **Frontend Aesthetics** — Typography (distinctive, avoid generic), Color & Theme (CSS variables, dominant + accent), Motion (staggered reveals, scroll-triggering), Spatial Composition (asymmetry, grid-breaking), Backgrounds (gradients, noise, textures)
- **Anti-patterns** — Never use: Inter/Roboto/Arial, purple-gradient-on-white, cookie-cutter layouts
- **Key principle:** Match implementation complexity to aesthetic vision

**Relationship:** `frontend-design` = how interfaces **look** (aesthetics). `frontend-patterns` = how interfaces are **built** (code architecture). Both invoked for frontend work.

### 2b. `skills/clarify-first/SKILL.md`

Detailed reference skill with full clarification framework:
- **Clarification Gate Checklist** — 7-item checklist (Goal? Output format? Constraints? Environment? Inputs? No assumptions? No destructive actions?)
- **Question Template** — Structured format with options + "decide for me" escape hatch
- **Assumption Policy** — Forbidden (silent assumptions), Allowed only when user says "decide for me"
- **Safety/Irreversible Actions** — Explicit confirmation before destructive steps
- **Confidence Thresholds** — <0.8 ask, <0.6 only provide options
- **Quick Examples** — Trigger scenarios for common ambiguous requests

### 2c. `skills/model-routing/SKILL.md`

Detailed reference skill with full model routing framework:
- **Task Classification** — Opus/Sonnet/Haiku task lists with examples
- **Bug Complexity Scoring** — 6 signals (+1 each: multi-file, no stack trace, intermittent, concurrency, state-dependent, performance). 0-1 → Sonnet, 2-3 → Sonnet first, 4+ → Opus
- **Escalation Triggers** — 3+ failed fixes, circular investigation, scope expansion, 3+ disproven hypotheses
- **Implementation Pattern** — Opus (analyze/plan) → Sonnet (execute/build) → Haiku (polish)
- **Decision Flow Diagram** — Visual routing tree
- **Cost Savings Table** — Quantified savings per workflow type

---

## 3. Modified Existing Files

### 3a. Generalize `skills/frontend-patterns/SKILL.md`

**Current:** React/Next.js specific with TypeScript examples.

**Change to:** Framework-agnostic "UI Patterns" covering universal principles:
- **Component Composition** — Small, single-responsibility, composable units (universal)
- **State Management** — Local/shared/server state patterns (applies to React, Vue, Svelte, Flutter, etc.)
- **Data Fetching** — Loading/error/success states, caching, optimistic updates
- **Form Handling** — Validation, error display, submission states
- **Accessibility** — Semantic HTML, ARIA, keyboard nav, focus management
- **Performance** — Lazy loading, code splitting, virtualization, memoization (concepts)
- **Animation** — CSS transitions, scroll effects, micro-interactions (CSS-first)

Remove: React-specific TypeScript code, Next.js patterns, `createContext`/`useReducer` API calls.
Keep: Principles behind each pattern — they're universal.

### 3b. Enhance `rules/common/agents.md`

Add Subagent Strategy section:
- Use subagents liberally for context window hygiene
- Offload research and exploration (not just implementation)
- For complex problems, throw more compute at it — dispatch parallel agents
- When in doubt, dispatch a subagent rather than polluting main context

### 3c. Enhance `rules/common/coding-style.md`

Add from CLAUDE.md:
- **Elegance Check** — Pause after non-trivial implementation: "more elegant way?" If hacky: rewrite with full context. Skip for simple fixes.
- **Minimal Impact** — Touch only what's necessary. No "while I'm here" improvements.

Add from Tiger Style (cherry-picked universals):
- **Function Length** — Target ~70 lines per function. Longer is a code smell — consider splitting, but use judgment for edge cases (switch statements, test setup, etc.). Split strategy: parent handles control flow, helpers handle computation.
- **Variable Scope** — Declare at smallest possible scope. Calculate/check close to use. Don't introduce before needed.
- **Naming Discipline** — No abbreviations (unless primitive loop counters). Add units/qualifiers last by descending significance (`latency_ms_max`). Get nouns and verbs right.
- **Error Handling** — All errors must be handled. No swallowed exceptions. No empty catch blocks.
- **Comments** — Explain "why", not "what". Always motivate decisions. Comments are well-written sentences.
- **Zero Technical Debt** — Code shipped is solid. Features may be incomplete, but what exists meets quality standards.
- **Assertions** — Assert pre/postconditions at function boundaries. Validate arguments and return values.

### 3d. Enhance `rules/common/performance.md`

Add from Tiger Style:
- **Back-of-Envelope Sketches** — Think about performance from design phase. Sketch network/disk/memory/CPU costs before implementing.
- **Batch Operations** — Amortize costs by batching. Don't one-at-a-time when you can batch.
- **Resource Priority** — Optimize for slowest resources first: Network → Disk → Memory → CPU (compensate for frequency).

### 3e. Update `rules/README.md`

Add the 7 new language directories to the structure diagram and installation instructions.

---

## 4. Language-Specific Rules (7 directories × 5 files = 35 files)

Each directory extends `rules/common/` with language-specific content. Each file is concise (~30-50 lines), references existing skills for deep guidance.

### 4a. `rules/ruby/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | RuboCop, snake_case/PascalCase, freeze string literals, `&:method` | `ruby-patterns` |
| `testing.md` | RSpec, SimpleCov 80%+, FactoryBot, test tags | `ruby-testing` |
| `patterns.md` | Service objects (`#call`), value objects, query objects, composition | `ruby-patterns` |
| `hooks.md` | PostToolUse: RuboCop auto-correct `.rb`, warn `puts`/`pp` | — |
| `security.md` | Brakeman, `bundle audit`, env-based secrets | `ruby-patterns` |

### 4b. `rules/rails/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Convention over config, fat models/skinny controllers, strong params, `rubocop-rails` | `rails-patterns` |
| `testing.md` | RSpec-Rails + FactoryBot + Capybara, request specs, database cleaner | `rails-tdd` |
| `patterns.md` | Engines arch, service layer, form/query objects, N+1 (`includes`/`eager_load`) | `rails-patterns` |
| `hooks.md` | PostToolUse: `rubocop-rails`, `rails routes` check, migration status | — |
| `security.md` | Brakeman, CSRF/XSS/SQLi protections, Pundit, `credentials.yml.enc` | `rails-security` |

### 4c. `rules/dart/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Effective Dart, `dart format`, lowerCamelCase, prefer final/const, null safety | `dart-patterns` |
| `testing.md` | `dart test`, mockito, `--coverage`, test dir mirrors lib/src/ | `dart-testing` |
| `patterns.md` | Result/Either, sealed classes, extension methods, factory constructors, copyWith | `dart-patterns` |
| `hooks.md` | PostToolUse: `dart format`, `dart analyze`, `dart fix --apply` | — |
| `security.md` | No hardcoded keys, `--dart-define`, pubspec audit, HTTPS enforcement | — |

### 4d. `rules/flutter/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Widget composition, const constructors, Key usage, prefer StatelessWidget, flutter_lints | `flutter-patterns` |
| `testing.md` | `testWidgets`, unit/integration tests, golden tests, mock navigation | `flutter-verification` |
| `patterns.md` | State management (Bloc/Riverpod/Provider), repository pattern, DI, GoRouter | `flutter-patterns` |
| `hooks.md` | PostToolUse: `dart format`, `flutter analyze`, `flutter test` | — |
| `security.md` | `flutter_secure_storage`, cert pinning, obfuscation, no secrets in source | — |

### 4e. `rules/django/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Split settings (base/dev/prod/test), app naming, DRF serializer conventions | `django-patterns` |
| `testing.md` | pytest-django, `@pytest.mark.django_db`, APIClient, factory_boy, pytest-cov | `django-tdd` |
| `patterns.md` | Service layer, custom QuerySets/Managers, signals guidelines, middleware, caching | `django-patterns` |
| `hooks.md` | PostToolUse: `black`/`ruff`, `manage.py check`, `makemigrations --check` | — |
| `security.md` | `SECURE_*` settings, CSRF middleware, parameterized ORM, `django-axes`, `check --deploy` | `django-security` |

### 4f. `rules/java/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Java 17+ (records, sealed classes), PascalCase/camelCase, final fields, Optional rules | `java-coding-standards` |
| `testing.md` | JUnit 5 + AssertJ, Mockito, `@ParameterizedTest`, jacoco 80%+, `shouldDoX_whenY` | `springboot-tdd` |
| `patterns.md` | Records as DTOs, Builder, sealed interfaces, constructor injection, repository interface | `jpa-patterns` |
| `hooks.md` | PostToolUse: Google Java Format/Spotless, `mvn compile`/`gradle build`, SpotBugs | — |
| `security.md` | Bean Validation (`@Valid`), OWASP dependency-check, parameterized JPQL, no `catch(Exception)` | `springboot-security` |

### 4g. `rules/springboot/` (5 files)

| File | Key Content | Skill Ref |
|---|---|---|
| `coding-style.md` | Constructor injection, thin controllers, `@Transactional(readOnly=true)`, record DTOs, `@ControllerAdvice` | `springboot-patterns` |
| `testing.md` | `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`, Testcontainers, MockMvc | `springboot-tdd` |
| `patterns.md` | Layered arch, `@Cacheable`/`@CacheEvict`, `@Async`, Pageable, Specification API | `springboot-patterns` |
| `hooks.md` | PostToolUse: Spotless, `mvn compile`, `mvn verify` for integration tests | — |
| `security.md` | Spring Security filter chain, `@PreAuthorize`, JWT filter, CORS, Bucket4j rate limiting | `springboot-security` |

---

## 5. Files Summary

| Category | Action | Count | Details |
|---|---|---|---|
| **New common rules** | Create | 3 | workflow-orchestration.md, clarify-first.md, model-routing.md |
| **New skills** | Create | 3 | frontend-design, clarify-first, model-routing |
| **Enhanced common rules** | Modify | 4 | agents.md, coding-style.md, performance.md, README.md |
| **Generalized skill** | Modify | 1 | frontend-patterns → framework-agnostic |
| **Language rules** | Create | 35 | 7 dirs × 5 files |
| **Total** | | **46** | 41 new + 5 modified |

---

## 6. What's NOT Changing

- All existing skills (TDD, brainstorming, writing-plans, debugging, etc.)
- All existing agents and their model tiers
- Hooks system (hooks.json)
- Existing language-specific skills (ruby-patterns, rails-tdd, etc.)
- All commands
- Layer 1/2/3 architecture
- Continuous-learning-v2 pipeline
- Mode skills (dev-mode, research-mode, review-mode)

---

## 7. Integration Points

### How new rules interact with existing skills:

| New Rule | Complements |
|---|---|
| `workflow-orchestration.md` | writing-plans, brainstorming, verification-before-completion, systematic-debugging, subagent-driven-development |
| `clarify-first.md` | brainstorming (already has 1-question-at-a-time), writing-plans (requirements restatement) |
| `model-routing.md` | Agent model tiers, subagent dispatch, dispatching-parallel-agents |

### Rule vs Skill division:

- **Rules** = always loaded, concise, behavioral principles (the "what")
- **Skills** = invoked when needed, detailed, procedural frameworks (the "how")
- Example: `rules/common/clarify-first.md` says "ask when confidence < 0.8". `skills/clarify-first/SKILL.md` provides the exact checklist, template, and scoring.
