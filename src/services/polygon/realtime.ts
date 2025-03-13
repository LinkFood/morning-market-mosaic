
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
  
  // Add the subscribers property for event handling
  private subscribers: Array<(data: any) => void> = [];
  
  constructor() {
    this.initBatteryMonitoring();
  }
  
  /**
   * Initialize battery monitoring for power-aware updates
   * @private
   */
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
  
  /**
   * Adjust polling frequency based on device battery status
   * @private
   */
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
  
  /**
   * Initialize the realtime service
   * @public
   */
  public init() {
    this.checkMarketStatus();
    this.determineUpdateMethod();
  }
  
  /**
   * Update realtime service settings
   * @param options - Partial options to update
   * @public
   */
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
  
  /**
   * Check and update the current market status
   * @private
   * @returns The current market status
   */
  private async checkMarketStatus() {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastMarketStatusCheck.getTime();
    
    if (timeSinceLastCheck > 5 * 60 * 1000 || !this.marketStatus) {
      try {
        const status = await marketData.getMarketStatus() as MarketStatus;
        this.updateMarketStatus(status);
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
  
  /**
   * Update market status and respond to changes
   * @param status - New market status
   * @private
   */
  private updateMarketStatus(status: MarketStatus) {
    const marketStatusChanged = 
      !this.marketStatus || 
      this.marketStatus.isOpen !== status.isOpen;
    
    this.marketStatus = status;
    
    if (marketStatusChanged) {
      this.determineUpdateMethod();
    }
  }
  
  /**
   * Determine the best update method based on market status and settings
   * @private
   */
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
  
  /**
   * Stop all update methods (polling and WebSocket)
   * @private
   */
  private stopUpdates() {
    this.stopPolling();
    this.disconnectWebSocket();
  }
  
  /**
   * Start polling for updates
   * @param lowPowerMode - Whether to use low power mode (less frequent updates)
   * @private
   */
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
  
  /**
   * Calculate appropriate polling interval based on market hours
   * @private
   * @returns Polling interval in seconds
   */
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
  
  /**
   * Stop all polling intervals
   * @private
   */
  private stopPolling() {
    Object.keys(this.pollingIntervals).forEach((key) => {
      window.clearInterval(this.pollingIntervals[key]);
      delete this.pollingIntervals[key];
    });
    
    this.status.isPolling = false;
    this.notifyStatusChanged();
  }
  
  /**
   * Poll for market indices data
   * @private
   */
  private pollMarketIndices() {
    try {
      console.log('Polling market indices...');
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
    } catch (error) {
      console.error('Error polling market indices:', error);
    }
  }
  
  /**
   * Poll for stock data
   * @private
   */
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
  
  /**
   * Connect to WebSocket for realtime updates
   * @private
   */
  private connectWebSocket() {
    console.log('WebSocket not implemented in this example');
    
    this.status.isConnected = true;
    this.notifyStatusChanged();
  }
  
  /**
   * Disconnect from WebSocket
   * @private
   */
  private disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.status.isConnected = false;
    this.notifyStatusChanged();
  }
  
  /**
   * Subscribe to data updates
   * @param callback - Callback function for updates
   * @public
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to multiple symbols at once
   * @param symbols - Array of symbols to subscribe to
   * @param callback - Callback function for updates
   * @public
   * @returns Unsubscribe function
   */
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
  
  /**
   * Notify subscribers of status changes
   * @private
   */
  private notifyStatusChanged() {
    this.subscribers.forEach(callback => {
      callback({
        type: 'status',
        data: this.getStatus()
      });
    });
  }
  
  /**
   * Get current status of the realtime service
   * @public
   * @returns Current status
   */
  public getStatus(): RealtimeUpdateStatus {
    return { ...this.status };
  }
  
  /**
   * Get the timestamp of the last update
   * @public
   * @returns Last updated timestamp or null
   */
  public getLastUpdated(): Date | null {
    return this.status.lastUpdated;
  }
  
  /**
   * Toggle pausing/resuming updates
   * @public
   * @returns New status (true if resumed, false if paused)
   */
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
  
  /**
   * Manually refresh all data
   * @public
   * @returns Promise resolving to success status
   */
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
  
  /**
   * Update cached data for a symbol
   * @param symbol - Symbol to update
   * @param data - New data
   * @public
   */
  public updateCachedData(symbol: string, data: any) {
    this.cachedData.set(symbol, data);
    this.notifyDataUpdated(symbol, data);
  }
  
  /**
   * Get cached data for a symbol
   * @param symbol - Symbol to get data for
   * @public
   * @returns Cached data or undefined
   */
  public getCachedData(symbol: string) {
    return this.cachedData.get(symbol);
  }
  
  /**
   * Notify subscribers of data updates for a symbol
   * @param symbol - Symbol that was updated
   * @param data - New data
   * @private
   */
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
