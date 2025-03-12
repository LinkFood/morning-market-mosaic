
import { fetchAndProcessBaseData, formatBaseResult, calculatePercentChange } from "./baseProcessor.ts";

// Process market data
export async function processMarketData(seriesId: string, timeSpan = 12) {
  const { 
    data, 
    latestObs, 
    previousObs, 
    realTimeStart, 
    trend 
  } = await fetchAndProcessBaseData(seriesId, timeSpan);
  
  // Since data is now in ascending order, find the week-ago observation from the end
  const observations = data.observations;
  const weekAgoIndex = Math.max(0, observations.length - 6); // 5 days back from latest
  const weekAgoObs = observations[weekAgoIndex];
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  const weekAgoValue = parseFloat(weekAgoObs?.value || '0');
  
  const dailyChange = latestValue - previousValue;
  const weeklyChange = latestValue - weekAgoValue;
  const dailyPctChange = calculatePercentChange(latestValue, previousValue);
  
  const result = formatBaseResult(
    seriesId,
    latestValue.toFixed(2),
    previousValue.toFixed(2),
    dailyChange.toFixed(2),
    latestObs.date,
    realTimeStart,
    trend
  );
  
  // Add market-specific fields
  return {
    ...result,
    changePercent: dailyPctChange.toFixed(2),
    weeklyChange: weeklyChange.toFixed(2)
  };
}
