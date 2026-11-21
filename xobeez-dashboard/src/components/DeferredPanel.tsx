import { useState } from 'react';
import { Button } from './ui';

interface AgentStatus {
  status: string;
  active_agents: Array<{ roster: string; profile: string; department: string; wave: string; role: string }>;
  deferred_agents: Array<{ roster: string; profile: string }>;
  total_agents: number;
}

interface DeferredPanelProps {
  agents: AgentStatus | null;
  onActivate: (profile: string) => Promise<void>;
  onAgentClick: (profile: string) => void;
}

export default function DeferredPanel({ agents, onActivate, onAgentClick }: DeferredPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const deferredToShow = agents 
    ? (showAll ? agents.deferred_agents : agents.deferred_agents.slice(0, 5)) 
    : [];

  const handleActivate = async (profile: string) => {
    setActivating(profile);
    try {
      await onActivate(profile);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Deferred Agents</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
        >
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="space-y-2">
        {deferredToShow.map((agent, idx) => (
          <div 
            key={idx} 
            className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-650 border-l-4 border-yellow-500"
            onClick={() => onAgentClick(agent.profile)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold truncate">{agent.profile}</span>
                  <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">Deferred</span>
                </div>
                <div className="text-xs text-gray-500">Roster {agent.roster}</div>
              </div>
              
              <Button
                variant="primary"
                size="sm"
                loading={activating === agent.profile}
                onClick={(e) => { e.stopPropagation(); handleActivate(agent.profile); }}
                title="Activate agent"
              >
                Activate
              </Button>
            </div>
          </div>
        ))}
        
        {agents && agents.deferred_agents.length > 5 && !showAll && (
          <p className="text-sm text-gray-400 mt-4">
            {agents.deferred_agents.length - 5} more agents hidden
          </p>
        )}
      </div>
    </div>
  );
}