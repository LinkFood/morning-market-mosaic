
import React from "react";
import OverviewCard from "./OverviewCard";

interface FedRateCardProps {
  rate: number;
  lastChange: number;
}

/**
 * Card displaying Federal Funds Rate data
 */
const FedRateCard: React.FC<FedRateCardProps> = ({ rate, lastChange }) => {
  const getTrendDirection = (): 'up' | 'down' | 'neutral' => {
    if (lastChange > 0) return 'up';
    if (lastChange < 0) return 'down';
    return 'neutral';
  };

  const getTrendDescription = (): string => {
    return lastChange > 0 ? 'Recently increased' : 
      lastChange < 0 ? 'Recently decreased' : 'Unchanged';
  };

  return (
    <OverviewCard
      title="Fed Funds Rate"
      value={`${rate.toFixed(2)}%`}
      trendDirection={getTrendDirection()}
      trendDescription={getTrendDescription()}
      valueColor="text-blue-600 dark:text-blue-400"
    />
  );
};

export default FedRateCard;
