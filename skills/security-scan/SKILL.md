---
name: security-scan
description: Scan Claude Code configuration for security vulnerabilities using AgentShield. Use before committing config changes or during periodic security checks.
---

# Security Scan

Audit your Claude Code configuration for security issues using [AgentShield](https://github.com/affaan-m/agentshield).

## When to Use

- Setting up a new Claude Code project
- After modifying `.claude/settings.json`, `CLAUDE.md`, or MCP configs
- Before committing configuration changes
- Periodic security hygiene checks

## What It Scans

| File | Checks |
|------|--------|
| `CLAUDE.md` | Hardcoded secrets, auto-run instructions, prompt injection patterns |
| `settings.json` | Overly permissive allow lists, missing deny lists, dangerous bypass flags |
| `mcp.json` | Risky MCP servers, hardcoded env secrets, npx supply chain risks |
| `hooks/` | Command injection via interpolation, data exfiltration, silent error suppression |
| `agents/*.md` | Unrestricted tool access, prompt injection surface, missing model specs |

## Prerequisites

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield
```

## Usage

### Basic Scan

```bash
# Scan current project
npx ecc-agentshield scan

# Scan specific path
npx ecc-agentshield scan --path /path/to/.claude

# Filter by severity
npx ecc-agentshield scan --min-severity medium
```

### Output Formats

```bash
# Terminal (default) — colored report with grade
npx ecc-agentshield scan

# JSON — for CI/CD
npx ecc-agentshield scan --format json

# Markdown — for docs
npx ecc-agentshield scan --format markdown
```

### Auto-Fix

```bash
npx ecc-agentshield scan --fix
```

Replaces hardcoded secrets with env var references and tightens wildcard permissions. Never modifies manual-only suggestions.

## Severity Grades

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Secure configuration |
| B | 75-89 | Minor issues |
| C | 60-74 | Needs attention |
| D | 40-59 | Significant risks |
| F | 0-39 | Critical vulnerabilities |

## Interpreting Results

**Critical (fix immediately):** Hardcoded API keys, `Bash(*)` in allow list, command injection in hooks, shell-running MCP servers.

**High (fix before production):** Auto-run instructions in CLAUDE.md, missing deny lists, agents with unnecessary Bash access.

**Medium (recommended):** Silent error suppression in hooks, missing PreToolUse security hooks, `npx -y` auto-install in MCP configs.

## Integration

Run as part of `finishing-a-development-branch` workflow or manually anytime.
