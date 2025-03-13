
/**
 * Manager for polling-based data updates
 */
export class PollingManager {
  private pollingIntervals: Record<string, number> = {};
  private updateCallback: (type: string) => void;
  private isPolling: boolean = false;
  
  constructor(updateCallback: (type: string) => void) {
    this.updateCallback = updateCallback;
  }
  
  /**
   * Start polling for updates
   * @param interval - Base polling interval in seconds
   * @param lowPowerMode - Whether to use low power mode
   */
  public start(interval: number, lowPowerMode: boolean = false) {
    if (this.isPolling) return;
    
    // Apply low power mode if needed
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
      this.updateCallback('marketStatus');
    }, 5 * 60 * 1000);
    
    this.isPolling = true;
  }
  
  /**
   * Stop all polling intervals
   */
  public stop() {
    Object.keys(this.pollingIntervals).forEach((key) => {
      window.clearInterval(this.pollingIntervals[key]);
      delete this.pollingIntervals[key];
    });
    
    this.isPolling = false;
  }
  
  /**
   * Poll for market indices data
   */
  private pollMarketIndices() {
    try {
      console.log('Polling market indices...');
      this.updateCallback('marketIndices');
    } catch (error) {
      console.error('Error polling market indices:', error);
    }
  }
  
  /**
   * Poll for stock data
   */
  private pollStocks() {
    try {
      // This is a placeholder for actual stock polling logic
      console.log('Polling general stocks...');
      this.updateCallback('stocks');
    } catch (error) {
      console.error('Error polling stocks:', error);
    }
  }
}
