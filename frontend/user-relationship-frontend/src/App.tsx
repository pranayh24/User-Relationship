import React, { useEffect, useState } from 'react';
import { useGraph } from './context/GraphContext';
import { useNotification } from './context/NotificationContext';
import { userAPI } from './services/api';
import { ErrorBoundary } from './components/Loading/ErrorBoundary';
import { LoadingSpinner } from './components/Loading/LoadingUI';
import { NotificationContainer } from './components/Notifications/NotificationContainer';
import { GraphCanvas } from './components/Graph/GraphCanvas';
import { Sidebar } from './components/Sidebar/Sidebar';
import { UserManagementPanel } from './components/UserManagement/UserManagementPanel';
import { TopBar } from './components/Layout/TopBar';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { state, setUsers, setLoading, setError, setDraggingHobby, setSelectedUser } = useGraph();
  const { addNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userManagementOpen, setUserManagementOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const graphData = await userAPI.getGraphData();
        setUsers(graphData.users);
      } catch (error: any) {
        setError(error.message);
        addNotification('Failed to load data: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setUsers, setLoading, setError, addNotification]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <Sidebar
              onHobbyDragStart={(hobby: string) => setDraggingHobby(hobby)}
            />
          )}
        </AnimatePresence>

        {/* Graph Canvas */}
        <div className="flex-1 flex flex-col">
          {state.loading && state.users.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner text="Loading graph data..." />
            </div>
          ) : state.error && state.users.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-4">{state.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reload
                </button>
              </div>
            </div>
          ) : (
            <GraphCanvas
              onNodeSelect={setSelectedUser}
              draggingHobby={state.draggingHobby}
            />
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setUserManagementOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center font-bold text-xl transition-all hover:scale-110 z-30"
        title="Open User Management"
      >
        +
      </motion.button>

      {/* User Management Panel */}
      <UserManagementPanel
        isOpen={userManagementOpen}
        onClose={() => setUserManagementOpen(false)}
      />

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
