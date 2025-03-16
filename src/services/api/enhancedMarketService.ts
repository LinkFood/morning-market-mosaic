
import apiClient from './client';
import { StockData } from '@/types/marketTypes';

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
    const response = await apiClient.get<{ gainers: StockData[]; losers: StockData[] }>(
      `/market/enhanced-movers?minPrice=${minPrice}&minVolume=${minVolume}&limit=${limit}`
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

export default {
  getHighQualityMarketMovers
};
