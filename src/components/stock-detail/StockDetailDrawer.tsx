
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { TimeFrame } from '../chart/TimeFrameSelector';
import { useStockData } from './hooks/useStockData';
import { useCandleData } from './hooks/useCandleData';
import StockDetailHeader from './StockDetailHeader';
import ChartSection from './ChartSection';
import CompanyInformation from './CompanyInformation';
import TechnicalIndicators from './TechnicalIndicators';
import StockDetailFooter from './StockDetailFooter';

interface StockDetailProps {
  ticker: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const StockDetailDrawer: React.FC<StockDetailProps> = ({ 
  ticker, 
  open = false, 
  onOpenChange 
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1M");
  const [companySectionOpen, setCompanySectionOpen] = useState(true);
  const [technicalSectionOpen, setTechnicalSectionOpen] = useState(false);
  
  const {
    stockDetails,
    stockData,
    candleData,
    setCandleData,
    weekHighLow,
    isLoading,
    error,
    market
  } = useStockData(ticker);
  
  const { loadCandleData } = useCandleData(ticker, timeFrame, setCandleData);
  
  const handleRefresh = () => {
    if (ticker) {
      toast.info('Refreshing stock data...');
      loadCandleData(ticker, timeFrame);
    }
  };
  
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-background pb-4 z-10">
          <StockDetailHeader
            ticker={ticker}
            stockData={stockData}
            stockDetails={stockDetails}
            market={market}
            weekHighLow={weekHighLow}
            isLoading={isLoading}
            error={error}
            handleRefresh={handleRefresh}
          />
        </SheetHeader>
        
        <div className="pb-20">
          <ChartSection
            isLoading={isLoading}
            candleData={candleData}
            stockData={stockData}
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
          />
          
          <CompanyInformation
            isOpen={companySectionOpen}
            onOpenChange={setCompanySectionOpen}
            isLoading={isLoading}
            stockDetails={stockDetails}
          />
          
          <TechnicalIndicators
            isOpen={technicalSectionOpen}
            onOpenChange={setTechnicalSectionOpen}
          />
        </div>
        
        <StockDetailFooter
          ticker={ticker}
          handleSheetClose={handleSheetClose}
        />
      </SheetContent>
    </Sheet>
  );
};

export default StockDetailDrawer;
