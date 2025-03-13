
import { RealtimeUpdateStatus, RealtimeOptions, MarketStatus, StockData } from '@/types/marketTypes';
import { clearAllCache } from './cache';
import marketData from './marketData';

export type DataUpdateType = 'status' | 'data' | 'error';
export type UpdateEventCallback = (data: any, type: DataUpdateType) => void;

/**
 * Realtime data service for Polygon.io
 * Supports both polling and WebSocket connections
 */
class RealtimeService {
  private status: RealtimeUpdateStatus = {
    isConnected: false,
    isPolling: false,
    lastUpdated: null,
    isPaused: false
  };
  
  private options: RealtimeOptions = {
    updateMethod: 'auto',
    prioritySymbols: [],
    batteryOptimization: false,
    intervals: {
      marketHours: 60,   // 1 minute during market hours
      afterHours: 300,   // 5 minutes during extended hours
      closed: 900        // 15 minutes when market is closed
    }
  };
  
  private pollingIntervals: Record<string, number> = {};
  private websocket: WebSocket | null = null;
  private marketStatus: MarketStatus | null = null;
  private lastMarketStatusCheck: Date = new Date(0);
  private cachedData: Map<string, any> = new Map();
  private batteryStatus: { charging: boolean, level: number } = { 
    charging: true, 
    level: 1.0 
  };
  
  constructor() {
    this.initBatteryMonitoring();
  }
  
