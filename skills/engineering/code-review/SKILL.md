---
name: code-review
description: Review changes since a fixed point along two axes: Standards and Spec. Runs both reviews in parallel sub-agents.
---

Two-axis review of the diff between HEAD and a fixed point:
- **Standards**: does the code conform to documented coding standards?
- **Spec**: does the code faithfully implement the originating issue/spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context.

## Process

### 1. Pin the fixed point
Capture the diff: `git diff <fixed-point>...HEAD`. Confirm it resolves and is non-empty.

### 2. Identify the spec source
Check commit messages for issue references, then look for spec files under `docs/` or `specs/`. If nothing found, ask the user.

### 3. Identify the standards sources
Search for `CODING_STANDARDS.md`, `CONTRIBUTING.md`, plus the Fowler smell baseline.

### 4. Spawn both sub-agents in parallel
Aggregate their findings into `## Standards` and `## Spec` sections. End with a one-line summary per axis.
