import { useState } from 'react';

interface AgentStatus {
  status: string;
  active_agents: Array<{ roster: string; profile: string; department: string; wave: string; role: string }>;
  deferred_agents: Array<{ roster: string; profile: string }>;
  total_agents: number;
}

export default function DeferredPanel({ agents }: { agents: AgentStatus }) {
  const [showAll, setShowAll] = useState(false);

  const deferredToShow = showAll ? agents.deferred_agents : agents.deferred_agents.slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Deferred Agents</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
        >
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="space-y-2">
        {deferredToShow.map((agent, idx) => (
          <div key={idx} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between">
              <span className="font-bold">{agent.profile}</span>
              <span className="text-sm text-gray-400">Roster {agent.roster}</span>
            </div>
          </div>
        ))}
      </div>

      {agents.deferred_agents.length > 5 && !showAll && (
        <p className="text-sm text-gray-400 mt-4">
          {agents.deferred_agents.length - 5} more agents hidden
        </p>
      )}
    </div>
  );
}
