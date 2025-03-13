
import { RealtimeUpdateStatus, RealtimeOptions, MarketStatus, StockData } from '@/types/marketTypes';
import { clearCache } from './cache';
import marketData from './marketData';

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
  private subscribers: Array<(data: any) => void> = [];
  private lastMarketStatusCheck: Date = new Date(0);
  private cachedData: Map<string, any> = new Map();
  private batteryStatus: { charging: boolean, level: number } = { 
    charging: true, 
    level: 1.0 
  };
  
  constructor() {
    this.initBatteryMonitoring();
  }
  
  /**
   * Initialize battery monitoring if available in the browser
   */
  private async initBatteryMonitoring() {
    try {
      // Check if Battery API is available
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        // Update initial status
        this.batteryStatus = {
          charging: battery.charging,
          level: battery.level
        };
        
        // Listen for battery status changes
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
   * Adjust polling frequency based on battery status
   */
  private adjustPollingForBattery() {
    if (!this.options.batteryOptimization) return;
    
    // If on battery and battery level is low (< 20%)
    if (!this.batteryStatus.charging && this.batteryStatus.level < 0.2) {
      // Double all intervals to reduce battery usage
      this.stopPolling();
      this.startPolling(true);
    } else {
      // Reset to normal intervals
      if (this.status.isPolling) {
        this.stopPolling();
        this.startPolling(false);
      }
    }
  }
  
  /**
   * Initialize realtime updates
   */
  public init() {
    this.checkMarketStatus();
    
    // Start updates based on current market status
    this.determineUpdateMethod();
  }
  
  /**
   * Update configuration options
   */
  public updateSettings(options: Partial<RealtimeOptions>) {
    this.options = {
      ...this.options,
      ...options
    };
    
    // Restart updates with new settings
    if (this.status.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
    
    this.adjustPollingForBattery();
  }
  
  /**
   * Get current market status
   */
  private async checkMarketStatus() {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastMarketStatusCheck.getTime();
    
    // Only check every 5 minutes to avoid excessive API calls
    if (timeSinceLastCheck > 5 * 60 * 1000 || !this.marketStatus) {
      try {
        const status = await marketData.getMarketStatus();
        this.updateMarketStatus(status);
        this.lastMarketStatusCheck = now;
      } catch (error) {
        console.error('Failed to get market status:', error);
        // Fallback to assuming market is closed
        this.marketStatus = {
          market: 'unknown',
          serverTime: new Date().toISOString(),
          exchanges: {},
          isOpen: false,
          nextOpeningTime: null
        };
      }
    }
    
    return this.marketStatus;
  }
  
  /**
   * Update stored market status
   */
  private updateMarketStatus(status: MarketStatus) {
    const marketStatusChanged = 
      !this.marketStatus || 
      this.marketStatus.isOpen !== status.isOpen;
    
    this.marketStatus = status;
    
    // Adjust update method if market status changed
    if (marketStatusChanged) {
      this.determineUpdateMethod();
    }
  }
  
  /**
   * Determine the best update method based on market status and settings
   */
  private determineUpdateMethod() {
    // Don't change anything if updates are paused
    if (this.status.isPaused) return;
    
    // First, check market status
    if (!this.marketStatus) return;
    
    // Stop current updates
    this.stopUpdates();
    
    if (this.options.updateMethod === 'websocket') {
      this.connectWebSocket();
    } else if (this.options.updateMethod === 'polling') {
      this.startPolling();
    } else {
      // Auto method - choose based on market status
      if (this.marketStatus.isOpen) {
        // During market hours, prefer WebSocket if available in your plan
        this.startPolling();
        // In a real implementation, you would use WebSocket for real-time data
        // this.connectWebSocket();
      } else {
        // When market is closed, polling is sufficient
        this.startPolling();
      }
    }
  }
  
  /**
   * Stop all active updates
   */
  private stopUpdates() {
    this.stopPolling();
    this.disconnectWebSocket();
  }
  
  /**
   * Start polling for updates
   */
  private startPolling(lowPowerMode = false) {
    if (this.status.isPolling) return;
    
    // Determine polling interval based on market status
    let interval = this.getPollingInterval();
    
    // Adjust for low power mode if needed
    if (lowPowerMode) {
      interval = interval * 2;
    }
    
    // Start different polling for different data types
    this.pollingIntervals['marketIndices'] = window.setInterval(() => {
      this.pollMarketIndices();
    }, interval * 1000); // Convert to milliseconds
    
    this.pollingIntervals['stocks'] = window.setInterval(() => {
      this.pollStocks();
    }, interval * 1000); // Convert to milliseconds
    
    // Check market status occasionally
    this.pollingIntervals['marketStatus'] = window.setInterval(() => {
      this.checkMarketStatus();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    this.status.isPolling = true;
    this.notifyStatusChanged();
  }
  
  /**
   * Determine polling interval based on market hours
   */
  private getPollingInterval(): number {
    if (!this.marketStatus) {
      return this.options.intervals?.closed || 900;
    }
    
    // Check if market is open
    if (this.marketStatus.isOpen) {
      return this.options.intervals?.marketHours || 60;
    }
    
    // Check if it's extended hours
    const now = new Date();
    const hour = now.getHours();
    
    // Pre-market (4:00 AM - 9:30 AM) or after-hours (4:00 PM - 8:00 PM)
    if ((hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20)) {
      return this.options.intervals?.afterHours || 300;
    }
    
    // Market closed
    return this.options.intervals?.closed || 900;
  }
  
  /**
   * Stop all polling operations
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
   * Poll for market indices
   */
  private async pollMarketIndices() {
    try {
      // In a real implementation, this would get real-time market index data
      // For this example, we're just simulating an update
      console.log('Polling market indices...');
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
    } catch (error) {
      console.error('Error polling market indices:', error);
    }
  }
  
  /**
   * Poll for stock data
   */
  private async pollStocks() {
    try {
      // Prioritize certain stocks based on settings
      const prioritySymbols = this.options.prioritySymbols || [];
      
      if (prioritySymbols.length > 0) {
        // In a real implementation, batch request stock data
        console.log('Polling priority stocks...', prioritySymbols);
      } else {
        // Poll a general set of stocks
        console.log('Polling general stocks...');
      }
      
      this.status.lastUpdated = new Date();
      this.notifyStatusChanged();
    } catch (error) {
      console.error('Error polling stocks:', error);
    }
  }
  
  /**
   * Connect to WebSocket for real-time updates
   */
  private connectWebSocket() {
    // In a real implementation, connect to Polygon.io WebSocket API
    console.log('WebSocket not implemented in this example');
    
    // Simulate connected state
    this.status.isConnected = true;
    this.notifyStatusChanged();
  }
  
  /**
   * Disconnect WebSocket
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
   * Subscribe to updates
   */
  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all subscribers of status changes
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
   * Get current status
   */
  public getStatus(): RealtimeUpdateStatus {
    return { ...this.status };
  }
  
  /**
   * Get last updated timestamp
   */
  public getLastUpdated(): Date | null {
    return this.status.lastUpdated;
  }
  
  /**
   * Pause or resume updates
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
   */
  public async refreshData() {
    try {
      // Clear cache to ensure fresh data
      clearCache();
      
      // Update market status
      await this.checkMarketStatus();
      
      // In a real implementation, this would refresh all relevant data
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
   */
  public updateCachedData(symbol: string, data: any) {
    this.cachedData.set(symbol, data);
    this.notifyDataUpdated(symbol, data);
  }
  
  /**
   * Get cached data for a symbol
   */
  public getCachedData(symbol: string) {
    return this.cachedData.get(symbol);
  }
  
  /**
   * Notify subscribers of data updates
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

// Export singleton instance
export const realtime = new RealtimeService();

// Initialize on import
realtime.init();
