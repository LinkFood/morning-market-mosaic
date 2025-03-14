
import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Function to load and initialize the TradingView widget
    const loadTradingViewScript = () => {
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.id = 'tradingview-widget-script';
      
      // Handle script load event
      script.onload = () => {
        if (window.TradingView && containerRef.current) {
          try {
            new window.TradingView.widget({
              width: "100%",
              height: height - 40, // Adjust for card padding
              symbol: symbol,
              interval: interval,
              timezone: "exchange",
              theme: theme === "dark" ? "dark" : "light",
              style: "1", // Candles
              toolbar_bg: theme === "dark" ? "#1a1a1a" : "#f1f3f6",
              enable_publishing: false,
              hide_side_toolbar: true,
              allow_symbol_change: true,
              container_id: containerRef.current.id,
              save_image: false,
            });
            
            setIsLoading(false);
          } catch (error) {
            console.error("Error initializing TradingView widget:", error);
            setHasError(true);
            setIsLoading(false);
          }
        }
      };
      
      // Handle script error
      script.onerror = () => {
        console.error("Failed to load TradingView script");
        setHasError(true);
        setIsLoading(false);
      };
      
      // Add script to document
      document.head.appendChild(script);
    };
    
    // Check if script is already loaded
    if (!document.getElementById('tradingview-widget-script')) {
      loadTradingViewScript();
    } else if (window.TradingView && containerRef.current) {
      // If script is already loaded, initialize widget directly
      try {
        new window.TradingView.widget({
          width: "100%",
          height: height - 40,
          symbol: symbol,
          interval: interval,
          timezone: "exchange",
          theme: theme === "dark" ? "dark" : "light",
          style: "1",
          toolbar_bg: theme === "dark" ? "#1a1a1a" : "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          save_image: false,
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing TradingView widget:", error);
        setHasError(true);
        setIsLoading(false);
      }
    }
    
    // Cleanup function
    return () => {
      // No need to remove the script as it might be used by other instances
      // Just clean up the container if needed
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, height, theme]);
  
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
            id={`tradingview_container_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
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
