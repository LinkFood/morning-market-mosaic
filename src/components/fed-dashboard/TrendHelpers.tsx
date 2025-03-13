
/**
 * Helper functions for determining economic trends
 */

/**
 * Determines the GDP growth trend based on recent data points
 */
export const determineGdpTrend = (trend: { date: string; value: number }[] = []): 'accelerating' | 'decelerating' | 'stable' => {
  if (trend.length < 3) return 'stable';
  
  const latest = trend[trend.length - 1].value;
  const previous = trend[trend.length - 2].value;
  const twoBefore = trend[trend.length - 3].value;
  
  const currentChange = latest - previous;
  const previousChange = previous - twoBefore;
  
  if (Math.abs(currentChange) < 0.1) return 'stable';
  if (currentChange > 0 && currentChange > previousChange) return 'accelerating';
  if (currentChange < 0 && currentChange < previousChange) return 'decelerating';
  return 'stable';
};

/**
 * Determines the unemployment trend based on recent data points
 */
export const determineUnemploymentTrend = (trend: { date: string; value: number }[] = []): 'improving' | 'worsening' | 'stable' => {
  if (trend.length < 3) return 'stable';
  
  const latest = trend[trend.length - 1].value;
  const previous = trend[trend.length - 2].value;
  const threeBefore = trend[trend.length - 4]?.value || previous;
  
  // For unemployment, decreasing is "improving"
  if (latest < previous && previous < threeBefore) return 'improving';
  if (latest > previous && previous > threeBefore) return 'worsening';
  return 'stable';
};

/**
 * Determines the inflation trend based on recent data points
 */
export const determineInflationTrend = (trend: { date: string; value: number }[] = []): 'rising' | 'falling' | 'stable' => {
  if (trend.length < 6) return 'stable';
  
  // Look at the last 6 months to determine trend
  const recent = trend.slice(-6);
  const increasing = recent.filter((pt, i) => i > 0 && pt.value > recent[i-1].value).length;
  const decreasing = recent.filter((pt, i) => i > 0 && pt.value < recent[i-1].value).length;
  
  if (increasing >= 4) return 'rising';
  if (decreasing >= 4) return 'falling';
  return 'stable';
};
