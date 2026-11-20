---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop.

When exploring the codebase, read `GLOSSARY.md` (if it exists) so test names match the project's domain language.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. A good test reads like a specification.

## Seams: where tests go

A **seam** is the public boundary you test at. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods
- **Tautological**: assertion recomputes the expected value the way the code does
- **Horizontal slicing**: writing all tests first, then all implementation

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage.
