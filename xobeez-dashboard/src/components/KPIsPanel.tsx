import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function KPIsPanel({ kpis }: { kpis: KPI | null }) {
  if (!kpis) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">KPIs</h2>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const data = [
    { name: 'Total', value: kpis.profiles_total },
    { name: 'Deployed', value: kpis.xo_deployed },
    { name: 'Active', value: kpis.active },
    { name: 'Deferred', value: kpis.deferred },
    { name: 'Disabled', value: kpis.disabled },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">KPIs</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded p-4">
          <div className="text-3xl font-bold text-blue-400">{kpis.agents_deployes}</div>
          <div className="text-sm text-gray-400">Deployed</div>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <div className="text-3xl font-bold text-green-400">{kpis.agents_actifs}</div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <div className="text-3xl font-bold text-yellow-400">{kpis.agents_differes}</div>
          <div className="text-sm text-gray-400">Deferred</div>
        </div>
        <div className="bg-gray-700 rounded p-4">
          <div className="text-3xl font-bold text-red-400">{kpis.disabled}</div>
          <div className="text-sm text-gray-400">Disabled</div>
        </div>
      </div>

      <div className="bg-gray-700 rounded p-4">
        <h3 className="font-bold mb-4">Deployment Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
