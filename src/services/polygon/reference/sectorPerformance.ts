
/**
 * Polygon.io Sector Performance Service
 * Provides performance data for market sectors
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { SectorPerformance } from '@/types/marketTypes';

/**
 * Get sector performance data using sector ETFs
 * @returns Promise with sector performance data
 */
export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  const cacheKey = 'sector_performance';
  const cachedData = getCachedData(cacheKey, CACHE_TTL.SECTOR_PERFORMANCE);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Sector ETFs
    const sectors = [
      { ticker: "XLF", name: "Financials" },
      { ticker: "XLK", name: "Technology" },
      { ticker: "XLE", name: "Energy" },
      { ticker: "XLV", name: "Healthcare" },
      { ticker: "XLY", name: "Consumer Cyclical" },
      { ticker: "XLP", name: "Consumer Defensive" },
      { ticker: "XLI", name: "Industrials" },
      { ticker: "XLB", name: "Materials" },
      { ticker: "XLU", name: "Utilities" },
      { ticker: "XLRE", name: "Real Estate" }
    ];
    
    const tickersParam = sectors.map(s => s.ticker).join(',');
    
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickersParam}`);
    
    // Map the response to our data format
    const sectorData: SectorPerformance[] = response.tickers.map((item: any) => {
      const sector = sectors.find(s => s.ticker === item.ticker);
      
      return {
        ticker: item.ticker,
        name: sector?.name || item.ticker,
        close: item.day.c,
        open: item.day.o,
        change: item.todaysChange,
        changePercent: item.todaysChangePerc
      };
    });
    
    // Cache the result
    cacheData(cacheKey, sectorData);
    
    return sectorData;
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    throw error;
  }
}

export default {
  getSectorPerformance
};
