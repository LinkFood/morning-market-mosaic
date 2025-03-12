
import { FRED_API_KEY, FRED_BASE_URL } from "./config.ts";
import { formatReleaseDate } from "./utils.ts";

// Function to fetch data with retry logic
export async function fetchWithRetry(url: string, options = {}, retries = 3, backoff = 300) {
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

// Calculate appropriate observation limit based on timeSpan and frequency
export function calculateObservationLimit(timeSpan: number, frequency: string): number {
  if (!timeSpan) return 30; // Default to 30 observations
  
  switch (frequency) {
    case "DAILY":
      // Approx. 252 trading days per year (21 trading days per month)
      return Math.min(5000, Math.ceil(timeSpan * 21));
    case "WEEKLY":
      // 4.3 weeks per month
      return Math.min(1000, Math.ceil(timeSpan * 4.3));
    case "MONTHLY":
      // 1:1 mapping for months
      return Math.min(500, timeSpan);
    case "QUARTERLY":
      // 1 quarter = 3 months
      return Math.min(200, Math.ceil(timeSpan / 3));
    default:
      return Math.min(500, timeSpan);
  }
}

// Fetch series observations with improved parameters to ensure latest data
export async function fetchSeriesObservations(seriesId: string, timeSpan = 12, sortOrder = "desc") {
  // Find the series to determine its frequency
  let frequency = "MONTHLY"; // default
  
  // Import this from the config rather than using a global
  const SERIES_GROUPS = await import("./config.ts").then(m => m.SERIES_GROUPS);
  
  for (const category in SERIES_GROUPS) {
    for (const series of SERIES_GROUPS[category as keyof typeof SERIES_GROUPS]) {
      if (series.id === seriesId) {
        frequency = series.frequency;
        break;
      }
    }
  }
  
  // Calculate appropriate limit based on timeSpan and frequency
  const limit = calculateObservationLimit(timeSpan, frequency);
  
  // Add frequency and observation_end=9999-12-31 to ensure we get the most recent data
  // The observation_end date in the future ensures we get all data up to the present
  const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Calculate the start date based on timeSpan (in months)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - timeSpan);
  const formattedStartDate = startDate.toISOString().split('T')[0];
  
  // Use observation_start and observation_end for more precise date ranges
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=${sortOrder}&limit=${limit}&observation_start=${formattedStartDate}&observation_end=${todayDate}`;
  
  console.log(`Fetching FRED data for ${seriesId} with end date ${todayDate} and limit ${limit}`);
  return fetchWithRetry(url);
}

// Get release dates for a series to check if new data is available
export async function getSeriesReleaseInfo(seriesId: string) {
  const url = `${FRED_BASE_URL}/series/release?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
  return fetchWithRetry(url);
}
