# ADR-001 : Architecture — FastAPI comme passerelle vers xobeez CLI/SQLite

**Statut** : Accepté  
**Date** : 2026-11-20  
**Contexte** : Le backend xobeez est une application CLI Python (`xobeez/dist/bin/xobeez`) utilisant SQLite comme ledger, sans interface HTTP native. Le dashboard React a besoin d'y accéder via HTTP/WebSocket.

## Décision

On déploie un serveur **FastAPI** (`xobeez-api/main.py`) qui expose des endpoints REST et WebSocket pour l'ensemble du dashboard React. Ce serveur ne contient aucune logique métier — il se contente de :
1. Lire le registry JSON (`registry/xobeez_agent_registry_v1.json`)
2. Exécuter des commandes xobeez CLI via `subprocess`
3. Interroger la base SQLite (`ledger/xobeez.db`)

Les données restent accessibles directement dans le système de fichiers, ce qui préserve la compatibilité avec les outils existants.

### Choix techniques

| Aspect | Choix | Justification |
|--------|-------|---------------|
| Framework API | FastAPI | Async natif, typage Pydantic, WebSockets intégrés |
| Sérialisation | Pydantic BaseModel | Validation automatique, schémas OpenAPI |
| Connexion DB | sqlite3 brut + row_factory | Pas de besoin d'ORM ; requêtes ponctuelles simples |
| Accès filesystem | Pathlib (Python 3.9+) | Chemins relatifs propres aux environnements containerisés |
| Authentification | Clé API via header `X-API-Key` | Simple, pas de session ni token, suffisant pour usage local |
| WebSocket | FastAPI原生 ws | Endpoints `/ws/overview` (5s) et `/ws/alerts` (3s) |

### Pourquoi pas autre chose ?

- **Next.js API routes** : incompatibles avec SQLite direct sur Windows/local dev
- **Flask/FastAPI seul sans wrapper** : xobeez CLI impose un appel subprocess systématique
- **Base de données externe** (PostgreSQL) : trop lourd pour un déploiement solo/local ; SQLite suffit
- **Authentication JWT/OIDC** : surprotégée pour un dashboard interne localhost

## Conséquences

### Positives
- Zéro dépendance externe ajoutée au runtime xobeez
- Dashboard peut tourner en local sans serveur cloud
- WebSocket live updates fonctionnent sans polling
- Schema OpenAPI auto-généré par FastAPI → docs Swagger à `/docs`

### Négatives / Risques
- Un process supplémentaire à lancer (FastAPI sur port 8003)
- La clé API par défaut doit être changée en production
- Subprocess sync bloque le thread — acceptable car xobeez CLI répond rapidement

## État actuel
Le projet fonctionne avec cette architecture depuis sa création. Aucune refonte prévue tant que le volume d'agents reste sous ~30.
