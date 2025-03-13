
import React from "react";
import { ArrowUp, ArrowDown, LineChart } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendDescription?: string;
  valueColor?: string;
}

/**
 * A card displaying an economic indicator with its trend
 */
const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'neutral',
  trendDescription,
  valueColor
}) => {
  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <ArrowUp className="h-5 w-5" />;
      case 'down':
        return <ArrowDown className="h-5 w-5" />;
      default:
        return <LineChart className="h-5 w-5" />;
    }
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return valueColor || "text-emerald-600 dark:text-emerald-400";
      case 'down':
        return valueColor || "text-red-600 dark:text-red-400";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4 rounded-lg bg-secondary/50">
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        <div className={getTrendColor()}>
          {getTrendIcon()}
        </div>
      </div>
      {trendDescription && (
        <p className="text-sm text-muted-foreground mt-1">
          {trendDescription}
        </p>
      )}
    </div>
  );
};

export default OverviewCard;
