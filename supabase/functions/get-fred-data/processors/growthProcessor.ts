
import { fetchAndProcessBaseData, formatBaseResult } from "./baseProcessor.ts";

// Process economic growth data
export async function processGrowthData(seriesId: string, timeSpan = 12) {
  const { 
    latestObs, 
    previousObs, 
    realTimeStart, 
    trend 
  } = await fetchAndProcessBaseData(seriesId, timeSpan);
  
  const latestValue = parseFloat(latestObs.value);
  const previousValue = parseFloat(previousObs.value);
  
  const quarterlyChange = latestValue - previousValue;
  
  return formatBaseResult(
    seriesId,
    latestValue.toFixed(1),
    previousValue.toFixed(1),
    quarterlyChange.toFixed(1),
    latestObs.date,
    realTimeStart,
    trend
  );
}
