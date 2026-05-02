import { supabase } from '../lib/supabase';
import { SupabaseProduct } from '../types';

const PRODUCTS_TABLE = 'products';

export const productService = {
  async getAll(): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<SupabaseProduct | null> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(product: Omit<SupabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseProduct> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SupabaseProduct>): Promise<SupabaseProduct> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<SupabaseProduct> {
    return this.update(id, { is_favorite: isFavorite });
  },

  async search(query: string): Promise<SupabaseProduct[]> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: PRODUCTS_TABLE }, callback)
      .subscribe();
  }
};