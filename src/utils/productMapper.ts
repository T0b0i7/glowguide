import { SupabaseProduct } from '../types";

export const productMapper = {
  // Convert from Supabase (snake_case) to UI (camelCase)
  fromSupabase(data: any): SupabaseProduct {
    return {
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
    };
  },

  // Convert from UI (camelCase) to Supabase (snake_case)
  toSupabase(data: Partial<SupabaseProduct>): any {
    return {
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
    };
  }
};
