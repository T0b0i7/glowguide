import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, PlusCircle, BarChart3, Moon, Sun, Settings, Download, Upload, GitCompare } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp, useSettings } from '../context';
import { ExportImportModal } from './ExportImportModal';
import { ComparisonTable } from './ComparisonTable';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { settings, updateSettings } = useSettings();
  const { state } = useApp();
  const [showExportImport, setShowExportImport] = React.useState(false);
  const [showComparison, setShowComparison] = React.useState(false);

  const navItems = [
    { name: 'Catalogue', path: '/', icon: BookOpen },
    { name: 'Tableau de Bord', path: '/dashboard', icon: BarChart3 },
    { name: 'Ajouter', path: '/add', icon: PlusCircle },
  ];

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-beauty-soft dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-br from-beauty-accent to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <span className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            GlowGuide
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {/* Navigation items */}
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
                    : 'text-gray-600 dark:text-gray-300 hover:bg-beauty-soft dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Comparison */}
            {state.comparisonIds.length > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComparison(true)}
                className="relative px-4 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl font-semibold border-2 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all flex items-center gap-2"
              >
                <GitCompare size={18} />
                <span className="hidden sm:inline">Comparer</span>
                <span className="w-5 h-5 bg-emerald-500 text-white rounded-full text-xs flex items-center justify-center">
                  {state.comparisonIds.length}
                </span>
              </motion.button>
            )}

            {/* Dark mode toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-beauty-base dark:bg-gray-800 text-gray-600 dark:text-yellow-400 border border-beauty-soft dark:border-gray-700 hover:bg-beauty-soft dark:hover:bg-gray-700 transition-all"
              title={settings.darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Settings / Export */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowExportImport(true)}
              className="p-2.5 rounded-xl bg-beauty-base dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-beauty-soft dark:border-gray-700 hover:bg-beauty-soft dark:hover:bg-gray-700 transition-all"
              title="Exporter / Importer"
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExportImportModal
        isOpen={showExportImport}
        onClose={() => setShowExportImport(false)}
      />

      <ComparisonTable
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </nav>
  );
};