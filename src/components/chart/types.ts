
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

export interface EnhancedChartProps {
  data: any[];
  height?: number;
  width?: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked?: boolean;
  comparisonPeriod?: string; // 'yoy', 'mom', 'qoq'
  title?: string;
  tooltipFormatter?: (value: number) => string;
}
