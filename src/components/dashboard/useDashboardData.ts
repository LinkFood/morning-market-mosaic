import { useState } from "react";
import { toast } from "sonner";
import apiService from "@/services/apiService";
import { marketStatus } from "@/services/market";
import stockPicker, { ScoredStock } from "@/services/stockPicker";
import { 
  MarketIndex, 
  SectorPerformance, 
  StockData, 
  EconomicIndicator, 
  MarketEvent, 
  MarketStatus,
  MarketMovers,
  UserSettings
} from "@/types/marketTypes";
import { getFeatureFlags, isFeatureEnabled } from "@/services/featureFlags";

export const useDashboardData = (settings: UserSettings) => {
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
  const [stockPicks, setStockPicks] = useState<ScoredStock[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEcon, setIsLoadingEcon] = useState(true);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const [isLoadingStockPicks, setIsLoadingStockPicks] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [moversError, setMoversError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
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
  
  // Function to load stock picks
  const loadStockPicks = async () => {
    setIsLoadingStockPicks(true);
    
    try {
      // Check if stock picker is enabled via feature flag
      if (!isFeatureEnabled('useStockPickerAlgorithm')) {
        console.log("Stock picker algorithm is disabled by feature flag");
        setIsLoadingStockPicks(false);
        return;
      }
      
      // Get market movers to use as input for the stock picker
      const moversData = await apiService.getMarketMovers(15); // Get more stocks for better selection
      
      // Combine gainers and losers
      const stocksToAnalyze = [...moversData.gainers, ...moversData.losers];
      
      // Apply the stock picker algorithm
      const pickedStocks = await stockPicker.getTopPicks(stocksToAnalyze);
      
      setStockPicks(pickedStocks);
    } catch (error) {
      console.error("Error loading stock picks:", error);
      toast.error("Failed to load stock picks");
    } finally {
      setIsLoadingStockPicks(false);
    }
  };
  
  // Function to load all market data
  const loadData = async () => {
    setIsLoading(true);
    setRefreshing(true);
    
    try {
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
      
      // Load stock picks if the feature is enabled
      if (isFeatureEnabled('useStockPickerAlgorithm')) {
        loadStockPicks();
      }
      
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load some market data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  return {
    // Data states
    indices,
    sectors,
    stocks,
    indicators,
    events,
    marketStatusData,
    marketMovers,
    stockPicks,
    
    // Loading states
    isLoading,
    isLoadingEcon,
    isLoadingMovers,
    isLoadingStockPicks,
    lastUpdated,
    moversError,
    refreshing,
    
    // Actions
    loadData,
    loadEconomicIndicators,
    loadMarketMovers,
    loadStockPicks
  };
};
