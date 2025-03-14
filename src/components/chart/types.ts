
/**
 * Props for the SparklineChart component
 * Used for small, inline charts in dashboard cards
 */
export interface SparklineChartProps {
  /** Array of data points to be displayed in the chart */
  data: number[];
  /** Optional array of date strings corresponding to each data point */
  dates?: string[];
  /** Whether the trend should be displayed as positive (green) or negative (red) */
  positive: boolean;
  /** Height of the chart in pixels */
  height?: number;
  /** Width of the chart in pixels */
  width?: number;
  /** Whether to show the X and Y axes */
  showAxis?: boolean;
  /** Whether to show data labels */
  showLabels?: boolean;
  /** Number of labels to display (will be evenly distributed) */
  labelCount?: number;
}

/**
 * Represents a single data point on a chart
 */
export interface ChartPoint {
  /** X coordinate value */
  x: number;
  /** Y coordinate value */
  y: number;
  /** The actual numeric value this point represents */
  value: number;
  /** Optional date string for this data point */
  date?: string;
  /** Index position of this point in the dataset */
  index: number;
}

/**
 * Configuration for a horizontal reference line on a chart
 */
export interface ReferenceLine {
  /** Y-axis position of the reference line */
  y: number;
  /** Optional label text for the reference line */
  label?: string;
  /** Optional color for the reference line */
  color?: string;
  /** Optional dash pattern for the reference line (e.g., "3 3") */
  strokeDasharray?: string;
}

/**
 * Props for the EnhancedChart component
 * Used for more complex, interactive charts with multiple series
 */
export interface EnhancedChartProps {
  /** Array of data objects for the chart */
  data: any[];
  /** Height of the chart in pixels */
  height?: number;
  /** Width of the chart in pixels */
  width?: number;
  /** Array of data keys to display as series on the chart */
  dataKeys: string[];
  /** The data key to use for the X axis */
  xAxisKey: string;
  /** Whether to stack the series on top of each other */
  stacked?: boolean;
  /** Optional comparison period for calculating changes (year-over-year, month-over-month, etc.) */
  comparisonPeriod?: string; // 'yoy', 'mom', 'qoq'
  /** Optional title for the chart */
  title?: string;
  /** Optional function to format tooltip values */
  tooltipFormatter?: (value: number) => string;
  /** Optional array of reference lines to display on the chart */
  referenceLines?: ReferenceLine[];
}

/**
 * Props for internal ChartComponent
 * This component handles the actual rendering of recharts elements
 */
export interface ChartComponentProps {
  /** Array of data objects for the chart */
  data: any[];
  /** Height of the chart in pixels */
  height: number;
  /** Array of data keys to display as series on the chart */
  dataKeys: string[];
  /** The data key to use for the X axis */
  xAxisKey: string;
  /** Whether to stack the series on top of each other */
  stacked?: boolean;
  /** Function to format tooltip values */
  tooltipFormatter: (value: number | string, name: string) => string;
  /** Function to format label text */
  labelFormatter: (label: string | number) => string;
  /** CSS properties for the tooltip */
  tooltipStyle: React.CSSProperties;
  /** Color for chart axes */
  axisColor: string;
  /** Array of colors to use for different data series */
  chartColors: string[];
  /** Optional array of tick values for the Y axis */
  yAxisTicks?: number[];
  /** Optional function to format Y axis tick values */
  yAxisFormatter?: (value: number | string) => string;
  /** Data frequency: daily, monthly, or quarterly */
  dataFrequency?: 'daily' | 'monthly' | 'quarterly';
  /** Interval for X axis ticks */
  xAxisTickInterval?: number;
  /** Optional array of reference lines to display on the chart */
  referenceLines?: ReferenceLine[];
}
