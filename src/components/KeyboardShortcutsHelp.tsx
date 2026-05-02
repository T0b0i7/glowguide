import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'Z'], description: 'Annuler' },
    { keys: ['Ctrl', 'Y'], description: 'Rétablir' },
    { keys: ['Ctrl', 'A'], description: 'Tout sélectionner' },
    { keys: ['Escape'], description: 'Désélectionner' },
    { keys: ['N'], description: 'Nouveau produit' },
    { keys: ['/'], description: 'Rechercher' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-gray-200 border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 text-white">Raccourcis clavier</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:text-gray-300">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-gray-700 text-gray-300">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-3 py-1.5 bg-gray-100 bg-gray-800 border border-gray-300 border-gray-700 rounded-lg text-sm font-mono text-gray-700 text-gray-300 shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
