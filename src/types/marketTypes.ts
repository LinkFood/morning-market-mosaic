
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
