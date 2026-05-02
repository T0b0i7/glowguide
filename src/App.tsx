/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProductList } from './pages/ProductList';
import { ProductDetailsView } from './pages/ProductDetailsView';
import { AddProduct } from './pages/AddProduct';
import { EditProduct } from './pages/EditProduct';  // Add this import
import { Dashboard } from './pages/Dashboard';
import { ProductProvider } from './context/ProductContext';
import { AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <ProductProvider>
      <Router>
        <div className="min-h-screen bg-beauty-base selection:bg-beauty-soft selection:text-beauty-accent">
          <Navbar />
          <main className="py-6">
            <AnimatePresence mode="wait">
<Routes>
  <Route path="/" element={<ProductList />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/product/:id" element={<ProductDetailsView />} />
  <Route path="/add" element={<AddProduct />} />
  <Route path="/edit/:id" element={<EditProduct />} />  {/* Add this line */}
</Routes>
            </AnimatePresence>
          </main>
          
          <footer className="py-12 mt-20 border-t border-beauty-soft text-center">
            <p className="text-gray-400 text-sm font-medium">
              Conçu pour les Professionnels de la Beauté &bull; GlowGuide &copy; {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </Router>
    </ProductProvider>
  );
}