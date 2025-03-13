
import { TimeFrame } from "./TimeFrameSelector";

export interface EnhancedChartProps {
  data: any[];
  height?: number;
  dataKeys: string[];
  xAxisKey: string;
  stacked?: boolean;
  title?: string;
  referenceLines?: any[];
  timeFrame?: TimeFrame;
  setTimeFrame?: (timeFrame: TimeFrame) => void;
}

// Add ChartPoint interface for ChartDataPoint component
export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  date?: string;
  index: number;
}

// Add SparklineChartProps interface for SparklineChart component
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

// Add ReferenceLine interface for ChartConfigContext
export interface ReferenceLine {
  y: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}
