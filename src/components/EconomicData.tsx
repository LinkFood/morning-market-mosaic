
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EconomicIndicator } from "@/types/marketTypes";
import { ArrowDown, ArrowUp, Minus, Database } from "lucide-react";
import { Link } from "react-router-dom";

interface EconomicDataProps {
  indicators: EconomicIndicator[];
  isLoading?: boolean;
}

const EconomicData = ({ indicators, isLoading = false }: EconomicDataProps) => {
  const getChangeColor = (change: number, indicatorId?: string) => {
    // For unemployment, decreasing is positive
    if (change < 0 && indicatorId === "UNRATE") {
      return "ticker-up";
    }
    // For inflation (CPI), decreasing is positive
    if (change < 0 && indicatorId === "CPIAUCSL") {
      return "ticker-up";
    }
    // For other indicators
    if (change > 0) return "ticker-up";
    if (change < 0) return "ticker-down";
    return "ticker-neutral";
  };
  
  const getChangeSymbol = (change: number, indicatorId?: string) => {
    // For unemployment and inflation, down arrow is positive
    if (indicatorId === "UNRATE" || indicatorId === "CPIAUCSL") {
      if (change < 0) return <ArrowDown className="h-4 w-4" />;
      if (change > 0) return <ArrowUp className="h-4 w-4" />;
    } else {
      if (change > 0) return <ArrowUp className="h-4 w-4" />;
      if (change < 0) return <ArrowDown className="h-4 w-4" />;
    }
    return <Minus className="h-4 w-4" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            <span>Economic Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-secondary/50">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/4 mb-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            <span>Economic Indicators</span>
          </div>
          <Link 
            to="/fed-dashboard" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View Full Dashboard →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map((indicator) => (
            <div key={indicator.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{indicator.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {indicator.date ? formatDate(indicator.date) : "Latest"}
                </span>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">
                    {indicator.value.toLocaleString()}{indicator.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Previous: {indicator.previous.toLocaleString()}{indicator.unit}
                  </p>
                </div>
                
                <div className={`flex items-center ${getChangeColor(indicator.change, indicator.id)}`}>
                  {getChangeSymbol(indicator.change, indicator.id)}
                  <span className="ml-1">
                    {indicator.change >= 0 ? "+" : ""}
                    {indicator.change.toFixed(1)}
                    {indicator.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicData;
