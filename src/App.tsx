import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProductList } from './pages/ProductList';
import { ProductDetailsView } from './pages/ProductDetailsView';
import { AddProduct } from './pages/AddProduct';
import { EditProduct } from './pages/EditProduct';
import { Dashboard } from './pages/Dashboard';
import { AppProvider, useSettings } from './context';
import { NotificationProvider } from './contexts/NotificationContext';
import { HistoryProvider } from './context/HistoryContext';
import { AnimatePresence } from 'motion/react';
import { ThemeController } from './components/ThemeController';
import { UndoRedoBar } from './components/UndoRedoBar';
import { useUrlSync } from './hooks/useUrlSync';
import { useServiceWorker } from './hooks/useServiceWorker';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { OfflineIndicator } from './components/OfflineIndicator';

function AppContent() {
  useUrlSync();
  useServiceWorker();
  useKeyboardShortcuts();

  return (
    <>
      <ThemeController />
      <Navbar />
      <OfflineIndicator />
      <main className="py-6">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product/:id" element={<ProductDetailsView />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/edit/:id" element={<EditProduct />} />
          </Routes>
        </AnimatePresence>
      </main>

      <UndoRedoBar />

      <footer className="py-12 mt-20 border-t border-beauty-soft dark:border-gray-700 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
          Conçu pour les Professionnels de la Beauté &bull; GlowGuide &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <HistoryProvider>
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-beauty-base dark:bg-gray-900 selection:bg-beauty-soft selection:text-beauty-accent transition-colors">
              <AppContent />
            </div>
          </Router>
        </AppProvider>
      </HistoryProvider>
    </NotificationProvider>
  );
}
