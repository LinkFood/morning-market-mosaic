
import { useEffect, useRef, useState, useMemo } from "react";
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
  const scriptLoadedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();
  
  // Generate a stable container ID based only on the symbol
  const containerId = useMemo(() => `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`, [symbol]);
  
  // Function to initialize or update the widget
  const initializeWidget = () => {
    if (!containerRef.current || !window.TradingView) {
      console.log("Cannot initialize widget: container or TradingView not available");
      return;
    }
    
    // Set loading state while we initialize
    setIsLoading(true);
    
    try {
      // Clean up previous widget instance if it exists
      if (widgetRef.current) {
        console.log("Removing previous widget instance");
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      
      // Short timeout to ensure the DOM is ready after removing the previous widget
      setTimeout(() => {
        try {
          if (!containerRef.current || !window.TradingView) return;
          
          console.log(`Initializing TradingView widget for ${symbol} with ${theme} theme`);
          
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
            container_id: containerId,
            save_image: false,
          });
          
          setIsLoading(false);
          setHasError(false);
        } catch (error) {
          console.error("Error creating TradingView widget:", error);
          setHasError(true);
          setIsLoading(false);
        }
      }, 100); // Small timeout to ensure DOM is ready
    } catch (error) {
      console.error("Error during widget initialization:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };
  
  // Consolidated effect to handle script loading, widget initialization and cleanup
  useEffect(() => {
    // Load the TradingView script if not already loaded
    if (!scriptLoadedRef.current && !document.getElementById('tradingview-widget-script') && !window.TradingView) {
      console.log("Loading TradingView script");
      setIsLoading(true);
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.id = 'tradingview-widget-script';
      
      script.onload = () => {
        console.log("TradingView script loaded");
        scriptLoadedRef.current = true;
        initializeWidget();
      };
      
      script.onerror = (error) => {
        console.error("Failed to load TradingView script:", error);
        setHasError(true);
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } else if (window.TradingView) {
      // Script already loaded, initialize widget with current props
      initializeWidget();
    }
    
    // Cleanup function to remove widget when component unmounts or props change
    return () => {
      if (widgetRef.current) {
        console.log("Cleaning up widget on unmount/props change");
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, interval, theme]); // Re-run when these props change
  
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
