
import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from "@/components/theme-provider";
import { TimeFrame } from "../TimeFrameSelector";
import { ReferenceLine } from "../types";
import { getChartColors, getTooltipStyle } from "../utils/styling";

interface ChartConfigContextType {
  theme: string;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  chartColors: string[];
  tooltipStyle: React.CSSProperties;
  axisColor: string;
}

const ChartConfigContext = createContext<ChartConfigContextType | undefined>(undefined);

export const ChartConfigProvider: React.FC<{
  children: ReactNode;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}> = ({ children, timeFrame, setTimeFrame }) => {
  const { theme } = useTheme();
  
  // Get chart styling properties
  const chartColors = getChartColors();
  const tooltipStyle = getTooltipStyle(theme);
  const axisColor = theme === 'dark' ? '#888888' : '#666666';
  
  return (
    <ChartConfigContext.Provider 
      value={{ 
        theme, 
        timeFrame, 
        setTimeFrame, 
        chartColors, 
        tooltipStyle, 
        axisColor 
      }}
    >
      {children}
    </ChartConfigContext.Provider>
  );
};

export const useChartConfig = (): ChartConfigContextType => {
  const context = useContext(ChartConfigContext);
  if (!context) {
    throw new Error('useChartConfig must be used within a ChartConfigProvider');
  }
  return context;
};
