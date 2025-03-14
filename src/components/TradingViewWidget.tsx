
import { useEffect, useRef, useState, useId } from "react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  height?: number;
  cardTitle?: string;
  cardDescription?: string;
  className?: string;
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: any) => any;
    };
  }
}

const TradingViewWidget = ({
  symbol = "ES1!",
  interval = "D",
  height = 400,
  cardTitle = "S&P 500 Futures",
  cardDescription = "Real-time market data",
  className = "",
}: TradingViewWidgetProps) => {
  // Use React's useId hook for a truly stable ID
  const uniqueId = useId();
  const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${uniqueId.replace(/:/g, '')}`;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  
  // Track if component is mounted to prevent state updates after unmounting
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    
    // Function to safely update state only if component is mounted
    const safeSetState = (loadingState: boolean, errorState: boolean) => {
      if (isMounted.current) {
        setIsLoading(loadingState);
        setHasError(errorState);
      }
    };
    
    // Load the TradingView script
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.TradingView) {
          resolve();
          return;
        }
        
        const scriptId = 'tradingview-widget-script';
        const existingScript = document.getElementById(scriptId);
        
        if (existingScript) {
          // If script is loading but not ready, wait for it
          if (!window.TradingView) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', (e) => reject(e));
          } else {
            resolve();
          }
          return;
        }
        
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };
    
    // Initialize the widget
    const createWidget = () => {
      if (!containerRef.current || !window.TradingView) return;
      
      // Clear previous content if any
      containerRef.current.innerHTML = '';
      
      try {
        // Create new widget instance
        new window.TradingView.widget({
          autosize: false,
          width: "100%",
          height: height - 40,
          symbol: symbol,
          interval: interval,
          timezone: "exchange",
          theme: theme === "dark" ? "dark" : "light",
          style: "1", // Candles
          toolbar_bg: theme === "dark" ? "#1a1a1a" : "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
          save_image: false,
          studies: ["RSI@tv-basicstudies"],
          locale: "en",
          disabled_features: ["use_localstorage_for_settings"],
        });
        
        safeSetState(false, false);
      } catch (error) {
        console.error("Error creating TradingView widget:", error);
        safeSetState(false, true);
      }
    };
    
    // Main initialization function
    const init = async () => {
      safeSetState(true, false);
      
      try {
        await loadScript();
        
        // Ensure DOM is ready with a small delay
        setTimeout(() => {
          if (isMounted.current) {
            createWidget();
          }
        }, 100);
      } catch (error) {
        console.error("Failed to load TradingView widget:", error);
        safeSetState(false, true);
      }
    };
    
    init();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [symbol, interval, theme, height, containerId]);
  
  return (
    <Card className={`shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-6">
        {isLoading ? (
          <Skeleton className={`w-full rounded-md`} style={{ height: `${height - 40}px` }} />
        ) : hasError ? (
          <div 
            className="flex items-center justify-center w-full bg-muted rounded-md" 
            style={{ height: `${height - 40}px` }}
          >
            <p className="text-muted-foreground">
              Failed to load chart. Please try again later.
            </p>
          </div>
        ) : (
          <div 
            id={containerId}
            ref={containerRef} 
            className="w-full rounded-md overflow-hidden"
            style={{ height: `${height - 40}px` }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget;
