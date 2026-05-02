import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useState } from 'react';
import { Product } from '../types';
import StorageService, { AppSettings, HistoryAction, ProductTemplate, Tag } from '../services/storageService';
import { productService } from '../services/productService';
import { useNotifications } from '../contexts/NotificationContext';
import { produce } from 'immer';

// State
interface AppState {
  products: Product[];
  settings: AppSettings;
  selectedIds: string[];
  filters: {
    search: string;
    category: string;
    brand: string;
    priceMin: number | null;
    priceMax: number | null;
    favoritesOnly: boolean;
    learningStatus: string;
    tags: string[];
  };
  tags: Tag[];
  templates: ProductTemplate[];
  history: HistoryAction[];
  comparisonIds: string[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string; isFavorite: boolean } }
  | { type: 'BULK_UPDATE'; payload: { ids: string; updates: Partial<Product> } }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SELECT_PRODUCTS'; payload: string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'TOGGLE_SELECT'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'ADD_TO_COMPARISON'; payload: string }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'ASSIGN_TAG'; payload: { tagId: string; productId: string } }
  | { type: 'UNASSIGN_TAG'; payload: { tagId: string; productId: string } }
  | { type: 'ADD_TEMPLATE'; payload: ProductTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: ProductTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const defaultFilters = {
  search: '',
  category: 'Tous',
  brand: '',
  priceMin: null,
  priceMax: null,
  favoritesOnly: false,
  learningStatus: 'Tous',
  tags: [] as string[]
};

const initialState: AppState = {
  products: [],
  settings: StorageService.getDefaultSettings(),
  selectedIds: [],
  filters: defaultFilters,
  tags: [],
  templates: StorageService.getTemplates(),
  history: StorageService.getHistory(),
  comparisonIds: [],
  isLoading: false,
  error: null
};

// Reducer with Immer for immutability
function appReducer(state: AppState, action: Action): AppState {
  return produce(state, draft => {
    switch (action.type) {
      case 'SET_PRODUCTS':
        draft.products = action.payload;
        break;

      case 'ADD_PRODUCT':
        draft.products.unshift(action.payload);
        break;

      case 'UPDATE_PRODUCT':
        draft.products = draft.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        );
        break;

      case 'DELETE_PRODUCT':
        draft.products = draft.products.filter(p => p.id !== action.payload);
        draft.selectedIds = draft.selectedIds.filter(id => id !== action.payload);
        break;

      case 'TOGGLE_FAVORITE':
        draft.products = draft.products.map(p =>
          p.id === action.payload.id ? { ...p, is_favorite: action.payload.isFavorite } : p
        );
        break;

      case 'BULK_UPDATE':
        draft.products = draft.products.map(p =>
          action.payload.ids.includes(p.id) ? { ...p, ...action.payload.updates } : p
        );
        break;

      case 'BULK_DELETE':
        draft.products = draft.products.filter(p => !action.payload.includes(p.id));
        draft.selectedIds = draft.selectedIds.filter(id => !action.payload.includes(id));
        break;

      case 'SET_LOADING':
        draft.isLoading = action.payload;
        break;

      case 'SET_ERROR':
        draft.error = action.payload;
        break;

      case 'SET_FILTERS':
        draft.filters = { ...draft.filters, ...action.payload };
        break;

      case 'RESET_FILTERS':
        draft.filters = defaultFilters;
        break;

      case 'SELECT_PRODUCTS':
        draft.selectedIds = action.payload;
        break;

      case 'DESELECT_ALL':
        draft.selectedIds = [];
        break;

      case 'TOGGLE_SELECT':
        if (draft.selectedIds.includes(action.payload)) {
          draft.selectedIds = draft.selectedIds.filter(id => id !== action.payload);
        } else {
          draft.selectedIds.push(action.payload);
        }
        break;

      case 'SELECT_ALL':
        draft.selectedIds = draft.products.map(p => p.id);
        break;

      case 'ADD_TO_COMPARISON':
        if (!draft.comparisonIds.includes(action.payload) && draft.comparisonIds.length < 3) {
          draft.comparisonIds.push(action.payload);
        }
        break;

      case 'REMOVE_FROM_COMPARISON':
        draft.comparisonIds = draft.comparisonIds.filter(id => id !== action.payload);
        break;

      case 'CLEAR_COMPARISON':
        draft.comparisonIds = [];
        break;

      case 'ADD_TAG':
        draft.tags.push(action.payload);
        break;

      case 'REMOVE_TAG':
        draft.tags = draft.tags.filter(t => t.id !== action.payload);
        // Also remove tag from all products
        draft.products.forEach(p => {
          if (p.tags) {
            p.tags = p.tags.filter(tagId => tagId !== action.payload);
          }
        });
        break;

      case 'UPDATE_TAG':
        draft.tags = draft.tags.map(t =>
          t.id === action.payload.id ? action.payload : t
        );
        break;

      case 'ASSIGN_TAG':
        const productIndex = draft.products.findIndex(p => p.id === action.payload.productId);
        if (productIndex !== -1) {
          if (!draft.products[productIndex].tags) {
            draft.products[productIndex].tags = [];
          }
          if (!draft.products[productIndex].tags?.includes(action.payload.tagId)) {
            draft.products[productIndex].tags?.push(action.payload.tagId);
          }
        }
        const tagIndex = draft.tags.findIndex(t => t.id === action.payload.tagId);
        if (tagIndex !== -1 && !draft.tags[tagIndex].productIds.includes(action.payload.productId)) {
          draft.tags[tagIndex].productIds.push(action.payload.productId);
        }
        break;

      case 'UNASSIGN_TAG':
        const prodIndex = draft.products.findIndex(p => p.id === action.payload.productId);
        if (prodIndex !== -1 && draft.products[prodIndex].tags) {
          draft.products[prodIndex].tags = draft.products[prodIndex].tags?.filter(
            tagId => tagId !== action.payload.tagId
          );
        }
        const tgIndex = draft.tags.findIndex(t => t.id === action.payload.tagId);
        if (tgIndex !== -1) {
          draft.tags[tgIndex].productIds = draft.tags[tgIndex].productIds.filter(
            id => id !== action.payload.productId
          );
        }
        break;

      case 'ADD_TEMPLATE':
        draft.templates.push(action.payload);
        break;

      case 'UPDATE_TEMPLATE':
        draft.templates = draft.templates.map(t =>
          t.id === action.payload.id ? action.payload : t
        );
        break;

      case 'DELETE_TEMPLATE':
        draft.templates = draft.templates.filter(t => t.id !== action.payload);
        break;

      case 'SET_SETTINGS':
        draft.settings = action.payload;
        break;

      case 'LOAD_STATE':
        Object.assign(draft, action.payload);
        break;

      default:
        break;
    }
  });
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience methods
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkUpdate: (ids: string[], updates: Partial<Product>) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  applyTemplate: (templateId: string, overrides?: Partial<Product>) => Partial<Product>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const notify = useNotifications();
  const [historyPointer, setHistoryPointer] = useState(StorageService.getHistory().length - 1);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [products, settings, tags, templates, history] = await Promise.all([
          productService.getAll(),
          Promise.resolve(StorageService.getSettings()),
          Promise.resolve(StorageService.getTags()),
          Promise.resolve(StorageService.getTemplates()),
          Promise.resolve(StorageService.getHistory())
        ]);

        dispatch({
          type: 'LOAD_STATE',
          payload: {
            products,
            settings,
            tags,
            templates,
            history: history.slice(-50) // Keep last 50
          }
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Persist to localStorage when state changes
  useEffect(() => {
    StorageService.saveProducts(state.products);
  }, [state.products]);

  useEffect(() => {
    StorageService.saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    StorageService.saveTags(state.tags);
  }, [state.tags]);

  useEffect(() => {
    StorageService.saveTemplates(state.templates);
  }, [state.templates]);

  // Actions with history
  const recordAction = useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    const fullAction: HistoryAction = {
      ...action,
      timestamp: Date.now()
    };
    StorageService.addToHistory(fullAction);
    setHistoryPointer(prev => prev + 1);
  }, []);

  const refreshProducts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const products = await productService.getAll();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.create(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      recordAction({ type: 'create', productId: newProduct.id, newState: newProduct });
      notify.success('Produit créé', `${newProduct.name} ajouté`);
    } catch (error) {
      notify.error('Erreur', 'Impossible de créer le produit');
      throw error;
    }
  }, [notify, recordAction]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const previous = state.products.find(p => p.id === id);
    if (!previous) return;

    try {
      const updated = await productService.update(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      recordAction({ type: 'update', productId: id, previousState: previous, newState: updated });
      notify.update('Modifié', 'Produit mis à jour');
    } catch (error) {
      notify.error('Erreur', 'Impossible de modifier');
      throw error;
    }
  }, [state.products, notify, recordAction]);

  const deleteProduct = useCallback(async (id: string) => {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    try {
      await productService.delete(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      recordAction({ type: 'delete', productId: id, previousState: product });
      notify.delete('Supprimé', `${product.name} supprimé`);
    } catch (error) {
      notify.error('Erreur', 'Impossible de supprimer');
      throw error;
    }
  }, [state.products, notify, recordAction]);

  const toggleFavorite = useCallback(async (id: string) => {
    const product = state.products.find(p => p.id === id);
    if (!product) return;

    const previous = product.isFavorite;
    const newValue = !previous;

    try {
      const updated = await productService.toggleFavorite(id, newValue);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: { id, isFavorite: newValue } });
      recordAction({
        type: 'toggle_favorite',
        productId: id,
        previousState: { ...product, isFavorite: previous },
        newState: { ...product, isFavorite: newValue }
      });
      notify.success('Favori', newValue ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch (error) {
      notify.error('Erreur', 'Impossible de modifier le favori');
      throw error;
    }
  }, [state.products, notify, recordAction]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    const products = state.products.filter(p => ids.includes(p.id));
    const previousState = products.map(p => ({ ...p }));

    try {
      await Promise.all(ids.map(id => productService.delete(id)));
      dispatch({ type: 'BULK_DELETE', payload: ids });
      recordAction({
        type: 'bulk',
        previousState: previousState.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
      });
      notify.success('Suppression', `${ids.length} produit(s) supprimé(s)`);
    } catch (error) {
      notify.error('Erreur', 'Suppression échouée');
      throw error;
    }
  }, [state.products, notify, recordAction]);

  const bulkUpdate = useCallback(async (ids: string[], updates: Partial<SupabaseProduct>) => {
    const previousState = state.products
      .filter(p => ids.includes(p.id))
      .reduce((acc, p) => ({ ...acc, [p.id]: { ...p } }), {});

    try {
      await Promise.all(ids.map(id => productService.update(id, updates)));
      dispatch({ type: 'BULK_UPDATE', payload: { ids, updates } });
      recordAction({ type: 'bulk', previousState });
      notify.success('Mis à jour', `${ids.length} produit(s) modifié(s)`);
    } catch (error) {
      notify.error('Erreur', 'Mise à jour échouée');
      throw error;
    }
  }, [state.products, notify, recordAction]);

  const undo = useCallback(() => {
    // TODO: Implement undo using history
    notify.info('Undo', 'Fonctionnalité à venir');
  }, [notify]);

  const redo = useCallback(() => {
    // TODO: Implement redo using history
    notify.info('Redo', 'Fonctionnalité à venir');
  }, [notify]);

  const applyTemplate = useCallback((templateId: string, overrides?: Partial<SupabaseProduct>): Partial<SupabaseProduct> => {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return {};

    return {
      ...template.defaultValues,
      ...overrides,
      category: template.category
    };
  }, [state.templates]);

  const value: AppContextType = {
    state,
    dispatch,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleFavorite,
    bulkDelete,
    bulkUpdate,
    undo,
    redo,
    canUndo: historyPointer > 0,
    canRedo: historyPointer < state.history.length - 1,
    applyTemplate
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selector hooks
export const useProducts = () => {
  const { state, refreshProducts, addProduct, updateProduct, deleteProduct, toggleFavorite } = useApp();
  return {
    products: state.products,
    loading: state.isLoading,
    error: state.error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleFavorite
  };
};

export const useSelection = () => {
  const { state, dispatch } = useApp();
  return {
    selectedIds: state.selectedIds,
    isSelected: (id: string) => state.selectedIds.includes(id),
    toggleSelect: (id: string) => dispatch({ type: 'TOGGLE_SELECT', payload: id }),
    selectAll: () => dispatch({ type: 'SELECT_ALL' }),
    deselectAll: () => dispatch({ type: 'DESELECT_ALL' }),
    setSelected: (ids: string[]) => dispatch({ type: 'SELECT_PRODUCTS', payload: ids })
  };
};

export const useFilters = () => {
  const { state, dispatch } = useApp();
  return {
    filters: state.filters,
    setFilters: (filters: Partial<typeof state.filters>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' })
  };
};

export const useTags = () => {
  const { state, dispatch } = useApp();
  return {
    tags: state.tags,
    addTag: (tag: Tag) => dispatch({ type: 'ADD_TAG', payload: tag }),
    removeTag: (id: string) => dispatch({ type: 'REMOVE_TAG', payload: id }),
    updateTag: (tag: Tag) => dispatch({ type: 'UPDATE_TAG', payload: tag }),
    assignTag: (tagId: string, productId: string) => dispatch({ type: 'ASSIGN_TAG', payload: { tagId, productId } }),
    unassignTag: (tagId: string, productId: string) => dispatch({ type: 'UNASSIGN_TAG', payload: { tagId, productId } })
  };
};

export const useTemplates = () => {
  const { state, dispatch } = useApp();
  return {
    templates: state.templates,
    addTemplate: (template: ProductTemplate) => dispatch({ type: 'ADD_TEMPLATE', payload: template }),
    updateTemplate: (template: ProductTemplate) => dispatch({ type: 'UPDATE_TEMPLATE', payload: template }),
    deleteTemplate: (id: string) => dispatch({ type: 'DELETE_TEMPLATE', payload: id })
  };
};

export const useComparison = () => {
  const { state, dispatch } = useApp();
  return {
    comparisonIds: state.comparisonIds,
    comparisonProducts: state.products.filter(p => state.comparisonIds.includes(p.id)),
    addToComparison: (id: string) => dispatch({ type: 'ADD_TO_COMPARISON', payload: id }),
    removeFromComparison: (id: string) => dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: id }),
    clearComparison: () => dispatch({ type: 'CLEAR_COMPARISON' })
  };
};

export const useSettings = () => {
  const { state, dispatch } = useApp();
  return {
    settings: state.settings,
    updateSettings: (settings: Partial<AppSettings>) => dispatch({ type: 'SET_SETTINGS', payload: { ...state.settings, ...settings } })
  };
};
