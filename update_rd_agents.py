import json
from pathlib import Path

registry_path = Path("xobeez/dist/registry/xobeez_agent_registry_v1.json")

with open(registry_path) as f:
    data = json.load(f)

# ============================================================
# R&D DEPARTMENT SETUP
# Department 15: Xobeez R&D Lab
# ============================================================

# New agents to add
new_agents = [
    "xo-stablecoin-research",
    "xo-secure-storage-rd"
]

# Add new agents to deployed_profiles if not already present
for agent in new_agents:
    if agent not in data['deployment']['deployed_profiles']:
        data['deployment']['deployed_profiles'].append(agent)

# ============================================================
# ACTIVE PROFILES - Move R&D agents to active with proper roster
# ============================================================

# R&D agents to activate (department 15, wave S5 - new wave for R&D)
rd_active_agents = [
    {"roster": "R22", "profile": "xo-rd", "department": "15", "wave": "S5", "role": "Research Lead / Directeur R&D (Généraliste)"},
    {"roster": "R23", "profile": "xo-stablecoin-research", "department": "15", "wave": "S5", "role": "Stablecoin Research Specialist"},
    {"roster": "R24", "profile": "xo-secure-storage-rd", "department": "15", "wave": "S5", "role": "Secure Storage Research Specialist"},
    {"roster": "R25", "profile": "xo-fact-check", "department": "15", "wave": "S5", "role": "Porte 1 - Fact-check Critique"},
    {"roster": "R26", "profile": "xo-eval", "department": "15", "wave": "S5", "role": "Porte 2 - Évaluation Critique"},
    {"roster": "R27", "profile": "xo-curator", "department": "15", "wave": "S5", "role": "Curateur Mémoire / Knowledge Base"},
    {"roster": "R28", "profile": "xo-optimizer", "department": "15", "wave": "S5", "role": "Optimiseur Code Quality"},
    {"roster": "R29", "profile": "xo-archi", "department": "15", "wave": "S5", "role": "Architecte Système"},
    {"roster": "R30", "profile": "xo-veille", "department": "15", "wave": "S5", "role": "Veille Technologique (Pipeline)"},
    {"roster": "R31", "profile": "xo-redacteur", "department": "15", "wave": "S5", "role": "Rédacteur Technique (Pipeline)"},
]

# Remove these from deferred_profiles if present
deferred_to_remove = ["xo-rd", "xo-fact-check"]
data['deployment']['deferred_profiles'] = [
    p for p in data['deployment']['deferred_profiles'] 
    if p['profile'] not in deferred_to_remove
]

# Remove from legacy_profiles if present
legacy_to_remove = ["xo-eval", "xo-fact-check", "xo-curator", "xo-optimizer", "xo-archi", "xo-veille", "xo-redacteur"]
data['deployment']['legacy_profiles'] = [
    p for p in data['deployment']['legacy_profiles'] 
    if p not in legacy_to_remove
]

# Add to active_profiles (avoid duplicates)
existing_active = {p['profile'] for p in data['deployment']['active_profiles']}
for agent in rd_active_agents:
    if agent['profile'] not in existing_active:
        data['deployment']['active_profiles'].append(agent)

# ============================================================
# AGENTS HIERARCHY - Define subordination relationships
# ============================================================

# Find existing agents in the agents list and update their hierarchy
# Structure: each agent can have 'reports_to' and 'subordinates' fields

# Hierarchy definition: parent -> [children]
hierarchy = {
    "xo-rd": [
        "xo-stablecoin-research",
        "xo-secure-storage-rd", 
        "xo-fact-check",
        "xo-eval",
        "xo-curator",
        "xo-optimizer",
        "xo-archi",
        "xo-veille",
        "xo-redacteur"
    ]
}

# Add hierarchy fields to agents
for agent in data['agents']:
    profile = agent.get('profile_name', '')
    
    # Initialize hierarchy fields
    if 'reports_to' not in agent:
        agent['reports_to'] = None
    if 'subordinates' not in agent:
        agent['subordinates'] = []
    if 'department_id' not in agent:
        agent['department_id'] = "15"
    if 'department' not in agent:
        agent['department'] = "Xobeez R&D Lab"
    
    # Set up hierarchy
    if profile in hierarchy:
        # This agent is a manager
        agent['subordinates'] = hierarchy[profile]
        agent['role_type'] = "manager"
    elif any(profile in subs for subs in hierarchy.values()):
        # This agent reports to someone
        for manager, subs in hierarchy.items():
            if profile in subs:
                agent['reports_to'] = manager
                agent['role_type'] = "specialist"
                break
    else:
        agent['role_type'] = "independent"

# Also add the new agents to the agents list if they don't exist
existing_agent_profiles = {a.get('profile_name', '') for a in data['agents']}

