
import { useEffect, useRef } from "react";
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
    TradingView?: any;
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
  const scriptLoadedRef = useRef<boolean>(false);
  const widgetCreatedRef = useRef<boolean>(false);
  const { theme } = useTheme();

  // Generate a simple static container ID based on the symbol
  const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  useEffect(() => {
    // Function to create the widget
    const createWidget = () => {
      if (!containerRef.current || !window.TradingView || widgetCreatedRef.current) return;

      // Clear any existing content
      containerRef.current.innerHTML = '';

      // Create the widget
      try {
        new window.TradingView.widget({
          width: "100%",
          height: height - 40,
          symbol: symbol,
          interval: interval,
          timezone: "exchange",
          theme: theme === "dark" ? "dark" : "light",
          style: "1", // Candles
          locale: "en",
          toolbar_bg: theme === "dark" ? "#1a1a1a" : "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
        });
        
        widgetCreatedRef.current = true;
      } catch (error) {
        console.error("Error creating TradingView widget:", error);
      }
    };
    
    // Reset widget created flag when dependencies change
    widgetCreatedRef.current = false;

    // If the script is already loaded, create the widget immediately
    if (window.TradingView) {
      createWidget();
      return;
    }
    
    // If we've already started loading the script, just wait for it
    if (scriptLoadedRef.current) {
      const checkTradingViewInterval = setInterval(() => {
        if (window.TradingView) {
          createWidget();
          clearInterval(checkTradingViewInterval);
        }
      }, 100);
      
      return () => {
        clearInterval(checkTradingViewInterval);
      };
    }
    
    // If we haven't loaded the script yet, load it now
    scriptLoadedRef.current = true;
    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    
    script.onload = () => {
      createWidget();
    };
    
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      // Don't remove the script on unmount as other widgets might need it
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      widgetCreatedRef.current = false;
    };
  }, [symbol, interval, theme, height, containerId]);

  return (
    <Card className={`shadow-md transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div 
          id={containerId}
          ref={containerRef} 
          className="w-full rounded-md overflow-hidden"
          style={{ height: `${height - 40}px` }}
        />
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget;
