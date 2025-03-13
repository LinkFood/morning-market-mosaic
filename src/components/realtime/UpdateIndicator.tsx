
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { realtime } from '@/services/polygon/realtime';
import { useMediaQuery } from '@/hooks/use-mobile';

interface UpdateIndicatorProps {
  onRefresh?: () => void;
  showControls?: boolean;
  className?: string;
}

export function UpdateIndicator({ 
  onRefresh, 
  showControls = true,
  className = ''
}: UpdateIndicatorProps) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(realtime.getLastUpdated());
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [status, setStatus] = useState(realtime.getStatus());
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Format time ago string
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 120) return '1m ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 7200) return '1h ago';
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  // Update time ago every 10 seconds
  useEffect(() => {
    const updateTimeAgo = () => {
      const currentStatus = realtime.getStatus();
      setStatus(currentStatus);
      setLastUpdated(currentStatus.lastUpdated);
      setTimeAgo(formatTimeAgo(currentStatus.lastUpdated));
    };
    
    // Update immediately
    updateTimeAgo();
    
    // Set up interval
    const interval = setInterval(updateTimeAgo, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await realtime.refreshData();
      setLastUpdated(realtime.getLastUpdated());
      setTimeAgo(formatTimeAgo(realtime.getLastUpdated()));
    }
  };
  
  // Toggle updates
  const toggleUpdates = () => {
    const newStatus = realtime.toggleUpdates();
    setStatus({ ...status, isPaused: !newStatus });
  };
  
  return (
    <div className={`flex items-center gap-1 md:gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="px-2 py-1 flex items-center gap-1 text-xs"
            >
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {lastUpdated 
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}` 
                : 'No updates yet'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showControls && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8"
                  onClick={toggleUpdates}
                >
                  {status.isPaused ? (
                    <PlayCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <PauseCircle className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {status.isPaused ? 'Resume updates' : 'Pause updates'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}

export default UpdateIndicator;
