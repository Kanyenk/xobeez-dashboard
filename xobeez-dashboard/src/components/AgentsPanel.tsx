import { useState } from 'react';

interface AgentStatus {
  status: string;
  active_agents: Array<{ roster: string; profile: string; department: string; wave: string; role: string }>;
  deferred_agents: Array<{ roster: string; profile: string }>;
  total_agents: number;
}

export default function AgentsPanel({ agents }: { agents: AgentStatus }) {
  const [activeOnly, setActiveOnly] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Agents Status</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveOnly(true)}
            className={`px-3 py-1 rounded ${activeOnly ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Active Only
          </button>
          <button
            onClick={() => setActiveOnly(false)}
            className={`px-3 py-1 rounded ${!activeOnly ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {agents.active_agents.map((agent, idx) => (
          <div key={idx} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between">
              <span className="font-bold">{agent.profile}</span>
              <span className="text-sm text-gray-400">Roster {agent.roster}</span>
            </div>
            <div className="text-sm text-gray-300">
              {agent.department} • Wave {agent.wave} • {agent.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
