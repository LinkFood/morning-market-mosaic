import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  StockData, 
  MarketIndex, 
  SectorPerformance, 
  EconomicIndicator,
  MarketMovers,
  MarketStatus,
  MarketEvent,
  UserSettings
} from "@/types/marketTypes";
import { ScoredStock } from "@/services/stockPicker/algorithm";
import { StockAnalysis } from "@/services/stockPicker/aiAnalysis";
import apiService, { getHighQualityMarketMovers } from "@/services/apiService";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

// Hook for managing dashboard data
export function useDashboardData(settings: UserSettings) {
  // Data states
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [marketStatusData, setMarketStatusData] = useState<MarketStatus | null>(null);
  const [marketMovers, setMarketMovers] = useState<MarketMovers>({ gainers: [], losers: [] });
  const [stockPicks, setStockPicks] = useState<ScoredStock[]>([]);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEcon, setIsLoadingEcon] = useState(true);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const [isLoadingStockPicks, setIsLoadingStockPicks] = useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [moversError, setMoversError] = useState<Error | null>(null);
  
  // Get feature flags
  const featureFlags = useFeatureFlags();
  
  // Load main market data
  const loadData = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    
    try {
      // Load market status
      const marketStatus = await apiService.getMarketStatus().catch((error) => {
        console.error("Error loading market status:", error);
        return null;
      });
      
      setMarketStatusData(marketStatus);
      
      // Load market indices in parallel
      const [indicesData, sectorsData, stocksData, eventsData] = await Promise.all([
        apiService.getMarketIndices(),
        apiService.getSectorPerformance(),
        apiService.getMajorStocks(settings.watchlist),
        apiService.getMarketEvents()
      ]);
      
      setIndices(indicesData || []);
      setSectors(sectorsData || []);
      setStocks(stocksData || []);
      setEvents(eventsData || []);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load market data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [settings.watchlist]);
  
  // Load economic indicators
  const loadEconomicIndicators = useCallback(async () => {
    if (!featureFlags.useFredEconomicData) {
      console.log("FRED economic data feature is disabled");
      setIsLoadingEcon(false);
      return;
    }
    
    setIsLoadingEcon(true);
    
    try {
      const economicData = await apiService.getEconomicIndicators();
      setIndicators(economicData);
    } catch (error) {
      console.error("Error loading economic indicators:", error);
      toast.error("Failed to load economic data");
    } finally {
      setIsLoadingEcon(false);
    }
  }, [featureFlags.useFredEconomicData]);
  
  // Load market movers with enhanced filtering
  const loadMarketMovers = useCallback(async () => {
    if (!featureFlags.showMarketMovers) {
      console.log("Market movers feature is disabled");
      setIsLoadingMovers(false);
      return;
    }
    
    setIsLoadingMovers(true);
    setMoversError(null);
    
    try {
      // Use the high quality market movers function that filters out penny stocks
      const moversData = await getHighQualityMarketMovers(
        10,          // Minimum price $10
        1000000,     // Minimum volume 1M shares
        10           // Number of stocks to show
      );
      
      setMarketMovers(moversData);
    } catch (error) {
      console.error("Error loading market movers:", error);
      setMoversError(error as Error);
      toast.error("Failed to load market movers");
    } finally {
      setIsLoadingMovers(false);
    }
  }, [featureFlags.showMarketMovers]);
  
  // Load algorithmic stock picks
  const loadStockPicks = useCallback(async () => {
    if (!featureFlags.useStockPickerAlgorithm) {
      console.log("Stock picker algorithm feature is disabled");
      setIsLoadingStockPicks(false);
      setIsLoadingAnalysis(false);
      return;
    }
    
    setIsLoadingStockPicks(true);
    setIsLoadingAnalysis(true);
    
    try {
      // Get a larger universe of stocks for the algorithm to analyze
      // Use established stocks that are more liquid rather than penny stocks
      const wellKnownStocks = [
        // Big Tech
        "AAPL", "MSFT", "AMZN", "GOOGL", "META", 
        // Semiconductors
        "NVDA", "AMD", "INTC", "TSM", "MU",
        // Finance
        "JPM", "BAC", "GS", "V", "MA", 
        // Healthcare
        "JNJ", "PFE", "MRK", "UNH", "ABBV",
        // Consumer
        "WMT", "PG", "KO", "PEP", "MCD",
        // Energy
        "XOM", "CVX", "COP", "EOG", "SLB",
        // Other Tech
        "CRM", "ADBE", "ORCL", "IBM", "CSCO"
      ];
      
      // Get stock data for the selected universe
      const stocksData = await apiService.getMajorStocks(wellKnownStocks);
      
      if (!stocksData || stocksData.length === 0) {
        throw new Error("Failed to retrieve stock data");
      }
      
      // Apply the algorithm to get top stock picks
      const scoredStocks = await apiService.getTopPicks(stocksData);
      setStockPicks(scoredStocks);
      setIsLoadingStockPicks(false);
      
      // Get AI analysis if enabled
      if (featureFlags.useAIStockAnalysis && scoredStocks.length > 0) {
        try {
          // Make async call for AI analysis
          apiService.getStockAnalysis(scoredStocks).then(analysis => {
            if (analysis && analysis.stockAnalyses && Object.keys(analysis.stockAnalyses).length > 0) {
              setStockAnalysis(analysis);
            } else {
              console.warn("AI analysis response was empty or malformed");
              toast.warning('AI analysis returned empty results');
            }
          }).catch(err => {
            console.error('Error processing AI analysis:', err);
            toast.error('Could not load AI analysis. Algorithm results still available.');
          }).finally(() => {
            setIsLoadingAnalysis(false);
          });
        } catch (analysisError) {
          console.error('Error getting AI analysis:', analysisError);
          toast.error('Could not load AI analysis. Algorithm results still available.');
          setIsLoadingAnalysis(false);
        }
      } else {
        setIsLoadingAnalysis(false);
      }
    } catch (error) {
      console.error("Error loading stock picks:", error);
      toast.error("Failed to load stock picks");
      setIsLoadingStockPicks(false);
      setIsLoadingAnalysis(false);
    }
  }, [featureFlags.useStockPickerAlgorithm, featureFlags.useAIStockAnalysis]);
  
  return {
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
  };
}
