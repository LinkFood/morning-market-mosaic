
export interface SparklineChartProps {
  data: number[];
  dates?: string[];
  positive: boolean;
  height?: number;
  width?: number;
  showAxis?: boolean;
  showLabels?: boolean;
  labelCount?: number;
}

export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  date?: string;
  index: number;
}
