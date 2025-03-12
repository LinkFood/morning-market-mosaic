
import { fetchAndProcessBaseData, formatBaseResult } from "./baseProcessor.ts";

// Process employment data
export async function processEmploymentData(seriesId: string, timeSpan = 12) {
  const { 
    data, 
    latestObs, 
    previousObs, 
    realTimeStart, 
    trend 
  } = await fetchAndProcessBaseData(seriesId, timeSpan);
  
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
  
  const result = formatBaseResult(
    seriesId,
    seriesId === "ICSA" ? Math.round(latestValue / 1000) : latestValue.toFixed(1),
    seriesId === "ICSA" ? Math.round(previousValue / 1000) : previousValue.toFixed(1),
    seriesId === "ICSA" ? Math.round((latestValue - previousValue) / 1000) : (latestValue - previousValue).toFixed(1),
    latestObs.date,
    realTimeStart,
    seriesId === "ICSA" 
      ? trend.map(item => ({ date: item.date, value: Math.round(item.value / 1000) }))
      : trend
  );
  
  // Add four week average for initial claims
  if (fourWeekAvg !== null) {
    return {
      ...result,
      fourWeekAvg
    };
  }
  
  return result;
}
