
import React from "react";
import OverviewCard from "./OverviewCard";
import { TrendingUp, TrendingDown } from "lucide-react";

interface GDPCardProps {
  rate: number;
  trend: 'accelerating' | 'decelerating' | 'stable';
}

/**
 * Card displaying GDP growth data
 */
const GDPCard: React.FC<GDPCardProps> = ({ rate, trend }) => {
  const getTrendDirection = (): 'up' | 'down' | 'neutral' => {
    return rate >= 0 ? 'up' : 'down';
  };

  const getTrendDescription = (): string => {
    return trend === 'accelerating' ? 'Accelerating' : 
      trend === 'decelerating' ? 'Decelerating' : 'Stable';
  };

  const getValueColor = (): string => {
    return rate >= 0 ? "text-emerald-600 dark:text-emerald-400" : 
      "text-red-600 dark:text-red-400";
  };

  return (
    <OverviewCard
      title="GDP Growth"
      value={`${rate.toFixed(1)}%`}
      trendDirection={getTrendDirection()}
      trendDescription={getTrendDescription()}
      valueColor={getValueColor()}
    />
  );
};

export default GDPCard;
