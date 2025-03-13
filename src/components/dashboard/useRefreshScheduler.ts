
import { useRef, useEffect } from "react";
import { MarketStatus, UserSettings } from "@/types/marketTypes";
import { isFeatureEnabled } from "@/services/features";

export const useRefreshScheduler = (
  marketStatusData: MarketStatus | null,
  settings: UserSettings,
  loadData: () => Promise<void>
) => {
  // Refresh timer ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule next data refresh based on market hours
  const scheduleNextRefresh = (status: MarketStatus | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    // Check if data refresh is enabled via feature flag
    if (!isFeatureEnabled('enableDataRefresh')) {
      console.log("Automatic data refresh is disabled by feature flag");
      return;
    }
    
    if (!settings || !settings.refreshInterval) {
      console.error("Refresh interval settings not available, using default");
      return;
    }
    
    let interval = settings.refreshInterval.closed; // Default to closed market interval
    
    if (status) {
      if (status.isOpen) {
        interval = settings.refreshInterval.marketHours; // Market is open
      } else {
        const now = new Date();
        const hour = now.getHours();
        
        if ((hour >= 4 && hour < 9.5) || (hour >= 16 && hour < 20)) {
          interval = settings.refreshInterval.afterHours; // Pre-market or after-hours
        }
      }
    }
    
    refreshTimerRef.current = setTimeout(() => {
      loadData();
    }, interval * 1000);
  };

  // Update refresh timer when market status changes
  useEffect(() => {
    scheduleNextRefresh(marketStatusData);
  }, [marketStatusData, settings.refreshInterval]);
  
  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    scheduleNextRefresh
  };
};
