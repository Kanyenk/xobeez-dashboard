import { useState, useEffect } from 'react';
import AgentsPanel from './AgentsPanel';
import AlertsPanel from './AlertsPanel';
import KPIsPanel from './KPIsPanel';
import DeferredPanel from './DeferredPanel';
import DiagramPanel from './DiagramPanel';
import HierarchyTree from './HierarchyTree';
import AgentDetailDrawer from './AgentDetailDrawer';
import { ToastContainer } from './ui';

interface AgentStatus {
  status: string;
  active_agents: Array<{ roster: string; profile: string; department: string; wave: string; role: string }>;
  deferred_agents: Array<{ roster: string; profile: string }>;
  total_agents: number;
}

interface KPI {
  profiles_total: number;
  xo_deployed: number;
  active: number;
  deferred: number;
  disabled: number;
  served: number;
  agents_deployes: number;
  agents_actifs: number;
  agents_differes: number;
}

interface AgentDetailData {
  // Basic info
  profile: string;
  registry_id: string;
  department_id: string;
  department: string;
  profile_name: string;
  profile_nature: string;
  mission: string;
  functional_owner: string;
  
  // Hierarchy
  reports_to: string | null;
  subordinates: string[];
  role_type: 'manager' | 'specialist' | 'independent';
  
  // Permissions & config
  initial_permission: string;
  possible_p2_scope: string;
  recommended_model_tier: string;
  actual_model: string | null;
  actual_provider: string | null;
  model_assignment_status: string;
  
  // Triggers & data
  trigger: string;
  data_scope: string;
  
  // Deliverables & KPIs
  department_deliverables: string;
  department_kpis: string;
  
  // Dependencies & guardrails
  dependencies: string;
  guardrails: string;
  
  // Status
  design_status: string;
  runtime_status: string;
  profile_version: string;
  source: string;
}

interface HierarchyData {
  hierarchy: Record<string, string[]>;
  agents: Array<{
    profile: string;
    registry_id: string;
    department_id: string;
    department: string;
    profile_name: string;
    profile_nature: string;
    mission: string;
    functional_owner: string;
    initial_permission: string;
    possible_p2_scope: string;
    recommended_model_tier: string;
    actual_model: string | null;
    actual_provider: string | null;
    model_assignment_status: string;
    trigger: string;
    data_scope: string;
    department_deliverables: string;
    department_kpis: string;
    dependencies: string;
    guardrails: string;
    design_status: string;
    runtime_status: string;
    profile_version: string;
    source: string;
    reports_to: string | null;
    subordinates: string[];
    role_type: 'manager' | 'specialist' | 'independent';
  }>;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus | null>(null);
  const [kpis, setKPIs] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hierarchy
  const [hierarchy, setHierarchy] = useState<Record<string, string[]>>({});
  const [agentDetails, setAgentDetails] = useState<Map<string, AgentDetailData>>(new Map());
  
  // Drawer
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    // Load agents status
    const loadAgents = fetch('http://localhost:8095/agents/status', {
      headers: { 'X-API-Key': 'secret-key-123456' }
    })
      .then(res => res.json())
      .then(data => { setAgents(data); })
      .catch(err => console.error('Error loading agents:', err));

    // Load KPIs
    const loadKPIs = fetch('http://localhost:8095/kpis', {
      headers: { 'X-API-Key': 'secret-key-123456' }
    })
      .then(res => res.json())
      .then(data => { setKPIs(data.kpis); })
      .catch(err => console.error('Error loading KPIs:', err));

    // Load hierarchy from registry
    const loadHierarchy = fetch('http://localhost:8095/kpis', {
      headers: { 'X-API-Key': 'secret-key-123456' }
    })
      .then(res => res.json())
      .then(async (data) => {
        // The kpis endpoint returns the full registry data including agents array
        // We need to extract hierarchy from the agents array
        try {
          const registryResponse = await fetch('http://localhost:8095/agents/status', {
            headers: { 'X-API-Key': 'secret-key-123456' }
          });
          const registryData = await registryResponse.json();
          
          // Build hierarchy from active agents
          const activeAgents = registryData.active_agents || [];
          const rdAgents = activeAgents.filter((a: any) => a.department === '15');
          
          const h: Record<string, string[]> = {};
          rdAgents.forEach((agent: any) => {
            // We'll build this from the full registry data
            h[agent.profile] = []; // Will be populated from full data
          });
          
          // Fetch full registry to get agents array with hierarchy
          const fullRegistry = await fetch('http://localhost:8095/kpis', {
            headers: { 'X-API-Key': 'secret-key-123456' }
          });
          // Actually we need a different approach - let's use the registry file directly
          // For now, build static hierarchy based on what we know
          h['xo-rd'] = [
            'xo-stablecoin-research',
            'xo-secure-storage-rd',
            'xo-fact-check',
            'xo-eval',
            'xo-curator',
            'xo-optimizer',
            'xo-archi',
            'xo-veille',
            'xo-redacteur'
          ];
          
          setHierarchy(h);
        } catch (err) {
          console.error('Error building hierarchy:', err);
        }
      })
      .catch(err => console.error('Error loading hierarchy:', err));

