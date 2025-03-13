
/**
 * Feature Flag System
 * Controls which features are enabled based on API availability
 */

// Feature flag definitions
export interface FeatureFlags {
  useRealTimeData: boolean;    // Use real-time data instead of cached
  showMarketMovers: boolean;   // Show market movers section
  enableDetailedCharts: boolean; // Show enhanced charts with technical indicators
  enableNewsSection: boolean;  // Show financial news
  useFredEconomicData: boolean; // Use FRED API for economic data
  enableDataRefresh: boolean;  // Allow automatic data refresh
  useStockPickerAlgorithm: boolean; // Use algorithmic stock picking
  useAIStockAnalysis: boolean; // Use AI for stock analysis
}

// Default feature flags (everything enabled)
const DEFAULT_FLAGS: FeatureFlags = {
  useRealTimeData: true,
  showMarketMovers: true,
  enableDetailedCharts: true,
  enableNewsSection: true,
  useFredEconomicData: true,
  enableDataRefresh: true,
  useStockPickerAlgorithm: true,
  useAIStockAnalysis: true
};

// Current feature flags
let currentFlags: FeatureFlags = { ...DEFAULT_FLAGS };

/**
 * Update feature flags based on service availability
 * @param polygonApiAvailable Whether Polygon API is available
 * @param fredApiAvailable Whether FRED API is available
 * @param geminiApiAvailable Whether Gemini API is available
 */
export function updateFeatureFlags(
  polygonApiAvailable: boolean, 
  fredApiAvailable: boolean,
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
  
  // Store in localStorage for persistence
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
  
  console.log("Feature flags updated:", currentFlags);
}

/**
 * Initialize feature flags from localStorage or defaults
 */
export function initializeFeatureFlags(): void {
  try {
    const stored = localStorage.getItem('feature_flags');
    if (stored) {
      const parsed = JSON.parse(stored);
      currentFlags = { ...DEFAULT_FLAGS, ...parsed };
    }
  } catch (error) {
    console.error("Error loading feature flags:", error);
    // Use defaults on error
    currentFlags = { ...DEFAULT_FLAGS };
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
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
  currentFlags[feature] = enabled;
  localStorage.setItem('feature_flags', JSON.stringify(currentFlags));
}

// Initialize on module load
initializeFeatureFlags();
