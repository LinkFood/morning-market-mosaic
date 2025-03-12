
// Types for FRED API service

// Interface for cache items
export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Interface for FRED API function parameters
export interface FredFunctionParams {
  category?: string;
  seriesId?: string;
  forceRefresh?: boolean;
  timeSpan?: number; // Number of months of historical data to fetch
}

// Enum for time span options
export enum TimeSpan {
  ONE_MONTH = 1,
  THREE_MONTHS = 3,
  SIX_MONTHS = 6,
  ONE_YEAR = 12,
  FIVE_YEARS = 60,
  MAX = 240 // 20 years max
}