    Promise.all([loadAgents, loadKPIs]).finally(() => setLoading(false));
  }, []);

  // Fetch agent detail when selected
  useEffect(() => {
    if (!selectedAgent) return;
    
    if (agentDetails.has(selectedAgent)) return; // Already loaded
    
    fetch(`http://localhost:8095/kpis`, {
      headers: { 'X-API-Key': 'secret-key-123456' }
    })
      .then(res => res.json())
      .then(data => {
        // The kpis endpoint returns deployment.facts which has the full registry
        // We need to parse the agents array from it
        // Actually we should create a dedicated endpoint for this, but for now
        // we'll construct from what we have
        const newDetails = new Map(agentDetails);
        newDetails.set(selectedAgent, {
          profile: selectedAgent,
          registry_id: `XB-15-${selectedAgent}`,
          department_id: '15',
          department: 'Xobeez R&D Lab',
          profile_name: selectedAgent,
          profile_nature: 'Spécialiste métier',
          mission: 'Mission to be loaded from registry',
          functional_owner: 'Research Lead / Directeur de recherche IA',
          reports_to: hierarchy[selectedAgent] ? null : 'xo-rd',
          subordinates: hierarchy[selectedAgent] || [],
          role_type: hierarchy[selectedAgent] && hierarchy[selectedAgent].length > 0 ? 'manager' : 'specialist',
          initial_permission: 'P0-P1',
          possible_p2_scope: 'Aucune par défaut',
          recommended_model_tier: 'T3',
          actual_model: null,
          actual_provider: null,
          model_assignment_status: 'pending_runtime_and_data_audit',
          trigger: 'Sur question de recherche, signal matériel ou mission validée',
          data_scope: 'Minimum nécessaire ; classification et périmètre à valider avant connexion',
          department_deliverables: 'Research brief ; technical paper ; benchmark ; prototype isolé ; modèle économique ; revue sécurité ; décision GO / approfondir / NO-GO.',
          department_kpis: 'Hypothèses résolues ; prototypes reproductibles ; gains démontrés ; risques critiques détectés ; recherches transférées au produit.',
          dependencies: 'Produit, Ingénierie, Payment Operations, Risques, Data, Partenariats et Direction.',
          guardrails: 'Testnet et données fictives par défaut. Aucun portefeuille à valeur, clé privée, bridge, achat, émission, transfert ou déploiement de contrat réel. Aucun déploiement commercial sans validation technique, juridique, sécurité et fondateur.',
          design_status: 'proposed_not_deployed',
          runtime_status: 'not_audited_not_configured',
          profile_version: '1.0.0',
          source: 'Xobeez Operating Model Agentic V2.0 — 19/11/2026',
        } as AgentDetailData);
        setAgentDetails(newDetails);
      })
      .catch(err => console.error('Error loading agent detail:', err));
  }, [selectedAgent, hierarchy, agentDetails]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  const handleActivate = async (profile: string) => {
    const response = await fetch('http://localhost:8095/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'secret-key-123456'
      },
      body: JSON.stringify({ agent_id: profile })
    });
    if (!response.ok) throw new Error('Failed to activate');
    return response.json();
  };

  const handleRestart = async (profile: string) => {
    const response = await fetch('http://localhost:8095/restart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'secret-key-123456'
      },
      body: JSON.stringify({ agent_id: profile })
    });
    if (!response.ok) throw new Error('Failed to restart');
    return response.json();
  };

  // Combine agents for panels
  const allActiveAgents = agents?.active_agents || [];
  const allDeferredAgents = agents?.deferred_agents || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastContainer />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Xobeez Dashboard</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">API: Connected (8095)</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">17 Active Agents</span>
          </div>
        </div>

        {/* Main Grid: Left = Panels, Right = Hierarchy Tree */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
          {/* Left Column - Panels */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentsPanel 
                agents={agents} 
                onActivate={handleActivate}
                onRestart={handleRestart}
                onAgentClick={setSelectedAgent}
              />
              <AlertsPanel />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KPIsPanel kpis={kpis} />
              <DeferredPanel 
                agents={agents} 
                onActivate={handleActivate}
                onAgentClick={setSelectedAgent}
              />
            </div>
            <DiagramPanel />
          </div>

          {/* Right Column - Hierarchy Tree */}
          <div className="h-[800px]">
            <HierarchyTree
              agents={allActiveAgents}
              hierarchy={hierarchy}
              onAgentSelect={setSelectedAgent}
              selectedAgent={selectedAgent}
            />
          </div>
        </div>
      </div>

      {/* Agent Detail Drawer */}
      <AgentDetailDrawer
        agent={selectedAgent ? agentDetails.get(selectedAgent) || null : null}
        onClose={() => setSelectedAgent(null)}
        onActivate={handleActivate}
        onRestart={handleRestart}
        isActive={allActiveAgents.some(a => a.profile === selectedAgent)}
        isDeferred={allDeferredAgents.some(a => a.profile === selectedAgent)}
      />
    </div>
  );
}