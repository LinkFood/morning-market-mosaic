
import React from "react";
import { getChangeColor, getChangeSymbol, getIndicatorDescription } from "./economicIndicatorUtils";
import EnhancedChart from "@/components/chart/EnhancedChart";
import IndicatorInfo from "./IndicatorInfo";
import { formatDate } from "@/utils/dateUtils";
import { Card, CardContent } from "@/components/ui/card";

export interface EconomicIndicator {
  id: string;
  name: string;
  value: string;
  previous: string;
  change: string;
  date: string;
  lastUpdated?: string;
  formattedDate?: string;
  trend?: { date: string; value: number }[];
  unit: string;
  benchmark?: string;
}

interface EconomicIndicatorCardProps {
  indicator: EconomicIndicator;
}

const EconomicIndicatorCard = ({ indicator }: EconomicIndicatorCardProps) => {
  // Calculate if this indicator is at a historical extreme
  const getHistoricalContext = (indicator: EconomicIndicator): string | null => {
    if (!indicator.trend || indicator.trend.length < 10) return null;
    
    const currentValue = parseFloat(indicator.value);
    const values = indicator.trend.map(t => t.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Get dates for historical comparisons
    const maxDate = indicator.trend.find(t => t.value === max)?.date;
    const minDate = indicator.trend.find(t => t.value === min)?.date;
    const maxYear = maxDate ? new Date(maxDate).getFullYear() : null;
    const minYear = minDate ? new Date(minDate).getFullYear() : null;
    
    const isWithin5PercentOfMax = currentValue >= max * 0.95;
    const isWithin5PercentOfMin = currentValue <= min * 1.05;
    
    if (isWithin5PercentOfMax && maxYear) {
      return currentValue === max ? 
        `All-time high in dataset` : 
        `Near highest level since ${maxYear}`;
    }
    
    if (isWithin5PercentOfMin && minYear) {
      return currentValue === min ? 
        `All-time low in dataset` : 
        `Near lowest level since ${minYear}`;
    }
    
    return null;
  };
  
  const historicalContext = getHistoricalContext(indicator);
  const formattedDisplayDate = formatDate(indicator.date, 'long') || indicator.formattedDate || indicator.date;
  const formattedUpdateDate = indicator.lastUpdated ? formatDate(indicator.lastUpdated, 'short') : null;
  
  return (
    <Card key={indicator.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium flex items-center gap-1">
            {indicator.name}
            <IndicatorInfo indicatorId={indicator.id} />
          </h3>
          <div className="text-right">
            <span className="text-sm text-muted-foreground block">
              {formattedDisplayDate}
            </span>
            {formattedUpdateDate && formattedUpdateDate !== formattedDisplayDate && (
              <span className="text-xs text-muted-foreground block">
                Updated: {formattedUpdateDate}
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
              {getIndicatorDescription(indicator.id)}
            </p>
            <p className="text-sm text-muted-foreground">
              Previous: {indicator.previous}{indicator.unit}
            </p>
            {historicalContext && (
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">
                {historicalContext}
              </p>
            )}
            {indicator.benchmark && (
              <p className="text-xs text-muted-foreground mt-1">
                Benchmark: {indicator.benchmark}
              </p>
            )}
          </div>
          
          <div className={getChangeColor(parseFloat(indicator.change), indicator.id)}>
            {getChangeSymbol(parseFloat(indicator.change), indicator.id)}
            <span className="ml-1">
              {parseFloat(indicator.change) >= 0 ? "+" : ""}
              {indicator.change}{indicator.unit}
            </span>
          </div>
        </div>
        
        {indicator.trend && (
          <div className="h-48 mt-4">
            <EnhancedChart
              data={indicator.trend.map(t => ({ date: t.date, value: t.value }))}
              dataKeys={["value"]}
              xAxisKey="date"
              height={180}
              title={`${indicator.name} Trend`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EconomicIndicatorCard;
