/**
 * Feature Flags Service
 * Provides a centralized way to manage feature flags in the application
 */

/**
 * Get all feature flags
 * @returns Dictionary of feature flags and their values
 */
export function getFeatureFlags() {
  return {
    // Market Data Features
    showMarketMovers: true,
    useStockPickerAlgorithm: true,
    useAIStockAnalysis: true,
    useFredEconomicData: true,
    
    // UI Features
    enableDarkMode: true,
    enableAnimations: true,
    
    // Experimental Features
    useRealtimeUpdates: false,
    showExperimentalCharts: false,
    
    // Mobile Features
    useTouchGestures: true,
    useBatteryOptimization: true,
    
    // Debug Features
    showDebugInfo: false,
    
    // User-specific Features
    allowCustomWatchlists: true,
    allowThemeCustomization: true
  };
}

/**
 * Check if a feature is enabled
 * @param featureName Name of the feature to check
 * @returns True if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(featureName: string): boolean {
  const flags = getFeatureFlags();
  return flags[featureName] === true;
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
