import React from 'react';
import { X, TrendingUp, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useComparison, useProducts } from '../context';
import { Product } from '../types';

interface ComparisonTableProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ isOpen, onClose }) => {
  const { comparisonProducts, removeFromComparison, clearComparison } = useComparison();

  // Fields to compare
  const fields = [
    { key: 'imageUrl', label: 'Image', type: 'image' },
    { key: 'brand', label: 'Marque', type: 'text' },
    { key: 'category', label: 'Catégorie', type: 'text' },
    { key: 'price', label: 'Prix (FCFA)', type: 'number', format: (v: number) => v.toLocaleString() },
    { key: 'summary', label: 'Résumé', type: 'text', truncate: true },
    { key: 'ingredients', label: 'Ingrédients', type: 'text', truncate: true },
    { key: 'benefits', label: 'Bénéfices', type: 'text', truncate: true },
    { key: 'usage', label: 'Utilisation', type: 'text', truncate: true },
    { key: 'targetSkin', label: 'Type de peau', type: 'text' },
    { key: 'contraindications', label: 'Contre-indications', type: 'text', truncate: true },
    { key: 'keyPoints', label: 'Points clés', type: 'array' },
    { key: 'isFavorite', label: 'Favori', type: 'boolean', format: (v: boolean) => v ? '❤️' : '○' },
    { key: 'learningStatus', label: 'Statut', type: 'status' }
  ];

  const getValue = (product: Product, fieldKey: string) => {
    const value = (product as any)[fieldKey];
    if (value === undefined || value === null) return '—';
    return value;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-beauty-soft/30 to-transparent flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Comparer ({comparisonProducts.length}/3)
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analysez les différences côte à côte
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comparisonProducts.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors font-medium"
                >
                  Tout effacer
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            {comparisonProducts.length === 0 ? (
              <div className="text-center py-20">
                <TrendingUp className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Aucun produit à comparer
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Ajoutez des produits depuis le catalogue pour les comparer
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-beauty-accent text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-32">
                        Attribut
                      </th>
                      {comparisonProducts.map(product => (
                        <th key={product.id} className="min-w-[250px] p-4">
                          <div className="flex flex-col items-center">
                            <img
                              src={product.image_url || 'https://via.placeholder.com/80'}
                              alt={product.name}
                              className="w-16 h-16 rounded-xl object-cover mb-3 border-2 border-beauty-soft"
                            />
                            <div className="text-center">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {product.brand}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromComparison(product.id)}
                              className="mt-2 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(field => (
                      <tr key={field.key} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </td>
                        {comparisonProducts.map(product => {
                          const value = getValue(product, field.key);
                          let displayValue: React.ReactNode = value;

                          if (field.type === 'image') {
                            displayValue = (
                              <img
                                src={value as string}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            );
                          } else if (field.type === 'boolean') {
                            displayValue = <span className="text-2xl">{value ? '❤️' : '○'}</span>;
                          } else if (field.type === 'array' && Array.isArray(value)) {
                            displayValue = (
                              <ul className="text-sm space-y-1">
                                {(value as string[]).map((v, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Check size={12} className="text-emerald-500 mt-1 flex-shrink-0" />
                                    <span>{v}</span>
                                  </li>
                                ))}
                              </ul>
                            );
                          } else if (field.type === 'status') {
                            const colors: Record<string, string> = {
                              'à-apprendre': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                              'en-cours': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                              'maîtrisé': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            };
                            displayValue = (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[value as string] || 'bg-gray-100 text-gray-800'}`}>
                                {value?.replace('-', ' ') || 'Non défini'}
                              </span>
                            );
                          } else if (field.truncate && typeof value === 'string') {
                            displayValue = (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {value}
                              </p>
                            );
                          } else if (field.format) {
                            displayValue = field.format(value);
                          }

                          // Highlight differences
                          const isDifferent = comparisonProducts.some(p => {
                            const v1 = getValue(p, field.key);
                            const v2 = value;
                            return JSON.stringify(v1) !== JSON.stringify(v2);
                          });

                          return (
                            <td
                              key={product.id}
                              className={`py-4 px-4 ${isDifferent ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                            >
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer hint */}
          {comparisonProducts.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <AlertTriangle size={16} className="inline mr-1" />
                  Les cellules en jaune indiquent des différences
                </p>
                <span className="text-sm text-gray-500">
                  {comparisonProducts.length}/3 produits
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
