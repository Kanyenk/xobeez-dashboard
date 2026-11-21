import { useState, useEffect } from 'react';
import AgentsPanel from './AgentsPanel';
import AlertsPanel from './AlertsPanel';
import KPIsPanel from './KPIsPanel';
import DeferredPanel from './DeferredPanel';
import DiagramPanel from './DiagramPanel';

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

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentStatus | null>(null);
  const [kpis, setKPIs] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load agents status
    fetch('http://localhost:8003/agents/status', {
      headers: {
        'X-API-Key': 'secret-key-123456'
      }
    })
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        setLoading(false);
      })
      .catch(err => console.error('Error loading agents:', err));

    // Load KPIs
    fetch('http://localhost:8003/kpis', {
      headers: {
        'X-API-Key': 'secret-key-123456'
      }
    })
      .then(res => res.json())
      .then(data => {
        setKPIs(data.kpis);
        setLoading(false);
      })
      .catch(err => console.error('Error loading KPIs:', err));
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Xobeez Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentsPanel agents={agents} />
        <AlertsPanel />
        <KPIsPanel kpis={kpis} />
        <DeferredPanel agents={agents} />
        <DiagramPanel />
      </div>
    </div>
  );
}
