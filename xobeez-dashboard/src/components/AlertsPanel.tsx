export default function AlertsPanel() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Budget Alerts</h2>

      <div className="space-y-4">
        <div className="bg-gray-700 rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Alert Cron</span>
            <code className="bg-gray-600 px-2 py-1 rounded">*/15 * * * *</code>
          </div>
          <p className="text-sm text-gray-400">Every 15 minutes</p>
        </div>

        <div className="bg-gray-700 rounded p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Reset Cron</span>
            <code className="bg-gray-600 px-2 py-1 rounded">5 0 1 * *</code>
          </div>
          <p className="text-sm text-gray-400">First day at 00:05 UTC</p>
        </div>

        <div className="bg-blue-900 rounded p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-bold">Budget Monitoring Active</span>
          </div>
          <p className="text-sm text-blue-200 mt-2">
            50%, 80%, and 100% thresholds are logged locally
          </p>
        </div>
      </div>
    </div>
  );
}
