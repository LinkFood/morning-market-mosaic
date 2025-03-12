
import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import EnhancedChart from "@/components/chart/EnhancedChart";

interface InterestRateData {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend: { date: string; value: number }[];
  unit: string;
}

interface InterestRateCardProps {
  rate: InterestRateData;
}

const InterestRateCard = ({ rate }: InterestRateCardProps) => {
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

  return (
    <div key={rate.id} className="p-4 rounded-lg bg-secondary/50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{rate.name}</h3>
        <div className="text-right">
          <span className="text-sm text-muted-foreground block">
            {rate.formattedDate || new Date(rate.date).toLocaleDateString()}
          </span>
          {rate.lastUpdated && rate.lastUpdated !== rate.date && (
            <span className="text-xs text-muted-foreground block">
              Updated: {new Date(rate.lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold">
            {rate.value}{rate.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Previous: {rate.previous}{rate.unit}
          </p>
        </div>
        
        <div className={getChangeColor(parseFloat(rate.change))}>
          {getChangeSymbol(parseFloat(rate.change))}
          <span className="ml-1">
            {parseFloat(rate.change) >= 0 ? "+" : ""}
            {rate.change}{rate.unit}
          </span>
        </div>
      </div>
      
      <div className="h-48 mt-4">
        <EnhancedChart
          data={rate.trend.map(t => ({ date: t.date, value: t.value }))}
          dataKeys={["value"]}
          xAxisKey="date"
          height={180}
          title={`${rate.name} Trend`}
        />
      </div>
    </div>
  );
};

export default InterestRateCard;
