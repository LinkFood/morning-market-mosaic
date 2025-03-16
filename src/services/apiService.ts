
import axios from 'axios';
import { StockData, MarketIndex, SectorPerformance, EconomicIndicator, MarketEvent } from '@/types/marketTypes';
import { ScoredStock } from './stockPicker/algorithm';
import { StockAnalysis } from './stockPicker/aiAnalysis';
import { supabase } from "@/integrations/supabase/client";
import { clearAIAnalysisCache } from "./stockPicker/aiAnalysis";

/**
 * API Service
 * Provides methods for accessing market data from various sources
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiService = {
  /**
   * Fetches market indices data
   * @returns Promise containing an array of MarketIndex objects
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const response = await axios.get<MarketIndex[]>(`${API_BASE_URL}/market/indices`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market indices:", error);
      throw error;
    }
  },

  /**
   * Fetches sector performance data
   * @returns Promise containing an array of SectorPerformance objects
   */
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      const response = await axios.get<SectorPerformance[]>(`${API_BASE_URL}/market/sectors`);
      return response.data;
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      throw error;
    }
  },

  /**
   * Fetches major stocks data
   * @param tickers Array of stock tickers to fetch
   * @returns Promise containing an array of StockData objects
   */
  async getMajorStocks(tickers: string[]): Promise<StockData[]> {
    try {
      const response = await axios.get<StockData[]>(`${API_BASE_URL}/market/stocks?tickers=${tickers.join(',')}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching major stocks:", error);
      throw error;
    }
  },

  /**
   * Gets sparkline data for a specific stock
   * @param ticker Stock ticker symbol
   * @returns Promise containing array of price points
   */
  async getStockSparkline(ticker: string): Promise<number[]> {
    try {
      const response = await axios.get<number[]>(`${API_BASE_URL}/market/stocks/${ticker}/sparkline`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sparkline for ${ticker}:`, error);
      // Return empty array as fallback
      return [];
    }
  },

  /**
   * Fetches economic indicators data
   * @returns Promise containing an array of EconomicIndicator objects
   */
  async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    try {
      const response = await axios.get<EconomicIndicator[]>(`${API_BASE_URL}/economic`);
      return response.data;
    } catch (error) {
      console.error("Error fetching economic indicators:", error);
      throw error;
    }
  },

  /**
   * Fetches market events data
   * @returns Promise containing an array of MarketEvent objects
   */
  async getMarketEvents(): Promise<MarketEvent[]> {
    try {
      const response = await axios.get<MarketEvent[]>(`${API_BASE_URL}/market/events`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market events:", error);
      throw error;
    }
  },

  /**
   * Fetches market status data
   * @returns Promise containing market status data
   */
  async getMarketStatus(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/market/status`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market status:", error);
      throw error;
    }
  },

  /**
   * Fetches market movers data (gainers and losers)
   * @returns Promise containing market movers data
   */
  async getMarketMovers(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/market/movers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching market movers:", error);
      throw error;
    }
  },

  /**
   * Gets the top stock picks based on a scoring algorithm
   * @param stocks Array of StockData to evaluate
   * @returns Promise containing an array of ScoredStock objects
   */
  async getTopPicks(stocks: StockData[]): Promise<ScoredStock[]> {
    try {
      const response = await axios.post<ScoredStock[]>(`${API_BASE_URL}/stock-picker/algorithm`, { stocks });
      return response.data;
    } catch (error) {
      console.error("Error getting top stock picks:", error);
      throw error;
    }
  },

  /**
   * Gets AI-driven analysis for a list of stocks
   * @param stocks Array of ScoredStock objects to analyze
   * @returns Promise containing StockAnalysis data
   */
  async getStockAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
    try {
      const response = await axios.post<StockAnalysis>(`${API_BASE_URL}/stock-picker/ai-analysis`, { stocks });
      return response.data;
    } catch (error) {
      console.error("Error getting stock analysis:", error);
      throw error;
    }
  },

  /**
   * Checks the health status of the Gemini API
   * @returns Promise containing health status information
   */
  async checkGeminiAPIHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await axios.get<{ healthy: boolean }>(`${API_BASE_URL}/stock-picker/ai-analysis/health`);
      return { healthy: response.data.healthy };
    } catch (error) {
      console.error("Error checking Gemini API health:", error);
      return { healthy: false, error: error.message };
    }
  },
  
  /**
   * Clears the AI analysis cache
   */
  clearAIAnalysisCache,
};

/**
 * Enhanced Market Movers Service
 * Provides advanced functionality for filtering market movers
 */

/**
 * Get high quality market movers with better filtering and additional data
 */
export async function getHighQualityMarketMovers(
  minPrice: number = 10,
  minVolume: number = 1000000,
  limit: number = 10
): Promise<{ gainers: StockData[]; losers: StockData[] }> {
  try {
    // Call the API to get enhanced market movers
    const response = await axios.get<{ gainers: StockData[]; losers: StockData[] }>(
      `${API_BASE_URL}/market/enhanced-movers?minPrice=${minPrice}&minVolume=${minVolume}&limit=${limit}`
    );
    
    // Check if the API returned valid data
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      console.error("Failed to fetch enhanced market movers:", response.statusText);
      return { gainers: [], losers: [] };
    }
  } catch (error) {
    console.error("Error fetching enhanced market movers:", error);
    return { gainers: [], losers: [] };
  }
}

/**
 * Polygon API Key Service
 * Provides methods for securely accessing the Polygon API key
 */

/**
 * Get Polygon API key from Supabase
 */
async function getPolygonApiKey(): Promise<string> {
  try {
    // Call Supabase function to get API key
    const { data, error } = await supabase.functions.invoke('get-polygon-api-key');
    
    if (error) {
      console.error("Error fetching Polygon API key from Supabase:", error);
      return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
    }
    
    // Check if the function returned a valid API key
    if (data && data.apiKey) {
      return data.apiKey;
    } else {
      console.warn("Polygon API key is missing in Supabase function response, using demo key");
      return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
    }
  } catch (error) {
    console.error("Error invoking Supabase function:", error);
    return process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'DEMO_API_KEY';
  }
}

export default apiService;
export { getHighQualityMarketMovers, getPolygonApiKey };
