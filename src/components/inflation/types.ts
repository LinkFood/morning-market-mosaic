
export interface InflationData {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend: { date: string; value: number }[];
  unit: string;
}

export interface InflationCardProps {
  indicator: InflationData;
}
