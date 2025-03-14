
import React, { createContext, useContext, useEffect } from "react";
import { getFeatureFlags } from "@/services/features"; // Fixed import path
import { DashboardContextType, defaultSettings } from "./types";
import { useDashboardData } from "./useDashboardData";
import { useRefreshScheduler } from "./useRefreshScheduler";
import { useDashboardUI } from "./useDashboardUI";
import { ExtendedFeatureFlags } from "@/services/features/types";

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize dashboard UI state
  const {
    settings,
    expandedComponent,
    collapsedComponents,
    updateSettings,
    toggleComponentCollapse,
    expandComponent,
    setExpandedComponent,
    isComponentVisible
  } = useDashboardUI(() => loadData());
  
  // Initialize dashboard data hooks
  const {
    indices,
    sectors,
    stocks,
    indicators,
    events,
    marketStatusData,
    marketMovers,
    stockPicks,
    stockAnalysis,
    isLoading,
    isLoadingEcon,
    isLoadingMovers,
    isLoadingStockPicks,
    isLoadingAnalysis,
    lastUpdated,
    moversError,
    refreshing,
    loadData,
    loadEconomicIndicators,
    loadMarketMovers,
    loadStockPicks
  } = useDashboardData(settings);
  
  // Initialize refresh scheduler
  const { scheduleNextRefresh } = useRefreshScheduler(marketStatusData, settings, loadData);
  
  // Initialize feature flags state - convert from FeatureFlags to ExtendedFeatureFlags
  const [featureFlags, setFeatureFlags] = React.useState<ExtendedFeatureFlags>(() => {
    // Call getFeatureFlags from the featureFlags service instead of the features service
    // This returns the ExtendedFeatureFlags type with UI-related flags
    return import("@/services/featureFlags").then(module => module.getFeatureFlags()).catch(() => {
      console.error("Failed to load ExtendedFeatureFlags, using defaults");
      // Provide default ExtendedFeatureFlags if the import fails
      return {
        useRealTimeData: true,
        showMarketMovers: true,
        enableDetailedCharts: true,
        enableNewsSection: true,
        useFredEconomicData: true,
        enableDataRefresh: true,
        useStockPickerAlgorithm: true,
        useAIStockAnalysis: true,
        enableDarkMode: true,
        enableAnimations: true,
        showExperimentalCharts: false,
        useTouchGestures: true,
        useBatteryOptimization: true,
        showDebugInfo: false,
        allowCustomWatchlists: true,
        allowThemeCustomization: true
      };
    });
  });
  
  // Effect to load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("market_dashboard_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        updateSettings({
          ...defaultSettings,
          ...parsed,
          refreshInterval: {
            ...defaultSettings.refreshInterval,
            ...(parsed.refreshInterval || {})
          }
        });
      }
    } catch (error) {
      console.error("Failed to parse saved settings:", error);
    }
    
    // Update feature flags - use the featureFlags service instead
    import("@/services/featureFlags").then(module => {
      setFeatureFlags(module.getFeatureFlags());
    }).catch(error => {
      console.error("Failed to load feature flags service:", error);
    });
  }, []);
  
  // Update refresh scheduling after loading data
  useEffect(() => {
    scheduleNextRefresh(marketStatusData);
  }, [marketStatusData]);
  
  // Load data on component mount or when watchlist changes
  useEffect(() => {
    loadData();
  }, [settings.watchlist.join(",")]);
  
  // Update feature flags whenever services change
  useEffect(() => {
    const handleFlagsUpdate = () => {
      import("@/services/featureFlags").then(module => {
        setFeatureFlags(module.getFeatureFlags());
      }).catch(error => {
        console.error("Failed to update feature flags:", error);
      });
    };
    
    window.addEventListener('feature_flags_updated', handleFlagsUpdate);
    
    return () => {
      window.removeEventListener('feature_flags_updated', handleFlagsUpdate);
    };
  }, []);

  return (
    <DashboardContext.Provider 
      value={{
        indices,
        sectors,
        stocks,
        indicators,
        events,
        marketStatusData,
        marketMovers,
        stockPicks,
        stockAnalysis,
        isLoading,
        isLoadingEcon,
        isLoadingMovers,
        isLoadingStockPicks,
        isLoadingAnalysis,
        lastUpdated,
        settings,
        moversError,
        refreshing,
        expandedComponent,
        collapsedComponents,
        featureFlags,
        loadData,
        loadEconomicIndicators,
        loadMarketMovers,
        loadStockPicks,
        updateSettings,
        toggleComponentCollapse,
        expandComponent,
        setExpandedComponent,
        isComponentVisible
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export { defaultSettings } from './types';
