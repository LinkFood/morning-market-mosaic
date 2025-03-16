
/**
 * Feature Flag System
 * Controls which features are enabled based on API availability
 * Supports both localStorage and Supabase database storage
 */

import { FeatureFlags, DEFAULT_FLAGS } from './types';
import appSettingsService from '../appSettings';

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
export async function updateFeatureFlags(
  polygonApiAvailable: boolean, 
  fredApiAvailable: boolean,
  geminiApiAvailable: boolean = false
): Promise<void> {
  // Update flags based on API availability
  const newFlags = {
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
  
  // Update current flags
  currentFlags = newFlags;
  
  // Store in localStorage for persistence and fallback
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
  
  // Set global window variable for easy access
  window.__FEATURE_FLAGS__ = { ...currentFlags };
  
  // Save to database if available
  try {
    await appSettingsService.updateFeatureFlagsInDB(newFlags);
  } catch (error) {
    console.warn("Failed to update feature flags in database, using localStorage only:", error);
    // No need to throw, since localStorage works as a fallback
  }
  
  console.log("Feature flags updated:", currentFlags);
}

/**
 * Initialize feature flags from database, localStorage, or defaults
 */
export async function initializeFeatureFlags(): Promise<void> {
  try {
    // Initialize app_settings table if needed
    await appSettingsService.initializeAppSettingsTable();
    
    // Try to get feature flags from database first
    const dbFlags = await appSettingsService.getFeatureFlagsFromDB();
    
    if (dbFlags) {
      // Use flags from database
      currentFlags = { ...DEFAULT_FLAGS, ...dbFlags };
      console.log("Feature flags loaded from database");
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem('feature_flags');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentFlags = { ...DEFAULT_FLAGS, ...parsed };
        console.log("Feature flags loaded from localStorage");
        
        // Save to database for future use
        await appSettingsService.updateFeatureFlagsInDB(currentFlags);
      } else {
        // Use defaults
        currentFlags = { ...DEFAULT_FLAGS };
        console.log("Using default feature flags");
        
        // Save defaults to database
        await appSettingsService.updateFeatureFlagsInDB(currentFlags);
      }
    }
    
    // Set global window variable for easy access
    window.__FEATURE_FLAGS__ = { ...currentFlags };
  } catch (error) {
    console.error("Error initializing feature flags:", error);
    // Use defaults on error
    currentFlags = { ...DEFAULT_FLAGS };
    window.__FEATURE_FLAGS__ = { ...currentFlags };
    
    // Store defaults in localStorage
    localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
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
  return currentFlags[feature];
}

/**
 * Manually override a feature flag (for testing or user preference)
 */
export async function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): Promise<void> {
  currentFlags[feature] = enabled;
  
  // Update the global flags
  window.__FEATURE_FLAGS__ = { ...currentFlags };
  
  // Update localStorage
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
  
  // Update database
  try {
    await appSettingsService.updateFeatureFlagsInDB(currentFlags);
  } catch (error) {
    console.warn(`Failed to update feature flag "${feature}" in database:`, error);
    // No need to throw, since localStorage works as a fallback
  }
}

// Export types
export type { FeatureFlags };
export { DEFAULT_FLAGS };
