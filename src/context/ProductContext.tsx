import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SupabaseProduct } from '../types';
import { productService } from '../services/productService';

interface ProductContextType {
  products: SupabaseProduct[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<SupabaseProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct = await productService.create(product);
      setProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<SupabaseProduct>) => {
    try {
      const updated = await productService.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const toggleFavorite = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      await productService.toggleFavorite(id, !product.is_favorite);
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleFavorite
    }}>
      {children}
    </ProductContext.Provider>
  );
};