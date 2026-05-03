import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, PlusCircle, BarChart3, Settings, GitCompare, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context';
import { ExportImportModal } from './ExportImportModal';
import { ComparisonTable } from './ComparisonTable';
import { SettingsModal, useCatalogName } from './SettingsModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();
  const catalogName = useCatalogName();
  const [showExportImport, setShowExportImport] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Catalogue', path: '/', icon: BookOpen },
    { name: 'Tableau de Bord', path: '/dashboard', icon: BarChart3 },
    { name: 'Ajouter un Produit', path: '/add', icon: PlusCircle },
  ];

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b border-beauty-sand px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-beauty-accent to-beauty-bronze rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles size={16} className="text-white" />
            </motion.div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-beauty-dark">
              {catalogName}
            </span>
          </Link>

          {/* Navigation - Desktop Only */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-beauty-accent text-white shadow-md'
                      : 'text-beauty-text hover:bg-beauty-soft'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Action buttons & Hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {state.comparisonIds.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2.5 bg-beauty-success/20 text-beauty-success rounded-xl font-semibold border-2 border-beauty-success hover:bg-beauty-success hover:text-white transition-all flex items-center gap-2"
                >
                  <GitCompare size={18} />
                  <span className="hidden lg:inline">Comparer</span>
                  <span className="w-5 h-5 bg-beauty-success text-white rounded-full text-[10px] flex items-center justify-center">
                    {state.comparisonIds.length}
                  </span>
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-beauty-soft text-beauty-text border border-beauty-sand hover:bg-beauty-ecru hover:border-beauty-accent transition-all"
                title="Paramètres"
              >
                <Settings size={20} />
              </motion.button>
            </div>

            {/* Hamburger Button - Mobile Only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-beauty-soft text-beauty-dark border border-beauty-sand active:scale-90 transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Modals */}
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        <ExportImportModal isOpen={showExportImport} onClose={() => setShowExportImport(false)} />
        <ComparisonTable isOpen={showComparison} onClose={() => setShowComparison(false)} />
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white z-[80] shadow-2xl md:hidden p-6 pt-24"
            >
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold text-beauty-accent uppercase tracking-widest mb-2 px-4">Menu Principal</p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-beauty-accent text-white shadow-lg'
                          : 'text-beauty-dark hover:bg-beauty-soft'
                      }`}
                    >
                      <Icon size={22} />
                      {item.name}
                    </Link>
                  );
                })}

                <div className="h-px bg-beauty-sand my-4" />
                
                <p className="text-xs font-bold text-beauty-accent uppercase tracking-widest mb-2 px-4">Paramètres</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-semibold text-beauty-dark hover:bg-beauty-soft transition-all text-left w-full"
                >
                  <Settings size={22} />
                  Réglages du Catalogue
                </button>
                
                {state.comparisonIds.length > 0 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-semibold text-beauty-success bg-beauty-success/10 hover:bg-beauty-success/20 transition-all text-left w-full"
                  >
                    <GitCompare size={22} />
                    Comparer ({state.comparisonIds.length})
                  </button>
                )}
              </div>

              <div className="absolute bottom-10 left-6 right-6">
                <div className="p-6 bg-beauty-soft rounded-[32px] border border-beauty-sand">
                  <p className="text-xs text-beauty-text font-medium text-center">
                    GlowGuide v2.0<br/>Professionnel
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
