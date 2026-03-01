# Rules

## Structure

Rules contain **behavioral principles** that are always active — ensuring standards are never skipped regardless of which skills are invoked.

```
rules/
├── common/          # Language-agnostic behavioral principles
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   ├── security.md
│   ├── workflow-orchestration.md
│   ├── clarify-first.md
│   └── model-routing.md
└── README.md
```

## Installation

```bash
cp -r rules/common/* ~/.claude/rules/
```

## Rules vs Skills

- **Rules** = always active, concise behavioral principles (the "what")
- **Skills** = invoked when needed, detailed procedural frameworks (the "how")

Language-specific guidance lives in skills (e.g., `ruby-patterns`, `rails-tdd`, `django-patterns`), loaded on demand when working with that language. This keeps the always-on token cost minimal while still providing deep guidance when needed.
