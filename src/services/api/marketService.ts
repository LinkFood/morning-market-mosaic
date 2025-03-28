
import apiClient from './client';
import { MarketIndex, SectorPerformance, StockData, MarketEvent } from '@/types/marketTypes';

// Fallback data for when API is unavailable
const FALLBACK_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', open: 170.5, high: 175.2, low: 169.8, close: 173.5, change: 0.87, changePercent: 0.5, volume: 65000000 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', open: 410.2, high: 418.0, low: 408.5, close: 415.3, change: 3.32, changePercent: 0.8, volume: 22000000 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', open: 150.1, high: 152.3, low: 148.7, close: 149.2, change: -0.45, changePercent: -0.3, volume: 18000000 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', open: 176.4, high: 180.1, low: 175.3, close: 178.9, change: 2.15, changePercent: 1.2, volume: 30000000 },
  { ticker: 'META', name: 'Meta Platforms Inc.', open: 488.1, high: 490.5, low: 483.2, close: 485.6, change: -3.4, changePercent: -0.7, volume: 25000000 }
];

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
      
      // Return fallback data with all required properties
      return [
        { ticker: 'SPX', name: 'S&P 500', open: 5180.75, high: 5210.50, low: 5175.25, close: 5200.25, change: 10.5, changePercent: 0.2 },
        { ticker: 'NDX', name: 'Nasdaq 100', open: 18200.30, high: 18310.20, low: 18150.80, close: 18250.75, change: 73.0, changePercent: 0.4 },
        { ticker: 'DJI', name: 'Dow Jones', open: 39100.20, high: 39200.10, low: 39050.80, close: 39150.50, change: 39.15, changePercent: 0.1 }
      ];
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
      
      // Return fallback data with all required properties
      return [
        { name: 'Technology', ticker: 'XLK', open: 183.75, high: 186.20, low: 183.50, close: 185.25, change: 1.48, changePercent: 0.8 },
        { name: 'Healthcare', ticker: 'XLV', open: 146.10, high: 146.80, low: 145.30, close: 145.50, change: -0.44, changePercent: -0.3 },
        { name: 'Financials', ticker: 'XLF', open: 39.65, high: 39.90, low: 39.60, close: 39.75, change: 0.08, changePercent: 0.2 }
      ];
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
      
      // Return fallback data filtered by requested tickers
      return FALLBACK_STOCKS.filter(stock => 
        tickers.includes(stock.ticker)
      );
    }
  },
  
  /**
   * Fetches stock sparkline data
   * @param ticker Stock ticker symbol
   * @param days Number of days of historical data
   * @returns Promise containing sparkline data for the stock
   */
  async getStockSparkline(ticker: string, days: number = 30): Promise<any> {
    try {
      const response = await apiClient.get(`/market/sparkline/${ticker}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sparkline for ${ticker}:`, error);
      
      // Return fallback sparkline data (30 random points)
      const baseValue = 100;
      const points = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        return {
          date: date.toISOString().split('T')[0],
          value: baseValue + (Math.random() * 20 - 10)
        };
      });
      
      return { ticker, points };
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
      
      // Return fallback events data
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return [
        { 
          title: 'FOMC Meeting Minutes', 
          date: tomorrow.toISOString().split('T')[0], 
          time: '14:00 ET',
          type: 'economic',
          importance: 'high'
        },
        { 
          title: 'Earnings: Apple (AAPL)', 
          date: tomorrow.toISOString().split('T')[0], 
          time: 'After Market',
          type: 'earnings',
          importance: 'high'
        }
      ];
    }
  },
  
  /**
   * Fetches market status data
   * @returns Promise containing market status information
   */
  async getMarketStatus(): Promise<any> {
    try {
      const response = await apiClient.get('/market/status');
      return response.data;
    } catch (error) {
      console.error("Error fetching market status:", error);
      
      // Return fallback status
      return {
        isOpen: false,
        nextOpen: '2025-03-31T09:30:00-04:00',
        nextClose: '2025-03-31T16:00:00-04:00',
        message: 'Markets are currently closed'
      };
    }
  }
};

export default marketService;
