
import React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import EnhancedChart from "@/components/chart/EnhancedChart";
import { InflationCardProps } from "./types";

const InflationCard = ({ indicator }: InflationCardProps) => {
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
    <div key={indicator.id} className="p-4 rounded-lg bg-secondary/50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{indicator.name}</h3>
        <div className="text-right">
          <span className="text-sm text-muted-foreground block">
            {indicator.formattedDate || new Date(indicator.date).toLocaleDateString()}
          </span>
          {indicator.lastUpdated && indicator.lastUpdated !== indicator.date && (
            <span className="text-xs text-muted-foreground block">
              Updated: {new Date(indicator.lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold">
            {indicator.value}{indicator.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Previous: {indicator.previous}{indicator.unit}
          </p>
        </div>
        
        <div className={getChangeColor(parseFloat(indicator.change))}>
          {getChangeSymbol(parseFloat(indicator.change))}
          <span className="ml-1">
            {parseFloat(indicator.change) >= 0 ? "+" : ""}
            {indicator.change}{indicator.unit}
          </span>
        </div>
      </div>
      
      <div className="h-48 mt-4">
        <EnhancedChart
          data={indicator.trend.map(t => ({ date: t.date, value: t.value }))}
          dataKeys={["value"]}
          xAxisKey="date"
          height={180}
          title={`${indicator.name} Trend`}
        />
      </div>
    </div>
  );
};

export default InflationCard;
