
// FRED API service constants

// Cache TTL in milliseconds (varies by data type)
export const CACHE_TTL = {
  DAILY: 1 * 60 * 60 * 1000,   // 1 hour
  WEEKLY: 6 * 60 * 60 * 1000,  // 6 hours
  MONTHLY: 24 * 60 * 60 * 1000 // 24 hours
};

// Categories of economic data
export const ECONOMIC_CATEGORIES = {
  INFLATION: "INFLATION",
  INTEREST_RATES: "INTEREST_RATES",
  ECONOMIC_GROWTH: "ECONOMIC_GROWTH",
  EMPLOYMENT: "EMPLOYMENT",
  MARKETS: "MARKETS"
};

// Define API endpoints
export const SUPABASE_FRED_FUNCTION = "get-fred-data";

// API request timeout in milliseconds
export const FETCH_TIMEOUT = 30000; // 30 seconds timeout
