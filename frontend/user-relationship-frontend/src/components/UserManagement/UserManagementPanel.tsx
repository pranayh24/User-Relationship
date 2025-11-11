import React, { useState } from 'react';
import { useGraph } from '../../context/GraphContext';
import { useNotification } from '../../context/NotificationContext';
import { userAPI } from '../../services/api';
import { CreateUserRequest, UpdateUserRequest } from '../../types';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UserManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ isOpen, onClose }) => {
  const { state, addUser, updateUser: updateUserState, deleteUser: deleteUserFromState, setLoading } =
    useGraph();
  const { addNotification } = useNotification();

  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    age: 25,
    hobbies: [],
  });
  const [newHobby, setNewHobby] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      addNotification('Username is required', 'warning');
      return;
    }

    if (formData.age < 1 || formData.age > 150) {
      addNotification('Age must be between 1 and 150', 'warning');
      return;
    }

    if (formData.hobbies.length === 0) {
      addNotification('At least one hobby is required', 'warning');
      return;
    }

    try {
      setLoading(true);

      if (editingUserId) {
        const updated = await userAPI.updateUser(editingUserId, {
          username: formData.username,
          age: formData.age,
          hobbies: formData.hobbies,
        } as UpdateUserRequest);
        updateUserState(updated);
        addNotification('User updated successfully', 'success');
      } else {
        const created = await userAPI.createUser(formData);
        addUser(created);
        addNotification('User created successfully', 'success');
      }

      resetForm();
      setIsCreating(false);
      setEditingUserId(null);
    } catch (error: any) {
      addNotification(error.message || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await userAPI.deleteUser(userId);
      deleteUserFromState(userId);
      addNotification('User deleted successfully', 'success');
      setDeleteConfirm(null);
    } catch (error: any) {
      addNotification(error.message || 'Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHobby = () => {
    if (!newHobby.trim()) return;

    if (formData.hobbies.includes(newHobby)) {
      addNotification('Hobby already added', 'warning');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      hobbies: [...prev.hobbies, newHobby],
    }));
    setNewHobby('');
  };

  const handleRemoveHobby = (hobby: string) => {
    setFormData((prev) => ({
      ...prev,
      hobbies: prev.hobbies.filter((h) => h !== hobby),
    }));
  };

  const resetForm = () => {
    setFormData({ username: '', age: 25, hobbies: [] });
    setNewHobby('');
  };

  const handleEdit = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      setFormData({
        username: user.username,
        age: user.age,
        hobbies: [...user.hobbies],
      });
      setEditingUserId(userId);
      setIsCreating(true);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 border-r border-gray-200 pr-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingUserId(null);
                  resetForm();
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isCreating && !editingUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                New User
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !isCreating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                View All
              </button>
            </div>

            {isCreating && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age * (1-150)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value) || 25,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hobbies * (min 1)
                  </label>
                  <div className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddHobby()}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add hobby..."
                    />
                    <button
                      type="button"
                      onClick={handleAddHobby}
                      className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium active:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.hobbies.map((hobby) => (
                      <motion.div
                        key={hobby}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {hobby}
                        <button
                          type="button"
                          onClick={() => handleRemoveHobby(hobby)}
                          className="hover:text-blue-600 font-bold"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {editingUserId ? 'Update User' : 'Create User'}
                </button>

                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingUserId(null);
                      resetForm();
                    }}
                    className="w-full py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </motion.form>
            )}
          </div>

          {/* Users List */}
          <div className="lg:col-span-2">
            {!isCreating || !editingUserId ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 max-h-[500px] overflow-y-auto"
              >
                {state.users.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users yet. Create one!</p>
                ) : (
                  state.users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{user.username}</h3>
                          <p className="text-sm text-gray-600">
                            Age: {user.age} | Score: {user.popularityScore.toFixed(1)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        Hobbies: {user.hobbies.join(', ')}
                      </p>
                      <p className="text-xs text-gray-600">
                        Friends: {user.friends.length}
                      </p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDeleteConfirm(null)}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Delete User?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure? This action cannot be undone. All friendships must be
              removed first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteUser(deleteConfirm);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
