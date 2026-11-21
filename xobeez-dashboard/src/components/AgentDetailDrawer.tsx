import React, { useEffect, useState } from 'react';
import { Button, Card } from './ui';
import { showToast } from './ui';

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
  
  // Budget (from deployment)
  budget_cap?: number;
  budget_spent?: number;
}

interface AgentDetailDrawerProps {
  agent: AgentDetailData | null;
  onClose: () => void;
  onActivate: (profile: string) => Promise<void>;
  onRestart: (profile: string) => Promise<void>;
  isActive: boolean;
  isDeferred: boolean;
}

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">{title}</h4>
    {children}
  </div>
);

const Field = ({ label, value }: { label: string; value: any }) => (
  <div className="mb-3">
    <label className="text-xs text-gray-500 block mb-1">{label}</label>
    <div className="text-sm text-white font-mono whitespace-pre-wrap">{formatValue(value)}</div>
  </div>
);

export default function AgentDetailDrawer({ agent, onClose, onActivate, onRestart, isActive, isDeferred }: AgentDetailDrawerProps) {
  const [activating, setActivating] = useState(false);
  const [restarting, setRestarting] = useState(false);

  if (!agent) return null;

  const handleActivate = async () => {
    setActivating(true);
    try {
      await onActivate(agent.profile);
      showToast.success(`Agent ${agent.profile} activated successfully`);
      onClose();
    } catch (error) {
      showToast.error(`Failed to activate: ${error}`);
    } finally {
      setActivating(false);
    }
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await onRestart(agent.profile);
      showToast.success(`Agent ${agent.profile} restarted`);
    } catch (error) {
      showToast.error(`Failed to restart: ${error}`);
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className="w-full max-w-3xl h-full bg-gray-900 border-l border-gray-700 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{agent.profile}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded ${
                agent.role_type === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                agent.role_type === 'specialist' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-600 text-gray-300'
              }`}>
                {agent.role_type === 'manager' ? '👑 Manager' : agent.role_type === 'specialist' ? '🔧 Specialist' : '🔍 Independent'}
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                {agent.department_id} • {agent.profile_version}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Identity */}
          <Section title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Registry ID" value={agent.registry_id} />
              <Field label="Profile Name" value={agent.profile_name} />
              <Field label="Profile Nature" value={agent.profile_nature} />
              <Field label="Functional Owner" value={agent.functional_owner} />
              <Field label="Department" value={`${agent.department_id} - ${agent.department}`} />
              <Field label="Source" value={agent.source} />
            </div>
          </Section>

          {/* Hierarchy */}
          <Section title="Hierarchy & Reporting">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role Type" value={agent.role_type} />
              <Field label="Reports To" value={agent.reports_to || 'None (Root)'} />
              <Field label="Subordinates" value={agent.subordinates.length > 0 ? agent.subordinates : 'None'} />
            </div>
          </Section>

          {/* Mission & Scope */}
          <Section title="Mission & Scope">
            <Field label="Mission" value={agent.mission} />
            <Field label="Trigger" value={agent.trigger} />
            <Field label="Data Scope" value={agent.data_scope} />
          </Section>

          {/* Permissions & Model */}
          <Section title="Permissions & Model">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Initial Permission" value={agent.initial_permission} />
              <Field label="Possible P2 Scope" value={agent.possible_p2_scope} />
              <Field label="Recommended Model Tier" value={agent.recommended_model_tier} />
              <Field label="Actual Model" value={agent.actual_model || 'Not assigned'} />
              <Field label="Actual Provider" value={agent.actual_provider || 'Not assigned'} />
              <Field label="Model Assignment Status" value={agent.model_assignment_status} />
            </div>
          </Section>

          {/* Deliverables & KPIs */}
          <Section title="Deliverables & KPIs">
            <Field label="Department Deliverables" value={agent.department_deliverables} />
            <Field label="Department KPIs" value={agent.department_kpis} />
          </Section>

          {/* Dependencies & Guardrails */}
          <Section title="Dependencies & Guardrails">
            <Field label="Dependencies" value={agent.dependencies} />
            <Field label="Guardrails" value={agent.guardrails} />
          </Section>

          {/* Status */}
          <Section title="Status">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Design Status" value={agent.design_status} />
              <Field label="Runtime Status" value={agent.runtime_status} />
              <Field label="Profile Version" value={agent.profile_version} />
            </div>
          </Section>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-3">
          {isDeferred && (
            <Button 
              variant="primary" 
              loading={activating}
              onClick={handleActivate}
            >
              Activate Agent
            </Button>
          )}
          {isActive && (
            <Button 
              variant="secondary" 
              loading={restarting}
              onClick={handleRestart}
            >
              Restart Agent
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in { animation: slide-in 0.3s ease-out; }
`;
document.head.appendChild(style);