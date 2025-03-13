
import { useState, useEffect, useCallback, useRef } from 'react';
import { realtime, DataUpdateType, UpdateEventCallback } from '@/services/polygon/realtime';
import { toast } from 'sonner';

interface RealtimeOptions {
  showToasts?: boolean;
  onUpdate?: (data: any, type: DataUpdateType) => void;
  retryDelay?: number;
  maxRetries?: number;
}

/**
 * Custom hook for handling realtime data updates
 * 
 * @param symbols - String or array of symbol(s) to subscribe to
 * @param options - Configuration options
 * @returns Object with data and control methods
 */
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
  const [retryCount, setRetryCount] = useState(0);
  
  // References to preserve values in closures
  const retryTimerRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Convert single symbol to array
  const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
  
  /**
   * Handle updates from realtime service
   */
  const handleUpdate = useCallback((newData: T, type: DataUpdateType) => {
    // Reset retry count on successful update
    if (retryCount > 0) {
      setRetryCount(0);
    }
    
    // Call user-provided onUpdate if available
    if (optionsRef.current.onUpdate) {
      optionsRef.current.onUpdate(newData, type);
    }
    
    // Update state based on update type
    if (type === 'data') {
      setData(prevData => {
        // If newData has a ticker property, use it as the key
        const key = (newData as any).ticker || symbolArray[0];
        return { ...prevData, [key]: newData };
      });
      
      setLastUpdated(new Date());
      
      // Show toast if enabled
      if (optionsRef.current.showToasts) {
        toast.info("Market data updated");
      }
    } else if (type === 'status') {
      // Update UI when status changes
      const status = newData as any;
      setIsPaused(status.isPaused);
      if (status.lastUpdated) {
        setLastUpdated(new Date(status.lastUpdated));
      }
    } else if (type === 'error') {
      // Handle error updates
      const maxRetries = optionsRef.current.maxRetries || 3;
      if (retryCount < maxRetries) {
        // Schedule retry
        const retryDelay = optionsRef.current.retryDelay || 5000;
        if (retryTimerRef.current) {
          window.clearTimeout(retryTimerRef.current);
        }
        
        retryTimerRef.current = window.setTimeout(() => {
          refresh();
          setRetryCount(prev => prev + 1);
        }, retryDelay);
        
        // Show toast for retry
        if (optionsRef.current.showToasts) {
          toast.warning(`Connection error, retrying in ${retryDelay / 1000}s... (${retryCount + 1}/${maxRetries})`);
        }
      } else if (optionsRef.current.showToasts) {
        toast.error("Failed to connect to market data after multiple attempts");
      }
    }
  }, [symbolArray, retryCount]);
  
  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      await realtime.refreshData();
      setLastUpdated(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      if (optionsRef.current.showToasts) {
        toast.error("Failed to refresh market data");
      }
    } finally {
      setIsUpdating(false);
    }
  }, []);
  
  /**
   * Toggle updates function
   */
  const toggleUpdates = useCallback(() => {
    const newState = realtime.toggleUpdates();
    setIsPaused(!newState);
    
    if (optionsRef.current.showToasts) {
      if (newState) {
        toast.success("Market updates resumed");
      } else {
        toast.info("Market updates paused");
      }
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
    
    // Set up subscription
    const unsubscribe = realtime.subscribe((data) => {
      if (data.type === 'data' && symbolArray.includes(data.symbol)) {
        handleUpdate(data.data, data.type);
      } else if (data.type === 'status' || data.type === 'error') {
        handleUpdate(data.data, data.type);
      }
    });
    
    // Get initial cached data if available
    symbolArray.forEach(symbol => {
      const cachedData = realtime.getCachedData(symbol);
      if (cachedData) {
        setData(prev => ({ ...prev, [symbol]: cachedData }));
      }
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Clear any pending retry timer
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
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
