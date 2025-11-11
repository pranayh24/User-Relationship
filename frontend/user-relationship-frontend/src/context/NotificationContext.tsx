import React, { createContext, useContext, useCallback, useState } from 'react';
import { NotificationState } from '../types';

interface NotificationContextType {
  notifications: NotificationState[];
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const removeNotificationFunc = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const notification: NotificationState = { id, message, type, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => removeNotificationFunc(id), duration);
      }
    },
    [removeNotificationFunc]
  );

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification: removeNotificationFunc }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
