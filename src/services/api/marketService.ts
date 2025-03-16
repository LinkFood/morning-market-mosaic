
import apiClient from './client';
import { MarketIndex, SectorPerformance, StockData, MarketEvent, MarketMovers } from '@/types/marketTypes';

/**
 * Market API Service
 * Provides methods for accessing market data
 */
const marketService = {
  /**
   * Fetches market indices data
   * @returns Promise containing an array of MarketIndex objects
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const response = await apiClient.get<MarketIndex[]>('/market/indices');
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
      const response = await apiClient.get<SectorPerformance[]>('/market/sectors');
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
      const response = await apiClient.get<StockData[]>(`/market/stocks?tickers=${tickers.join(',')}`);
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
      const response = await apiClient.get<number[]>(`/market/stocks/${ticker}/sparkline`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sparkline for ${ticker}:`, error);
      // Return empty array as fallback
      return [];
    }
  },

  /**
   * Fetches market events data
   * @returns Promise containing an array of MarketEvent objects
   */
  async getMarketEvents(): Promise<MarketEvent[]> {
    try {
      const response = await apiClient.get<MarketEvent[]>('/market/events');
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
      const response = await apiClient.get('/market/status');
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
  async getMarketMovers(): Promise<MarketMovers> {
    try {
      const response = await apiClient.get<MarketMovers>('/market/movers');
      return response.data;
    } catch (error) {
      console.error("Error fetching market movers:", error);
      throw error;
    }
  }
};

export default marketService;
