
/**
 * Feature Flag Type Definitions
 * Central location for feature flag interfaces
 */

// Core feature flag definitions
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

// Extended feature flags interface with UI and experimental flags
export interface ExtendedFeatureFlags extends FeatureFlags {
  enableDarkMode: boolean;
  enableAnimations: boolean;
  showExperimentalCharts: boolean;
  useTouchGestures: boolean;
  useBatteryOptimization: boolean;
  showDebugInfo: boolean;
  allowCustomWatchlists: boolean;
  allowThemeCustomization: boolean;
}

// Default feature flags (everything enabled)
export const DEFAULT_FLAGS: FeatureFlags = {
  useRealTimeData: true,
  showMarketMovers: true,
  enableDetailedCharts: true,
  enableNewsSection: true,
  useFredEconomicData: true,
  enableDataRefresh: true,
  useStockPickerAlgorithm: true,
  useAIStockAnalysis: true
};
