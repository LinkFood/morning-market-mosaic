
import { 
  MarketIndex, 
  SectorPerformance, 
  StockData, 
  EconomicIndicator, 
  MarketEvent, 
  UserSettings, 
  MarketStatus,
  MarketMovers
} from "@/types/marketTypes";

// Dashboard context type
export type DashboardContextType = {
  indices: MarketIndex[];
  sectors: SectorPerformance[];
  stocks: StockData[];
  indicators: EconomicIndicator[];
  events: MarketEvent[];
  marketStatusData: MarketStatus | null;
  marketMovers: MarketMovers;
  isLoading: boolean;
  isLoadingEcon: boolean;
  isLoadingMovers: boolean;
  lastUpdated: Date | null;
  settings: UserSettings;
  moversError: Error | null;
  refreshing: boolean;
  expandedComponent: string | null;
  collapsedComponents: {[key: string]: boolean};
  featureFlags: ReturnType<typeof import("@/services/features").getFeatureFlags>;
  loadData: () => Promise<void>;
  loadEconomicIndicators: () => Promise<void>;
  loadMarketMovers: () => Promise<void>;
  updateSettings: (newSettings: UserSettings) => void;
  toggleComponentCollapse: (componentId: string) => void;
  expandComponent: (componentId: string) => void;
  setExpandedComponent: (componentId: string | null) => void;
  isComponentVisible: (componentId: string) => boolean;
};

// Default settings
export const defaultSettings: UserSettings = {
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
