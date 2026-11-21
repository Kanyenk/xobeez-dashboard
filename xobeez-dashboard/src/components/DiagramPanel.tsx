import { useState, useEffect } from 'react';

export default function DiagramPanel() {
  const [diagram, setDiagram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8003/diagram', {
      headers: {
        'X-API-Key': 'secret-key-123456'
      }
    })
      .then(res => res.json())
      .then(data => {
        setDiagram(data);
        setLoading(false);
      })
      .catch(err => console.error('Error loading diagram:', err));
  }, []);

  if (loading) {
    return <div className="bg-gray-800 rounded-lg p-6 shadow-lg">Loading diagram...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Agent Mapping</h2>

      <div className="space-y-4">
        {diagram.diagram.routes.map((route: string, idx: number) => (
          <div key={idx} className="bg-gray-700 rounded p-4">
            <div className="font-bold text-blue-400">Route {idx + 1}</div>
            <div className="text-sm text-gray-300">
              {diagram.diagram.roster_ids.map((rosterId: string, rosterIdx: number) => (
                <span key={rosterIdx}>
                  {rosterId}
                  {rosterIdx < diagram.diagram.roster_ids.length - 1 && ' → '}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-900 rounded p-4">
        <div className="font-bold text-blue-200">Active Routes</div>
        <p className="text-sm text-blue-300 mt-2">
          {diagram.diagram.routes} out of {diagram.diagram.routes} routes are currently active
        </p>
      </div>
    </div>
  );
}
