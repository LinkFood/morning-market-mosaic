
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

interface TradingViewWidgetInstance {
  options: any;
  iframe?: HTMLIFrameElement;
  remove: () => void;
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: any) => TradingViewWidgetInstance;
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
  const widgetRef = useRef<TradingViewWidgetInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  
  // Generate a stable container ID that won't change on re-renders
  const containerId = useRef(`tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.floor(Math.random() * 1000000)}`);
  
  // Function to initialize or update the widget
  const initializeWidget = () => {
    if (!containerRef.current || !window.TradingView) return;
    
    try {
      // Clean up previous widget instance if it exists
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      
      // Create new widget instance
      widgetRef.current = new window.TradingView.widget({
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
        container_id: containerId.current,
        save_image: false,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing TradingView widget:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };
  
  // Effect to load the TradingView script only once
  useEffect(() => {
    // Only load the script if it hasn't been loaded yet
    if (!document.getElementById('tradingview-widget-script') && !window.TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.id = 'tradingview-widget-script';
      
      script.onload = () => {
        initializeWidget();
      };
      
      script.onerror = () => {
        console.error("Failed to load TradingView script");
        setHasError(true);
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } else if (window.TradingView) {
      // If script is already loaded, initialize widget
      initializeWidget();
    }
    
    // Cleanup function to remove widget when component unmounts
    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, []); // Only run on mount and unmount
  
  // Separate effect to handle theme changes
  useEffect(() => {
    // Skip initial render, only update on theme changes after initial setup
    if (!isLoading && window.TradingView && containerRef.current) {
      initializeWidget();
    }
  }, [theme]); // Only re-run when theme changes
  
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
            id={containerId.current}
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
