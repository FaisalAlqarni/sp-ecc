# Performance Optimization

## Model Selection Strategy

**Haiku 4.5** (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems

**Sonnet 4.6** (Best coding model):
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus 4.6** (Deepest reasoning):
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Extended Thinking + Plan Mode

Extended thinking is enabled by default, reserving up to 31,999 tokens for internal reasoning.

Control extended thinking via:
- **Toggle**: Option+T (macOS) / Alt+T (Windows/Linux)
- **Config**: Set `alwaysThinkingEnabled` in `~/.claude/settings.json`
- **Budget cap**: `export MAX_THINKING_TOKENS=10000`
- **Verbose mode**: Ctrl+O to see thinking output

For complex tasks requiring deep reasoning:
1. Ensure extended thinking is enabled (on by default)
2. Enable **Plan Mode** for structured approach
3. Use multiple critique rounds for thorough analysis
4. Use split role sub-agents for diverse perspectives

## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix

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
