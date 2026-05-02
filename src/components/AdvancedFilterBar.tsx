import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Tag as TagIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFilters, useTags, useSelection, useApp } from '../context';
import { categories } from '../data/categories';

export const AdvancedFilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFilters();
  const { tags } = useTags();
  const { selectedIds } = useSelection();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = Object.values(filters).some(v =>
    v !== '' && v !== 'Tous' && v !== null && v !== false && (Array.isArray(v) ? v.length > 0 : true)
  );

  return (
    <div className="mb-8 space-y-4">
      {/* Main search bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou marque..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white bg-gray-800 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="px-6 py-4 rounded-2xl bg-white bg-gray-800 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 cursor-pointer"
          >
            <option value="Tous">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Advanced toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`
              px-6 py-4 rounded-2xl font-semibold border transition-all flex items-center gap-2
              ${hasActiveFilters || showAdvanced
                ? 'bg-beauty-accent text-white border-beauty-accent'
                : 'bg-white bg-gray-800 text-gray-700 text-gray-200 border-beauty-soft border-gray-700 hover:border-beauty-accent'
              }
            `}
          >
            <SlidersHorizontal size={20} />
            Filtres
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white/30 rounded-full text-xs flex items-center justify-center">
                {Object.values(filters).filter(v => v !== '' && v !== 'Tous' && v !== null && v !== false && (Array.isArray(v) ? v.length > 0 : true)).length}
              </span>
            )}
            <ChevronDown className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} size={16} />
          </motion.button>

          {/* Clear all */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetFilters}
              className="px-4 py-4 rounded-2xl bg-gray-100 bg-gray-700 text-gray-600 text-gray-300 hover:bg-gray-200 hover:bg-gray-600 transition-colors"
            >
              <X size={20} />
            </motion.button>
          )}

          {/* Selection count */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-4 rounded-2xl bg-pink-100 bg-pink-900/30 text-pink-700 text-pink-300 font-bold border border-pink-200 border-pink-800">
              {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white bg-gray-800 rounded-2xl border border-beauty-soft border-gray-700 p-6 space-y-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Brand filter */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 text-gray-300 uppercase tracking-wider">Marque</label>
                  <input
                    type="text"
                    placeholder="Ex: L'Oréal"
                    value={filters.brand}
                    onChange={(e) => setFilters({ brand: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-beauty-base bg-gray-900 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                  />
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 text-gray-300 uppercase tracking-wider">Prix (FCFA)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin ?? ''}
                      onChange={(e) => setFilters({ priceMin: e.target.value ? Number(e.target.value) : null })}
                      className="w-1/2 px-4 py-3 rounded-xl bg-beauty-base bg-gray-900 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax ?? ''}
                      onChange={(e) => setFilters({ priceMax: e.target.value ? Number(e.target.value) : null })}
                      className="w-1/2 px-4 py-3 rounded-xl bg-beauty-base bg-gray-900 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                    />
                  </div>
                </div>

                {/* Learning status */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 text-gray-300 uppercase tracking-wider">Statut</label>
                  <select
                    value={filters.learningStatus}
                    onChange={(e) => setFilters({ learningStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-beauty-base bg-gray-900 border border-beauty-soft border-gray-700 text-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                  >
                    <option value="Tous">Tous</option>
                    <option value="à-apprendre">À apprendre</option>
                    <option value="en-cours">En cours</option>
                    <option value="maîtrisé">Maîtrisé</option>
                  </select>
                </div>

                {/* Tags filter */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 text-gray-300 uppercase tracking-wider">Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-12 overflow-y-auto">
                    {tags.slice(0, 4).map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag.id)
                            ? filters.tags.filter(t => t !== tag.id)
                            : [...filters.tags, tag.id];
                          setFilters({ tags: newTags });
                        }}
                        className={`
                          px-3 py-1 rounded-full text-xs font-bold transition-all
                          ${filters.tags.includes(tag.id)
                            ? 'ring-2 ring-offset-2'
                            : 'opacity-70 hover:opacity-100'
                          }
                        `}
                        style={{
                          backgroundColor: tag.color,
                          color: 'white',
                          '--tw-ring-color': tag.color
                        } as React.CSSProperties}
                      >
                        {tag.name}
                      </button>
                    ))}
                    {tags.length > 4 && (
                      <span className="px-2 text-xs text-gray-500">+{tags.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active filters chips */}
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <FilterChip
                    label={`Recherche: "${filters.search}"`}
                    onRemove={() => setFilters({ search: '' })}
                  />
                )}
                {filters.brand && (
                  <FilterChip
                    label={`Marque: ${filters.brand}`}
                    onRemove={() => setFilters({ brand: '' })}
                  />
                )}
                {filters.priceMin !== null && (
                  <FilterChip
                    label={`Prix min: ${filters.priceMin} FCFA`}
                    onRemove={() => setFilters({ priceMin: null })}
                  />
                )}
                {filters.priceMax !== null && (
                  <FilterChip
                    label={`Prix max: ${filters.priceMax} FCFA`}
                    onRemove={() => setFilters({ priceMax: null })}
                  />
                )}
                {filters.favoritesOnly && (
                  <FilterChip
                    label="Favoris uniquement"
                    onRemove={() => setFilters({ favoritesOnly: false })}
                  />
                )}
                {filters.learningStatus !== 'Tous' && (
                  <FilterChip
                    label={`Statut: ${filters.learningStatus}`}
                    onRemove={() => setFilters({ learningStatus: 'Tous' })}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 text-gray-400">
        <span>
          {selectedIds.length === 0 && `${useApp().state.products.length} produits`}
          {selectedIds.length > 0 && `${selectedIds.length} sur ${useApp().state.products.length} sélectionnés`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-beauty-accent hover:underline font-medium"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
};

const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="inline-flex items-center gap-1 px-3 py-1 bg-beauty-soft bg-gray-700 text-gray-700 text-gray-300 rounded-full text-sm font-medium"
  >
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors">
      <X size={14} />
    </button>
  </motion.span>
);
