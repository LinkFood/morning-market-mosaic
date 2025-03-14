
/**
 * Feature Flag System
 * Controls which features are enabled based on API availability
 */

import { FeatureFlags, DEFAULT_FLAGS } from './types';

// Current feature flags
let currentFlags: FeatureFlags = { ...DEFAULT_FLAGS };

// Declare global window extension
declare global {
  interface Window {
    __FEATURE_FLAGS__?: FeatureFlags;
  }
}

/**
 * Update feature flags based on service availability
 * @param polygonApiAvailable Whether Polygon API is available
 * @param fredApiAvailable Whether FRED API is available
 * @param geminiApiAvailable Whether Gemini API is available
 */
export function updateFeatureFlags(
  polygonApiAvailable: boolean = true, 
  fredApiAvailable: boolean = true,
  geminiApiAvailable: boolean = false
): void {
  // Update flags based on API availability
  currentFlags = {
    ...DEFAULT_FLAGS,
    useRealTimeData: polygonApiAvailable,
    showMarketMovers: polygonApiAvailable,
    enableDetailedCharts: polygonApiAvailable,
    enableNewsSection: polygonApiAvailable,
    useFredEconomicData: fredApiAvailable,
    enableDataRefresh: polygonApiAvailable || fredApiAvailable,
    useStockPickerAlgorithm: polygonApiAvailable,  // Stock picker depends on Polygon API
    useAIStockAnalysis: geminiApiAvailable && polygonApiAvailable  // AI Analysis depends on both Polygon and Gemini APIs
  };
  
  // Force all flags to true during development to avoid issues
  if (import.meta.env.DEV) {
    Object.keys(currentFlags).forEach(key => {
      if (key !== 'useAIStockAnalysis') { // Only keep AI as optional
        currentFlags[key as keyof FeatureFlags] = true;
      }
    });
  }
  
  // Store in localStorage for persistence
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
  
  // Set global window variable for easy access
  window.__FEATURE_FLAGS__ = { ...currentFlags };
  
  console.log("Feature flags updated:", currentFlags);
  
  // Dispatch custom event so UI components can respond
  window.dispatchEvent(new CustomEvent('feature_flags_updated'));
}

/**
 * Initialize feature flags from localStorage or defaults
 */
export function initializeFeatureFlags(): void {
  try {
    // In development mode, always start with all features enabled
    if (import.meta.env.DEV) {
      console.log("Development mode: Initializing with all features enabled");
      
      // Start with all features enabled in dev mode
      currentFlags = { ...DEFAULT_FLAGS };
      Object.keys(currentFlags).forEach(key => {
        if (key !== 'useAIStockAnalysis') { // Only keep AI as optional
          currentFlags[key as keyof FeatureFlags] = true;
        }
      });
      
      // Set global window variable
      window.__FEATURE_FLAGS__ = { ...currentFlags };
      return;
    }
    
    // In production, use stored values
    const stored = localStorage.getItem('feature_flags');
    if (stored) {
      const parsed = JSON.parse(stored);
      currentFlags = { ...DEFAULT_FLAGS, ...parsed };
    }
    
    // Set global window variable for easy access
    window.__FEATURE_FLAGS__ = { ...currentFlags };
  } catch (error) {
    console.error("Error loading feature flags:", error);
    // Use defaults on error
    currentFlags = { ...DEFAULT_FLAGS };
    window.__FEATURE_FLAGS__ = { ...currentFlags };
  }
}

/**
 * Get current feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...currentFlags };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  // In development mode, almost all features are enabled
  if (import.meta.env.DEV && feature !== 'useAIStockAnalysis') {
    return true;
  }
  return currentFlags[feature];
}

/**
 * Manually override a feature flag (for testing or user preference)
 */
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
  currentFlags[feature] = enabled;
  
  // Update the global flags
  window.__FEATURE_FLAGS__ = { ...currentFlags };
  
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
  
  // Dispatch custom event so UI components can respond
  window.dispatchEvent(new CustomEvent('feature_flags_updated'));
}

// Initialize on module load
initializeFeatureFlags();

// Export types
export type { FeatureFlags };
export { DEFAULT_FLAGS };
