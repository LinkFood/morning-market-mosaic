
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import apiService from "@/services/apiService";
import { marketStatus } from "@/services/market";
import { 
  MarketIndex, 
  SectorPerformance, 
  StockData, 
  EconomicIndicator, 
  MarketEvent, 
  UserSettings, 
  MarketStatus,
  MarketMovers
} from "@/types/marketTypes";
import { getFeatureFlags, isFeatureEnabled } from "@/services/features";

// Default settings
export const defaultSettings: UserSettings = {
  watchlist: ["AAPL", "MSFT", "AMZN", "GOOGL", "META"],
  visibleComponents: [
    "market-overview", 
    "es1-futures", 
    "major-stocks", 
    "economic-data", 
    "sector-performance", 
    "market-events", 
    "market-movers"
  ],
  componentOrder: [
    "market-overview", 
    "es1-futures", 
    "major-stocks", 
    "economic-data", 
    "sector-performance", 
    "market-events", 
    "market-movers"
  ],
  refreshInterval: {
    marketHours: 60, // seconds
    afterHours: 300, // seconds
    closed: 900 // seconds
  }
};

type DashboardContextType = {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  stocks: StockData[];
  indicators: EconomicIndicator[];
  events: MarketEvent[];
  marketStatusData: MarketStatus | null;
  marketMovers: MarketMovers;
  isLoading: boolean;
  isLoadingEcon: boolean;
  isLoadingMovers: boolean;
  lastUpdated: Date | null;
  settings: UserSettings;
  moversError: Error | null;
  refreshing: boolean;
  expandedComponent: string | null;
  collapsedComponents: {[key: string]: boolean};
  featureFlags: ReturnType<typeof getFeatureFlags>;
  loadData: () => Promise<void>;
  loadEconomicIndicators: () => Promise<void>;
  loadMarketMovers: () => Promise<void>;
  updateSettings: (newSettings: UserSettings) => void;
  toggleComponentCollapse: (componentId: string) => void;
  expandComponent: (componentId: string) => void;
  setExpandedComponent: (componentId: string | null) => void;
  isComponentVisible: (componentId: string) => boolean;
};

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for market data
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [marketStatusData, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketMovers, setMarketMovers] = useState<MarketMovers>({
    gainers: [],
    losers: []
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEcon, setIsLoadingEcon] = useState(true);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [moversError, setMoversError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [collapsedComponents, setCollapsedComponents] = useState<{[key: string]: boolean}>({});
  const [featureFlags, setFeatureFlags] = useState(getFeatureFlags());
  
  // Refresh timer refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("market_dashboard_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
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
      setSettings(defaultSettings);
    }
    
    // Update feature flags
    setFeatureFlags(getFeatureFlags());
  }, []);

  // Function to update settings
  const updateSettings = (newSettings: UserSettings) => {
    const updatedSettings = {
      ...defaultSettings,
      ...newSettings,
      refreshInterval: {
        ...defaultSettings.refreshInterval,
        ...(newSettings.refreshInterval || {})
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem("market_dashboard_settings", JSON.stringify(updatedSettings));
    toast.success("Settings updated");
    loadData(); // Reload data with new settings
  };
  
  // Function to toggle component collapse state
  const toggleComponentCollapse = (componentId: string) => {
    setCollapsedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };
  
  // Function to expand component to full screen
  const expandComponent = (componentId: string) => {
    setExpandedComponent(componentId);
  };
  
  // Function to load economic indicators from FRED
  const loadEconomicIndicators = async () => {
    setIsLoadingEcon(true);
    try {
      // Check if FRED data is enabled via feature flag
      if (!isFeatureEnabled('useFredEconomicData')) {
        console.log("FRED economic data is disabled by feature flag");
        setIsLoadingEcon(false);
        return;
      }
      
      const fedIndicators = await apiService.getEconomicIndicators();
      setIndicators(fedIndicators);
    } catch (error) {
      console.error("Error loading economic indicators:", error);
      toast.error("Failed to load economic indicators");
    } finally {
      setIsLoadingEcon(false);
    }
  };
  
  // Function to load market movers
  const loadMarketMovers = async () => {
    setIsLoadingMovers(true);
    setMoversError(null);
    
    try {
      // Check if market movers is enabled via feature flag
      if (!isFeatureEnabled('showMarketMovers')) {
        console.log("Market movers are disabled by feature flag");
        setIsLoadingMovers(false);
        return;
      }
      
      const status = await apiService.getMarketStatus();
      setMarketStatus(status);
      
      const moversData = await apiService.getMarketMovers(5);
      setMarketMovers(moversData);
    } catch (error) {
      console.error("Error loading market movers:", error);
      setMoversError(error as Error);
    } finally {
      setIsLoadingMovers(false);
    }
  };
  
  // Schedule next data refresh based on market hours
  const scheduleNextRefresh = (status: MarketStatus | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    // Check if data refresh is enabled via feature flag
    if (!isFeatureEnabled('enableDataRefresh')) {
      console.log("Automatic data refresh is disabled by feature flag");
      return;
    }
    
    if (!settings || !settings.refreshInterval) {
      console.error("Refresh interval settings not available, using default");
      return;
    }
    
    let interval = settings.refreshInterval.closed; // Default to closed market interval
    
    if (status) {
      if (status.isOpen) {
        interval = settings.refreshInterval.marketHours; // Market is open
      } else {
        const now = new Date();
        const hour = now.getHours();
        
        if ((hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20)) {
          interval = settings.refreshInterval.afterHours; // Pre-market or after-hours
        }
      }
    }
    
    refreshTimerRef.current = setTimeout(() => {
      loadData();
    }, interval * 1000);
  };
  
  // Function to load all market data
  const loadData = async () => {
    setIsLoading(true);
    setRefreshing(true);
    
    try {
      // Update feature flags to make sure we have the latest state
      setFeatureFlags(getFeatureFlags());
      
      const status = await marketStatus.getMarketStatus();
      setMarketStatus(status);
      
      const indicesData = await apiService.getMarketIndices();
      setIndices(indicesData);
      
      const timestamp = apiService.getCacheTimestamp("market_indices");
      if (timestamp) {
        setLastUpdated(timestamp);
      }
      
      const sectorsData = await apiService.getSectorPerformance();
      setSectors(sectorsData);
      
      const stocksData = await apiService.getMajorStocks(settings.watchlist);
      setStocks(stocksData);
      
      const eventsData = await apiService.getMarketEvents();
      setEvents(eventsData);
      
      // Load market movers if the feature is enabled
      if (isFeatureEnabled('showMarketMovers')) {
        loadMarketMovers();
      }
      
      // Load economic indicators if the feature is enabled
      if (isFeatureEnabled('useFredEconomicData')) {
        loadEconomicIndicators();
      }
      
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load some market data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      scheduleNextRefresh(marketStatusData);
    }
  };
  
  // Update refresh timer when market status changes
  useEffect(() => {
    scheduleNextRefresh(marketStatusData);
  }, [marketStatusData, settings.refreshInterval]);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [settings.watchlist.join(",")]);
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Determine which components to render based on settings and feature flags
  const isComponentVisible = (componentId: string) => {
    if (!settings || !settings.visibleComponents) {
      return false;
    }
    
    // Check component-specific feature flags
    if (componentId === "market-movers" && !isFeatureEnabled('showMarketMovers')) {
      return false;
    }
    
    if (componentId === "economic-data" && !isFeatureEnabled('useFredEconomicData')) {
      return false;
    }
    
    return settings.visibleComponents.includes(componentId);
  };

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
        isLoading,
        isLoadingEcon,
        isLoadingMovers,
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
