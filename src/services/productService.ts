import { supabase } from '../lib/supabase';
import { Product } from '../types';

const PRODUCTS_TABLE = 'products';

// Map Supabase response (snake_case) to UI (camelCase)
const mapProduct = (data: any): Product => ({
  id: data.id,
  name: data.name,
  brand: data.brand,
  category: data.category,
  price: data.price,
  summary: data.summary || '',
  ingredients: data.ingredients || '',
  benefits: data.benefits || '',
  usage: data.usage || '',
  targetSkin: data.target_skin || '',
  contraindications: data.contraindications || '',
  keyPoints: Array.isArray(data.key_points) ? data.key_points : [],
  notes: data.notes || '',
  isFavorite: data.is_favorite || false,
  learningStatus: data.learning_status || 'à-apprendre',
  imageUrl: data.image_url || '',
  tags: data.tags || [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  createdBy: data.created_by,
  updatedBy: data.updated_by
});

// Map UI input (camelCase) to Supabase (snake_case)
const toSupabase = (data: Partial<Product>): any => ({
  ...data,
  target_skin: data.targetSkin,
  key_points: data.keyPoints,
  is_favorite: data.isFavorite,
  learning_status: data.learningStatus,
  image_url: data.imageUrl,
  created_at: data.createdAt,
  updated_at: data.updatedAt,
  created_by: data.createdBy,
  updated_by: data.updatedBy
});

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapProduct(data) : null;
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert([toSupabase(product)])
      .select()
      .single();

    if (error) throw error;
    return mapProduct(data);
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(toSupabase(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapProduct(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Product> {
    return this.update(id, { isFavorite });
  },

  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`);

    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: PRODUCTS_TABLE }, callback)
      .subscribe();
  }
};
