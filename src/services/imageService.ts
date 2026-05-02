import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'product-images';

export const imageService = {
  async upload(file: File, productId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  },

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) throw error;
  },

  async getPublicUrl(path: string): Promise<string> {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};