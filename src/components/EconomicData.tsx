
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EconomicIndicator } from "@/types/marketTypes";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface EconomicDataProps {
  indicators: EconomicIndicator[];
}

const EconomicData = ({ indicators }: EconomicDataProps) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return "ticker-up";
    if (change < 0) return "ticker-down";
    return "ticker-neutral";
  };
  
  const getChangeSymbol = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4" />;
    if (change < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Economic Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map((indicator) => (
            <div key={indicator.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{indicator.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {formatDate(indicator.date)}
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
                
                <div className={`flex items-center ${getChangeColor(indicator.change)}`}>
                  {getChangeSymbol(indicator.change)}
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
