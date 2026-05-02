import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTemplates } from '../context';

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, onClose, isOpen }) => {
  const { templates } = useTemplates();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 border-gray-700"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 border-gray-700 bg-gradient-to-r from-violet-50 to-purple-50 from-violet-900/20 to-purple-900/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 text-white">Templates de Produits</h2>
                  <p className="text-sm text-gray-600 text-gray-400">
                    Démarrer rapidement avec un modèle pré-rempli
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 hover:bg-gray-700 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Templates grid */}
          <div className="p-8 space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 text-gray-400">Aucun template disponible</p>
                <p className="text-sm text-gray-500 text-gray-500 mt-2">
                  Créez un produit et enregistrez-le comme template
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map(template => {
                  const isExpanded = expanded === template.id;
                  return (
                    <div
                      key={template.id}
                      className="border border-gray-200 border-gray-700 rounded-2xl overflow-hidden bg-white bg-gray-800"
                    >
                      <button
                        onClick={() => setExpanded(isExpanded ? null : template.id)}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 hover:bg-gray-700/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 from-violet-900/30 to-purple-900/30 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-violet-600 text-violet-400" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 text-gray-400">
                              Catégorie: {template.category}
                              {template.brand && ` • ${template.brand}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(template.id);
                              onClose();
                            }}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
                          >
                            Utiliser
                          </motion.button>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="text-gray-400" size={20} />
                          </motion.div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 border-t border-gray-100 border-gray-700 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                {template.defaultValues.price && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Prix</span>
                                    <p className="text-lg font-bold text-gray-900 text-white">
                                      {template.defaultValues.price.toLocaleString()} FCFA
                                    </p>
                                  </div>
                                )}
                                {template.defaultValues.key_points && (
                                  <div className="col-span-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Points clés</span>
                                    <ul className="mt-1 space-y-1">
                                      {template.defaultValues.key_points.map((point: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 text-gray-300">
                                          <Check size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                                          {point}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {template.defaultValues.notes && (
                                  <div className="col-span-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Notes</span>
                                    <p className="text-sm text-gray-700 text-gray-300 mt-1">
                                      {template.defaultValues.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
