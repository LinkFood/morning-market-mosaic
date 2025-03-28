
import apiClient from './client';
import { MarketIndex, SectorPerformance, StockData, MarketEvent } from '@/types/marketTypes';

// Fallback data for when API is unavailable
const FALLBACK_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', close: 173.5, changePercent: 0.5, volume: 65000000 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', close: 415.3, changePercent: 0.8, volume: 22000000 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', close: 149.2, changePercent: -0.3, volume: 18000000 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', close: 178.9, changePercent: 1.2, volume: 30000000 },
  { ticker: 'META', name: 'Meta Platforms Inc.', close: 485.6, changePercent: -0.7, volume: 25000000 }
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
      
      // Return fallback data
      return [
        { ticker: 'SPX', name: 'S&P 500', close: 5200.25, changePercent: 0.2 },
        { ticker: 'NDX', name: 'Nasdaq 100', close: 18250.75, changePercent: 0.4 },
        { ticker: 'DJI', name: 'Dow Jones', close: 39150.50, changePercent: 0.1 }
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
      
      // Return fallback data
      return [
        { name: 'Technology', ticker: 'XLK', changePercent: 0.8, close: 185.25 },
        { name: 'Healthcare', ticker: 'XLV', changePercent: -0.3, close: 145.50 },
        { name: 'Financials', ticker: 'XLF', changePercent: 0.2, close: 39.75 }
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
