---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
---

# Diagnosing Bugs

A discipline for hard bugs. Skip phases only when explicitly justified.

## Phase 1: Build a feedback loop
Create a tight pass/fail signal for the bug — a failing test, curl script, CLI invocation, or headless browser script. Without this loop, no amount of staring at code will save you.

## Phase 2: Reproduce + minimise
Run the loop until it goes red. Shrink the repro to the smallest scenario that still fails.

## Phase 3: Hypothesise
Generate 3–5 ranked hypotheses. Each must be falsifiable: state the prediction it makes. Show the ranked list to the user before testing.

## Phase 4: Instrument
Each probe maps to a specific prediction. Change one variable at a time. Tag every debug log with a unique prefix (e.g. `[DEBUG-a4f2]`).

## Phase 5: Fix + regression test
Write the regression test before the fix if there's a correct seam. Apply the fix. Re-run the Phase 1 loop against the original scenario.

## Phase 6: Cleanup
Remove all `[DEBUG-...]` instrumentation. Delete throwaway prototypes. State the winning hypothesis in the commit message.
