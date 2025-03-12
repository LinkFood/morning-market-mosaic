
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
}
