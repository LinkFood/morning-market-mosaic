
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ChevronDown,
  ChevronUp, 
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { MarketIndex, MarketStatus, MarketBreadthData } from "@/types/marketTypes";
import SparklineChart from "./chart/SparklineChart";
import PriceRangeSlider from "./chart/PriceRangeSlider";
import VolumeIndicator from "./chart/VolumeIndicator";
import MarketBreadth from "./chart/MarketBreadth";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { stocks, marketStatus, marketBreadth } from "@/services/market";

interface MarketOverviewProps {
  indices: MarketIndex[];
}

const MarketOverview = ({ indices }: MarketOverviewProps) => {
  const [sparklines, setSparklines] = useState<{[key: string]: number[]}>({});
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [breadth, setBreadth] = useState<MarketBreadthData | null>(null);
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  
  // Toggle expansion for a specific index
  const toggleExpanded = (ticker: string) => {
    setExpanded(prev => ({
      ...prev,
      [ticker]: !prev[ticker]
    }));
  };
  
  // Load market status
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const data = await marketStatus.getMarketStatus();
        setStatus(data);
      } catch (error) {
        console.error("Failed to fetch market status:", error);
      }
    };
    
    fetchMarketStatus();
    // Refresh status every minute
    const interval = setInterval(fetchMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Load market breadth
  useEffect(() => {
    const fetchBreadth = async () => {
      try {
        const data = await marketBreadth.getMarketBreadth();
        setBreadth(data);
      } catch (error) {
        console.error("Failed to fetch market breadth:", error);
      }
    };
    
    fetchBreadth();
  }, []);
  
  // Load sparklines for each index
  useEffect(() => {
    const fetchSparklines = async () => {
      const sparklineData: {[key: string]: number[]} = {};
      
      for (const index of indices) {
        try {
          // Get 5-day historical data for better context
          const data = await stocks.getStockSparkline(index.ticker);
          sparklineData[index.ticker] = data;
        } catch (error) {
          console.error(`Failed to fetch sparkline for ${index.ticker}:`, error);
          // Provide fallback data if the API fails
          sparklineData[index.ticker] = [100, 101, 102, 101, 102, 103, 104];
        }
      }
      
      setSparklines(sparklineData);
    };
    
    if (indices.length > 0) {
      fetchSparklines();
    }
  }, [indices]);
  
  const formatChange = (change: number, includeSign = true) => {
    const formatted = Math.abs(change).toFixed(2);
    return includeSign ? `${change >= 0 ? "+" : "-"}${formatted}` : formatted;
  };
  
  const formatPercentChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };
  
  // Render market status indicator
  const renderMarketStatus = () => {
    if (!status) return null;
    
    let statusIcon;
    let statusText;
    let statusClass;
    
    if (status.isOpen) {
      statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
      statusText = "Market Open";
      statusClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    } else {
      const now = new Date();
      const hour = now.getHours();
      
      // Before normal trading (pre-market)
      if (hour >= 4 && hour < 9.5) {
        statusIcon = <Clock className="h-4 w-4 text-blue-500" />;
        statusText = "Pre-Market";
        statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      } 
      // After normal trading (after-hours)
      else if (hour >= 16 && hour < 20) {
        statusIcon = <Clock className="h-4 w-4 text-purple-500" />;
        statusText = "After Hours";
        statusClass = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      }
      // Market closed
      else {
        statusIcon = <XCircle className="h-4 w-4 text-red-500" />;
        statusText = "Market Closed";
        statusClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      }
    }
    
    return (
      <div className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusClass}`}>
        {statusIcon}
        <span>{statusText}</span>
      </div>
    );
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Market Overview</CardTitle>
        <div className="flex items-center space-x-2">
          {renderMarketStatus()}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((index) => (
            <Collapsible
              key={index.ticker} 
              className="p-4 rounded-lg bg-secondary/50 flex flex-col"
              open={expanded[index.ticker]}
              onOpenChange={() => toggleExpanded(index.ticker)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{index.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold">{index.close.toFixed(2)}</p>
                    <p className={`text-sm ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatChange(index.change)} ({formatPercentChange(index.changePercent)})
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${index.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
                  {index.change >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <CollapsibleTrigger asChild>
                    <button className="rounded-full p-1 hover:bg-secondary">
                      {expanded[index.ticker] ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              {/* Sparkline */}
              <div className="h-14 mt-2 mb-2">
                {sparklines[index.ticker] && (
                  <SparklineChart 
                    data={sparklines[index.ticker]} 
                    positive={index.change >= 0}
                    showAxis={true}
                    showLabels={true}
                  />
                )}
              </div>
              
              {/* Day Range */}
              {index.high && index.low && (
                <div className="mt-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Day Range</span>
                  </div>
                  <PriceRangeSlider 
                    low={index.low} 
                    high={index.high} 
                    current={index.close} 
                  />
                </div>
              )}
              
              <CollapsibleContent>
                <Separator className="my-3" />
                
                {/* Additional stats shown when expanded */}
                <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                  {/* Volume */}
                  {index.volume && (
                    <div>
                      <span className="text-muted-foreground">Volume</span>
                      <div>
                        <VolumeIndicator 
                          volume={index.volume} 
                          avgVolume={index.volume * 0.9} // Approximation for demo
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Previous Close */}
                  {index.previousClose && (
                    <div>
                      <span className="text-muted-foreground">Prev Close</span>
                      <div>{index.previousClose.toFixed(2)}</div>
                    </div>
                  )}
                  
                  {/* Pre-market changes if available and market is closed */}
                  {status && !status.isOpen && index.preMarketChange && (
                    <div>
                      <span className="text-muted-foreground">Pre-Market</span>
                      <div className={index.preMarketChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercentChange(index.preMarketChangePercent || 0)}
                      </div>
                    </div>
                  )}
                  
                  {/* After-hours changes if available and market is closed */}
                  {status && !status.isOpen && index.afterHoursChange && (
                    <div>
                      <span className="text-muted-foreground">After Hours</span>
                      <div className={index.afterHoursChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercentChange(index.afterHoursChangePercent || 0)}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Market Breadth (only show for major indices) */}
                {breadth && (index.ticker === "SPY" || index.ticker === "QQQ" || index.ticker === "DIA") && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Market Breadth</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">
                                Shows the overall market health based on the number of advancing vs declining stocks and new highs vs lows.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <MarketBreadth 
                        advancers={breadth.advancers}
                        decliners={breadth.decliners}
                        unchanged={breadth.unchanged}
                        newHighs={breadth.newHighs}
                        newLows={breadth.newLows}
                      />
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
