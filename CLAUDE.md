# Xobeez Dashboard — Project Guidelines

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues in `Kanyenk/xobeez-dashboard`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `GLOSSARY.md` + `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.

---

## Project structure

```
/
├── xobeez/                # Xobeez CLI core (Python)
├── xobeez-api/            # FastAPI wrapper (port 8003)
├── xobeez-dashboard/      # React/TypeScript/Vite dashboard (port 5174)
├── skills/                # Matt Pocock engineering skills (installed locally)
├── .agents/               # Skill invocation rules & installation guides
└── docker-compose.yml     # Orchestrates api + web services
```

## Key commands

| Command | Description |
|---------|-------------|
| `cd xobeez-api && python main.py` | Start FastAPI server (port 8003) |
| `cd xobeez-dashboard && npm run dev` | Start Vite dev server (port 5174) |
| `docker-compose up` | Run both services via Docker |
| `/setup-matt-pocock-skills` | Re-run skill configuration |
| `/tdd` | Test-driven development loop |
| `/code-review` | Two-axis review (Standards + Spec) |

## Auth setup

The FastAPI backend requires an `X-API-Key` header on every request:

```bash
export XOBEEZ_API_KEY="your-secret-key-here"
# or set in docker-compose.yml environment section
```

Dashboard client auto-sends the key from `.env.local`:
```
VITE_API_KEY=your-secret-key-here
```
