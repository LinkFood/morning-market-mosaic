import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  X, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import StockCandlestickChart from './chart/StockCandlestickChart';
import PriceRangeSlider from './chart/PriceRangeSlider';
import { TimeFrame } from './chart/TimeFrameSelector';
import VolumeIndicator from './chart/VolumeIndicator';
import { TickerDetails, StockData, CandleData, MarketStatus } from '@/types/marketTypes';
import { stocks, marketStatus } from '@/services/market';

interface StockDetailContextType {
  openStockDetail: (ticker: string) => void;
  isOpen: boolean;
  currentTicker: string | null;
}

const StockDetailContext = React.createContext<StockDetailContextType>({
  openStockDetail: () => {},
  isOpen: false,
  currentTicker: null,
});

export const useStockDetail = () => React.useContext(StockDetailContext);

export const StockDetailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);

  const openStockDetail = (ticker: string) => {
    setCurrentTicker(ticker);
    setIsOpen(true);
  };

  return (
    <StockDetailContext.Provider value={{ openStockDetail, isOpen, currentTicker }}>
      {children}
      {isOpen && currentTicker && (
        <StockDetailDrawer 
          ticker={currentTicker} 
          open={isOpen} 
          onOpenChange={setIsOpen}
        />
      )}
    </StockDetailContext.Provider>
  );
};

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
  const [stockDetails, setStockDetails] = useState<TickerDetails | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [weekHighLow, setWeekHighLow] = useState<{ high: number; low: number } | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1M");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [market, setMarket] = useState<MarketStatus | null>(null);
  const [technicalSectionOpen, setTechnicalSectionOpen] = useState(false);
  const [companySectionOpen, setCompanySectionOpen] = useState(true);

  useEffect(() => {
    if (!ticker) return;

    const loadStockData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const marketStatusData = await marketStatus.getMarketStatus();
        setMarket(marketStatusData);
        
        const majorStocks = await stocks.getMajorStocks([ticker]);
        if (majorStocks && majorStocks.length > 0) {
          setStockData(majorStocks[0]);
        }
        
        const highLowData = await stocks.get52WeekHighLow(ticker);
        setWeekHighLow(highLowData);
        
        const details = await stocks.getStockDetails(ticker);
        setStockDetails(details);
        
        await loadCandleData(ticker, timeFrame);
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError('Failed to load stock data. Please try again.');
        toast.error('Failed to load stock data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStockData();
  }, [ticker]);
  
  useEffect(() => {
    if (ticker) {
      loadCandleData(ticker, timeFrame);
    }
  }, [timeFrame, ticker]);
  
  const loadCandleData = async (ticker: string, timeFrame: TimeFrame) => {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case "1D":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "1W":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "1M":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "3M":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "6M":
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case "5Y":
          startDate.setFullYear(endDate.getFullYear() - 5);
          break;
        case "MAX":
          startDate.setFullYear(endDate.getFullYear() - 10);
          break;
      }
      
      const fromDate = startDate.toISOString().split('T')[0];
      const toDate = endDate.toISOString().split('T')[0];
      
      let timespan = 'day';
      if (timeFrame === "1D") {
        timespan = 'minute';
      } else if (timeFrame === "1W") {
        timespan = 'hour';
      }
      
      const candles = await stocks.getStockCandles(ticker, timespan, fromDate, toDate);
      setCandleData(candles);
    } catch (err) {
      console.error('Error loading candle data:', err);
      toast.error('Failed to load chart data');
    }
  };
  
  const handleRefresh = () => {
    if (ticker) {
      setIsLoading(true);
      toast.info('Refreshing stock data...');
      
      loadCandleData(ticker, timeFrame)
        .catch(err => console.error('Error refreshing candle data:', err))
        .finally(() => setIsLoading(false));
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
        </SheetHeader>
        
        <div className="pb-20">
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
            
            {stockData && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Trading Information</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Open</div>
                      <div>${stockData.open.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">High</div>
                      <div>${stockData.high.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Low</div>
                      <div>${stockData.low.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Previous Close</div>
                      <div>${(stockData.close - stockData.change).toFixed(2)}</div>
                    </div>
                    {stockData.volume && (
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Volume</div>
                        <VolumeIndicator 
                          volume={stockData.volume} 
                          avgVolume={stockData.volume * 0.8}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Collapsible
            open={companySectionOpen}
            onOpenChange={setCompanySectionOpen}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Company Information</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {companySectionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : stockDetails ? (
                <div className="space-y-4">
                  {stockDetails.description && (
                    <p className="text-sm text-muted-foreground">
                      {stockDetails.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {stockDetails.exchange && (
                      <div>
                        <div className="text-xs text-muted-foreground">Exchange</div>
                        <div>{stockDetails.exchange}</div>
                      </div>
                    )}
                    {stockDetails.sector && (
                      <div>
                        <div className="text-xs text-muted-foreground">Industry</div>
                        <div>{stockDetails.sector}</div>
                      </div>
                    )}
                    {stockDetails.employees && (
                      <div>
                        <div className="text-xs text-muted-foreground">Employees</div>
                        <div>{stockDetails.employees.toLocaleString()}</div>
                      </div>
                    )}
                    {stockDetails.listDate && (
                      <div>
                        <div className="text-xs text-muted-foreground">Listed Date</div>
                        <div>{stockDetails.listDate}</div>
                      </div>
                    )}
                  </div>
                  
                  {stockDetails.homepageUrl && (
                    <div className="mt-2">
                      <a
                        href={stockDetails.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center text-sm"
                      >
                        Visit company website
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {stockDetails.address && Object.values(stockDetails.address).some(v => v) && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Headquarters</div>
                      <address className="text-sm not-italic">
                        {stockDetails.address.address1}<br />
                        {stockDetails.address.city}, {stockDetails.address.state} {stockDetails.address.postalCode}
                      </address>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No company information available.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible
            open={technicalSectionOpen}
            onOpenChange={setTechnicalSectionOpen}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Technical Indicators</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {technicalSectionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2">
              <Tabs defaultValue="rsi">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rsi">RSI</TabsTrigger>
                  <TabsTrigger value="macd">MACD</TabsTrigger>
                  <TabsTrigger value="bollinger">Bollinger Bands</TabsTrigger>
                </TabsList>
                <TabsContent value="rsi" className="pt-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Relative Strength Index (RSI) is a momentum indicator that measures the 
                      magnitude of recent price changes to evaluate overbought or oversold 
                      conditions.
                    </p>
                  </div>
                  <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
                    <p className="text-sm text-muted-foreground">
                      RSI chart will be implemented in a future update
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="macd" className="pt-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Moving Average Convergence Divergence (MACD) is a trend-following 
                      momentum indicator that shows the relationship between two moving 
                      averages of a security's price.
                    </p>
                  </div>
                  <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
                    <p className="text-sm text-muted-foreground">
                      MACD chart will be implemented in a future update
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="bollinger" className="pt-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Bollinger Bands are a technical analysis tool defined by a set of 
                      trendlines plotted two standard deviations away from a simple 
                      moving average of the security's price.
                    </p>
                  </div>
                  <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
                    <p className="text-sm text-muted-foreground">
                      Bollinger Bands chart will be implemented in a future update
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <SheetFooter className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleSheetClose}
            >
              Close
            </Button>
            <Button onClick={() => toast.info(`Added ${ticker} to watchlist`)}>
              Add to Watchlist
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StockDetailDrawer;
