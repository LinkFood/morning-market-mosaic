
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
