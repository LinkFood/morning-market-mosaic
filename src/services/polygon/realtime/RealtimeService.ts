
import { RealtimeUpdateStatus, RealtimeOptions, MarketStatus, StockData } from '@/types/marketTypes';
import { clearCache } from '../cache';
import marketData from '../marketData';
import { BatteryManager } from './BatteryManager';
import { PollingManager } from './PollingManager';
import { WebSocketManager } from './WebSocketManager';
import { DataSubscriptionManager, DataUpdateType, UpdateEventCallback } from './DataSubscriptionManager';

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
  
  private marketStatus: MarketStatus | null = null;
  private lastMarketStatusCheck: Date = new Date(0);
  private cachedData: Map<string, any> = new Map();
  
  // Managers
  private batteryManager: BatteryManager;
  private pollingManager: PollingManager;
  private webSocketManager: WebSocketManager;
  private subscriptionManager: DataSubscriptionManager;
  
  constructor() {
    this.batteryManager = new BatteryManager(this.handleBatteryStatusChange.bind(this));
    this.pollingManager = new PollingManager(this.handlePollingUpdate.bind(this));
    this.webSocketManager = new WebSocketManager(this.handleWebSocketUpdate.bind(this));
    this.subscriptionManager = new DataSubscriptionManager();
    
    this.batteryManager.init();
  }
  
  /**
   * Handle battery status changes
   */
  private handleBatteryStatusChange(charging: boolean, level: number): void {
    if (!this.options.batteryOptimization) return;
    
    if (!charging && level < 0.2) {
      this.pollingManager.stop();
      this.pollingManager.start(this.getPollingInterval(), true);
    } else {
      if (this.status.isPolling) {
        this.pollingManager.stop();
        this.pollingManager.start(this.getPollingInterval(), false);
      }
    }
  }
  
  /**
   * Handle polling updates
   */
  private handlePollingUpdate(type: string): void {
    this.status.lastUpdated = new Date();
    this.notifyStatusChanged();
  }
  
  /**
   * Handle WebSocket updates
   */
  private handleWebSocketUpdate(connected: boolean): void {
    this.status.isConnected = connected;
    this.notifyStatusChanged();
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
      this.pollingManager.stop();
      this.pollingManager.start(this.getPollingInterval());
    }
    
    if (options.batteryOptimization !== undefined) {
      this.batteryManager.toggleOptimization(options.batteryOptimization);
    }
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
      this.webSocketManager.connect();
    } else if (this.options.updateMethod === 'polling') {
      this.pollingManager.start(this.getPollingInterval());
    } else {
      if (this.marketStatus.isOpen) {
        this.pollingManager.start(this.getPollingInterval());
      } else {
        this.pollingManager.start(this.getPollingInterval());
      }
    }
  }
  
  /**
   * Stop all update methods (polling and WebSocket)
   * @private
   */
  private stopUpdates() {
    this.pollingManager.stop();
    this.webSocketManager.disconnect();
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
   * Notify subscribers of status changes
   * @private
   */
  private notifyStatusChanged() {
    this.subscriptionManager.notifySubscribers({
      type: 'status',
      data: this.getStatus()
    });
  }
  
  /**
   * Subscribe to data updates
   * @param callback - Callback function for updates
   * @public
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: any) => void) {
    return this.subscriptionManager.subscribe(callback);
  }
  
  /**
   * Subscribe to multiple symbols at once
   * @param symbols - Array of symbols to subscribe to
   * @param callback - Callback function for updates
   * @public
   * @returns Unsubscribe function
   */
  public subscribeMultiple(symbols: string[], callback: UpdateEventCallback) {
    return this.subscriptionManager.subscribeMultiple(symbols, callback);
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
      clearCache();
      
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
    this.subscriptionManager.notifySubscribers({
      type: 'data',
      symbol,
      data
    });
  }
}

export default RealtimeService;
