import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Save, Palette, Loader2 } from 'lucide-react';

import { useSettings, useApp } from '../context';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-beauty-sand"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-beauty-sand bg-gradient-to-r from-beauty-soft/50 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-beauty-accent/20 rounded-2xl flex items-center justify-center">
                  <Settings className="text-beauty-accent" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-beauty-dark">Paramètres</h2>
                  <p className="text-sm text-beauty-text/60">Configurez votre catalogue</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-beauty-soft rounded-full transition-colors"
              >
                <X size={20} className="text-beauty-text" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Catalog Name */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-beauty-text uppercase tracking-wider flex items-center gap-2">
                  <Palette size={16} />
                  Nom du Catalogue
                </label>
                <input
                  type="text"
                  value={localSettings.catalogName}
                  onChange={(e) => setLocalSettings({ ...localSettings, catalogName: e.target.value })}
                  className="w-full px-5 py-4 bg-beauty-soft border border-beauty-sand rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent text-beauty-dark font-semibold text-lg transition-all"
                  placeholder="Nom de votre catalogue"
                />
              </div>

              {/* Language */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-beauty-text uppercase tracking-wider">
                  Langue
                </label>
                <select
                  value={localSettings.language}
                  onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value as 'fr' | 'en' })}
                  className="w-full px-5 py-4 bg-beauty-soft border border-beauty-sand rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent text-beauty-text transition-all"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Items per page */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-beauty-text uppercase tracking-wider">
                  Produits par page
                </label>
                <select
                  value={localSettings.itemsPerPage}
                  onChange={(e) => setLocalSettings({ ...localSettings, itemsPerPage: parseInt(e.target.value) })}
                  className="w-full px-5 py-4 bg-beauty-soft border border-beauty-sand rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent text-beauty-text transition-all"
                >
                  <option value="8">8 produits</option>
                  <option value="12">12 produits</option>
                  <option value="16">16 produits</option>
                  <option value="24">24 produits</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-beauty-sand bg-beauty-soft/30 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-white text-beauty-text font-semibold border border-beauty-sand hover:bg-beauty-soft transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-2xl bg-beauty-accent text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Hook to get catalog name
export const useCatalogName = () => {
  const { settings } = useSettings();
  return settings.catalogName || 'GlowGuide';
};