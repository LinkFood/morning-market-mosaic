
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
  
  const yearAgoIndex = Math.min(12, data.observations.length - 1);
  const yearAgoObs = data.observations[yearAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const yearAgoValue = parseFloat(yearAgoObs.value);
  
  const monthlyChange = calculatePercentChange(latestValue, previousValue);
  const annualChange = calculatePercentChange(latestValue, yearAgoValue);
  
  // For CPI and PCE, we want to show the annual percentage change as the main value
  const isInflationIndex = ["CPIAUCSL", "PCEPI"].includes(seriesId);
  
  return formatBaseResult(
    seriesId,
    isInflationIndex ? annualChange.toFixed(1) : latestValue.toFixed(2),
    isInflationIndex ? (calculatePercentChange(previousValue, data.observations[yearAgoIndex-1]?.value || 0)).toFixed(1) : previousValue.toFixed(2),
    isInflationIndex ? (annualChange - calculatePercentChange(previousValue, data.observations[yearAgoIndex-1]?.value || 0)).toFixed(1) : (latestValue - previousValue).toFixed(2),
    latestObs.date,
    realTimeStart,
    trend
  );
}
