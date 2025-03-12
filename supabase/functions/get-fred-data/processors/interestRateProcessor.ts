
import { fetchAndProcessBaseData, formatBaseResult } from "./baseProcessor.ts";

// Process interest rate data
export async function processInterestRateData(seriesId: string, timeSpan = 12) {
  const { 
    data, 
    latestObs, 
    previousObs, 
    realTimeStart, 
    trend 
  } = await fetchAndProcessBaseData(seriesId, timeSpan);
  
  const weekAgoIndex = Math.min(5, data.observations.length - 1);
  const weekAgoObs = data.observations[weekAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const weekAgoValue = parseFloat(weekAgoObs.value);
  
  const dailyChange = latestValue - previousValue;
  const weeklyChange = latestValue - weekAgoValue;
  
  const result = formatBaseResult(
    seriesId,
    latestValue.toFixed(2),
    previousValue.toFixed(2),
    dailyChange.toFixed(2),
    latestObs.date,
    realTimeStart,
    trend
  );
  
  // Add weekly change specific to interest rates
  return {
    ...result,
    weeklyChange: weeklyChange.toFixed(2)
  };
}
