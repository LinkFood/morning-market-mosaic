import { supabase } from "@/integrations/supabase/client";
import { FeatureFlags, DEFAULT_FLAGS } from './features/types';
import { Json } from '@/integrations/supabase/types';

/**
 * App Settings Service
 * Manages application settings stored in Supabase
 */

// Type for settings that can be stored in app_settings table
export type AppSettingKey = 'feature_flags' | 'dashboard_layout' | 'theme_preferences';

/**
 * Initialize the app_settings table if it doesn't exist
 * This function should be called during application startup
 */
export async function initializeAppSettingsTable(): Promise<boolean> {
  try {
    // Check if table exists by attempting to query it
    const { error } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking app_settings table:', error.message);
      
      // If the table doesn't exist, we need to create it
      // Since we don't have direct SQL execution access in the client,
      // we'll show an error message instructing the user to create the table manually
      console.error(`
Please create the app_settings table in your Supabase project with the following SQL:

CREATE TABLE IF NOT EXISTS public.app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by key
CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings (key);

-- Add RLS policies to allow authorized access
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Default initial settings for feature flags
INSERT INTO public.app_settings (key, value, description)
VALUES (
  'feature_flags',
  '${JSON.stringify(DEFAULT_FLAGS)}',
  'Application feature flags configuration'
) ON CONFLICT (key) DO NOTHING;
      `);
      
      return false;
    }
    
    // Check if feature_flags setting exists, create if not
    await ensureFeatureFlags();
    return true;
  } catch (error) {
    console.error('Error initializing app_settings:', error);
    return false;
  }
}

/**
 * Get a setting from the app_settings table
 */
export async function getSetting<T extends Json>(key: AppSettingKey): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error(`Error getting setting "${key}":`, error.message);
      return null;
    }
    
    return data?.value as T || null;
  } catch (error) {
    console.error(`Error getting setting "${key}":`, error);
    return null;
  }
}

/**
 * Update a setting in the app_settings table
 */
export async function updateSetting<T extends Json>(
  key: AppSettingKey, 
  value: T, 
  description?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        description: description || undefined,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });
    
    if (error) {
      console.error(`Error updating setting "${key}":`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating setting "${key}":`, error);
    return false;
  }
}

/**
 * Delete a setting from the app_settings table
 */
export async function deleteSetting(key: AppSettingKey): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_settings')
      .delete()
      .eq('key', key);
    
    if (error) {
      console.error(`Error deleting setting "${key}":`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting setting "${key}":`, error);
    return false;
  }
}

/**
 * Ensure feature flags setting exists
 */
async function ensureFeatureFlags(): Promise<void> {
  // Check if feature_flags setting exists
  const existingFlags = await getSetting<FeatureFlags>('feature_flags');
  
  if (!existingFlags) {
    // Create feature_flags setting with default values
    await updateSetting<FeatureFlags>(
      'feature_flags',
      DEFAULT_FLAGS,
      'Application feature flags configuration'
    );
    
    console.log('Feature flags initialized with default values');
  }
}

/**
 * Get feature flags from the app_settings table
 */
export async function getFeatureFlagsFromDB(): Promise<FeatureFlags | null> {
  const flags = await getSetting<Record<string, boolean>>('feature_flags');
  if (!flags) return null;
  
  // Convert from Record<string, boolean> to FeatureFlags
  return {
    useRealTimeData: flags.useRealTimeData ?? DEFAULT_FLAGS.useRealTimeData,
    showMarketMovers: flags.showMarketMovers ?? DEFAULT_FLAGS.showMarketMovers,
    enableDetailedCharts: flags.enableDetailedCharts ?? DEFAULT_FLAGS.enableDetailedCharts,
    enableNewsSection: flags.enableNewsSection ?? DEFAULT_FLAGS.enableNewsSection,
    useFredEconomicData: flags.useFredEconomicData ?? DEFAULT_FLAGS.useFredEconomicData,
    enableDataRefresh: flags.enableDataRefresh ?? DEFAULT_FLAGS.enableDataRefresh,
    useStockPickerAlgorithm: flags.useStockPickerAlgorithm ?? DEFAULT_FLAGS.useStockPickerAlgorithm,
    useAIStockAnalysis: flags.useAIStockAnalysis ?? DEFAULT_FLAGS.useAIStockAnalysis
  };
}

/**
 * Update feature flags in the app_settings table
 */
export async function updateFeatureFlagsInDB(flags: FeatureFlags): Promise<boolean> {
  // Convert FeatureFlags to a Record that can be stored as Json
  const flagsRecord: Record<string, boolean> = {
    useRealTimeData: flags.useRealTimeData,
    showMarketMovers: flags.showMarketMovers,
    enableDetailedCharts: flags.enableDetailedCharts,
    enableNewsSection: flags.enableNewsSection,
    useFredEconomicData: flags.useFredEconomicData,
    enableDataRefresh: flags.enableDataRefresh,
    useStockPickerAlgorithm: flags.useStockPickerAlgorithm,
    useAIStockAnalysis: flags.useAIStockAnalysis
  };
  
  return updateSetting<Record<string, boolean>>(
    'feature_flags',
    flagsRecord,
    'Application feature flags configuration'
  );
}

export default {
  initializeAppSettingsTable,
  getSetting,
  updateSetting,
  deleteSetting,
  getFeatureFlagsFromDB,
  updateFeatureFlagsInDB
};
