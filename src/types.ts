export type Category = string;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  summary: string;
  ingredients: string;
  benefits: string;
  usage: string;
  targetSkin: string;
  contraindications: string;
  keyPoints: string[];
  notes: string;
  isFavorite?: boolean;
  learningStatus?: 'à-apprendre' | 'en-cours' | 'maîtrisé';
  imageUrl?: string;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  summary: string;
  ingredients: string;
  benefits: string;
  usage: string;
  target_skin: string;
  contraindications: string;
  key_points: string[];
  notes: string;
  is_favorite?: boolean;
  learning_status?: 'à-apprendre' | 'en-cours' | 'maîtrisé';
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}