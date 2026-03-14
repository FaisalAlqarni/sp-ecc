# Superpower-ECC for OpenCode

Complete guide for using Superpower-ECC with [OpenCode.ai](https://opencode.ai).

## Quick Install

Tell OpenCode:

```
Clone https://github.com/obra/superpower-ecc to ~/.config/opencode/sp-ecc, then create directory ~/.config/opencode/plugins, then symlink ~/.config/opencode/sp-ecc/.opencode/plugins/sp-ecc.js to ~/.config/opencode/plugins/sp-ecc.js, then symlink ~/.config/opencode/sp-ecc/skills to ~/.config/opencode/skills/sp-ecc, then restart opencode.
```

## Manual Installation

### Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- Git installed

### macOS / Linux

```bash
# 1. Install Superpower-ECC (or update existing)
if [ -d ~/.config/opencode/sp-ecc ]; then
  cd ~/.config/opencode/sp-ecc && git pull
else
  git clone https://github.com/obra/superpower-ecc.git ~/.config/opencode/sp-ecc
fi

# 2. Create directories
mkdir -p ~/.config/opencode/plugins ~/.config/opencode/skills

# 3. Remove old symlinks/directories if they exist
rm -f ~/.config/opencode/plugins/sp-ecc.js
rm -rf ~/.config/opencode/skills/sp-ecc

# 4. Create symlinks
ln -s ~/.config/opencode/sp-ecc/.opencode/plugins/sp-ecc.js ~/.config/opencode/plugins/sp-ecc.js
ln -s ~/.config/opencode/sp-ecc/skills ~/.config/opencode/skills/sp-ecc

# 5. Restart OpenCode
```

#### Verify Installation

```bash
ls -l ~/.config/opencode/plugins/sp-ecc.js
ls -l ~/.config/opencode/skills/sp-ecc
```

Both should show symlinks pointing to the sp-ecc directory.

### Windows

**Prerequisites:**
- Git installed
- Either **Developer Mode** enabled OR **Administrator privileges**
  - Windows 10: Settings → Update & Security → For developers
  - Windows 11: Settings → System → For developers

Pick your shell below: [Command Prompt](#command-prompt) | [PowerShell](#powershell) | [Git Bash](#git-bash)

#### Command Prompt

Run as Administrator, or with Developer Mode enabled:

```cmd
:: 1. Install Superpower-ECC
git clone https://github.com/obra/superpower-ecc.git "%USERPROFILE%\.config\opencode\sp-ecc"

:: 2. Create directories
mkdir "%USERPROFILE%\.config\opencode\plugins" 2>nul
mkdir "%USERPROFILE%\.config\opencode\skills" 2>nul

:: 3. Remove existing links (safe for reinstalls)
del "%USERPROFILE%\.config\opencode\plugins\sp-ecc.js" 2>nul
rmdir "%USERPROFILE%\.config\opencode\skills\sp-ecc" 2>nul

:: 4. Create plugin symlink (requires Developer Mode or Admin)
mklink "%USERPROFILE%\.config\opencode\plugins\sp-ecc.js" "%USERPROFILE%\.config\opencode\sp-ecc\.opencode\plugins\sp-ecc.js"

:: 5. Create skills junction (works without special privileges)
mklink /J "%USERPROFILE%\.config\opencode\skills\sp-ecc" "%USERPROFILE%\.config\opencode\sp-ecc\skills"

:: 6. Restart OpenCode
```

#### PowerShell

Run as Administrator, or with Developer Mode enabled:

```powershell
# 1. Install Superpower-ECC
git clone https://github.com/obra/superpower-ecc.git "$env:USERPROFILE\.config\opencode\sp-ecc"

# 2. Create directories
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\plugins"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\skills"

# 3. Remove existing links (safe for reinstalls)
Remove-Item "$env:USERPROFILE\.config\opencode\plugins\sp-ecc.js" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.config\opencode\skills\sp-ecc" -Force -ErrorAction SilentlyContinue

# 4. Create plugin symlink (requires Developer Mode or Admin)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\opencode\plugins\sp-ecc.js" -Target "$env:USERPROFILE\.config\opencode\sp-ecc\.opencode\plugins\sp-ecc.js"

# 5. Create skills junction (works without special privileges)
New-Item -ItemType Junction -Path "$env:USERPROFILE\.config\opencode\skills\sp-ecc" -Target "$env:USERPROFILE\.config\opencode\sp-ecc\skills"

# 6. Restart OpenCode
```

#### Git Bash

Note: Git Bash's native `ln` command copies files instead of creating symlinks. Use `cmd //c mklink` instead (the `//c` is Git Bash syntax for `/c`).

```bash
# 1. Install Superpower-ECC
git clone https://github.com/obra/superpower-ecc.git ~/.config/opencode/sp-ecc

# 2. Create directories
mkdir -p ~/.config/opencode/plugins ~/.config/opencode/skills

# 3. Remove existing links (safe for reinstalls)
rm -f ~/.config/opencode/plugins/sp-ecc.js 2>/dev/null
rm -rf ~/.config/opencode/skills/sp-ecc 2>/dev/null

# 4. Create plugin symlink (requires Developer Mode or Admin)
cmd //c "mklink \"$(cygpath -w ~/.config/opencode/plugins/sp-ecc.js)\" \"$(cygpath -w ~/.config/opencode/sp-ecc/.opencode/plugins/sp-ecc.js)\""

# 5. Create skills junction (works without special privileges)
cmd //c "mklink /J \"$(cygpath -w ~/.config/opencode/skills/sp-ecc)\" \"$(cygpath -w ~/.config/opencode/sp-ecc/skills)\""

# 6. Restart OpenCode
```

#### WSL Users

If running OpenCode inside WSL, use the [macOS / Linux](#macos--linux) instructions instead.

#### Verify Installation

**Command Prompt:**
```cmd
dir /AL "%USERPROFILE%\.config\opencode\plugins"
dir /AL "%USERPROFILE%\.config\opencode\skills"
```

**PowerShell:**
```powershell
Get-ChildItem "$env:USERPROFILE\.config\opencode\plugins" | Where-Object { $_.LinkType }
Get-ChildItem "$env:USERPROFILE\.config\opencode\skills" | Where-Object { $_.LinkType }
```

Look for `<SYMLINK>` or `<JUNCTION>` in the output.

#### Troubleshooting Windows

**"You do not have sufficient privilege" error:**
- Enable Developer Mode in Windows Settings, OR
- Right-click your terminal → "Run as Administrator"

**"Cannot create a file when that file already exists":**
- Run the removal commands (step 3) first, then retry

**Symlinks not working after git clone:**
- Run `git config --global core.symlinks true` and re-clone

## Usage

### Finding Skills

Use OpenCode's native `skill` tool to list all available skills:

```
use skill tool to list skills
```

### Loading a Skill

Use OpenCode's native `skill` tool to load a specific skill:

```
use skill tool to load sp-ecc/brainstorming
```

### Personal Skills

Create your own skills in `~/.config/opencode/skills/`:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

Create `~/.config/opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

### Project Skills

Create project-specific skills in your OpenCode project:

```bash
# In your OpenCode project
mkdir -p .opencode/skills/my-project-skill
```

Create `.opencode/skills/my-project-skill/SKILL.md`:

```markdown
---
name: my-project-skill
description: Use when [condition] - [what it does]
---

# My Project Skill

[Your skill content here]
```

## Skill Locations

OpenCode discovers skills from these locations:

1. **Project skills** (`.opencode/skills/`) - Highest priority
2. **Personal skills** (`~/.config/opencode/skills/`)
3. **Superpower-ECC skills** (`~/.config/opencode/skills/sp-ecc/`) - via symlink

## Features

### Automatic Context Injection

The plugin automatically injects sp-ecc context via the `experimental.chat.system.transform` hook. This adds the "using-sp-ecc" skill content to the system prompt on every request.

### Native Skills Integration

Superpower-ECC uses OpenCode's native `skill` tool for skill discovery and loading. Skills are symlinked into `~/.config/opencode/skills/sp-ecc/` so they appear alongside your personal and project skills.

### Tool Mapping

Skills written for Claude Code are automatically adapted for OpenCode. The bootstrap provides mapping instructions:

- `TodoWrite` → `update_plan`
- `Task` with subagents → OpenCode's `@mention` system
- `Skill` tool → OpenCode's native `skill` tool
- File operations → Native OpenCode tools

## Architecture

### Plugin Structure

**Location:** `~/.config/opencode/sp-ecc/.opencode/plugins/sp-ecc.js`

**Components:**
- `experimental.chat.system.transform` hook for bootstrap injection
- Reads and injects the "using-sp-ecc" skill content

### Skills

**Location:** `~/.config/opencode/skills/sp-ecc/` (symlink to `~/.config/opencode/sp-ecc/skills/`)

Skills are discovered by OpenCode's native skill system. Each skill has a `SKILL.md` file with YAML frontmatter.

## Updating

```bash
cd ~/.config/opencode/sp-ecc
git pull
```

Restart OpenCode to load the updates.

## Troubleshooting

### Plugin not loading

1. Check plugin exists: `ls ~/.config/opencode/sp-ecc/.opencode/plugins/sp-ecc.js`
2. Check symlink/junction: `ls -l ~/.config/opencode/plugins/` (macOS/Linux) or `dir /AL %USERPROFILE%\.config\opencode\plugins` (Windows)
3. Check OpenCode logs: `opencode run "test" --print-logs --log-level DEBUG`
4. Look for plugin loading message in logs

### Skills not found

1. Verify skills symlink: `ls -l ~/.config/opencode/skills/sp-ecc` (should point to sp-ecc/skills/)
2. Use OpenCode's `skill` tool to list available skills
3. Check skill structure: each skill needs a `SKILL.md` file with valid frontmatter

### Windows: Module not found error

If you see `Cannot find module` errors on Windows:
- **Cause:** Git Bash `ln -sf` copies files instead of creating symlinks
- **Fix:** Use `mklink /J` directory junctions instead (see Windows installation steps)

### Bootstrap not appearing

1. Verify using-sp-ecc skill exists: `ls ~/.config/opencode/sp-ecc/skills/using-sp-ecc/SKILL.md`
2. Check OpenCode version supports `experimental.chat.system.transform` hook
3. Restart OpenCode after plugin changes

## Getting Help

- Report issues: https://github.com/obra/superpower-ecc/issues
- Main documentation: https://github.com/obra/superpower-ecc
- OpenCode docs: https://opencode.ai/docs/

## Testing

Verify your installation:

```bash
# Check plugin loads
opencode run --print-logs "hello" 2>&1 | grep -i sp-ecc

# Check skills are discoverable
opencode run "use skill tool to list all skills" 2>&1 | grep -i sp-ecc

# Check bootstrap injection
opencode run "what skills do you have?"
```

The agent should mention having sp-ecc skills and be able to list skills from `sp-ecc/`.
