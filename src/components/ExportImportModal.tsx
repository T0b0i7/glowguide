import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, Database, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useNotifications } from '../context';
import StorageService from '../services/storageService';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useApp();
  const { success, error: showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);

  const handleExport = () => {
    const json = StorageService.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glowguide-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Exporté', 'Vos données ont été exportées avec succès');
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Preview
      setImportPreview({
        productsCount: data.products?.length || 0,
        tagsCount: data.tags?.length || 0,
        templatesCount: data.templates?.length || 0,
        exportedAt: data.exportedAt
      });

      // Confirm import
      if (window.confirm(`Importer ${data.products?.length || 0} produits, ${data.tags?.length || 0} tags et ${data.templates?.length || 0} templates ?\n\nLes données actuelles seront remplacées.`)) {
        const successImport = StorageService.importAll(text);
        if (successImport) {
          // Reload state
          const products = StorageService.getProducts();
          const tags = StorageService.getTags();
          const templates = StorageService.getTemplates();
          dispatch({ type: 'SET_PRODUCTS', payload: products });
          dispatch({ type: 'LOAD_STATE', payload: { tags, templates } });
          success('Importé', 'Données importées avec succès');
          onClose();
        } else {
          showError('Erreur', 'Import échoué - format invalide');
        }
      }
    } catch (err) {
      showError('Erreur', 'Fichier invalide ou corrompu');
    } finally {
      setIsImporting(false);
      setImportPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 border-gray-700"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-beauty-soft border-gray-700 flex justify-between items-center bg-gradient-to-r from-beauty-soft/30 to-transparent">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white">Export / Import</h2>
              <p className="text-sm text-gray-600 text-gray-400 mt-1">
                Sauvegardez ou restaurez vos données
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 hover:bg-gray-800 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<Database size={24} />}
                label="Produits"
                value={state.products.length}
                color="text-beauty-accent"
              />
              <StatCard
                icon={<TagIconAdapter size={24} />}
                label="Tags"
                value={state.tags.length}
                color="text-violet-500"
              />
              <StatCard
                icon={<FileJson size={24} />}
                label="Templates"
                value={state.templates.length}
                color="text-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 from-emerald-900/30 to-emerald-800/30 border-2 border-emerald-200 border-emerald-700 hover:border-emerald-400 hover:border-emerald-500 transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Download size={28} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-emerald-800 text-emerald-200">Exporter</h3>
                  <p className="text-xs text-emerald-600 text-emerald-300">JSON complet</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 from-blue-900/30 to-blue-800/30 border-2 border-blue-200 border-blue-700 hover:border-blue-400 hover:border-blue-500 transition-all group disabled:opacity-50"
              >
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-blue-800 text-blue-200">Importer</h3>
                  <p className="text-xs text-blue-600 text-blue-300">Restauration</p>
                </div>
              </motion.button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 bg-amber-900/30 border border-amber-200 border-amber-700 rounded-xl">
              <AlertTriangle className="text-amber-600 text-amber-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-amber-800 text-amber-200">
                <p className="font-semibold mb-1">Attention</p>
                <p>L'import remplace toutes les données actuelles. Assurez-vous d'avoir exporté une sauvegarde avant.</p>
              </div>
            </div>

            {/* Import preview */}
            {importPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-green-50 bg-green-900/30 border border-green-200 border-green-700 rounded-xl"
              >
                <div className="flex items-center gap-2 text-green-700 text-green-300 font-semibold mb-2">
                  <Check size={20} />
                  Fichier prêt à importer
                </div>
                <div className="text-sm text-green-600 text-green-400 space-y-1">
                  <p>{importPreview.productsCount} produits</p>
                  <p>{importPreview.tagsCount} tags</p>
                  <p>{importPreview.templatesCount} templates</p>
                  <p className="text-xs opacity-70 mt-2">
                    Exporté le: {new Date(importPreview.exportedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Tag icon adapter since we can't use the real Tag icon due to circular dependency
const TagIconAdapter: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon, label, value, color
}) => (
  <div className="bg-beauty-base bg-gray-800 rounded-2xl p-4 text-center border border-beauty-soft border-gray-700">
    <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
    <div className="text-2xl font-bold text-gray-900 text-white">{value}</div>
    <div className="text-xs text-gray-600 text-gray-400 uppercase tracking-wider">{label}</div>
  </div>
);
