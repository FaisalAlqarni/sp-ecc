# Performance Optimization

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
