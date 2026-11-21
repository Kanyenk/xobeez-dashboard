import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button, Card } from './ui';

interface AgentNodeData {
  label: string;
  profile: string;
  department: string;
  wave: string;
  role: string;
  roster: string;
  isManager: boolean;
  subordinates: string[];
  reportsTo: string | null;
  onSelect: (profile: string) => void;
}

interface HierarchyTreeProps {
  agents: Array<{
    roster: string;
    profile: string;
    department: string;
    wave: string;
    role: string;
  }>;
  hierarchy: Record<string, string[]>;
  onAgentSelect: (profile: string) => void;
  selectedAgent: string | null;
}

// Custom node component
const AgentNode = ({ data }: { data: AgentNodeData }) => {
  const { label, profile, department, wave, role, roster, isManager, onSelect } = data;
  const isSelected = false; // Will be handled by parent

  return (
    <div
      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
        isManager
          ? 'bg-blue-900/50 border-blue-500'
          : 'bg-gray-800 border-gray-600 hover:border-blue-500'
      } min-w-[200px] max-w-[280px]`}
      onClick={() => onSelect(profile)}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs rounded ${
          isManager ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600 text-gray-300'
        }`}>
          {isManager ? '👑 Manager' : '🔧 Specialist'}
        </span>
        <span className="text-xs text-gray-500">Roster {roster}</span>
      </div>
      
      <div className="font-bold text-white text-lg mb-1">{label}</div>
      <div className="text-xs text-gray-400 mb-1">{role}</div>
      <div className="flex gap-2 text-xs text-gray-500">
        <span>Dept {department}</span>
        <span>Wave {wave}</span>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

const edgeTypes: EdgeTypes = {
  default: {
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    animated: true,
    markerEnd: { type: 'arrowclosed', color: '#3b82f6' },
  },
};

export default function HierarchyTree({ agents, hierarchy, onAgentSelect, selectedAgent }: HierarchyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // Build nodes and edges from hierarchy data
  const { builtNodes, builtEdges } = useMemo(() => {
    const nodeMap = new Map<string, Node<AgentNodeData>>();
    const edgeList: Edge[] = [];

    // Find all R&D agents (department 15)
    const rdAgents = agents.filter(a => a.department === '15');
    
    // Build nodes
    rdAgents.forEach(agent => {
      const isManager = hierarchy[agent.profile] && hierarchy[agent.profile].length > 0;
      const subordinates = hierarchy[agent.profile] || [];
      
      nodeMap.set(agent.profile, {
        id: agent.profile,
        type: 'agent',
        position: { x: 0, y: 0 }, // Will be auto-laid out
        data: {
          label: agent.profile.replace('xo-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          profile: agent.profile,
          department: agent.department,
          wave: agent.wave,
          role: agent.role,
          roster: agent.roster,
          isManager,
          subordinates,
          reportsTo: null, // Will be filled below
          onSelect: onAgentSelect,
        },
      });
    });

    // Build edges and set reportsTo
    Object.entries(hierarchy).forEach(([manager, subs]) => {
      subs.forEach((sub) => {
        if (nodeMap.has(manager) && nodeMap.has(sub)) {
          edgeList.push({
            id: `edge-${manager}-${sub}`,
            source: manager,
            target: sub,
            type: 'default',
          });
          
          // Update subordinate's reportsTo
          const subNode = nodeMap.get(sub);
          if (subNode) {
            subNode.data.reportsTo = manager;
          }
        }
      });
    });

    return { builtNodes: Array.from(nodeMap.values()), builtEdges: edgeList };
  }, [agents, hierarchy, onAgentSelect]);

  // Apply layout - simple vertical tree layout
  const layoutedNodes = useMemo(() => {
    const nodesCopy = [...builtNodes];
    const managers = nodesCopy.filter(n => n.data.isManager);
    const specialists = nodesCopy.filter(n => !n.data.isManager);
    
    // Position managers horizontally
    managers.forEach((manager, i) => {
      manager.position = { x: i * 320 + 100, y: 100 };
      
      // Position subordinates below manager
      const subs = hierarchy[manager.data.profile] || [];
      subs.forEach((subProfile, j) => {
        const subNode = nodesCopy.find(n => n.id === subProfile);
        if (subNode) {
          subNode.position = { x: i * 320 + 100 + (j - (subs.length - 1) / 2) * 220, y: 350 };
        }
      });
    });
    
    return nodesCopy;
  }, [builtNodes, hierarchy]);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

  return (
    <div className="h-[600px] bg-gray-900 rounded-lg border border-gray-700">
      <ReactFlow
        nodes={layoutedNodes}
        edges={builtEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        viewport={viewport}
        onViewportChange={setViewport}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#374151" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => (node.data.isManager ? '#3b82f6' : '#6b7280')}
          maskColor="rgba(0,0,0,0.8)"
        />
        <Panel position="top-left">
          <div className="p-3 bg-gray-900/90 rounded-lg border border-gray-700 text-sm text-gray-300">
            <div className="font-bold text-white mb-2">R&D Hierarchy</div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span> Manager</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-500"></span> Specialist</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Click node to view details →
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}