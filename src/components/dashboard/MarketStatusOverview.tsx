
import React from "react";
import { 
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { MarketIndex, MarketStatus } from "@/types/marketTypes";
import { useDashboard } from "./DashboardContext";

// Market status indicator component
export const MarketStatusIndicator = ({ status }: { status: MarketStatus | null }) => {
  if (!status) return null;
  
  let statusIcon;
  let statusText;
  let statusClass;
  let nextOpeningTime = null;
  
  if (status.isOpen) {
    statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
    statusText = "Market Open";
    statusClass = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  } else {
    const now = new Date();
    const hour = now.getHours();
    
    // Before normal trading (pre-market)
    if (hour >= 4 && hour < 9.5) {
      statusIcon = <Clock className="h-4 w-4 text-blue-500" />;
      statusText = "Pre-Market";
      statusClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    } 
    // After normal trading (after-hours)
    else if (hour >= 16 && hour < 20) {
      statusIcon = <Clock className="h-4 w-4 text-purple-500" />;
      statusText = "After Hours";
      statusClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    }
    // Market closed
    else {
      statusIcon = <XCircle className="h-4 w-4 text-red-500" />;
      statusText = "Market Closed";
      statusClass = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      
      // Show next opening time if available
      if (status.nextOpeningTime) {
        const nextOpen = new Date(status.nextOpeningTime);
        nextOpeningTime = nextOpen.toLocaleString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        });
      }
    }
  }
  
  return (
    <div className="flex flex-col items-start space-y-1">
      <div className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${statusClass}`}>
        {statusIcon}
        <span>{statusText}</span>
      </div>
      {nextOpeningTime && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Next open: {nextOpeningTime}</span>
        </div>
      )}
    </div>
  );
};

// Trading day progress bar component
export const TradingDayProgress = ({ status }: { status: MarketStatus | null }) => {
  if (!status || !status.isOpen) return null;
  
  // Regular market hours are 9:30 AM to 4:00 PM ET (6.5 hours)
  const marketOpenTime = new Date();
  marketOpenTime.setHours(9, 30, 0, 0);
  
  const marketCloseTime = new Date();
  marketCloseTime.setHours(16, 0, 0, 0);
  
  const now = new Date();
  
  // Calculate progress
  const totalMarketTime = marketCloseTime.getTime() - marketOpenTime.getTime();
  const elapsedTime = now.getTime() - marketOpenTime.getTime();
  let progress = Math.min(Math.max((elapsedTime / totalMarketTime) * 100, 0), 100);
  
  // If before market open or after market close, show appropriate value
  if (now < marketOpenTime) progress = 0;
  if (now > marketCloseTime) progress = 100;
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>9:30 AM</span>
        <span>4:00 PM</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Market sentiment indicator component
export const MarketSentiment = ({ indices }: { indices: MarketIndex[] }) => {
  // Calculate overall market sentiment
  const spyIndex = indices.find(index => index.ticker === "SPY" || index.ticker === "^GSPC");
  const nasdaqIndex = indices.find(index => index.ticker === "QQQ" || index.ticker === "^IXIC");
  const dowIndex = indices.find(index => index.ticker === "DIA" || index.ticker === "^DJI");
  
  if (!spyIndex && !nasdaqIndex && !dowIndex) return null;
  
  // Count positive indices
  const positiveCount = [spyIndex, nasdaqIndex, dowIndex].filter(
    index => index && index.changePercent > 0
  ).length;
  
  let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
  let icon = <AlertCircle className="h-4 w-4 text-yellow-500" />;
  let label = "Neutral";
  let color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  
  if (positiveCount >= 2) {
    sentiment = "bullish";
    icon = <TrendingUp className="h-4 w-4 text-green-500" />;
    label = "Bullish";
    color = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  } else if (positiveCount <= 0) {
    sentiment = "bearish";
    icon = <TrendingDown className="h-4 w-4 text-red-500" />;
    label = "Bearish";
    color = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  }
  
  return (
    <div className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${color}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

// Combined market status overview component
const MarketStatusOverview = () => {
  const { marketStatusData, indices } = useDashboard();
  
  return (
    <div className="mb-6 bg-card rounded-lg border shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Market Status</h3>
          <MarketStatusIndicator status={marketStatusData} />
        </div>
        
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Trading Day Progress</h3>
          <TradingDayProgress status={marketStatusData} />
        </div>
        
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Market Sentiment</h3>
          <MarketSentiment indices={indices} />
        </div>
      </div>
    </div>
  );
};

export default MarketStatusOverview;
