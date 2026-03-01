---
name: frontend-patterns
description: Framework-agnostic UI development patterns for component composition, state management, data fetching, forms, accessibility, performance, and animation. Applies to React, Vue, Svelte, Rails views, Flutter, and any UI framework.
---

# UI Development Patterns

Universal patterns for building maintainable, performant user interfaces. These principles apply across all UI frameworks — React, Vue, Svelte, Angular, Rails ERB/Hotwire, Flutter, SwiftUI, and beyond.

## Component Composition

Build UIs from small, single-responsibility, composable units.

**Principles:**
- Each component does ONE thing well
- Prefer composition over inheritance — combine simple components to build complex ones
- Use slot-based composition for flexible layouts (children, named slots, content blocks)
- Compound components share state through context/providers — the parent holds state, children consume it
- Extract reusable components when a pattern appears 2+ times

**Anti-patterns:**
- God components that handle rendering, data fetching, and business logic
- Prop drilling through 4+ levels — use context/providers instead
- Tightly coupling components to specific data shapes — accept generic props

## State Management

Three categories of state — choose the simplest option that works:

**Local State** — Component-scoped, not shared. Toggle visibility, form input values, animation state. Keep it local.

**Shared State** — App-wide, multiple components need it. Auth status, theme, shopping cart. Use your framework's store/context mechanism. Don't over-architect — start local, elevate only when needed.

**Server State** — Cached API data with loading/error/stale semantics. Treat separately from UI state. Use dedicated data-fetching patterns (see below). Server state has unique concerns: caching, revalidation, optimistic updates.

**Anti-patterns:**
- Putting everything in global state — most state is local
- Duplicating server data in client state instead of caching
- Managing derived state manually — compute it from source state

## Data Fetching

Every data fetch has 3 states: **loading**, **success**, **error**. Handle all 3.

**Principles:**
- Show loading indicators for operations > 200ms
- Display meaningful error messages with retry options
- Cache responses when appropriate — avoid redundant network calls
- Debounce search/filter inputs (300-500ms)
- Use optimistic updates for instant-feeling interactions (update UI before server confirms)
- Handle stale data — show cached data while revalidating in background

**Anti-patterns:**
- Ignoring error states — users see blank screens
- Fetching on every render without caching
- Blocking the entire UI during a single fetch

## Form Handling

**Principles:**
- Use controlled forms with explicit state
- Validate on submit (not on every keystroke, unless UX requires inline validation)
- Show errors near the relevant field, not in a generic banner
- Clear field errors when the user starts correcting
- Handle submission states: idle → submitting → success/error
- Disable submit button during submission to prevent double-submit
- Preserve form data on validation failure — never clear the form on error

**Anti-patterns:**
- Silent validation failures — user doesn't know what's wrong
- Validating on every keystroke without debounce (distracting)
- Resetting the form on error (user loses their input)

## Accessibility

**Semantic HTML first** — use `button`, `nav`, `main`, `article`, `header`, `footer`, `section`, `label`, `fieldset` — not `div` for everything. Correct semantics give you keyboard support and screen reader support for free.

**ARIA when semantics aren't enough:**
- `aria-label` for icon-only buttons
- `aria-expanded` for collapsible sections
- `aria-live` for dynamic content updates
- `role="dialog"` with `aria-modal="true"` for modals

**Keyboard navigation:**
- Arrow keys in lists and menus
- Escape to close overlays/modals
- Enter/Space to activate buttons and links
- Tab order follows visual layout

**Focus management:**
- Trap focus inside modals (Tab cycles within modal, not behind it)
- Restore focus to trigger element when modal closes
- Auto-focus the first interactive element in new views

**Color contrast:** WCAG AA minimum (4.5:1 for text, 3:1 for large text).

## Performance

**Principles:**
- Lazy load heavy components — don't load what the user hasn't requested
- Virtualize long lists — rendering 1000 items kills performance; render only visible items
- Memoize expensive computations — recalculate only when inputs change
- Code-split by route — each page loads only its own code
- Minimize re-renders — avoid unnecessary state updates that cascade through the component tree
- Optimize images — use appropriate formats (WebP/AVIF), lazy load below-fold images, provide srcset for responsive sizes

**Anti-patterns:**
- Rendering 1000+ list items without virtualization
- Loading all routes upfront in a SPA
- Re-computing derived data on every render
- Importing entire libraries when you need one function

## Animation

**Principles:**
- CSS transitions for simple state changes (hover, focus, visibility)
- Scroll-triggered animations for engagement — elements animate as they enter viewport
- Staggered reveals for lists — each item animates with a small delay (`animation-delay: calc(index * 50ms)`)
- Micro-interactions on hover/focus for polish — scale, shadow, color shifts
- Prefer CSS-only solutions — they're lighter and more performant
- Use framework animation libraries (Framer Motion, Vue Transitions, CSS Animations API) for complex orchestrated sequences
- Respect `prefers-reduced-motion` — disable animations for users who opt out

**High-impact moments:**
- Page load: one well-orchestrated staggered reveal creates more delight than scattered effects
- State transitions: smooth crossfades between views, not jarring cuts
- Feedback: button press effects, form submission confirmations

**Anti-patterns:**
- Animation on every element (overwhelming, distracting)
- Long durations (>500ms feels sluggish for UI transitions)
- Ignoring reduced-motion preferences

---

**Remember:** Choose patterns that fit your project's complexity. A simple form doesn't need a state machine. A static page doesn't need virtualization. Apply the right level of architecture for the problem at hand.
