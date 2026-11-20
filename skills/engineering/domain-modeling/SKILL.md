---
name: domain-modeling
description: Actively build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLOSSARY.md, or recording or editing an ADR.
---

# Domain Modeling

Actively build and sharpen the project's domain model. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallize.

## File structure
```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── ...
└── src/
```

## During the session
- Challenge terms against the existing glossary immediately
- Sharpen fuzzy language with precise canonical terms
- Stress-test domain relationships with concrete scenarios
- Cross-reference with code when users state how things work
- Update `GLOSSARY.md` inline as terms are resolved
- Offer ADRs sparingly: only when hard to reverse, surprising without context, and resulting from a real trade-off
