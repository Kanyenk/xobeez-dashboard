---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:
- **Issue tracker**: where issues live (GitHub by default; local markdown also supported)
- **Triage labels**: the strings used for the five canonical triage roles
- **Domain docs**: where GLOSSARY.md and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore
Look at the current repo: git remote, CLAUDE.md/AGENTS.md, GLOSSARY.md, docs/adr/, .scratch/, monorepo signals.

### 2. Present findings and ask
Lead each section with the recommended answer so the user can accept it in a word.
- **Section A: Issue tracker** — propose GitHub (if gh auth works), GitLab, or local markdown
- **Section B: Triage labels** — ask if default labels are ok (yes/no)
- **Section C: Domain docs** — single-context by default, multi-context only for monorepos

### 3. Confirm and edit
Show the user a draft of the ## Agent skills block and the docs/agents/*.md files before writing.

### 4. Write
Pick CLAUDE.md or AGENTS.md (edit whichever exists). Create docs/agents/issue-tracker.md, domain.md, and triage-labels.md.

### 5. Done
Tell the user the setup is complete and which engineering skills will now read from these files.
