# 🛠️ Livrable : Guide des Skills mattpocock/skills

> [!info] À propos
> Ce projet installe et utilise les compétences (*skills*) de **Matt Pocock**, conçues pour le "Real Engineering" — coder avec discipline, alignement et feedback rapide. Ces skills ne sont pas des plugins magiques : ce sont des **checklists structurées** que l'agent suit étape par étape.

---

## 🏗️ Architecture du système

### Structure sur disque

```
/projet/
├── .agents/                    ← Règles fondamentales (non-actionnables)
│   ├── invocation.md           ← Comment les skills s'appellent entre eux
│   └── install-block.md        ← Instructions d'installation canoniques
├── skills/                     ← Compétences actionnables
│   ├── engineering/            ← 5+ skills pour l'ingénierie logicielle
│   └── productivity/           ← 3+ skills pour la productivité
├── GLOSSARY.md                 ← Vocabulaire de domaine partagé
├── docs/adr/                   ← Architectural Decision Records
├── docs/agents/                ← Configuration du tracker d'issues
├── CLAUDE.md                   ← Guidelines du projet
└── xobeez-api/                 ← FastAPI backend (port 8003)
    └── xobeez-dashboard/       ← React/Vite frontend (port 5174)
```

### Classification : User-invoked vs Model-invoked

| Type | Qui peut invoquer | Exemple | Usage |
|------|-------------------|---------|-------|
| **User-invoked** | Uniquement l'humain | `/grill-me`, `/tdd` | Orchestrer une séquence de travail |
| **Model-invoked** | L'IA elle-même | `diagnosing-bugs`, `code-review` | Détectée automatiquement quand la tâche correspond |

> [!warning] Règle fondamentale
> Un skill user-invoked **ne peut jamais invoquer un autre skill user-invoked**. Il peut seulement appeler des model-invoked. C'est une invariant architecturale.

---

## 🧰 Skills d'Ingénierie disponibles

| Skill | Invocation | Rôle clé |
|-------|------------|----------|
| [[tdd]] | model | Cycle Red→Green→Refactor discipliné |
| [[code-review]] | model | Revue à deux axes : Standards + Spec |
| [[diagnosing-bugs]] | model | Boucle de diagnostic rigoureuse en 6 phases |
| [[domain-modeling]] | model | Construire la GLOSSARY.md et les ADRs |
| [[improve-codebase-architecture]] | user | Scan architectural + rapport HTML interactif |
| [[grill-with-docs]] | user | Interview serré + documentation intégrée |
| [[setup-matt-pocock-skills]] | user | Configurer le tracker d'issues, labels, structure docs |

## ⚡ Skills de Productivité disponibles

| Skill | Invocation | Rôle clé |
|-------|------------|----------|
| [[grill-me]] | user | Interview rigoureux sur un plan avant de coder |
| [[handoff]] | user | Compactage de session pour transmission à un autre agent |

---

## 📖 Documentations internes (`.agents/`)

| Fichier | Contenu |
|---------|---------|
| [[.agents/invocation]] | Comment les skills s'invoquent entre eux (règles strictes) |
| [[.agents/install-block]] | Instructions canoniques d'installation par agent |

---

## 🚀 Procédure de démarrage

> [!tip] Première commande à exécuter
> ```
> /setup-matt-pocock-skills
> ```
> Cela configure votre traqueur d'issues, vos labels de triage, et la structure des docs (`GLOSSARY.md`, `docs/adr/`).

### Ordre recommandé des opérations

1. **Setup** → `/setup-matt-pocock-skills`
2. **Alignement** → `/grill-me` ou `/grill-with-docs` avant tout gros travail
3. **Construction** → `/tdd` pour les features, `/implement` pour les specs complètes
4. **Vérification** → `/code-review` sur les branches prêtes
5. **Architecture** → `/improve-codebase-architecture` toutes les quelques sessions
6. **Transmission** → `/handoff` si vous devez changer d'agent

---

## 🔗 Liens croisés

- Voir aussi : [[tdd]], [[code-review]], [[diagnosing-bugs]], [[domain-modeling]], [[grill-me]], [[handoff]]
- Glossaire projet : voir [[domain-modeling]]
- ADRs existants : `docs/adr/`

---

*Généré le 20 novembre 2026 pour le projet Xobeez Dashboard.*