new_agent_definitions = [
    {
        "registry_id": f"XB-15-{profile}",
        "agent_id": profile.replace("xo-", ""),
        "department_id": "15",
        "department": "Xobeez R&D Lab",
        "profile_name": profile,
        "profile_nature": "Spécialiste métier" if profile != "xo-rd" else "Direction / responsable fonctionnel",
        "mission": {
            "xo-stablecoin-research": "Recherche sur les stablecoins, algorithmes de peg, réserves et conformité réglementaire.",
            "xo-secure-storage-rd": "Recherche sur le stockage sécurisé, chiffrement, HSM, MPC et gestion de clés.",
            "xo-fact-check": "Vérification critique des faits, sources, données avant publication (Porte 1).",
            "xo-eval": "Évaluation critique des modèles, benchmarks, métriques de performance (Porte 2).",
            "xo-curator": "Curation mémoire, knowledge base, déduplication, conservation sources et historique.",
            "xo-optimizer": "Optimisation code quality, performance, refactoring, dette technique.",
            "xo-archi": "Architecture système, design patterns, scalability, security by design.",
            "xo-veille": "Veille technologique, sourcing papers, tendances, signaux faibles (Pipeline entrée).",
            "xo-redacteur": "Rédaction technique, documentation, specs, rapports recherche (Pipeline sortie).",
            "xo-rd": "Direction R&D Lab, coordination recherche, arbitrage GO/NO-GO, transfert vers produit."
        }.get(profile, "Mission à définir"),
        "functional_owner": "Research Lead / Directeur de recherche IA",
        "initial_roster_refs": [next(a['roster'] for a in rd_active_agents if a['profile'] == profile)],
        "activation_stage": "Noyau mutualisé — compétence portée par un worker",
        "initial_permission": "P0-P1",
        "possible_p2_scope": "Aucune par défaut",
        "recommended_model_tier": "T3" if profile in ["xo-stablecoin-research", "xo-secure-storage-rd", "xo-fact-check", "xo-eval"] else "T2",
        "actual_model": None,
        "actual_provider": None,
        "model_assignment_status": "pending_runtime_and_data_audit",
        "trigger": "Sur question de recherche, signal matériel ou mission validée",
        "data_scope": "Minimum nécessaire ; classification et périmètre à valider avant connexion",
        "department_deliverables": "Research brief ; technical paper ; benchmark ; prototype isolé ; modèle économique ; revue sécurité ; décision GO / approfondir / NO-GO.",
        "department_kpis": "Hypothèses résolues ; prototypes reproductibles ; gains démontrés ; risques critiques détectés ; recherches transférées au produit.",
        "dependencies": "Produit, Ingénierie, Payment Operations, Risques, Data, Partenariats et Direction.",
        "guardrails": "Testnet et données fictives par défaut. Aucun portefeuille à valeur, clé privée, bridge, achat, émission, transfert ou déploiement de contrat réel. Aucun déploiement commercial sans validation technique, juridique, sécurité et fondateur.",
        "design_status": "proposed_not_deployed",
        "runtime_status": "not_audited_not_configured",
        "profile_version": "1.0.0",
        "source": "Xobeez Operating Model Agentic V2.0 — 19/11/2026"
    }
    for profile in new_agents
]

for agent_def in new_agent_definitions:
    if agent_def['profile_name'] not in existing_agent_profiles:
        data['agents'].append(agent_def)

# ============================================================
# UPDATE METADATA
# ============================================================
data['metadata']['registry_version'] = "1.1.0"
data['metadata']['created_date'] = "2026-11-21"
data['metadata']['status'] = f"deployed_{len(data['deployment']['deployed_profiles'])}_active_{len(data['deployment']['active_profiles'])}_deferred_{len(data['deployment']['deferred_profiles'])}"

# Update deployment status
data['deployment']['status'] = f"{len(data['deployment']['deployed_profiles'])}_deployed_{len(data['deployment']['active_profiles'])}_active_{len(data['deployment']['deferred_profiles'])}_deferred_{data['deployment'].get('disabled_count', 28)}_disabled"
data['deployment']['verified_at'] = "2026-11-21T12:00:00Z"

# Update facts
data['deployment']['facts']['profiles_total'] = len(data['deployment']['deployed_profiles']) + len(data['deployment']['legacy_profiles'])
data['deployment']['facts']['xo_deployed'] = len(data['deployment']['deployed_profiles'])
data['deployment']['facts']['active'] = len(data['deployment']['active_profiles'])
data['deployment']['facts']['deferred'] = len(data['deployment']['deferred_profiles'])
data['deployment']['facts']['legacy'] = len(data['deployment']['legacy_profiles'])
data['deployment']['facts']['disabled'] = data['deployment'].get('disabled_count', 28)
data['deployment']['facts']['served'] = len(data['deployment']['active_profiles']) + 1  # +1 for default

# Save
with open(registry_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("[OK] Registry updated successfully!")
print(f"Deployed: {len(data['deployment']['deployed_profiles'])}")
print(f"Active: {len(data['deployment']['active_profiles'])}")
print(f"Deferred: {len(data['deployment']['deferred_profiles'])}")
print(f"Legacy: {len(data['deployment']['legacy_profiles'])}")

# Print R&D active agents
print("\n=== R&D ACTIVE AGENTS ===")
for p in data['deployment']['active_profiles']:
    if p['department'] == '15':
        print(f"  {p['roster']}: {p['profile']} - {p['role']}")

# Print hierarchy
print("\n=== HIERARCHY ===")
for manager, subs in hierarchy.items():
    print(f"  {manager} → {', '.join(subs)}")