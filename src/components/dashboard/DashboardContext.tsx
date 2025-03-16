import React, { createContext, useContext, useEffect, useState } from "react";
import { getFeatureFlags, isFeatureEnabled, initializeFeatureFlags } from "@/services/features"; // Fixed imports
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
  
  // Initialize feature flags state with default extended feature flags
  const [featureFlags, setFeatureFlags] = useState<ExtendedFeatureFlags>({
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
  });
  
  // Effect to initialize feature flags on component mount
  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // Initialize feature flags from database
        await initializeFeatureFlags();
        // Convert the core feature flags to extended feature flags by merging with defaults
        const coreFlags = getFeatureFlags();
        setFeatureFlags(prevFlags => ({
          ...prevFlags,
          ...coreFlags
        }));
        console.log("Feature flags loaded:", getFeatureFlags());
      } catch (error) {
        console.error("Failed to load feature flags:", error);
      }
    };
    
    loadFeatureFlags();
  }, []);
  
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
      const coreFlags = getFeatureFlags();
      setFeatureFlags(prevFlags => ({
        ...prevFlags,
        ...coreFlags
      }));
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
