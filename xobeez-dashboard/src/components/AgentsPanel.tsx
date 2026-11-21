import { useState } from 'react';
import { Button } from './ui';

interface AgentStatus {
  status: string;
  active_agents: Array<{ roster: string; profile: string; department: string; wave: string; role: string }>;
  deferred_agents: Array<{ roster: string; profile: string }>;
  total_agents: number;
}

interface AgentsPanelProps {
  agents: AgentStatus | null;
  onActivate: (profile: string) => Promise<void>;
  onRestart: (profile: string) => Promise<void>;
  onAgentClick: (profile: string) => void;
}

export default function AgentsPanel({ agents, onActivate, onRestart, onAgentClick }: AgentsPanelProps) {
  const [activeOnly, setActiveOnly] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [restarting, setRestarting] = useState<string | null>(null);

  const displayAgents = activeOnly 
    ? agents?.active_agents || []
    : [...(agents?.active_agents || []), ...(agents?.deferred_agents || [])];

  const handleActivate = async (profile: string) => {
    setActivating(profile);
    try {
      await onActivate(profile);
    } finally {
      setActivating(null);
    }
  };

  const handleRestart = async (profile: string) => {
    setRestarting(profile);
    try {
      await onRestart(profile);
    } finally {
      setRestarting(null);
    }
  };

  const isDeferred = (profile: string) => 
    agents?.deferred_agents.some(a => a.profile === profile) ?? false;

  const isActive = (profile: string) => 
    agents?.active_agents.some(a => a.profile === profile) ?? false;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Agents Status</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveOnly(true)}
            className={`px-3 py-1 rounded text-sm ${activeOnly ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Active Only
          </button>
          <button
            onClick={() => setActiveOnly(false)}
            className={`px-3 py-1 rounded text-sm ${!activeOnly ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {displayAgents.map((agent, idx) => (
          <div 
            key={idx} 
            className={`bg-gray-700 rounded p-3 cursor-pointer transition-colors ${
              isDeferred(agent.profile) ? 'border-l-4 border-yellow-500' : 'border-l-4 border-green-500'
            } hover:bg-gray-650`}
            onClick={() => onAgentClick(agent.profile)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold truncate">{agent.profile}</span>
                  {isDeferred(agent.profile) && (
                    <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">Deferred</span>
                  )}
                  {isActive(agent.profile) && (
                    <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Active</span>
                  )}
                </div>
                <div className="text-sm text-gray-300 truncate">
                  {agent.department} • Wave {agent.wave} • {agent.role}
                </div>
                <div className="text-xs text-gray-500 mt-1">Roster {agent.roster}</div>
              </div>
              
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {isDeferred(agent.profile) && (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={activating === agent.profile}
                    onClick={(e) => { e.stopPropagation(); handleActivate(agent.profile); }}
                    title="Activate agent"
                  >
                    Activate
                  </Button>
                )}
                {isActive(agent.profile) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={restarting === agent.profile}
                    onClick={(e) => { e.stopPropagation(); handleRestart(agent.profile); }}
                    title="Restart agent"
                  >
                    Restart
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {displayAgents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No agents to display
          </div>
        )}
      </div>
    </div>
  );
}