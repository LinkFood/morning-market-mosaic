
export type DataUpdateType = 'status' | 'data' | 'error';
export type UpdateEventCallback = (data: any, type: DataUpdateType) => void;

/**
 * Manager for data subscription and notification
 */
export class DataSubscriptionManager {
  private subscribers: Array<(data: any) => void> = [];
  
  /**
   * Subscribe to data updates
   * @param callback - Callback function for updates
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Subscribe to updates for multiple symbols
   * @param symbols - Array of symbols to subscribe to
   * @param callback - Callback function for updates
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
   * Notify all subscribers of an update
   * @param data - Update data
   */
  public notifySubscribers(data: any) {
    this.subscribers.forEach(callback => {
      callback(data);
    });
  }
}
