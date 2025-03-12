
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// FRED API configuration
const FRED_API_KEY = Deno.env.get("FRED_API_KEY");
const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache TTL values in milliseconds
const CACHE_TTL = {
  DAILY: 1 * 60 * 60 * 1000,  // 1 hour
  WEEKLY: 6 * 60 * 60 * 1000, // 6 hours
  MONTHLY: 24 * 60 * 60 * 1000 // 24 hours
};

// Series groups for different economic indicators
const SERIES_GROUPS = {
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

// Function to fetch data with retry logic
async function fetchWithRetry(url: string, options = {}, retries = 3, backoff = 300) {
  try {
    console.log(`Fetching URL: ${url}`);
    const response = await fetch(url, options);
    
    if (response.ok) {
      return await response.json();
    }
    
    const errorText = await response.text();
    throw new Error(`HTTP error: ${response.status} - ${errorText}`);
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retry attempt, remaining: ${retries-1}, backoff: ${backoff}ms`);
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, backoff));
    
    // Retry with increased backoff
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

// Fetch series observations
async function fetchSeriesObservations(seriesId: string, limit = 12, sortOrder = "desc") {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=${sortOrder}&limit=${limit}`;
  return fetchWithRetry(url);
}

// Calculate the percentage change between two values
function calculatePercentChange(newer: number, older: number): number {
  if (older === 0) return 0;
  return ((newer - older) / older) * 100;
}

// Process inflation data
async function processInflationData(seriesId: string) {
  const data = await fetchSeriesObservations(seriesId, 13);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  const yearAgoIndex = Math.min(12, data.observations.length - 1);
  const yearAgoObs = data.observations[yearAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const yearAgoValue = parseFloat(yearAgoObs.value);
  
  const monthlyChange = calculatePercentChange(latestValue, previousValue);
  const annualChange = calculatePercentChange(latestValue, yearAgoValue);
  
  // For CPI and PCE, we want to show the annual percentage change as the main value
  const isInflationIndex = ["CPIAUCSL", "PCEPI"].includes(seriesId);
  
  return {
    id: seriesId,
    value: isInflationIndex ? annualChange.toFixed(1) : latestValue.toFixed(2),
    previous: isInflationIndex ? (calculatePercentChange(previousValue, data.observations[yearAgoIndex-1]?.value || 0)).toFixed(1) : previousValue.toFixed(2),
    change: isInflationIndex ? (annualChange - calculatePercentChange(previousValue, data.observations[yearAgoIndex-1]?.value || 0)).toFixed(1) : (latestValue - previousValue).toFixed(2),
    date: latestObs.date,
    trend: data.observations.slice(0, 12).reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process interest rate data
async function processInterestRateData(seriesId: string) {
  const data = await fetchSeriesObservations(seriesId, 30);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  const weekAgoIndex = Math.min(5, data.observations.length - 1);
  const weekAgoObs = data.observations[weekAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const weekAgoValue = parseFloat(weekAgoObs.value);
  
  const dailyChange = latestValue - previousValue;
  const weeklyChange = latestValue - weekAgoValue;
  
  return {
    id: seriesId,
    value: latestValue.toFixed(2),
    previous: previousValue.toFixed(2),
    change: dailyChange.toFixed(2),
    weeklyChange: weeklyChange.toFixed(2),
    date: latestObs.date,
    trend: data.observations.slice(0, 30).reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process economic growth data
async function processGrowthData(seriesId: string) {
  const data = await fetchSeriesObservations(seriesId, 8);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  
  const quarterlyChange = latestValue - previousValue;
  
  return {
    id: seriesId,
    value: latestValue.toFixed(1),
    previous: previousValue.toFixed(1),
    change: quarterlyChange.toFixed(1),
    date: latestObs.date,
    trend: data.observations.slice(0, 8).reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process employment data
async function processEmploymentData(seriesId: string) {
  // For weekly initial claims, we need more data points
  const limit = seriesId === "ICSA" ? 52 : 12;
  const data = await fetchSeriesObservations(seriesId, limit);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  
  let latestValue = parseFloat(latestObs.value);
  let previousValue = parseFloat(previousObs.value);
  
  // Format nonfarm payrolls in thousands
  if (seriesId === "PAYEMS") {
    latestValue = latestValue / 1000;
    previousValue = previousValue / 1000;
  }
  
  // For initial claims, we also want to show a 4-week average
  let fourWeekAvg = null;
  if (seriesId === "ICSA" && data.observations.length >= 4) {
    fourWeekAvg = data.observations.slice(0, 4).reduce((sum, obs) => sum + parseFloat(obs.value), 0) / 4;
    fourWeekAvg = Math.round(fourWeekAvg / 1000); // Convert to thousands
  }
  
  return {
    id: seriesId,
    value: seriesId === "ICSA" ? Math.round(latestValue / 1000) : latestValue.toFixed(1),
    previous: seriesId === "ICSA" ? Math.round(previousValue / 1000) : previousValue.toFixed(1),
    change: seriesId === "ICSA" ? Math.round((latestValue - previousValue) / 1000) : (latestValue - previousValue).toFixed(1),
    fourWeekAvg: fourWeekAvg,
    date: latestObs.date,
    trend: data.observations.slice(0, Math.min(52, data.observations.length)).reverse().map(obs => ({
      date: obs.date,
      value: seriesId === "ICSA" ? Math.round(parseFloat(obs.value) / 1000) : parseFloat(obs.value)
    }))
  };
}

// Process market data
async function processMarketData(seriesId: string) {
  const data = await fetchSeriesObservations(seriesId, 30);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  const weekAgoIndex = Math.min(5, data.observations.length - 1);
  const weekAgoObs = data.observations[weekAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const weekAgoValue = parseFloat(weekAgoObs.value);
  
  const dailyChange = latestValue - previousValue;
  const weeklyChange = latestValue - weekAgoValue;
  const dailyPctChange = calculatePercentChange(latestValue, previousValue);
  
  return {
    id: seriesId,
    value: latestValue.toFixed(2),
    previous: previousValue.toFixed(2),
    change: dailyChange.toFixed(2),
    changePercent: dailyPctChange.toFixed(2),
    weeklyChange: weeklyChange.toFixed(2),
    date: latestObs.date,
    trend: data.observations.slice(0, 30).reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Main handler function for the endpoint
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { seriesId, category } = await req.json();
    
    console.log(`Request received for ${category || 'category'} ${seriesId || 'all series'}`);
    
    // If a specific series is requested
    if (seriesId) {
      let result;
      
      // Determine the processing function based on series ID or category
      if (SERIES_GROUPS.INFLATION.some(s => s.id === seriesId)) {
        result = await processInflationData(seriesId);
      } else if (SERIES_GROUPS.INTEREST_RATES.some(s => s.id === seriesId)) {
        result = await processInterestRateData(seriesId);
      } else if (SERIES_GROUPS.ECONOMIC_GROWTH.some(s => s.id === seriesId)) {
        result = await processGrowthData(seriesId);
      } else if (SERIES_GROUPS.EMPLOYMENT.some(s => s.id === seriesId)) {
        result = await processEmploymentData(seriesId);
      } else if (SERIES_GROUPS.MARKETS.some(s => s.id === seriesId)) {
        result = await processMarketData(seriesId);
      } else {
        throw new Error(`Unknown series ID: ${seriesId}`);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If a category is requested, fetch all series in that category
    if (category) {
      let seriesGroup;
      let processingFunction;
      
      switch (category.toUpperCase()) {
        case 'INFLATION':
          seriesGroup = SERIES_GROUPS.INFLATION;
          processingFunction = processInflationData;
          break;
        case 'INTEREST_RATES':
          seriesGroup = SERIES_GROUPS.INTEREST_RATES;
          processingFunction = processInterestRateData;
          break;
        case 'ECONOMIC_GROWTH':
          seriesGroup = SERIES_GROUPS.ECONOMIC_GROWTH;
          processingFunction = processGrowthData;
          break;
        case 'EMPLOYMENT':
          seriesGroup = SERIES_GROUPS.EMPLOYMENT;
          processingFunction = processEmploymentData;
          break;
        case 'MARKETS':
          seriesGroup = SERIES_GROUPS.MARKETS;
          processingFunction = processMarketData;
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }
      
      const results = await Promise.all(
        seriesGroup.map(async (series) => {
          try {
            const data = await processingFunction(series.id);
            return {
              ...data,
              name: series.name,
              unit: series.unit
            };
          } catch (error) {
            console.error(`Error processing ${series.id}:`, error);
            return {
              id: series.id,
              name: series.name,
              error: error.message
            };
          }
        })
      );
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // If neither series nor category specified, return available options
    return new Response(JSON.stringify({
      categories: Object.keys(SERIES_GROUPS),
      series: Object.entries(SERIES_GROUPS).reduce((acc, [category, series]) => {
        acc[category] = series.map(s => ({ id: s.id, name: s.name }));
        return acc;
      }, {})
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in FRED data function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
