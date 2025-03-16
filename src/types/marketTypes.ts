// Common types used across the market dashboard

export interface MarketIndex {
  ticker: string;
  name: string;
  close: number;
  open: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  previousClose?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  afterHoursChange?: number;
  afterHoursChangePercent?: number;
}

export interface SectorPerformance {
  ticker: string;
  name: string;
  close: number;
  open: number;
  change: number;
  changePercent: number;
}

export interface StockData {
  ticker: string;
  name?: string;
  close: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume?: number;
  avgVolume?: number;
  lastUpdated?: Date;
  previousClose?: number;
  marketCap?: number;
  sector?: string;
}

export interface EconomicIndicator {
  id: string;
  name: string;
  value: number;
  previous: number;
  change: number;
  unit: string;
  date: string;
}

export interface MarketEvent {
  type: string;
  title: string;
  date: string;
  time: string;
  importance: string;
}

export interface UserSettings {
  watchlist: string[];
  visibleComponents: string[];
  componentOrder?: string[];
  refreshInterval: {
    marketHours: number;
    afterHours: number;
    closed: number;
  };
  realtimeUpdates?: {
    enabled: boolean;
    method: 'auto' | 'polling' | 'websocket';
    priorityData: 'watchlist' | 'visible' | 'all';
  };
  compactMode?: boolean;
  batteryOptimization?: boolean;
  touchGestures?: boolean;
  activeSection?: string;
  notificationsEnabled?: boolean;
}

// New interfaces for Polygon API data

export interface MarketStatus {
  market: string;
  serverTime: string;
  exchanges: Record<string, string>;
  isOpen: boolean;
  nextOpeningTime: string | null;
}

export interface MarketMovers {
  gainers: StockData[];
  losers: StockData[];
}

export interface TickerDetails {
  ticker: string;
  name: string;
  description: string;
  homepageUrl: string;
  phoneNumber: string;
  listDate: string;
  marketCap: number;
  employees: number;
  sector: string;
  exchange: string;
  address: {
    address1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  author: string;
  source: string;
  url: string;
  imageUrl: string;
  description: string;
  publishedDate: string;
  tickers: string[];
  keywords: string[];
}

export interface MarketHoliday {
  name: string;
  date: string;
  status: string;
  exchange: string;
}

export interface CandleData {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketBreadthData {
  advancers: number;
  decliners: number;
  unchanged: number;
  newHighs: number;
  newLows: number;
  timestamp: string;
}

// Realtime update specific types
export interface RealtimeUpdateStatus {
  isConnected: boolean;
  isPolling: boolean;
  lastUpdated: Date | null;
  isPaused: boolean;
}

export interface RealtimeOptions {
  updateMethod?: 'auto' | 'polling' | 'websocket';
  updateInterval?: number;
  prioritySymbols?: string[];
  batteryOptimization?: boolean;
  intervals?: {
    marketHours: number;
    afterHours: number;
    closed: number;
  };
}
