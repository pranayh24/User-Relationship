import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Connection,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraph } from '../../context/GraphContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api';
import { HighScoreNode } from './CustomNodes/HighScoreNode';
import { LowScoreNode } from './CustomNodes/LowScoreNode';
import { generateGraphLayout } from '../../utils/helpers';
import { motion } from 'framer-motion';

const nodeTypes: NodeTypes = {
  highScore: HighScoreNode as any,
  lowScore: LowScoreNode as any,
};

interface GraphCanvasProps {
  onNodeSelect: (userId: string) => void;
  draggingHobby: string | null;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ onNodeSelect, draggingHobby }) => {
  const { state, updateUser, setUsers } = useGraph();
  const { addNotification } = useNotification();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { getNode } = useReactFlow();

  // Initialize nodes from users
  React.useEffect(() => {
    const positions = generateGraphLayout(state.users.length, 1200, 800);
    const newNodes: Node[] = state.users.map((user, index) => ({
      id: user.id,
      type: user.popularityScore > 5 ? 'highScore' : 'lowScore',
      data: {
        label: user.username,
        age: user.age,
        popularityScore: user.popularityScore,
      },
      position: positions[index] || { x: Math.random() * 500, y: Math.random() * 500 },
      draggable: true,
    }));
    setNodes(newNodes);
  }, [state.users, setNodes]);

  // Initialize edges from relationships
  React.useEffect(() => {
    const newEdges: Edge[] = [];
    const addedPairs = new Set<string>();

    state.users.forEach((user) => {
      user.friends.forEach((friendId) => {
        const pairKey = [user.id, friendId].sort().join('-');
        if (!addedPairs.has(pairKey)) {
          newEdges.push({
            id: pairKey,
            source: user.id,
            target: friendId,
            animated: true,
          });
          addedPairs.add(pairKey);
        }
      });
    });

    setEdges(newEdges);
  }, [state.users, setEdges]);

  // Validate connection
  const isValidConnection = useCallback((connection: Connection): boolean => {
    if (connection.source === connection.target) {
      return false;
    }

    const existingEdge = edges.find(
      (edge) =>
        (edge.source === connection.source && edge.target === connection.target) ||
        (edge.source === connection.target && edge.target === connection.source)
    );

    return !existingEdge;
  }, [edges]);

  // Enhanced connection handler
  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      if (!isValidConnection(connection)) {
        addNotification('Users are already connected', 'warning');
        return;
      }

      try {
        await userAPI.linkUsers(connection.source, connection.target);
        const graphData = await userAPI.getGraphData();
        setUsers(graphData.users);
        addNotification('✅ Users linked successfully!', 'success');
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to link users';
        addNotification(errorMsg, 'error');
        console.error('Connection error:', error);
      }
    },
    [setUsers, addNotification, isValidConnection]
  );

  // Handle node drag start for visual feedback
  const handleNodeMouseDown = useCallback((nodeId: string) => {
    setDraggedNode(nodeId);
  }, []);

  // Handle node hover for connection preview
  const handleNodeMouseEnter = useCallback((nodeId: string) => {
    if (draggedNode && draggedNode !== nodeId) {
      setHoveredNode(nodeId);
    }
  }, [draggedNode]);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Handle drop on node to create relationship
  const handleNodeDrop = useCallback(
    async (targetNodeId: string) => {
      if (!draggedNode || draggedNode === targetNodeId) {
        setDraggedNode(null);
        return;
      }

      // Check if already connected
      if (areNodesConnected(draggedNode, targetNodeId)) {
        addNotification('Users are already connected', 'warning');
        setDraggedNode(null);
        return;
      }

      try {
        await userAPI.linkUsers(draggedNode, targetNodeId);
        const graphData = await userAPI.getGraphData();
        setUsers(graphData.users);
        addNotification('✅ Users linked successfully!', 'success');
      } catch (error: any) {
        addNotification(error.message || 'Failed to link users', 'error');
      } finally {
        setDraggedNode(null);
        setHoveredNode(null);
      }
    },
    [draggedNode, areNodesConnected, setUsers, addNotification]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingHobby) {
      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    }
  }, [draggingHobby]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).style.backgroundColor = '';

      if (!draggingHobby) return;

      const reactflowBounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - reactflowBounds.left;
      const y = e.clientY - reactflowBounds.top;

      const nodeAtPosition = nodes.find((node) => {
        if (!node.position) return false;
        const distance = Math.sqrt(
          Math.pow(node.position.x - x, 2) + Math.pow(node.position.y - y, 2)
        );
        return distance < 100;
      });

      if (!nodeAtPosition) {
        addNotification('Drop hobby on a user node', 'warning');
        return;
      }

      try {
        const user = state.users.find((u) => u.id === nodeAtPosition.id);
        if (!user) return;

        if (user.hobbies.includes(draggingHobby)) {
          addNotification('User already has this hobby', 'warning');
          return;
        }

        const updated = await userAPI.updateUser(nodeAtPosition.id, {
          hobbies: [...user.hobbies, draggingHobby],
        });

        updateUser(updated);
        addNotification(`Added hobby "${draggingHobby}" to ${user.username}`, 'success');
      } catch (error: any) {
        addNotification(error.message || 'Failed to add hobby', 'error');
      }
    },
    [draggingHobby, nodes, state.users, updateUser, addNotification]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onMouseDown: () => handleNodeMouseDown(node.id),
            onMouseEnter: () => handleNodeMouseEnter(node.id),
            onMouseLeave: handleNodeMouseLeave,
            onDrop: () => handleNodeDrop(node.id),
            isDragged: draggedNode === node.id,
            isHovered: hoveredNode === node.id,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        isValidConnection={isValidConnection}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>

      {/* Connection Instructions */}
      <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <p className="text-sm font-semibold text-gray-800 mb-3">📌 How to Connect Users:</p>
        <ul className="text-xs text-gray-600 space-y-2">
          <li>✓ <strong>Method 1:</strong> Drag one node directly onto another node</li>
          <li>✓ <strong>Method 2:</strong> Drag from a handle at the bottom of a node to another node's handle</li>
          <li>✓ Connections are bidirectional (mutual)</li>
          <li>✓ Can't connect a user to themselves</li>
        </ul>
      </div>

      {/* Connection Preview Line */}
      {draggedNode && hoveredNode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <svg className="w-full h-full">
            <line
              x1={getNode(draggedNode)?.position.x || 0}
              y1={getNode(draggedNode)?.position.y || 0}
              x2={getNode(hoveredNode)?.position.x || 0}
              y2={getNode(hoveredNode)?.position.y || 0}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      )}

      {/* Stats Overlay */}
      <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-gray-900 mb-2">Graph Stats</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>👥 Users: {state.users.length}</p>
          <p>🔗 Connections: {edges.length}</p>
          <p>
            ⭐ Popular: {state.users.filter((u) => u.popularityScore > 5).length}
          </p>
          <p>
            📊 Avg Score:{' '}
            {state.users.length > 0
              ? (state.users.reduce((sum, u) => sum + u.popularityScore, 0) / state.users.length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>

      {/* Drag Hint */}
      {draggingHobby && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Drop "{draggingHobby}" on a user node
        </motion.div>
      )}

      {/* Dragging Feedback */}
      {draggedNode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          🔗 Drag to another node to connect
        </motion.div>
      )}
    </motion.div>
  );
};
