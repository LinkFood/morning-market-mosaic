
import { 
  fetchSeriesObservations, 
  getSeriesReleaseInfo 
} from "../api.ts";
import { 
  calculatePercentChange, 
  formatReleaseDate 
} from "../utils.ts";

// Base processor function with common operations
export async function fetchAndProcessBaseData(seriesId: string, timeSpan = 12) {
  const data = await fetchSeriesObservations(seriesId, timeSpan);
  
  if (!data.observations || data.observations.length < 2) {
    throw new Error(`Insufficient data for series ${seriesId}`);
  }
  
  // Get release info to show when the data was last updated
  const releaseInfo = await getSeriesReleaseInfo(seriesId);
  const realTimeStart = releaseInfo?.releases?.[0]?.realtime_start || null;
  
  const latestObs = data.observations[0];
  const previousObs = data.observations[1];
  
  return {
    data,
    latestObs,
    previousObs,
    realTimeStart,
    trend: [...data.observations].reverse().map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
  };
}

// Shared result formatter with common fields
export function formatBaseResult(
  seriesId: string, 
  value: string | number, 
  previous: string | number, 
  change: string | number, 
  date: string, 
  lastUpdated: string | null, 
  trend: Array<{date: string, value: number}>
) {
  return {
    id: seriesId,
    value: typeof value === 'number' ? value.toString() : value,
    previous: typeof previous === 'number' ? previous.toString() : previous,
    change: typeof change === 'number' ? change.toString() : change,
    date,
    lastUpdated: lastUpdated || date,
    formattedDate: formatReleaseDate(date),
    trend
  };
}

export { calculatePercentChange };
