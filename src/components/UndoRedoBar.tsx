import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useHistory } from '../context';

export const UndoRedoBar: React.FC = () => {
  const { canUndo, canRedo, undo, redo } = useHistory();

  if (!canUndo && !canRedo) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
      <div className="bg-gray-900 bg-gray-800 rounded-full px-4 py-2 shadow-2xl border border-gray-700 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-full transition-colors ${
            canUndo
              ? 'text-white hover:bg-white/20'
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </motion.button>

        <div className="w-px h-6 bg-gray-700" />

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-full transition-colors ${
            canRedo
              ? 'text-white hover:bg-white/20'
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </motion.button>
      </div>
    </div>
  );
};
