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
      <main className="py-12">
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

      <footer className="py-8 sm:py-12 mt-12 sm:mt-20 border-t border-beauty-sand text-center px-4">
        <p className="text-beauty-text/60 text-xs sm:text-sm font-medium">
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
            <div className="min-h-screen selection:bg-beauty-ecru selection:text-beauty-accent">
              <AppContent />
            </div>
          </Router>
        </AppProvider>
      </HistoryProvider>
    </NotificationProvider>
  );

}
