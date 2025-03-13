
import { useMemo } from 'react';
import { TimeFrame } from "../TimeFrameSelector";
import { 
  filterDataByTimeFrame, 
  formatChartDates,
  normalizeChartData,
} from "../utils/index";
import { detectDateFrequency } from "@/utils/dateUtils";

/**
 * Hook to process and prepare chart data
 */
export const useChartData = (
  data: any[],
  dataKeys: string[],
  xAxisKey: string,
  timeFrame: TimeFrame
) => {
  // Apply date formatting based on frequency
  const formattedData = useMemo(() => 
    formatChartDates(data || [], xAxisKey), 
    [data, xAxisKey]
  );
  
  // Filter data based on the selected time frame
  const filteredData = useMemo(() => 
    filterDataByTimeFrame(formattedData, timeFrame, xAxisKey), 
    [formattedData, timeFrame, xAxisKey]
  );
  
  // Normalize data if necessary for better visualization
  const normalizedData = useMemo(() => 
    normalizeChartData(filteredData, dataKeys, xAxisKey),
    [filteredData, dataKeys, xAxisKey]
  );
  
  // Determine data frequency for proper labeling
  const dataFrequency = useMemo(() => 
    formattedData?.length > 1 ? 
    detectDateFrequency(formattedData.map(item => item[xAxisKey])) : 
    'monthly',
    [formattedData, xAxisKey]
  );

  return {
    filteredData,
    normalizedData,
    dataFrequency,
    isEmpty: !filteredData || filteredData.length === 0
  };
};
