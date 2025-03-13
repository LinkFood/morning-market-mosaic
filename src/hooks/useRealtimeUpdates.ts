
import { useState, useEffect, useCallback } from 'react';
import { realtime, DataUpdateType, UpdateEventCallback } from '@/services/polygon/realtime';
import { toast } from 'sonner';

interface RealtimeOptions {
  showToasts?: boolean;
  onUpdate?: (data: any, type: DataUpdateType) => void;
}

export function useRealtimeUpdates<T>(
  symbols: string | string[], 
  options: RealtimeOptions = {}
): {
  data: Record<string, T>,
  lastUpdated: Date | null,
  isUpdating: boolean,
  isPaused: boolean,
  refresh: () => Promise<void>,
  toggleUpdates: () => boolean
} {
  const [data, setData] = useState<Record<string, T>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Convert single symbol to array
  const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
  
  // Handle updates from realtime service
  const handleUpdate = useCallback((newData: T, type: DataUpdateType) => {
    // Call user-provided onUpdate if available
    if (options.onUpdate) {
      options.onUpdate(newData, type);
    }
    
    // Update state
    setData(prevData => {
      // If newData has a ticker property, use it as the key
      const key = (newData as any).ticker || symbolArray[0];
      return { ...prevData, [key]: newData };
    });
    
    setLastUpdated(new Date());
    
    // Show toast if enabled
    if (options.showToasts) {
      toast.info("Market data updated");
    }
  }, [options, symbolArray]);
  
  // Manual refresh function
  const refresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      await realtime.refreshData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.error("Failed to refresh market data");
    } finally {
      setIsUpdating(false);
    }
  }, []);
  
  // Toggle updates function
  const toggleUpdates = useCallback(() => {
    const newState = realtime.toggleUpdates();
    setIsPaused(!newState);
    
    if (newState) {
      toast.success("Market updates resumed");
    } else {
      toast.info("Market updates paused");
    }
    
    return newState;
  }, []);
  
  // Subscribe to updates on mount
  useEffect(() => {
    if (symbolArray.length === 0) return;
    
    // Update initial state from realtime service
    const status = realtime.getStatus();
    setIsPaused(status.isPaused);
    setLastUpdated(status.lastUpdated);
    
    // Use a simple subscription approach instead of subscribeMultiple
    const unsubscribe = realtime.subscribe((data) => {
      if (data.type === 'data' && symbolArray.includes(data.symbol)) {
        handleUpdate(data.data, data.type);
      } else if (data.type === 'status') {
        handleUpdate(data.data, data.type);
      }
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [symbolArray, handleUpdate]);
  
  return {
    data,
    lastUpdated,
    isUpdating,
    isPaused,
    refresh,
    toggleUpdates
  };
}
