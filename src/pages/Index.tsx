import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { 
  Clock,
  Expand,
  RotateCw,
  Settings,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Components
import DashboardHeader from "@/components/DashboardHeader";
import MarketOverview from "@/components/MarketOverview";
import EconomicData from "@/components/EconomicData";
import MajorStocks from "@/components/major-stocks/MajorStocks";
import MarketEvents from "@/components/MarketEvents";
import SectorPerformance from "@/components/SectorPerformance";
import MarketMovers from "@/components/market-movers/MarketMovers";
import ES1FuturesChart from "@/components/ES1FuturesChart";

// Services
import apiService from "@/services/apiService";
import { marketStatus } from "@/services/market";

// Types
import { 
  MarketIndex, 
  SectorPerformance as SectorType, 
  StockData, 
  EconomicIndicator, 
  MarketEvent, 
  UserSettings, 
  MarketStatus,
  MarketMovers as MarketMoversType
} from "@/types/marketTypes";

const defaultSettings: UserSettings = {
  watchlist: ["AAPL", "MSFT", "AMZN", "GOOGL", "META"],
  visibleComponents: [
    "market-overview", 
    "es1-futures", 
    "major-stocks", 
    "economic-data", 
    "sector-performance", 
    "market-events", 
    "market-movers"
  ],
  componentOrder: [
    "market-overview", 
    "es1-futures", 
    "major-stocks", 
    "economic-data", 
    "sector-performance", 
    "market-events", 
    "market-movers"
  ],
  refreshInterval: {
    marketHours: 60, // seconds
    afterHours: 300, // seconds
    closed: 900 // seconds
  }
};

// Component to show market status indicator
const MarketStatusIndicator = ({ status }: { status: MarketStatus | null }) => {
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
const TradingDayProgress = ({ status }: { status: MarketStatus | null }) => {
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

// Quick market sentiment indicator component
const MarketSentiment = ({ indices }: { indices: MarketIndex[] }) => {
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

// Component for full-screen view
const FullScreenComponent = ({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title: string; 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Dashboard component
const Dashboard = () => {
  // Theme state
  const { theme } = useTheme();
  
  // State for market data
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorType[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [marketStatusData, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketMovers, setMarketMovers] = useState<MarketMoversType>({
    gainers: [],
    losers: []
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEcon, setIsLoadingEcon] = useState(true);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [moversError, setMoversError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [collapsedComponents, setCollapsedComponents] = useState<{[key: string]: boolean}>({});
  
  // Refresh timer refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("market_dashboard_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...defaultSettings,
          ...parsed,
          refreshInterval: {
            ...defaultSettings.refreshInterval,
            ...(parsed.refreshInterval || {})
          }
        });
      }
    } catch (error) {
      console.error("Failed to parse saved settings:", error);
      setSettings(defaultSettings);
    }
  }, []);
  
  // Function to update settings
  const updateSettings = (newSettings: UserSettings) => {
    const updatedSettings = {
      ...defaultSettings,
      ...newSettings,
      refreshInterval: {
        ...defaultSettings.refreshInterval,
        ...(newSettings.refreshInterval || {})
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem("market_dashboard_settings", JSON.stringify(updatedSettings));
    toast.success("Settings updated");
    loadData(); // Reload data with new settings
  };
  
  // Function to toggle component collapse state
  const toggleComponentCollapse = (componentId: string) => {
    setCollapsedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };
  
  // Function to expand component to full screen
  const expandComponent = (componentId: string) => {
    setExpandedComponent(componentId);
  };
  
  // Function to load economic indicators from FRED
  const loadEconomicIndicators = async () => {
    setIsLoadingEcon(true);
    try {
      const fedIndicators = await apiService.getEconomicIndicators();
      setIndicators(fedIndicators);
    } catch (error) {
      console.error("Error loading economic indicators:", error);
      toast.error("Failed to load economic indicators");
    } finally {
      setIsLoadingEcon(false);
    }
  };
  
  // Function to load market movers
  const loadMarketMovers = async () => {
    setIsLoadingMovers(true);
    setMoversError(null);
    
    try {
      const status = await apiService.getMarketStatus();
      setMarketStatus(status);
      
      const moversData = await apiService.getMarketMovers(5);
      setMarketMovers(moversData);
    } catch (error) {
      console.error("Error loading market movers:", error);
      setMoversError(error as Error);
    } finally {
      setIsLoadingMovers(false);
    }
  };
  
  // Function to load all market data
  const loadData = async () => {
    setIsLoading(true);
    setRefreshing(true);
    
    try {
      const status = await marketStatus.getMarketStatus();
      setMarketStatus(status);
      
      const indicesData = await apiService.getMarketIndices();
      setIndices(indicesData);
      
      const timestamp = apiService.getCacheTimestamp("market_indices");
      if (timestamp) {
        setLastUpdated(timestamp);
      }
      
      const sectorsData = await apiService.getSectorPerformance();
      setSectors(sectorsData);
      
      const stocksData = await apiService.getMajorStocks(settings.watchlist);
      setStocks(stocksData);
      
      const eventsData = await apiService.getMarketEvents();
      setEvents(eventsData);
      
      loadMarketMovers();
      
      loadEconomicIndicators();
      
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error("Failed to load some market data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      scheduleNextRefresh(marketStatusData);
    }
  };
  
  // Schedule next data refresh based on market hours
  const scheduleNextRefresh = (status: MarketStatus | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    if (!settings || !settings.refreshInterval) {
      console.error("Refresh interval settings not available, using default");
      return;
    }
    
    let interval = settings.refreshInterval.closed; // Default to closed market interval
    
    if (status) {
      if (status.isOpen) {
        interval = settings.refreshInterval.marketHours; // Market is open
      } else {
        const now = new Date();
        const hour = now.getHours();
        
        if ((hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20)) {
          interval = settings.refreshInterval.afterHours; // Pre-market or after-hours
        }
      }
    }
    
    refreshTimerRef.current = setTimeout(() => {
      loadData();
    }, interval * 1000);
  };
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [settings.watchlist.join(",")]);
  
  // Update refresh timer when market status changes
  useEffect(() => {
    scheduleNextRefresh(marketStatusData);
  }, [marketStatusData, settings.refreshInterval]);
  
  // Determine which components to render based on settings
  const isComponentVisible = (componentId: string) => {
    if (!settings || !settings.visibleComponents) {
      return false;
    }
    return settings.visibleComponents.includes(componentId);
  };
  
  // Render a collapsible component
  const renderCollapsibleComponent = (
    componentId: string,
    title: string,
    component: React.ReactNode
  ) => {
    const isCollapsed = collapsedComponents[componentId];
    
    if (!isComponentVisible(componentId)) return null;
    
    return (
      <Collapsible
        open={!isCollapsed}
        className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => expandComponent(componentId)}
              className="p-1 rounded-full hover:bg-secondary"
              aria-label="Expand"
            >
              <Expand className="h-4 w-4" />
            </button>
            <CollapsibleTrigger
              onClick={() => toggleComponentCollapse(componentId)}
              className="p-1 rounded-full hover:bg-secondary"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="p-4 pt-0">
            {component}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        <DashboardHeader 
          lastUpdated={lastUpdated}
          refreshData={loadData}
          isRefreshing={refreshing}
          userSettings={settings}
          updateUserSettings={updateSettings}
        />
        
        {/* Market Status Overview */}
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
        
        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ES1 Futures Chart */}
          {isComponentVisible('es1-futures') && (
            <div className={`${isComponentVisible('es1-futures') ? 'lg:col-span-2' : ''}`}>
              {renderCollapsibleComponent(
                'es1-futures',
                'S&P 500 Futures',
                <ES1FuturesChart />
              )}
            </div>
          )}
          
          {/* Market Overview */}
          {isComponentVisible('market-overview') && (
            <div className={`${isComponentVisible('market-overview') ? '' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'market-overview',
                'Market Overview',
                <MarketOverview indices={indices} />
              )}
            </div>
          )}
          
          {/* Economic Data */}
          {isComponentVisible('economic-data') && (
            <div className={`${isComponentVisible('economic-data') ? '' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'economic-data',
                'Economic Indicators',
                <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
              )}
            </div>
          )}
          
          {/* Major Stocks */}
          {isComponentVisible('major-stocks') && (
            <div className={`${isComponentVisible('major-stocks') ? 'lg:col-span-2' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'major-stocks',
                'Watchlist',
                <MajorStocks stocks={stocks} />
              )}
            </div>
          )}
          
          {/* Sector Performance */}
          {isComponentVisible('sector-performance') && (
            <div className={`${isComponentVisible('sector-performance') ? '' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'sector-performance',
                'Sector Performance',
                <SectorPerformance sectors={sectors} />
              )}
            </div>
          )}
          
          {/* Market Events */}
          {isComponentVisible('market-events') && (
            <div className={`${isComponentVisible('market-events') ? '' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'market-events',
                'Market Events',
                <MarketEvents events={events} />
              )}
            </div>
          )}
          
          {/* Market Movers */}
          {isComponentVisible('market-movers') && (
            <div className={`${isComponentVisible('market-movers') ? 'lg:col-span-2' : 'hidden'}`}>
              {renderCollapsibleComponent(
                'market-movers',
                'Market Movers',
                <MarketMovers 
                  gainers={marketMovers.gainers} 
                  losers={marketMovers.losers}
                  isLoading={isLoadingMovers}
                  error={moversError}
                  marketStatus={marketStatusData || undefined}
                  refreshData={loadMarketMovers}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Full-screen component view */}
        {expandedComponent === 'market-overview' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Market Overview"
          >
            <MarketOverview indices={indices} />
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'es1-futures' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="S&P 500 Futures"
          >
            <div className="h-[80vh]">
              <ES1FuturesChart />
            </div>
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'economic-data' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Economic Indicators"
          >
            <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'major-stocks' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Watchlist"
          >
            <MajorStocks stocks={stocks} />
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'sector-performance' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Sector Performance"
          >
            <SectorPerformance sectors={sectors} />
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'market-events' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Market Events"
          >
            <MarketEvents events={events} />
          </FullScreenComponent>
        )}
        
        {expandedComponent === 'market-movers' && (
          <FullScreenComponent 
            isOpen={true} 
            onClose={() => setExpandedComponent(null)}
            title="Market Movers"
          >
            <MarketMovers 
              gainers={marketMovers.gainers} 
              losers={marketMovers.losers}
              isLoading={isLoadingMovers}
              error={moversError}
              marketStatus={marketStatusData || undefined}
              refreshData={loadMarketMovers}
            />
          </FullScreenComponent>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
