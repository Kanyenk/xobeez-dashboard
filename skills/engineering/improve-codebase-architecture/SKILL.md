---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones.

## Process

### 1. Explore
Walk the codebase organically. Note where you experience friction: shallow modules, leaks across seams, untested parts. Apply the deletion test: would deleting it concentrate complexity?

### 2. Present candidates as an HTML report
Write a self-contained HTML file to the OS temp directory using Tailwind via CDN and Mermaid via CDN for diagrams. Open it for the user and tell them the absolute path.

For each candidate render a card with: Files involved, Problem, Solution, Benefits, Before/After diagram, Recommendation strength.

### 3. Grilling loop
Once the user picks a candidate, call the Skill tool with "grilling" to walk the decision tree with them. Call the Skill tool with "domain-modeling" to keep the domain model current as you go.