  private async initBatteryMonitoring() {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        this.batteryStatus = {
          charging: battery.charging,
          level: battery.level
        };
        
        battery.addEventListener('chargingchange', () => {
          this.batteryStatus.charging = battery.charging;
          this.adjustPollingForBattery();
        });
        
        battery.addEventListener('levelchange', () => {
          this.batteryStatus.level = battery.level;
          this.adjustPollingForBattery();
        });
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  
  private adjustPollingForBattery() {
    if (!this.options.batteryOptimization) return;
    
    if (!this.batteryStatus.charging && this.batteryStatus.level < 0.2) {
      this.stopPolling();
      this.startPolling(true);
    } else {
      if (this.status.isPolling) {
        this.stopPolling();
        this.startPolling(false);
      }
    }
  }
  
  public init() {
    this.checkMarketStatus();
    
    this.determineUpdateMethod();
  }
  
  public updateSettings(options: Partial<RealtimeOptions>) {
    this.options = {
      ...this.options,
      ...options
    };
    
    if (this.status.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
    
    this.adjustPollingForBattery();
  }
  
  private async checkMarketStatus() {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastMarketStatusCheck.getTime();
    
    if (timeSinceLastCheck > 5 * 60 * 1000 || !this.marketStatus) {
      try {
        const status = await marketData.getMarketStatus();
        this.updateMarketStatus(status as MarketStatus);
        this.lastMarketStatusCheck = now;
      } catch (error) {
        console.error('Failed to get market status:', error);
        // Create a default MarketStatus object if the API call fails
        const defaultStatus: MarketStatus = {
          market: 'unknown',
          serverTime: new Date().toISOString(),
          exchanges: {},
          isOpen: false,
          nextOpeningTime: null
        };
        this.marketStatus = defaultStatus;
      }
    }
    
    return this.marketStatus;
  }
  
  private updateMarketStatus(status: MarketStatus) {
    const marketStatusChanged = 
      !this.marketStatus || 
      this.marketStatus.isOpen !== status.isOpen;
    
    this.marketStatus = status;
    
    if (marketStatusChanged) {
      this.determineUpdateMethod();
    }
  }
  
  private determineUpdateMethod() {
    if (this.status.isPaused) return;
    
    if (!this.marketStatus) return;
    
    this.stopUpdates();
    
    if (this.options.updateMethod === 'websocket') {
      this.connectWebSocket();
    } else if (this.options.updateMethod === 'polling') {
      this.startPolling();
    } else {
      if (this.marketStatus.isOpen) {
        this.startPolling();
      } else {
        this.startPolling();
      }
    }
  }
  
  private stopUpdates() {
    this.stopPolling();
    this.disconnectWebSocket();
  }
  
  private startPolling(lowPowerMode = false) {
    if (this.status.isPolling) return;
    
    let interval = this.getPollingInterval();
    
    if (lowPowerMode) {
      interval = interval * 2;
    }
    
    this.pollingIntervals['marketIndices'] = window.setInterval(() => {
      this.pollMarketIndices();
    }, interval * 1000);
    
    this.pollingIntervals['stocks'] = window.setInterval(() => {
      this.pollStocks();
    }, interval * 1000);
    
    this.pollingIntervals['marketStatus'] = window.setInterval(() => {
      this.checkMarketStatus();
    }, 5 * 60 * 1000);
    
    this.status.isPolling = true;
    this.notifyStatusChanged();
  }
  
  private getPollingInterval(): number {
    if (!this.marketStatus) {
      return this.options.intervals?.closed || 900;
    }
    
    if (this.marketStatus.isOpen) {
      return this.options.intervals?.marketHours || 60;
    }
    
    const now = new Date();
    const hour = now.getHours();
    
    if ((hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20)) {
      return this.options.intervals?.afterHours || 300;
    }
    
    return this.options.intervals?.closed || 900;
  }
  
  private stopPolling() {
    Object.keys(this.pollingIntervals).forEach((key) => {
      window.clearInterval(this.pollingIntervals[key]);
      delete this.pollingIntervals[key];
    });
    
    this.status.isPolling = false;
    this.notifyStatusChanged();
  }
  
  private pollMarketIndices() {
    try {
      console.log('Polling market indices...');
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
    } catch (error) {
      console.error('Error polling market indices:', error);
    }
  }
  
  private pollStocks() {
    try {
      const prioritySymbols = this.options.prioritySymbols || [];
      
      if (prioritySymbols.length > 0) {
        console.log('Polling priority stocks...', prioritySymbols);
      } else {
        console.log('Polling general stocks...');
      }
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
    } catch (error) {
      console.error('Error polling stocks:', error);
    }
  }
  
  private connectWebSocket() {
    console.log('WebSocket not implemented in this example');
    
    this.status.isConnected = true;
    this.notifyStatusChanged();
  }
  
  private disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.status.isConnected = false;
    this.notifyStatusChanged();
  }
  
  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  public subscribeMultiple(symbols: string[], callback: UpdateEventCallback) {
    // Create separate subscriptions for each symbol
    const unsubscribes = symbols.map(symbol => this.subscribe((data) => {
      if (data.symbol === symbol || data.type === 'status') {
        callback(data.data, data.type as DataUpdateType);
      }
    }));
    
    // Return a function that unsubscribes all
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }
  
  private notifyStatusChanged() {
    this.subscribers.forEach(callback => {
      callback({
        type: 'status',
        data: this.getStatus()
      });
    });
  }
  
  public getStatus(): RealtimeUpdateStatus {
    return { ...this.status };
  }
  
  public getLastUpdated(): Date | null {
    return this.status.lastUpdated;
  }
  
  public toggleUpdates(): boolean {
    this.status.isPaused = !this.status.isPaused;
    
    if (this.status.isPaused) {
      this.stopUpdates();
    } else {
      this.determineUpdateMethod();
    }
    
    this.notifyStatusChanged();
    return !this.status.isPaused;
  }
  
  public async refreshData() {
    try {
      clearAllCache();
      
      await this.checkMarketStatus();
      
      console.log('Manually refreshing all data...');
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
      
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  }
  
  public updateCachedData(symbol: string, data: any) {
    this.cachedData.set(symbol, data);
    this.notifyDataUpdated(symbol, data);
  }
  
  public getCachedData(symbol: string) {
    return this.cachedData.get(symbol);
  }
  
  private notifyDataUpdated(symbol: string, data: any) {
    this.subscribers.forEach(callback => {
      callback({
        type: 'data',
        symbol,
        data
      });
    });
  }
}

export const realtime = new RealtimeService();

realtime.init();
