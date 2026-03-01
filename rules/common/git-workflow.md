# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

## Feature Implementation Workflow

1. **Plan First** — Break down into phases, identify dependencies
2. **TDD Approach** — Follow workflow in `testing.md`
3. **Code Review** — Use code-reviewer agent (see `agents.md`)
4. **Commit & Push** — Detailed commit messages, conventional format
