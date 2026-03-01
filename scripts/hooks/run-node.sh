#!/usr/bin/env bash
# Cross-platform Node.js wrapper for Claude Code hooks
# Finds and executes node in common installation locations

# Convert Windows paths to WSL paths if running in WSL
# Check if we're in WSL by looking for /proc/version with "Microsoft" or "WSL"
if grep -qi "microsoft\|wsl" /proc/version 2>/dev/null; then
    # Running in WSL - convert Windows drive letters (C:\, D:\) to WSL format (/mnt/c/, /mnt/d/)
    # This handles cases where Claude Code passes Windows paths to WSL bash
    args=()
    for arg in "$@"; do
        # Match Windows absolute paths like C:\... or C:/...
        if [[ "$arg" =~ ^([A-Za-z]):[\\/] ]]; then
            drive="${BASH_REMATCH[1]}"
            drive_lower=$(echo "$drive" | tr '[:upper:]' '[:lower:]')
            # Convert C:\path or C:/path to /mnt/c/path
            wsl_path=$(echo "$arg" | sed -E "s|^[A-Za-z]:[\\/]|/mnt/${drive_lower}/|" | sed 's|\\|/|g')
            args+=("$wsl_path")
        else
            args+=("$arg")
        fi
    done
    set -- "${args[@]}"
fi

# Try to find node in PATH first (works on Mac/Linux and properly configured Windows)
if command -v node >/dev/null 2>&1; then
    exec node "$@"
fi

# Check for MSYS/Git Bash environment
if [ -n "$MSYSTEM" ]; then
    # Running in MSYS2/Git Bash - adjust paths
    export PATH="/mingw64/bin:/usr/bin:$PATH"
fi

# Try common installation paths
NODE_PATHS=(
    "/usr/local/bin/node"           # Mac/Linux: Homebrew, manual install
    "/usr/bin/node"                 # Linux: apt/yum install
    "/opt/homebrew/bin/node"        # Mac: Apple Silicon Homebrew
    "$HOME/.nvm/versions/node/*/bin/node"  # nvm install (find latest)
    "$HOME/.fnm/node-versions/*/installation/bin/node"  # fnm install
    "$HOME/.volta/bin/node"         # Volta install
    "/c/Program Files/nodejs/node.exe"     # Windows: Git Bash path
    "C:/Program Files/nodejs/node.exe"     # Windows: native path
    "/mnt/c/Program Files/nodejs/node.exe" # WSL path
)

# Try each path
for node_path in "${NODE_PATHS[@]}"; do
    # Expand glob pattern for nvm
    for expanded_path in $node_path; do
        if [ -x "$expanded_path" ]; then
            exec "$expanded_path" "$@"
        fi
    done
done

# Node.js not found - provide helpful error
echo "[Hook Error] Node.js not found in PATH or common locations" >&2
echo "[Hook Error] " >&2
echo "[Hook Error] Hooks require Node.js to run. Please install Node.js:" >&2
echo "[Hook Error]   - Download: https://nodejs.org/ (LTS recommended)" >&2
echo "[Hook Error]   - Or use nvm: https://github.com/nvm-sh/nvm" >&2
echo "[Hook Error] " >&2
echo "[Hook Error] After installation:" >&2
echo "[Hook Error]   1. Restart your terminal/IDE" >&2
echo "[Hook Error]   2. Verify: node --version" >&2
echo "[Hook Error] " >&2
echo "[Hook Error] Hooks are optional - the plugin works without them" >&2
echo "[Hook Error] but you won't have git safety hooks and other features" >&2
exit 0
