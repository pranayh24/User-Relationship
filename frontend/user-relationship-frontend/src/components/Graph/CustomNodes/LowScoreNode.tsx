import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface LowScoreNodeProps {
  data: {
    label: string;
    age: number;
    popularityScore: number;
  };
  isConnecting?: boolean;
  selected?: boolean;
}

export const LowScoreNode: React.FC<LowScoreNodeProps> = ({ data, isConnecting, selected }) => {
  const scorePercentage = Math.min((data.popularityScore / 5) * 100, 100);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`px-4 py-3 rounded-lg shadow-md border-2 transition-all ${
        selected
          ? 'border-orange-500 bg-orange-100 ring-2 ring-orange-300'
          : 'border-blue-400 bg-blue-50'
      } ${isConnecting ? 'opacity-50' : 'opacity-100'}`}
      style={{
        minWidth: '160px',
        boxShadow: `0 0 ${scorePercentage / 10}px rgba(59, 130, 246, ${scorePercentage / 100})`,
      }}
    >
      {/* Connection handles - allow both incoming and outgoing connections */}
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <Handle type="source" position={Position.Bottom} isConnectable={true} />

      {/* Invisible side handles for additional connection options */}
      <Handle type="target" position={Position.Left} isConnectable={true} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} isConnectable={true} style={{ opacity: 0 }} />

      <div className="flex flex-col items-center gap-1">
        <div className="font-bold text-center text-blue-900 truncate w-full">
          {data.label}
        </div>
        <div className="text-xs text-gray-600 flex gap-3">
          <span>Age: {data.age}</span>
          <span>Score: {data.popularityScore.toFixed(1)}</span>
        </div>

        {/* Score bar */}
        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
          <motion.div
            className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-xs font-semibold text-blue-700 mt-1">
          👤 Regular
        </div>
      </div>
    </motion.div>
  );
};
