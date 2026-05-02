import { useEffect } from 'react';
import { useHistory, useSelection, useApp } from '../context';

export const useKeyboardShortcuts = () => {
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { deselectAll } = useSelection();
  const { dispatch, state } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' ||
                           activeElement?.tagName === 'TEXTAREA' ||
                           activeElement?.getAttribute('contenteditable') === 'true';

      const isModifier = e.ctrlKey || e.metaKey || e.altKey;

      // Undo / Redo
      if (isModifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((isModifier && e.key === 'y') || (isModifier && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Select all
      if (isModifier && e.key === 'a') {
        e.preventDefault();
        dispatch({ type: 'SELECT_ALL' });
      }

      // Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        deselectAll();
      }

      // Quick navigation
      if (!isModifier && !isInputFocused) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            window.location.href = '/add';
            break;
          case '/':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, deselectAll, dispatch, state.selectedIds]);
};
