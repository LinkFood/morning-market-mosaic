
export interface OverviewSummary {
  gdpGrowth: {
    rate: number;
    trend: 'accelerating' | 'decelerating' | 'stable';
  } | null;
  unemployment: {
    rate: number;
    trend: 'improving' | 'worsening' | 'stable';
  } | null;
  inflation: {
    rate: number;
    trend: 'rising' | 'falling' | 'stable';
  } | null;
  fedRate: {
    rate: number;
    lastChange: number;
  } | null;
  lastUpdated: Date | null;
}
