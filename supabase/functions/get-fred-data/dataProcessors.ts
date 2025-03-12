
import { 
  fetchSeriesObservations, 
  getSeriesReleaseInfo 
} from "./api.ts";
import { 
  calculatePercentChange, 
  formatReleaseDate 
} from "./utils.ts";

// Process inflation data
export async function processInflationData(seriesId: string, timeSpan = 12) {
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
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
    lastUpdated: realTimeStart || latestObs.date, // Use release date if available
    formattedDate: formatReleaseDate(latestObs.date),
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process interest rate data
export async function processInterestRateData(seriesId: string, timeSpan = 12) {
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
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
    lastUpdated: realTimeStart || latestObs.date, // Use release date if available
    formattedDate: formatReleaseDate(latestObs.date),
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process economic growth data
export async function processGrowthData(seriesId: string, timeSpan = 12) {
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
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
    lastUpdated: realTimeStart || latestObs.date, // Use release date if available
    formattedDate: formatReleaseDate(latestObs.date),
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Process employment data
export async function processEmploymentData(seriesId: string, timeSpan = 12) {
  // For weekly initial claims, we need more data points
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
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
    lastUpdated: realTimeStart || latestObs.date, // Use release date if available
    formattedDate: formatReleaseDate(latestObs.date),
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: seriesId === "ICSA" ? Math.round(parseFloat(obs.value) / 1000) : parseFloat(obs.value)
    }))
  };
}

// Process market data
export async function processMarketData(seriesId: string, timeSpan = 12) {
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
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
    lastUpdated: realTimeStart || latestObs.date, // Use release date if available
    formattedDate: formatReleaseDate(latestObs.date),
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}
