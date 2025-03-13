
/**
 * Battery status manager for power-aware updates
 */
export class BatteryManager {
  private batteryStatus: { charging: boolean, level: number } = { 
    charging: true, 
    level: 1.0 
  };
  
  private optimizationEnabled: boolean = false;
  private statusChangeCallback: (charging: boolean, level: number) => void;
  
  constructor(statusChangeCallback: (charging: boolean, level: number) => void) {
    this.statusChangeCallback = statusChangeCallback;
  }
  
  /**
   * Initialize battery monitoring
   */
  public async init() {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        this.batteryStatus = {
          charging: battery.charging,
          level: battery.level
        };
        
        battery.addEventListener('chargingchange', () => {
          this.batteryStatus.charging = battery.charging;
          this.notifyBatteryChange();
        });
        
        battery.addEventListener('levelchange', () => {
          this.batteryStatus.level = battery.level;
          this.notifyBatteryChange();
        });
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }
  
  /**
   * Enable or disable battery optimization
   */
  public toggleOptimization(enabled: boolean) {
    this.optimizationEnabled = enabled;
    
    if (enabled) {
      this.notifyBatteryChange();
    }
  }
  
  /**
   * Get current battery status
   */
  public getBatteryStatus() {
    return { ...this.batteryStatus };
  }
  
  /**
   * Notify about battery status changes
   */
  private notifyBatteryChange() {
    if (this.optimizationEnabled) {
      this.statusChangeCallback(this.batteryStatus.charging, this.batteryStatus.level);
    }
  }
}
