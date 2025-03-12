
// FRED API configuration
export const FRED_API_KEY = Deno.env.get("FRED_API_KEY");
export const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

// CORS headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache TTL values in milliseconds
export const CACHE_TTL = {
  DAILY: 1 * 60 * 60 * 1000,  // 1 hour
  WEEKLY: 6 * 60 * 60 * 1000, // 6 hours
  MONTHLY: 24 * 60 * 60 * 1000 // 24 hours
};

// Series groups for different economic indicators
export const SERIES_GROUPS = {
  INFLATION: [
    { id: "CPIAUCSL", name: "Consumer Price Index (CPI)", unit: "%", frequency: "MONTHLY" },
    { id: "PCEPI", name: "Personal Consumption Expenditures", unit: "%", frequency: "MONTHLY" },
    { id: "T10YIE", name: "10-Year Breakeven Inflation Rate", unit: "%", frequency: "DAILY" }
  ],
  INTEREST_RATES: [
    { id: "FEDFUNDS", name: "Federal Funds Rate", unit: "%", frequency: "DAILY" },
    { id: "DGS10", name: "10-Year Treasury Yield", unit: "%", frequency: "DAILY" },
    { id: "DGS2", name: "2-Year Treasury Yield", unit: "%", frequency: "DAILY" },
    { id: "T10Y2Y", name: "10Y-2Y Treasury Spread", unit: "%", frequency: "DAILY" }
  ],
  ECONOMIC_GROWTH: [
    { id: "GDPC1", name: "Real GDP", unit: "B$", frequency: "QUARTERLY" },
    { id: "A191RL1Q225SBEA", name: "GDP Growth Rate", unit: "%", frequency: "QUARTERLY" }
  ],
  EMPLOYMENT: [
    { id: "UNRATE", name: "Unemployment Rate", unit: "%", frequency: "MONTHLY" },
    { id: "ICSA", name: "Initial Jobless Claims", unit: "K", frequency: "WEEKLY" },
    { id: "PAYEMS", name: "Nonfarm Payrolls", unit: "K", frequency: "MONTHLY" }
  ],
  MARKETS: [
    { id: "SP500", name: "S&P 500", unit: "", frequency: "DAILY" },
    { id: "VIXCLS", name: "VIX Volatility Index", unit: "", frequency: "DAILY" }
  ]
};
