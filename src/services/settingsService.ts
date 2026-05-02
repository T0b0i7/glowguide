import { supabase } from '../lib/supabase';
import { AppSettings } from './storageService';

const SETTINGS_TABLE = 'app_settings';

export const settingsService = {
  async getSettings(): Promise<Partial<AppSettings> | null> {
    try {
      const { data, error } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Row not found
          return null;
        }
        console.error('Error fetching settings:', error);
        return null;
      }

      return {
        catalogName: data.catalog_name,
        // Add other settings if needed
      };
    } catch (err) {
      console.error('Failed to fetch settings from DB:', err);
      return null;
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const updateData: any = {};
      if (settings.catalogName !== undefined) updateData.catalog_name = settings.catalogName;
      
      const { error } = await supabase
        .from(SETTINGS_TABLE)
        .upsert({ id: 1, ...updateData, updated_at: new Date().toISOString() });

      if (error) {
        // If it's a permission error, don't throw, just log it once
        if (error.code === '42501' || error.message?.includes('permission')) {
          console.warn('DB Settings Sync: Permission denied (check RLS policies)');
          return;
        }
        throw error;
      }
    } catch (err) {
      // Fail silently to avoid crashing the app, rely on localStorage fallback
      console.warn('DB Settings Sync: Failed to save to Supabase, using local storage instead.');
    }
  }
};
