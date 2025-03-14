
/**
 * Polygon.io Sector Performance Service
 * Provides performance data for market sectors
 */
import { polygonRequest } from '../client';
import { polygonRequestWithRetry } from '../retry-manager';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { SectorPerformance } from '@/types/marketTypes';

// Default sectors if API call fails
const DEFAULT_SECTORS = [
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

// Timestamp of last successful fetch
let lastSuccessfulFetch = 0;
const FETCH_COOLDOWN = 30000; // 30 seconds between attempts

/**
 * Get sector performance data using sector ETFs
 * @returns Promise with sector performance data
 */
export async function getSectorPerformance(): Promise<SectorPerformance[]> {
  const cacheKey = 'sector_performance';
  
  // Check cache first
  const cachedData = getCachedData<SectorPerformance[]>(cacheKey, CACHE_TTL.SECTOR_PERFORMANCE);
  if (cachedData) {
    return cachedData;
  }
  
  // Implement cooldown to prevent excessive API calls
  const now = Date.now();
  if (now - lastSuccessfulFetch < FETCH_COOLDOWN && lastSuccessfulFetch > 0) {
    console.log("Sector performance fetch cooldown in effect, generating placeholder data");
    return generatePlaceholderData();
  }
  
  try {
    console.log("Fetching sector performance data");
    
    // Sector ETFs
    const sectors = DEFAULT_SECTORS;
    const tickersParam = sectors.map(s => s.ticker).join(',');
    
    // Use retry-enabled request for better reliability
    const response = await polygonRequestWithRetry(
      `/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickersParam}`,
      3 // 3 retries
    );
    
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
    }).filter((item: SectorPerformance) => item !== null);
    
    // Update successful fetch timestamp
    lastSuccessfulFetch = Date.now();
    
    // Cache the result only if we got data for at least half the sectors
    if (sectorData.length >= sectors.length / 2) {
      cacheData(cacheKey, sectorData);
    } else {
      console.warn("Incomplete sector data received, not caching", sectorData.length);
    }
    
    return sectorData;
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    
    // Check if we already have a stale cache that's better than nothing
    const staleCache = getCachedData<SectorPerformance[]>(cacheKey, Infinity);
    if (staleCache) {
      console.log("Using stale sector performance cache");
      return staleCache;
    }
    
    // Generate placeholder data as last resort
    return generatePlaceholderData();
  }
}

/**
 * Generate fallback placeholder data when API fails
 */
function generatePlaceholderData(): SectorPerformance[] {
  return DEFAULT_SECTORS.map(sector => {
    // Generate plausible random data as placeholder
    const changePercent = (Math.random() * 2 - 1) * 2; // -2% to +2%
    const close = 50 + Math.random() * 50; // 50-100
    const open = close / (1 + changePercent / 100);
    const change = close - open;
    
    return {
      ticker: sector.ticker,
      name: sector.name,
      close,
      open,
      change,
      changePercent
    };
  });
}

export default {
  getSectorPerformance
};
