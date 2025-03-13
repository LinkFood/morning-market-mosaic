
/**
 * Feature Flags Service
 * Provides a centralized way to manage feature flags in the application
 */

// Import from the types file to avoid circular dependencies
import { FeatureFlags, ExtendedFeatureFlags } from './features/types';

// Re-export the FeatureFlags type
export type { FeatureFlags };

/**
 * Get all feature flags
 * @returns Dictionary of feature flags and their values
 */
export function getFeatureFlags(): ExtendedFeatureFlags {
  // Import dynamically to avoid circular dependencies
  const featureModule = require('./features');
  const coreFlags = featureModule.getFeatureFlags();
  
  return {
    ...coreFlags,
    
    // UI Features
    enableDarkMode: true,
    enableAnimations: true,
    
    // Experimental Features
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
  return flags[featureName as keyof ExtendedFeatureFlags] === true;
}

/**
 * Update a feature flag
 * @param featureName Name of the feature to update
 * @param enabled New value for the feature flag
 */
export function updateFeatureFlag(featureName: string, enabled: boolean) {
  // Dynamic import to avoid circular dependencies
  const featureModule = require('./features');
  
  if (featureName in featureModule.DEFAULT_FLAGS) {
    featureModule.setFeatureFlag(featureName as keyof FeatureFlags, enabled);
  }
  
  // In a real application, you would want to persist UI feature flag changes too
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
