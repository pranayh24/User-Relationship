import React, { useState, useMemo, useRef } from 'react';
import { useGraph } from '../../context/GraphContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api';
import { getAllUniqueSuggestions } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  onHobbyDragStart: (hobby: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onHobbyDragStart }) => {
  const { state, updateUser, setDraggingHobby } = useGraph();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddHobby, setShowAddHobby] = useState(false);
  const [newHobby, setNewHobby] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRequestInProgress = useRef(false);

  const allHobbies = useMemo(() => getAllUniqueSuggestions(state.users), [state.users]);

  const filteredHobbies = useMemo(
    () =>
      allHobbies.filter((hobby) =>
        hobby.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allHobbies, searchTerm]
  );

  // Handle hobby drag start with proper state management
  const handleHobbyDragStart = (hobby: string) => {
    if (!state.selectedUserId) {
      addNotification('Please select a user first', 'warning');
      return;
    }
    setDraggingHobby(hobby);
    onHobbyDragStart(hobby);
  };

  const handleAddHobby = async () => {
    // Prevent multiple simultaneous requests
    if (isRequestInProgress.current || isLoading) {
      return;
    }

    if (!newHobby.trim()) {
      addNotification('Please enter a hobby name', 'warning');
      return;
    }

    if (!state.selectedUserId) {
      addNotification('Please select a user first', 'warning');
      return;
    }

    try {
      isRequestInProgress.current = true;
      setIsLoading(true);

      const user = state.users.find((u) => u.id === state.selectedUserId);
      if (!user) {
        addNotification('User not found', 'error');
        return;
      }

      // Normalize hobby name (trim and lowercase for comparison)
      const normalizedNewHobby = newHobby.trim();
      const hobbyExists = user.hobbies.some(
        (h) => h.toLowerCase() === normalizedNewHobby.toLowerCase()
      );

      if (hobbyExists) {
        addNotification('User already has this hobby', 'warning');
        return;
      }

      const updatedUser = await userAPI.updateUser(state.selectedUserId, {
        hobbies: [...user.hobbies, normalizedNewHobby],
      });

      updateUser(updatedUser);
      addNotification(`Added hobby "${normalizedNewHobby}" successfully`, 'success');
      setNewHobby('');
      setShowAddHobby(false);
    } catch (error: any) {
      addNotification(error.message || 'Failed to add hobby', 'error');
    } finally {
      isRequestInProgress.current = false;
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-blue-200 shadow-lg flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-200 bg-blue-100">
        <h2 className="text-lg font-bold text-blue-900">Hobbies & Activities</h2>
        <p className="text-xs text-blue-700 mt-1">
          {state.selectedUserId
            ? 'Drag hobbies onto users to add them'
            : 'Select a user first'}
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-blue-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hobbies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Selected User Info */}
      {state.selectedUserId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-100 border-b border-blue-200"
        >
          <p className="text-sm font-semibold text-blue-900">
            Selected User:{' '}
            {state.users.find((u) => u.id === state.selectedUserId)?.username}
          </p>
        </motion.div>
      )}

      {/* Hobbies List */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {filteredHobbies.length > 0 ? (
            filteredHobbies.map((hobby) => (
              <motion.div
                key={hobby}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                draggable={!!state.selectedUserId}
                onDragStart={() => handleHobbyDragStart(hobby)}
                className={`mb-2 p-3 bg-white border border-blue-300 rounded-lg transition-all ${
                  state.selectedUserId 
                    ? 'cursor-move hover:shadow-md hover:border-blue-500 active:opacity-75' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{hobby}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {state.users.filter((u) => u.hobbies.includes(hobby)).length} users
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'No hobbies found' : 'No hobbies yet'}
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* Add Hobby Button */}
      <div className="p-4 border-t border-blue-200 bg-blue-50">
        {!showAddHobby ? (
          <button
            onClick={() => {
              if (!state.selectedUserId) {
                addNotification('Please select a user first', 'warning');
                return;
              }
              setShowAddHobby(true);
            }}
            disabled={isLoading || !state.selectedUserId}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
            Add Hobby
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="New hobby..."
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAddHobby()}
              disabled={isLoading}
              className="flex-1 min-w-0 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
            <button
              onClick={handleAddHobby}
              disabled={isLoading}
              type="button"
              className="flex-shrink-0 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-800"
            >
              {isLoading ? '⏳' : '✓'}
            </button>
            <button
              onClick={() => {
                if (!isLoading) {
                  setShowAddHobby(false);
                  setNewHobby('');
                }
              }}
              disabled={isLoading}
              type="button"
              className="flex-shrink-0 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-600"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
