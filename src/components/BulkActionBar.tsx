import React from 'react';
import { Trash2, Heart, Tag, FileDown, FileUp, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelection, useApp, useNotifications } from '../context';

export const BulkActionBar: React.FC = () => {
  const { selectedIds, deselectAll } = useSelection();
  const { state, bulkDelete, bulkUpdate, dispatch } = useApp();
  const { success, error: showError } = useNotifications();

  const selectedProducts = state.products.filter(p => selectedIds.includes(p.id));
  const allSelected = selectedIds.length === state.products.length;

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAll();
    } else {
      dispatch({ type: 'SELECT_ALL' });
    }
  };

  const handleBulkFavorite = async () => {
    const allFavorited = selectedProducts.every(p => p.isFavorite);
    try {
      await bulkUpdate(selectedIds, { isFavorite: !allFavorited });
      success('Favoris', `${!allFavorited ? 'Ajouté' : 'Retiré'} aux favoris`);
    } catch (err) {
      showError('Erreur', 'Action échouée');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) {
      try {
        await bulkDelete(selectedIds);
        success('Supprimé', `${selectedIds.length} produit(s) supprimé(s)`);
      } catch (err) {
        showError('Erreur', 'Suppression échouée');
      }
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700 p-4 flex items-center gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
            <button
              onClick={handleSelectAll}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="font-semibold">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={deselectAll}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkFavorite}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors font-medium"
            >
              <Heart size={18} />
               {selectedProducts.every(p => p.isFavorite) ? 'Retirer' : 'Favoris'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium"
            >
              <Trash2 size={18} />
              Supprimer
            </motion.button>

            {/* Export button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors font-medium"
            >
              <FileDown size={18} />
              Exporter
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
