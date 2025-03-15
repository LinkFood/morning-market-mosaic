
/**
 * API Service
 * Main entry point for all API services
 */
import { toast } from "sonner";
import {
  MarketIndex,
  SectorPerformance,
  StockData,
  MarketStatus,
  MarketMovers,
  TickerDetails,
  CandleData,
  NewsItem,
  MarketEvent,
  EconomicIndicator
} from "@/types/marketTypes";
import { ScoredStock } from "@/services/stockPicker/algorithm";
import { StockAnalysis } from "@/services/stockPicker/aiAnalysis";

// Import specialized services
import marketService from "./market";
import stockPickerService from "./stockPicker";
// Import FRED service methods directly to avoid circular imports
import {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  testFredConnection,
  ECONOMIC_CATEGORIES
} from "./fred";

// Import enhanced Polygon.io features
import polygonService from "./polygon";
import { 
  StockFundamentals, 
  EarningsData 
} from "./polygon/enhanced";

// Re-export all services for backward compatibility
export const {
  getMarketIndices,
  getSectorPerformance,
  getMajorStocks,
  getStockSparkline,
  getMarketStatus,
  getMarketMovers,
  getStockDetails,
  getStockCandles,
  getMarketEvents
} = marketService;

// Re-export stock picker services
export const {
  getTopPicks,
  getStockAnalysis,
  clearAIAnalysisCache
} = stockPickerService;

// Get economic indicators from FRED
async function getEconomicIndicators(): Promise<EconomicIndicator[]> {
  try {
    // Get key economic indicators from FRED 
    // GDP, GDP Growth, Unemployment, Inflation (CPI)
    const keySeriesIds = ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "CPIAUCSL"];
    const promises = keySeriesIds.map(seriesId => getEconomicSeries(seriesId));
    
    const results = await Promise.all(promises);
    
    // Convert to EconomicIndicator type
    const fedIndicators: EconomicIndicator[] = results.map(item => ({
      id: item.id,
      name: item.name,
      value: parseFloat(item.value),
      previous: parseFloat(item.previous),
      change: parseFloat(item.change),
      unit: item.unit,
      date: item.date
    }));
    
    return fedIndicators;
  } catch (error) {
    console.error("Error loading economic indicators:", error);
    toast.error("Failed to load economic indicators");
    return [];
  }
}

// Export enhanced Polygon.io APIs
export const {
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions
} = polygonService.enhanced;

// Re-export cache utilities
export const {
  fetchWithCache,
  clearAllCacheData,
  getCacheTimestamp
} = marketService;

// Re-export FRED APIs
export {
  clearFredCacheData,
  getFredCacheTimestamp,
  getEconomicCategory,
  testFredConnection
};

// Enhanced Stock Data Interface that includes fundamentals
export interface EnhancedStockData extends StockData {
  fundamentals?: StockFundamentals;
  earnings?: EarningsData;
  news?: NewsItem[];
  insiderActivity?: any[];
}

/**
 * Get enhanced stock data with fundamentals, earnings, news, etc.
 */
export async function getEnhancedStockData(ticker: string): Promise<EnhancedStockData | null> {
  try {
    // Get basic stock data
    const stockData = await marketService.getStockDetails(ticker);
    
    if (!stockData) {
      console.error(`No stock data found for ${ticker}`);
      return null;
    }
    
    // Enhance with additional data in parallel
    const [fundamentals, earnings, news, insiderActivity] = await Promise.all([
      getStockFundamentals(ticker).catch(() => null),
      getStockEarnings(ticker).catch(() => null),
      getStockNews(ticker, 3).catch(() => []),
      getInsiderTransactions(ticker, 5).catch(() => [])
    ]);
    
    // Create enhanced data object
    const enhancedData: EnhancedStockData = {
      ...stockData,
      fundamentals: fundamentals || undefined,
      earnings: earnings || undefined,
      news: news.length > 0 ? news : undefined,
      insiderActivity: insiderActivity.length > 0 ? insiderActivity : undefined
    };
    
    return enhancedData;
  } catch (error) {
    console.error(`Error fetching enhanced stock data for ${ticker}:`, error);
    toast.error(`Failed to load enhanced data for ${ticker}`);
    return null;
  }
}

/**
 * Get high-quality market movers with enhanced filtering
 */
export async function getHighQualityMarketMovers(
  minPrice: number = 10,
  minVolume: number = 1000000,
  limit: number = 10
): Promise<MarketMovers> {
  try {
    // Try to use enhanced API if available
    return await getEnhancedMarketMovers(minPrice, minVolume, limit);
  } catch (error) {
    console.error("Error using enhanced market movers, falling back to standard API:", error);
    
    // Fallback to standard API with filtering
    const movers = await marketService.getMarketMovers(limit * 2);
    
    // Filter the results
    const filterQualityStocks = (stocks: StockData[]) => {
      return stocks
        .filter(stock => 
          stock.close >= minPrice && 
          (stock.volume || 0) >= minVolume
        )
        .slice(0, limit);
    };
    
    return {
      gainers: filterQualityStocks(movers.gainers),
      losers: filterQualityStocks(movers.losers)
    };
  }
}

// Default export with all methods
/**
 * Check the health of the Gemini API service
 */
export async function checkGeminiAPIHealth(): Promise<{
  healthy: boolean;
  status: string;
  error?: string;
  timestamp?: string;
}> {
  try {
    // Call the health check endpoint
    const { data, error } = await supabase.functions.invoke('gemini-stock-analysis/health', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'x-request-id': `health-check-${Date.now()}`
      }
    });
    
    if (error) {
      console.error("Error checking Gemini API health:", error);
      return {
        healthy: false,
        status: 'error',
        error: error.message || 'Unknown error'
      };
    }
    
    // Process response
    if (data && data.status === 'healthy') {
      return {
        healthy: true,
        status: 'healthy',
        timestamp: data.timestamp
      };
    } else {
      return {
        healthy: false,
        status: data?.status || 'error',
        error: data?.error || 'Unknown error',
        timestamp: data?.timestamp
      };
    }
  } catch (error) {
    console.error("Exception checking Gemini API health:", error);
    return {
      healthy: false,
      status: 'error',
      error: error.message || 'Exception occurred'
    };
  }
}

export default {
  // Market data APIs
  ...marketService,
  
  // Stock picker APIs
  ...stockPickerService,
  
  // Economic data APIs
  getEconomicIndicators,
  getEconomicCategory,
  clearFredCacheData,
  getFredCacheTimestamp,
  testFredConnection,
  
  // Enhanced Polygon APIs
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions,
  getEnhancedStockData,
  getHighQualityMarketMovers,
  
  // API Health Checks
  checkGeminiAPIHealth,
  
  // Additional utilities
  clearAIAnalysisCache
};
