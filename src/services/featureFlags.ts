
/**
 * Feature Flags Service
 * Provides a centralized way to manage feature flags in the application
 */

// Import the FeatureFlags interface from the features service
import { FeatureFlags } from './features';

// Re-export the FeatureFlags type
export type { FeatureFlags };

/**
 * Get all feature flags
 * @returns Dictionary of feature flags and their values
 */
export function getFeatureFlags(): FeatureFlags & {
  // Additional flags not in the core FeatureFlags interface
  enableDarkMode: boolean;
  enableAnimations: boolean;
  showExperimentalCharts: boolean;
  useTouchGestures: boolean;
  useBatteryOptimization: boolean;
  showDebugInfo: boolean;
  allowCustomWatchlists: boolean;
  allowThemeCustomization: boolean;
  useAIStockAnalysis: boolean; // Add this flag for AI stock analysis
} {
  return {
    // Core FeatureFlags from features service
    useRealTimeData: true,
    showMarketMovers: true,
    enableDetailedCharts: true,
    enableNewsSection: true,
    useFredEconomicData: true,
    enableDataRefresh: true,
    useStockPickerAlgorithm: true,
    
    // UI Features
    enableDarkMode: true,
    enableAnimations: true,
    
    // Experimental Features
    // Fixed property name from 'useRealtimeUpdates' to 'useRealTimeData'
    showExperimentalCharts: false,
    
    // Mobile Features
    useTouchGestures: true,
    useBatteryOptimization: true,
    
    // Debug Features
    showDebugInfo: false,
    
    // User-specific Features
    allowCustomWatchlists: true,
    allowThemeCustomization: true,
    
    // AI Analysis Feature
    useAIStockAnalysis: true
  };
}

/**
 * Check if a feature is enabled
 * @param featureName Name of the feature to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(featureName: string): boolean {
  const flags = getFeatureFlags();
  return flags[featureName as keyof ReturnType<typeof getFeatureFlags>] === true;
}

/**
 * Update a feature flag
 * @param featureName Name of the feature to update
 * @param enabled New value for the feature flag
 */
export function updateFeatureFlag(featureName: string, enabled: boolean) {
  // In a real application, you would want to persist these changes to a database or configuration file
  console.log(`Feature flag ${featureName} updated to ${enabled}`);
  
  // Dispatch a custom event to notify components of the change
  const event = new CustomEvent('feature_flags_updated');
  window.dispatchEvent(event);
}

export default {
  getFeatureFlags,
  isFeatureEnabled,
  updateFeatureFlag
};
