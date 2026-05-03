import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useMemo } from 'react';
import { Product, Tag, ProductTemplate } from '../types';
import { AppSettings, HistoryAction } from '../services/storageService';
import StorageService from '../services/storageService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { useNotifications } from '../contexts/NotificationContext';

interface AppState {
  products: Product[];
  settings: AppSettings;
  tags: Tag[];
  templates: ProductTemplate[];
  history: HistoryAction[];
  loading: boolean;
  error: string | null;
  comparisonIds: string[];
}

interface FilterState {
  search: string;
  category: string;
  brand: string;
  priceMin: number | null;
  priceMax: number | null;
  learningStatus: string;
  tags: string[];
  favoritesOnly: boolean;
}

const initialFilters: FilterState = {
  search: '',
  category: 'Tous',
  brand: '',
  priceMin: null,
  priceMax: null,
  learningStatus: 'Tous',
  tags: [],
  favoritesOnly: false,
};

type AppAction =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string; isFavorite: boolean } }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'BULK_UPDATE'; payload: { ids: string[]; updates: Partial<Product> } }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'ASSIGN_TAG'; payload: { tagId: string; productId: string } }
  | { type: 'UNASSIGN_TAG'; payload: { tagId: string; productId: string } }
  | { type: 'ADD_TEMPLATE'; payload: ProductTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: ProductTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_COMPARISON'; payload: string }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: string }
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'UNDO'; payload: Product[] }
  | { type: 'REDO'; payload: Product[] };

const initialState: AppState = {
  products: [],
  settings: StorageService.getSettings(),
  tags: StorageService.getTags(),
  templates: StorageService.getTemplates(),
  history: StorageService.getHistory(),
  loading: true,
  error: null,
  comparisonIds: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, isFavorite: action.payload.isFavorite } : p
        )
      };
    case 'BULK_DELETE':
      return {
        ...state,
        products: state.products.filter(p => !action.payload.includes(p.id))
      };
    case 'BULK_UPDATE':
      return {
        ...state,
        products: state.products.map(p =>
          action.payload.ids.includes(p.id) ? { ...p, ...action.payload.updates } : p
        )
      };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(t => t.id !== action.payload) };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'ASSIGN_TAG':
      return {
        ...state,
        tags: state.tags.map(t =>
          t.id === action.payload.tagId
            ? { ...t, productIds: [...new Set([...t.productIds, action.payload.productId])] }
            : t
        )
      };
    case 'UNASSIGN_TAG':
      return {
        ...state,
        tags: state.tags.map(t =>
          t.id === action.payload.tagId
            ? { ...t, productIds: t.productIds.filter(id => id !== action.payload.productId) }
            : t
        )
      };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TEMPLATE':
      return { ...state, templates: state.templates.filter(t => t.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_TO_COMPARISON':
      return {
        ...state,
        comparisonIds: [...new Set([...state.comparisonIds, action.payload])]
      };
    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        comparisonIds: state.comparisonIds.filter(id => id !== action.payload)
      };
    case 'CLEAR_COMPARISON':
      return { ...state, comparisonIds: [] };
    case 'UNDO':
    case 'REDO':
      return { ...state, products: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [filters, setFiltersState] = useState<FilterState>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const setFilters = useCallback((updates: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(initialFilters), []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const selectAll = useCallback((ids: string[]) => setSelectedIds(ids), []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const products = await productService.getAll();
        const settings = StorageService.getSettings();
        const tags = StorageService.getTags();
        const templates = StorageService.getTemplates();
        const history = StorageService.getHistory();

        const dbSettings = await settingsService.getSettings();
        const finalSettings = { ...settings };
        if (dbSettings && dbSettings.catalogName) {
          finalSettings.catalogName = dbSettings.catalogName;
        }

        dispatch({
          type: 'LOAD_STATE',
          payload: {
            products,
            settings: finalSettings,
            tags,
            templates,
            history: history.slice(-50)
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

  const value = useMemo(() => ({
    state,
    dispatch,
    filters,
    setFilters,
    resetFilters,
    selectedIds,
    toggleSelect,
    clearSelection,
    selectAll
  }), [state, filters, selectedIds, setFilters, resetFilters, toggleSelect, clearSelection, selectAll]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const useProducts = () => {
  const { state, dispatch } = useApp();
  const notify = useNotifications();

  const recordAction = useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    const fullAction: HistoryAction = {
      ...action,
      timestamp: Date.now()
    };
    StorageService.addToHistory(fullAction);
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.create(product as any);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      recordAction({ type: 'create', productId: newProduct.id, newState: newProduct });
      notify.success('Succès', 'Produit ajouté avec succès');
      return newProduct;
    } catch (error) {
      notify.error('Erreur', "Impossible d'ajouter le produit");
      throw error;
    }
  }, [dispatch, notify, recordAction]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const previous = state.products.find(p => p.id === id);
    try {
      const updated = await productService.update(id, updates as any);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      recordAction({ type: 'update', productId: id, previousState: previous, newState: updated });
      notify.success('Succès', 'Produit mis à jour');
      return updated;
    } catch (error) {
      notify.error('Erreur', "Impossible de mettre à jour le produit");
      throw error;
    }
  }, [state.products, dispatch, notify, recordAction]);

  const deleteProduct = useCallback(async (id: string) => {
    const previous = state.products.find(p => p.id === id);
    try {
      await productService.delete(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      recordAction({ type: 'delete', productId: id, previousState: previous });
      notify.success('Succès', 'Produit supprimé');
    } catch (error) {
      notify.error('Erreur', 'Impossible de supprimer le produit');
      throw error;
    }
  }, [state.products, dispatch, notify, recordAction]);

  const toggleFavorite = useCallback(async (id: string) => {
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    const previous = product.isFavorite;
    const newValue = !previous;
    try {
      await productService.toggleFavorite(id, newValue);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: { id, isFavorite: newValue } });
      recordAction({
        type: 'toggle_favorite',
        productId: id,
        previousState: { ...product, isFavorite: previous },
        newState: { ...product, isFavorite: newValue }
      });
      notify.success('Favori', newValue ? 'Ajouté' : 'Retiré');
    } catch (error) {
      notify.error('Erreur', 'Échec de la modification');
    }
  }, [state.products, dispatch, notify, recordAction]);

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleFavorite
  };
};

export const useSelection = () => {
  const { selectedIds, toggleSelect, clearSelection, selectAll } = useApp();
  return { selectedIds, toggleSelect, clearSelection, selectAll };
};

export const useFilters = () => {
  const { filters, setFilters, resetFilters } = useApp();
  return { filters, setFilters, resetFilters };
};

export const useSettings = () => {
  const { state, dispatch } = useApp();
  
  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    const newSettings = { ...state.settings, ...settings };
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    try {
      await settingsService.updateSettings(settings);
    } catch (err) {
      console.warn('DB Sync Failed:', err);
    }
  }, [state.settings, dispatch]);

  return {
    settings: state.settings,
    updateSettings
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
