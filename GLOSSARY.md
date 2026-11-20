# Glossaire du projet Xobeez Dashboard

Ce document définit le vocabulaire partagé du projet Xobeez Dashboard. Toutes les sorties de code, tickets, et discussions doivent utiliser ces termes — jamais leurs synonymes.

---

## Agents

### Agent
Un travailleur IA identifié par un **profile** (`xo-*`). Chaque agent effectue des tâches selon un rôle défini dans le registre.

### Profile
Répertoire de configuration d'un agent sous `xobeez/dist/profiles/<nom>`. Un profile actif correspond à un répertoire présent ; un profile différé se trouve dans `profiles-disabled/`.

### Coordinatrice / Chief of Staff
L'agent central (`xo-chief-of-staff`) qui orchestre le workflow **Brief** 8h30 et délègue aux autres agents. Représentée au centre du diagramme de réseau.

### Rôle
Fonction métier assignée à un agent (ex: « Direction », « Marketing », « Ingénierie »). Lié à un numéro de département.

### Statut d'agent
| Valeur | Signification |
|--------|---------------|
| `active` | Profile déployé et opérationnel |
| `deferred` | Profile en attente, non déployé |
| `disabled` | Profile legacy, désactivé |
| `pending` | Statut temporaire lors d'une activation |

---

## Organisation

### Département
Unité organisationnelle numérotée (`01`–`15`). Chaque département dispose d'un budget mensuel et d'un ou plusieurs agents.

| Code | Nom | Budget mensuel |
|------|-----|----------------|
| 01 | Direction | 25 € |
| 02 | Stratégie | 25 € |
| 04 | Commercial | 25 € |
| 05 | Partenariats | 25 € |
| 12 | Risques & Juridique | 25 € |
| 13 | Finance | 25 € |
| Autres | Non budgétés | 0 € |

### Budget
Plafond de dépense mensuel par département, exprimé en euros. Les seuils d'alerte sont : **50%**, **80%**, **100%**.

### Seuil d'alerte
Palier déclenchant une notification budget :
- **Alerte 50%** — consommation ≥ 50% du plafond
- **Alerte 80%** — consommation ≥ 80% du plafond
- **Alerte 100%** — dépassement du plafond

---

## Système technique

### Audit
Registre SQLite (`ledger/xobeez.db`) enregistrant chaque décision agent avec verdict (`ALLOW` / `DENY`), montant (niveau P2), timestamp et détail.

### Ledger
Synonyme de la base de données SQLite contenant les tables `audit`, `budgets`, `envelopes`.

### Envelope
Requête de tâche soumise par un agent, contenant un payload, une priorité et une date d'expiration (`expires_at`).

### Kill Switch
Mécanisme d'arrêt d'urgence. Un fichier `state/kill.json` avec `"engaged": true` déclenche l'arrêt de tous les agents.

### Brief
Workflow quotidien 8h30 orchestré par le **Chief of Staff** via crontab (`30 8 * * *` timezone Indian/Antananarivo). Produisant des tâches, livrables et actions.

### Cron Reglets
Tâches planifiées :
- **Brief** : 8h30 Indian/Antananarivo
- **Reset budget** : 00:05 UTC, 1er du mois

---

## Interactions dashboard

### Vue Overview
Tableau de bord principal affichant l'état global : budgets, next brief run, kill switch, alertes temps réel via WebSocket.

### Vue Alerts
Liste des alertes actives (budget, kill switch, task failed, envelope expiring) mises à jour en temps réel.

### Diagramme d'agents
Visualisation SVG en anneau : coordinatrice au centre, agents actifs en anneau interne, agents différés en anneau externe, agents legacy en bas.

### Activation / Redémarrage
- **Activer** : déplacer un profile de `profiles-disabled/` vers `profiles/` et mettre à jour le registre
- **Redémarrer** : exécuter la commande CLI xobeez `agent restart <profile>`

---

*Ce glossaire est alimenté dynamiquement par le skill `domain-modeling`. Modifiez-le quand un nouveau terme doit être formalisé.*
