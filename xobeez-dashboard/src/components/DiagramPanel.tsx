import { useState, useEffect } from 'react';

export default function DiagramPanel() {
  const [diagram, setDiagram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8095/diagram', {
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

  if (!diagram || !diagram.diagram) {
    return <div className="bg-gray-800 rounded-lg p-6 shadow-lg">Failed to load diagram</div>;
  }

  const diagramData = diagram.diagram;
  const routeCount = diagramData.routes || 0;
  const rosterIds = diagramData.roster_ids || [];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Agent Mapping</h2>

      <div className="space-y-4">
        {rosterIds.map((rosterId: string, idx: number) => (
          <div key={idx} className="bg-gray-700 rounded p-4">
            <div className="font-bold text-blue-400">Route {idx + 1}</div>
            <div className="text-sm text-gray-300">{rosterId}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-900 rounded p-4">
        <div className="font-bold text-blue-200">Active Routes</div>
        <p className="text-sm text-blue-300 mt-2">
          {routeCount} routes active: {rosterIds.join(' → ')}
        </p>
      </div>
    </div>
  );
}
