
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { TickerDetails, StockData, MarketStatus } from '@/types/marketTypes';
import PriceRangeSlider from '../chart/PriceRangeSlider';

interface StockDetailHeaderProps {
  ticker: string;
  stockData: StockData | null;
  stockDetails: TickerDetails | null;
  market: MarketStatus | null;
  weekHighLow: { high: number; low: number } | null;
  isLoading: boolean;
  error: string | null;
  handleRefresh: () => void;
}

const StockDetailHeader: React.FC<StockDetailHeaderProps> = ({
  ticker,
  stockData,
  stockDetails,
  market,
  weekHighLow,
  isLoading,
  error,
  handleRefresh
}) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <SheetTitle className="text-xl flex items-center gap-2">
            {stockData?.ticker}
            {stockDetails?.name && (
              <span className="text-base font-normal text-muted-foreground">
                {stockDetails.name}
              </span>
            )}
            {market && (
              <Badge 
                variant={market.isOpen ? "default" : "outline"}
                className="ml-2"
              >
                {market.isOpen ? "Market Open" : "Market Closed"}
              </Badge>
            )}
          </SheetTitle>
          
          {isLoading ? (
            <div className="flex flex-col gap-2 mt-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : stockData ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ${stockData.close.toFixed(2)}
                </span>
                <span className={`flex items-center ${
                  stockData.change >= 0 ? 'text-positive' : 'text-negative'
                }`}>
                  {stockData.change >= 0 ? 
                    <TrendingUp className="inline h-4 w-4 mr-1" /> : 
                    <TrendingDown className="inline h-4 w-4 mr-1" />
                  }
                  {stockData.change >= 0 ? '+' : ''}
                  {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
              
              {stockDetails && (
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {stockDetails.marketCap && (
                    <div>
                      Market Cap: ${(stockDetails.marketCap / 1_000_000_000).toFixed(2)}B
                    </div>
                  )}
                  {stockDetails.sector && (
                    <div>
                      Sector: {stockDetails.sector}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <SheetDescription>
              {error || `No data available for ${ticker}`}
            </SheetDescription>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </div>
      </div>
      
      {weekHighLow && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-1">
            52-Week Range: ${weekHighLow.low.toFixed(2)} - ${weekHighLow.high.toFixed(2)}
          </div>
          {stockData && (
            <PriceRangeSlider 
              low={weekHighLow.low} 
              high={weekHighLow.high} 
              current={stockData.close} 
            />
          )}
        </div>
      )}
      
      <Separator className="my-4" />
    </>
  );
};

export default StockDetailHeader;
