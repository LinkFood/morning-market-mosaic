
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import StockCandlestickChart from '../chart/StockCandlestickChart';
import TradingInfoCard from './TradingInfoCard';
import { CandleData, StockData } from '@/types/marketTypes';
import { TimeFrame } from '../chart/TimeFrameSelector';

interface ChartSectionProps {
  isLoading: boolean;
  candleData: CandleData[];
  stockData: StockData | null;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  isLoading,
  candleData,
  stockData,
  timeFrame,
  setTimeFrame
}) => {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Price Chart</h3>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : candleData.length > 0 ? (
            <StockCandlestickChart 
              data={candleData}
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
            />
          ) : (
            <div className="flex items-center justify-center h-full border rounded-md">
              <p className="text-muted-foreground">No chart data available</p>
            </div>
          )}
        </div>
      </div>
      
      {stockData && <TradingInfoCard stockData={stockData} />}
    </div>
  );
};

export default ChartSection;
