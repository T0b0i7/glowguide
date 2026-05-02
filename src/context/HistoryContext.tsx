import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { produce } from 'immer';
import StorageService, { HistoryAction } from '../services/storageService';

interface HistoryState {
  past: HistoryAction[];
  present: HistoryAction | null;
  future: HistoryAction[];
}

type HistoryActionType =
  | { type: 'PUSH'; payload: HistoryAction }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; payload: HistoryAction[] };

const initialState: HistoryState = {
  past: [],
  present: null,
  future: []
};

function historyReducer(state: HistoryState, action: HistoryActionType): HistoryState {
  return produce(state, draft => {
    switch (action.type) {
      case 'PUSH':
        draft.past.push(action.payload);
        draft.present = action.payload;
        draft.future = [];
        // Keep only last 50
        if (draft.past.length > 50) {
          draft.past.shift();
        }
        break;

      case 'UNDO':
        if (draft.past.length === 0) return;
        const previous = draft.past[draft.past.length - 1];
        draft.past = draft.past.slice(0, -1);
        draft.future = [previous, ...draft.future];
        draft.present = draft.past[draft.past.length - 1] || null;
        break;

      case 'REDO':
        if (draft.future.length === 0) return;
        const next = draft.future[0];
        draft.future = draft.future.slice(1);
        draft.past.push(next);
        draft.present = next;
        break;

      case 'CLEAR':
        draft.past = [];
        draft.present = null;
        draft.future = [];
        break;

      case 'LOAD':
        draft.past = action.payload;
        draft.present = action.payload[action.payload.length - 1] || null;
        draft.future = [];
        break;

      default:
        break;
    }
  });
}

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  push: (action: Omit<HistoryAction, 'timestamp'>) => void;
  clear: () => void;
  getLastAction: () => HistoryAction | null;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    const history = StorageService.getHistory();
    dispatch({ type: 'LOAD', payload: history });
  }, []);

  // Save to storage when past changes
  useEffect(() => {
    StorageService.saveHistory(state.past);
  }, [state.past]);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const push = useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    const fullAction: HistoryAction = {
      ...action,
      timestamp: Date.now()
    };
    dispatch({ type: 'PUSH', payload: fullAction });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const getLastAction = useCallback(() => {
    return state.past[state.past.length - 1] || null;
  }, [state.past]);

  return (
    <HistoryContext.Provider value={{
      canUndo,
      canRedo,
      undo,
      redo,
      push,
      clear,
      getLastAction
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
