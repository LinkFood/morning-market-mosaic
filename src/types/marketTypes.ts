
// Common types used across the market dashboard

export interface MarketIndex {
  ticker: string;
  name: string;
  close: number;
  open: number;
  change: number;
  changePercent: number;
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
  close: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
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
  type: string; // Changed from "earnings" | "economic" to accept any string
  title: string;
  date: string;
  time: string;
  importance: string; // Changed from "low" | "medium" | "high" to accept any string
}

export interface UserSettings {
  watchlist: string[];
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
