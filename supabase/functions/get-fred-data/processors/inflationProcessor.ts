
import { fetchAndProcessBaseData, formatBaseResult, calculatePercentChange } from "./baseProcessor.ts";

// Process inflation data
export async function processInflationData(seriesId: string, timeSpan = 12) {
  const { 
    data, 
    latestObs, 
    previousObs, 
    realTimeStart, 
    trend 
  } = await fetchAndProcessBaseData(seriesId, timeSpan);
  
  // Since data is now in ascending order, find the year-ago observation from the end
  const observations = data.observations;
  const yearAgoIndex = Math.max(0, observations.length - 13); // 12 months back from the latest
  const yearAgoObs = observations[yearAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const yearAgoValue = parseFloat(yearAgoObs?.value || '0');
  
  const monthlyChange = calculatePercentChange(latestValue, previousValue);
  const annualChange = calculatePercentChange(latestValue, yearAgoValue);
  
  // For CPI and PCE, we want to show the annual percentage change as the main value
  const isInflationIndex = ["CPIAUCSL", "PCEPI"].includes(seriesId);
  
  // For the previous year-on-year value, get 1 month before the latest and 1 year before that
  const prevYoYIndex = Math.max(0, observations.length - 2); // 1 month back from latest
  const prevYoYAgoIndex = Math.max(0, observations.length - 14); // 1 year + 1 month back
  
  return formatBaseResult(
    seriesId,
    isInflationIndex ? annualChange.toFixed(1) : latestValue.toFixed(2),
    isInflationIndex ? (calculatePercentChange(previousValue, yearAgoValue)).toFixed(1) : previousValue.toFixed(2),
    isInflationIndex ? (annualChange - calculatePercentChange(previousValue, yearAgoValue)).toFixed(1) : (latestValue - previousValue).toFixed(2),
    latestObs.date,
    realTimeStart,
    trend
  );
}
