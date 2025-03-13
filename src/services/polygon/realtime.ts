/**
 * Polygon.io Realtime API Service
 * Handles real-time data updates using WebSockets and intelligent polling
 */
import { toast } from "sonner";
import { POLYGON_BASE_URL, POLYGON_API_KEY, initializeApiKey } from "../market/config";
import { getMarketStatus } from "./marketData";
import { clearAllCache } from "./cache";
import { 
  MarketStatus, 
  StockData,
  TickerDetails
} from "@/types/marketTypes";

// Default polling intervals in milliseconds
const DEFAULT_INTERVALS = {
  MARKET_HOURS: 30000,  // 30 seconds during market hours
  PRE_MARKET: 60000,    // 1 minute during pre-market
  AFTER_HOURS: 60000,   // 1 minute during after-hours
  CLOSED: 300000,       // 5 minutes when market closed
};

// WebSocket constants
const WS_BASE_URL = "wss://delayed.polygon.io";
const RECONNECT_DELAY = 3000; // 3 seconds

// Event types
export type DataUpdateType = 'stock' | 'index' | 'sector' | 'economic';
export type UpdateEventCallback = (data: any, type: DataUpdateType) => void;

// Update manager state
interface UpdateManagerState {
  isPolling: boolean;
  isConnected: boolean;
  lastUpdated: Date | null;
  marketStatus: MarketStatus | null;
  subscribers: Map<string, Set<UpdateEventCallback>>;
  watchedSymbols: Set<string>;
  userSettings: {
    paused: boolean;
    intervals: {
      marketHours: number;
      afterHours: number;
      closed: number;
    };
  };
  pollingIntervals: Map<string, NodeJS.Timeout>;
}

// The update manager singleton
class UpdateManager {
  private static instance: UpdateManager;
  private state: UpdateManagerState;
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    // Initialize state
    this.state = {
      isPolling: false,
      isConnected: false,
      lastUpdated: null,
      marketStatus: null,
      subscribers: new Map(),
      watchedSymbols: new Set(),
      userSettings: {
        paused: false,
        intervals: {
          marketHours: DEFAULT_INTERVALS.MARKET_HOURS,
          afterHours: DEFAULT_INTERVALS.AFTER_HOURS,
          closed: DEFAULT_INTERVALS.CLOSED,
        },
      },
      pollingIntervals: new Map(),
    };

