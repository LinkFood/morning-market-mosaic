
import { HeatMapItem } from "../types";

/**
 * Function to determine color based on value/change
 */
export const getColor = (value: number | undefined): string => {
  // Handle undefined or NaN values
  if (value === undefined || isNaN(value)) {
    return 'rgba(128, 128, 128, 0.2)'; // Gray for undefined values
  }
  
  // For percentages between -10% and +10%
  const normalizedValue = Math.max(-10, Math.min(10, value)) / 10;
  
  if (value > 0) {
    // Green gradient for positive values
    const intensity = Math.round(200 * normalizedValue);
    return `rgba(0, ${100 + intensity}, 0, ${0.5 + normalizedValue * 0.5})`;
  } else {
    // Red gradient for negative values
    const intensity = Math.round(200 * -normalizedValue);
    return `rgba(${100 + intensity}, 0, 0, ${0.5 + -normalizedValue * 0.5})`;
  }
};

/**
 * Creates color scale indicators for the legend
 */
export const ColorLegend = () => {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-10) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-5) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(-1) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(0) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(1) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(5) }}></span>
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: getColor(10) }}></span>
    </div>
  );
};
