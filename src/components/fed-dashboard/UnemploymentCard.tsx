
import React from "react";
import OverviewCard from "./OverviewCard";

interface UnemploymentCardProps {
  rate: number;
  trend: 'improving' | 'worsening' | 'stable';
}

/**
 * Card displaying unemployment data
 */
const UnemploymentCard: React.FC<UnemploymentCardProps> = ({ rate, trend }) => {
  const getTrendDirection = (): 'up' | 'down' | 'neutral' => {
    if (trend === 'improving') return 'down';
    if (trend === 'worsening') return 'up';
    return 'neutral';
  };

  const getTrendDescription = (): string => {
    return trend === 'improving' ? 'Decreasing' : 
      trend === 'worsening' ? 'Increasing' : 'Stable';
  };

  const getValueColor = (): string => {
    return trend === 'improving' ? "text-emerald-600 dark:text-emerald-400" : 
      trend === 'worsening' ? "text-red-600 dark:text-red-400" : 
      "text-gray-500";
  };

  return (
    <OverviewCard
      title="Unemployment"
      value={`${rate.toFixed(1)}%`}
      trendDirection={getTrendDirection()}
      trendDescription={getTrendDescription()}
      valueColor={getValueColor()}
    />
  );
};

export default UnemploymentCard;
