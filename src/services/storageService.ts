import { SupabaseProduct } from '../types';

const PRODUCTS_KEY = 'glowguide-products';
const SETTINGS_KEY = 'glowguide-settings';
const HISTORY_KEY = 'glowguide-history';
const TAGS_KEY = 'glowguide-tags';
const TEMPLATES_KEY = 'glowguide-templates';

export interface AppSettings {
  darkMode: boolean;
  language: 'fr' | 'en';
  itemsPerPage: number;
  defaultSortBy: string;
  autoRefresh: boolean;
  notificationsEnabled: boolean;
}

export interface HistoryAction {
  type: 'create' | 'update' | 'delete' | 'favorite' | 'bulk';
  productId?: string;
  previousState?: Partial<SupabaseProduct>;
  newState?: Partial<SupabaseProduct>;
  timestamp: number;
}

export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  brand?: string;
  defaultValues: Partial<SupabaseProduct>;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  productIds: string[];
}

class StorageService {
  // Products
  static getProducts(): SupabaseProduct[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveProducts(products: SupabaseProduct[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  // Settings
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static getDefaultSettings(): AppSettings {
    return {
      darkMode: false,
      language: 'fr',
      itemsPerPage: 12,
      defaultSortBy: 'name',
      autoRefresh: true,
      notificationsEnabled: true
    };
  }

  // History (for undo/redo)
  static getHistory(): HistoryAction[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveHistory(history: HistoryAction[]): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  static addToHistory(action: HistoryAction): void {
    const history = this.getHistory();
    history.push(action);
    // Keep only last 50 actions
    if (history.length > 50) {
      history.shift();
    }
    this.saveHistory(history);
  }

  static clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  // Tags
  static getTags(): Tag[] {
    try {
      const data = localStorage.getItem(TAGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTags(tags: Tag[]): void {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }

  // Templates
  static getTemplates(): ProductTemplate[] {
    try {
      const data = localStorage.getItem(TEMPLATES_KEY);
      return data ? JSON.parse(data) : this.getDefaultTemplates();
    } catch {
      return this.getDefaultTemplates();
    }
  }

  static saveTemplates(templates: ProductTemplate[]): void {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }

  static getDefaultTemplates(): ProductTemplate[] {
    return [
      {
        id: 'default-cream',
        name: 'Crème Hydratante',
        category: 'Crème',
        defaultValues: {
          price: 15000,
          key_points: ['Hydratation intense', 'Texture légère', 'Convient à tous les types de peau'],
          notes: 'À personnaliser selon le produit'
        }
      },
      {
        id: 'default-serum',
        name: 'Sérum Anti-Âge',
        category: 'Sérum',
        defaultValues: {
          price: 25000,
          key_points: ['Rides visiblement réduites', 'Peau raffermie', 'Éclat restauré'],
          notes: 'À personnaliser selon le produit'
        }
      },
      {
        id: 'default-cleanser',
        name: 'Nettoyant Doux',
        category: 'Nettoyant',
        defaultValues: {
          price: 8000,
          key_points: ['Nettoie en profondeur', 'Respecte la barrière cutanée', 'Sans sulfate'],
          notes: 'À personnaliser selon le produit'
        }
      }
    ];
  }

  // Clear all data
  static clearAll(): void {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(TAGS_KEY);
    localStorage.removeItem(TEMPLATES_KEY);
  }

  // Export all data
  static exportAll(): string {
    const data = {
      products: this.getProducts(),
      settings: this.getSettings(),
      tags: this.getTags(),
      templates: this.getTemplates(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data
  static importAll(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.settings) this.saveSettings(data.settings);
      if (data.tags) this.saveTags(data.tags);
      if (data.templates) this.saveTemplates(data.templates);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}

export default StorageService;
