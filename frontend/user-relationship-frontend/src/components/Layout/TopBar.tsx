import React, { useState } from 'react';
import { useGraph } from '../../context/GraphContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowPathIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { state, setUsers, setLoading } = useGraph();
  const { addNotification } = useNotification();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setLoading(true);
      const graphData = await userAPI.getGraphData();
      setUsers(graphData.users);
      addNotification('Data refreshed successfully', 'success');
    } catch (error: any) {
      addNotification(error.message || 'Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">User Relationship Graph</h1>
            <p className="text-blue-100 text-sm">Visualize and manage user connections</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-semibold">{state.users.length} Users</p>
            <p className="text-blue-100">
              {(state.users.reduce((sum, u) => sum + u.friends.length, 0) / 2) | 0} Connections
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || state.loading}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
            >
              <ArrowPathIcon className="w-6 h-6" />
            </motion.div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
