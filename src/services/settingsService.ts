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
        .maybeSingle(); // Plus robuste que single()

      if (error) {
        console.error('Error fetching settings:', error);
        return null;
      }

      if (!data) return null;

      return {
        catalogName: data.catalog_name,
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
      
      // On s'assure d'avoir l'ID 1 pour la ligne unique de réglages
      const { error } = await supabase
        .from(SETTINGS_TABLE)
        .upsert(
          { id: 1, ...updateData, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Supabase Save Error:', error);
        throw error;
      }
      
      console.log('Settings successfully synced to Supabase');
    } catch (err) {
      console.warn('DB Settings Sync Failed. Keeping local changes only.', err);
      // On ne jette pas d'erreur pour ne pas bloquer l'UI, mais on logge l'erreur précise
    }
  }
};
