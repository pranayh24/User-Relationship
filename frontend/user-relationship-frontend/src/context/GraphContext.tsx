import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface GraphState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUserId: string | null;
  draggingHobby: string | null;
  history: GraphState[];
  historyIndex: number;
}

type GraphAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_USER'; payload: string | null }
  | { type: 'SET_DRAGGING_HOBBY'; payload: string | null }
  | { type: 'PUSH_HISTORY' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface GraphContextType {
  state: GraphState;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedUser: (id: string | null) => void;
  setDraggingHobby: (hobby: string | null) => void;
  undo: () => void;
  redo: () => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

const initialState: GraphState = {
  users: [],
  loading: true,
  error: null,
  selectedUserId: null,
  draggingHobby: null,
  history: [],
  historyIndex: -1,
};

const graphReducer = (state: GraphState, action: GraphAction): GraphState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUserId: action.payload };
    case 'SET_DRAGGING_HOBBY':
      return { ...state, draggingHobby: action.payload };
    case 'PUSH_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ ...state, history: [], historyIndex: -1 });
      return { ...state, history: newHistory, historyIndex: newHistory.length - 1 };
    }
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return { ...previousState, history: state.history, historyIndex: state.historyIndex - 1 };
      }
      return state;
    }
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return { ...nextState, history: state.history, historyIndex: state.historyIndex + 1 };
      }
      return state;
    }
    default:
      return state;
  }
};

export const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  const setUsers = useCallback((users: User[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);

  const addUser = useCallback((user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const deleteUser = useCallback((id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setSelectedUser = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: id });
  }, []);

  const setDraggingHobby = useCallback((hobby: string | null) => {
    dispatch({ type: 'SET_DRAGGING_HOBBY', payload: hobby });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  return (
    <GraphContext.Provider
      value={{
        state,
        setUsers,
        addUser,
        updateUser,
        deleteUser,
        setLoading,
        setError,
        setSelectedUser,
        setDraggingHobby,
        undo,
        redo,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within GraphProvider');
  }
  return context;
};

