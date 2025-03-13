
import { formatChartValue } from "../utils/formatting";

/**
 * Hook to provide tooltip formatting functions
 */
export const useTooltipFormatter = (title?: string) => {
  // Enhanced tooltip formatter with more context
  const enhancedTooltipFormatter = (value: number | string, name: string) => {
    // Basic formatting
    const formattedValue = formatChartValue(Number(value), name, title);
    
    // Add context based on chart type
    let context = '';
    if (title?.toLowerCase().includes('inflation')) {
      context = Number(value) > 2 ? ' (Above Target)' : ' (At/Below Target)';
    } else if (title?.toLowerCase().includes('unemployment')) {
      context = Number(value) < 4 ? ' (Low)' : Number(value) > 6 ? ' (High)' : ' (Moderate)';
    } else if (title?.toLowerCase().includes('interest') && name.includes('rate')) {
      context = Number(value) > 4 ? ' (Restrictive)' : Number(value) < 1 ? ' (Accommodative)' : ' (Neutral)';
    }
    
    return `${formattedValue}${context}`;
  };
  
  return {
    enhancedTooltipFormatter
  };
};
