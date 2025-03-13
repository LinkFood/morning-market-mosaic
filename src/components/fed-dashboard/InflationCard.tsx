
import React from "react";
import OverviewCard from "./OverviewCard";

interface InflationCardProps {
  rate: number;
  trend: 'rising' | 'falling' | 'stable';
}

/**
 * Card displaying inflation data
 */
const InflationCard: React.FC<InflationCardProps> = ({ rate, trend }) => {
  const getTrendDirection = (): 'up' | 'down' | 'neutral' => {
    if (trend === 'falling') return 'down';
    if (trend === 'rising') return 'up';
    return 'neutral';
  };

  const getTrendDescription = (): string => {
    return trend === 'falling' ? 'Decreasing' : 
      trend === 'rising' ? 'Increasing' : 'Stable';
  };

  const getValueColor = (): string => {
    return rate <= 3 ? "text-emerald-600 dark:text-emerald-400" : 
      rate > 5 ? "text-red-600 dark:text-red-400" : 
      "text-amber-600 dark:text-amber-400";
  };

  return (
    <OverviewCard
      title="Inflation (CPI)"
      value={`${rate.toFixed(1)}%`}
      trendDirection={getTrendDirection()}
      trendDescription={getTrendDescription()}
      valueColor={getValueColor()}
    />
  );
};

export default InflationCard;