    // Initialize
    this.init();
  }

  // Get the singleton instance
  public static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  // Initialize the manager
  private async init() {
    try {
      // Get API key
      this.apiKey = await initializeApiKey();
      
      // Get initial market status
      await this.updateMarketStatus();
      
      // Start appropriate update mechanism based on market status
      this.startUpdates();
      
      // Set up interval to check market status every minute
      setInterval(() => this.updateMarketStatus(), 60000);
    } catch (error) {
      console.error("Failed to initialize update manager:", error);
      toast.error("Failed to initialize market data updates");
    }
  }

  // Update market status
  private async updateMarketStatus() {
    try {
      const status = await getMarketStatus();
      const previousStatus = this.state.marketStatus;
      this.state.marketStatus = status;
      
      // If market status changed, adjust update strategy
      if (previousStatus?.isOpen !== status.isOpen) {
        this.adjustUpdateStrategy();
      }
      
      return status;
    } catch (error) {
      console.error("Failed to update market status:", error);
      return null;
    }
  }

  // Adjust update strategy based on market status
  private adjustUpdateStrategy() {
    // Clear all polling intervals
    this.stopPolling();
    
    // If WebSocket is supported and market is open, use WebSocket
    if (this.isWebSocketSupported() && this.state.marketStatus?.isOpen) {
      this.connectWebSocket();
    } else {
      // Otherwise use polling with appropriate frequency
      this.startPolling();
    }
  }

  // Check if WebSocket is supported in the current environment
  private isWebSocketSupported(): boolean {
    return typeof WebSocket !== 'undefined' && this.apiKey !== null;
  }

  // Start updates using the appropriate method
  private startUpdates() {
    if (this.state.userSettings.paused) {
      return;
    }
    
    if (this.isWebSocketSupported() && this.state.marketStatus?.isOpen) {
      this.connectWebSocket();
    } else {
      this.startPolling();
    }
  }

  // Connect to Polygon.io WebSocket
  private connectWebSocket() {
    if (this.ws || !this.apiKey || this.state.userSettings.paused) {
      return;
    }

    try {
      // Create WebSocket connection
      this.ws = new WebSocket(`${WS_BASE_URL}/stocks`);
      
      // Set up event handlers
      this.ws.onopen = this.handleWebSocketOpen.bind(this);
      this.ws.onmessage = this.handleWebSocketMessage.bind(this);
      this.ws.onclose = this.handleWebSocketClose.bind(this);
      this.ws.onerror = this.handleWebSocketError.bind(this);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      this.fallbackToPolling();
    }
  }

  // Handle WebSocket open event
  private handleWebSocketOpen() {
    if (!this.ws || !this.apiKey) return;
    
    try {
      // Reset reconnect attempts
      this.reconnectAttempts = 0;
      
      // Set state
      this.state.isConnected = true;
      
      // Authenticate
      this.ws.send(JSON.stringify({ action: "auth", params: this.apiKey }));
      
      // Subscribe to watched symbols
      this.subscribeToSymbols();
      
      console.log("WebSocket connected to Polygon.io");
      this.notifyUpdate();
    } catch (error) {
      console.error("WebSocket open handler error:", error);
    }
  }

  // Subscribe to watched symbols
  private subscribeToSymbols() {
    if (!this.ws || !this.state.isConnected || this.state.watchedSymbols.size === 0) {
      return;
    }
    
    try {
      const symbols = Array.from(this.state.watchedSymbols);
      const subscribeMessage = {
        action: "subscribe",
        params: symbols.map(symbol => `T.${symbol}`).join(",")
      };
      
      this.ws.send(JSON.stringify(subscribeMessage));
      console.log(`Subscribed to ${symbols.length} symbols`);
    } catch (error) {
      console.error("Failed to subscribe to symbols:", error);
    }
  }

  // Handle WebSocket message event
  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      if (Array.isArray(data)) {
        data.forEach(msg => {
          if (msg.ev === 'T') {
            this.processTradeUpdate(msg);
          }
        });
      } else if (data.status === 'connected') {
        console.log("WebSocket authenticated successfully");
      } else if (data.status === 'auth_success') {
        console.log("WebSocket authenticated successfully");
      } else if (data.status === 'success' && data.message?.includes('subscribed')) {
        console.log("WebSocket subscription successful");
      }
      
      this.notifyUpdate();
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  }

  // Process trade update from WebSocket
  private processTradeUpdate(trade: any) {
    if (!trade || !trade.sym) return;
    
    const symbol = trade.sym;
    const price = trade.p;
    const size = trade.s;
    const timestamp = trade.t;
    
    // Create stock data update
    const update: Partial<StockData> = {
      ticker: symbol,
      close: price,
      // Other fields would need to be calculated based on previous data
    };
    
    // Notify subscribers
    this.notifySubscribers(symbol, update, 'stock');
  }

  // Handle WebSocket close event
  private handleWebSocketClose(event: CloseEvent) {
    this.state.isConnected = false;
    this.ws = null;
    
    console.log(`WebSocket closed: ${event.code} ${event.reason}`);
    
    // Attempt to reconnect if not closed intentionally
    if (!this.state.userSettings.paused) {
      this.attemptReconnect();
    }
  }

  // Handle WebSocket error event
  private handleWebSocketError(error: Event) {
    console.error("WebSocket error:", error);
    this.state.isConnected = false;
    
    // Fall back to polling
    this.fallbackToPolling();
  }

  // Attempt to reconnect WebSocket
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached, falling back to polling");
      this.fallbackToPolling();
      return;
    }
    
    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.state.isConnected && !this.state.userSettings.paused) {
        this.connectWebSocket();
      }
    }, delay);
  }

  // Fall back to polling if WebSocket fails
  private fallbackToPolling() {
    if (!this.state.isPolling && !this.state.userSettings.paused) {
      console.log("Falling back to polling mechanism");
      this.startPolling();
    }
  }

  // Start polling mechanism
  private startPolling() {
    if (this.state.isPolling || this.state.userSettings.paused) {
      return;
    }
    
    this.state.isPolling = true;
    
    // Poll different data types at different intervals
    this.setupPollingInterval('stocks', this.pollStocks.bind(this), this.getPollingInterval());
    this.setupPollingInterval('indices', this.pollIndices.bind(this), this.getPollingInterval());
    this.setupPollingInterval('sectors', this.pollSectors.bind(this), this.getPollingInterval() * 2);
    
    console.log(`Polling started with ${this.getPollingInterval()}ms interval`);
  }

  // Set up a polling interval for a specific data type
  private setupPollingInterval(key: string, pollFn: () => Promise<void>, interval: number) {
    if (this.state.pollingIntervals.has(key)) {
      clearInterval(this.state.pollingIntervals.get(key)!);
    }
    
    // Execute immediately and then set interval
    pollFn();
    
    const intervalId = setInterval(pollFn, interval);
    this.state.pollingIntervals.set(key, intervalId);
  }

  // Stop all polling
  private stopPolling() {
    if (!this.state.isPolling) {
      return;
    }
    
    // Clear all intervals
    this.state.pollingIntervals.forEach(interval => clearInterval(interval));
    this.state.pollingIntervals.clear();
    this.state.isPolling = false;
    
    console.log("Polling stopped");
  }

  // Poll for stock updates
  private async pollStocks(): Promise<void> {
    if (this.state.watchedSymbols.size === 0) {
      return;
    }
    
    try {
      // Get batches of 10 symbols at a time to avoid large requests
      const symbols = Array.from(this.state.watchedSymbols);
      const batches = [];
      
      for (let i = 0; i < symbols.length; i += 10) {
        batches.push(symbols.slice(i, i + 10));
      }
      
      // Fetch each batch
      for (const batch of batches) {
        // Import here to avoid circular dependencies
        const { getBatchStockSnapshots } = await import("./marketData");
        const snapshots = await getBatchStockSnapshots(batch);
        
        // Process each snapshot
        for (const symbol in snapshots) {
          this.notifySubscribers(symbol, snapshots[symbol], 'stock');
        }
      }
      
      this.notifyUpdate();
    } catch (error) {
      console.error("Error polling stocks:", error);
    }
  }

  // Poll for index updates
  private async pollIndices(): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { getBatchIndexData } = await import("./historical");
      
      // Common indices
      const indices = ["SPY", "QQQ", "DIA", "IWM"];
      const indexData = await getBatchIndexData(indices);
      
      // Process each index
      for (const symbol in indexData) {
        this.notifySubscribers(symbol, indexData[symbol], 'index');
      }
      
      this.notifyUpdate();
    } catch (error) {
      console.error("Error polling indices:", error);
    }
  }

  // Poll for sector updates
  private async pollSectors(): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { getSectorPerformance } = await import("./reference");
      
      const sectors = await getSectorPerformance();
      
      // Notify subscribers
      this.notifySubscribers("sectors", sectors, 'sector');
      this.notifyUpdate();
    } catch (error) {
      console.error("Error polling sectors:", error);
    }
  }

  // Get appropriate polling interval based on market status and user settings
  private getPollingInterval(): number {
    if (!this.state.marketStatus) {
      return this.state.userSettings.intervals.closed;
    }
    
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    if (isWeekend) {
      return this.state.userSettings.intervals.closed;
    }
    
    if (this.state.marketStatus.isOpen) {
      return this.state.userSettings.intervals.marketHours;
    }
    
    // Pre-market (4:00 AM - 9:30 AM)
    if (hour >= 4 && hour < 9.5) {
      return this.state.userSettings.intervals.afterHours;
    }
    
    // After-hours (4:00 PM - 8:00 PM)
    if (hour >= 16 && hour < 20) {
      return this.state.userSettings.intervals.afterHours;
    }
    
    // Market closed
    return this.state.userSettings.intervals.closed;
  }

  // Subscribe to updates for a symbol
  public subscribe(symbol: string, callback: UpdateEventCallback): () => void {
    // Add symbol to watched symbols
    this.state.watchedSymbols.add(symbol);
    
    // Add callback to subscribers
    if (!this.state.subscribers.has(symbol)) {
      this.state.subscribers.set(symbol, new Set());
    }
    
    this.state.subscribers.get(symbol)!.add(callback);
    
    // Subscribe to symbol in WebSocket if connected
    if (this.state.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        action: "subscribe",
        params: `T.${symbol}`
      }));
    }
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.state.subscribers.get(symbol);
      if (subscribers) {
        subscribers.delete(callback);
        
        // If no more subscribers for this symbol, remove it from watched symbols
        if (subscribers.size === 0) {
          this.state.subscribers.delete(symbol);
          this.state.watchedSymbols.delete(symbol);
          
          // Unsubscribe from symbol in WebSocket if connected
          if (this.state.isConnected && this.ws) {
            this.ws.send(JSON.stringify({
              action: "unsubscribe",
              params: `T.${symbol}`
            }));
          }
        }
      }
    };
  }

  // Subscribe to updates for multiple symbols
  public subscribeMultiple(symbols: string[], callback: UpdateEventCallback): () => void {
    const unsubscribers = symbols.map(symbol => this.subscribe(symbol, callback));
    
    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }
  
  // Subscribe to a specific data type (like 'sectors')
  public subscribeToType(type: string, callback: UpdateEventCallback): () => void {
    return this.subscribe(type, callback);
  }

  // Notify subscribers about updates for a symbol
  private notifySubscribers(symbol: string, data: any, type: DataUpdateType): void {
    const subscribers = this.state.subscribers.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data, type);
        } catch (error) {
          console.error(`Error in subscriber callback for ${symbol}:`, error);
        }
      });
    }
  }

  // Notify about any update (for UI indicators)
  private notifyUpdate(): void {
    this.state.lastUpdated = new Date();
  }

  // Manually trigger an update
  public async refreshData(): Promise<void> {
    try {
      // Clear cache to ensure fresh data
      await clearAllCache();
      
      // Update market status
      await this.updateMarketStatus();
      
      // Poll for fresh data
      await Promise.all([
        this.pollStocks(),
        this.pollIndices(),
        this.pollSectors()
      ]);
      
      toast.success("Market data refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh market data");
    }
  }

  // Pause updates
  public pauseUpdates(): void {
    this.state.userSettings.paused = true;
    
    // Disconnect WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Stop polling
    this.stopPolling();
    
    console.log("Updates paused");
  }

  // Resume updates
  public resumeUpdates(): void {
    this.state.userSettings.paused = false;
    
    // Restart updates
    this.startUpdates();
    
    console.log("Updates resumed");
  }

  // Toggle pause/resume
  public toggleUpdates(): boolean {
    if (this.state.userSettings.paused) {
      this.resumeUpdates();
    } else {
      this.pauseUpdates();
    }
    
    return !this.state.userSettings.paused;
  }

  // Update user settings
  public updateSettings(settings: {
    intervals?: {
      marketHours?: number;
      afterHours?: number;
      closed?: number;
    }
  }): void {
    if (settings.intervals) {
      this.state.userSettings.intervals = {
        ...this.state.userSettings.intervals,
        ...(settings.intervals || {})
      };
      
      // Restart polling with new intervals
      if (this.state.isPolling) {
        this.stopPolling();
        this.startPolling();
      }
    }
  }

  // Get last updated timestamp
  public getLastUpdated(): Date | null {
    return this.state.lastUpdated;
  }

  // Get connection status
  public getStatus(): {
    isPolling: boolean;
    isConnected: boolean;
    lastUpdated: Date | null;
    isPaused: boolean;
  } {
    return {
      isPolling: this.state.isPolling,
      isConnected: this.state.isConnected,
      lastUpdated: this.state.lastUpdated,
      isPaused: this.state.userSettings.paused
    };
  }

  // Clean up resources
  public dispose(): void {
    // Disconnect WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Stop polling
    this.stopPolling();
    
    // Clear state
    this.state.subscribers.clear();
    this.state.watchedSymbols.clear();
    
    console.log("Update manager disposed");
  }
}

// Export the update manager
export const realtime = {
  getInstance: () => UpdateManager.getInstance(),
  
  // Helper functions
  subscribe: (symbol: string, callback: UpdateEventCallback) => 
    UpdateManager.getInstance().subscribe(symbol, callback),
    
  subscribeMultiple: (symbols: string[], callback: UpdateEventCallback) => 
    UpdateManager.getInstance().subscribeMultiple(symbols, callback),
    
  subscribeToType: (type: string, callback: UpdateEventCallback) => 
    UpdateManager.getInstance().subscribeToType(type, callback),
    
  refreshData: () => UpdateManager.getInstance().refreshData(),
  
  pauseUpdates: () => UpdateManager.getInstance().pauseUpdates(),
  
  resumeUpdates: () => UpdateManager.getInstance().resumeUpdates(),
  
  toggleUpdates: () => UpdateManager.getInstance().toggleUpdates(),
  
  updateSettings: (settings: any) => UpdateManager.getInstance().updateSettings(settings),
  
  getStatus: () => UpdateManager.getInstance().getStatus(),
  
  getLastUpdated: () => UpdateManager.getInstance().getLastUpdated(),
  
  dispose: () => UpdateManager.getInstance().dispose()
};

export default realtime;
