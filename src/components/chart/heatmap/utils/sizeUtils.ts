
import { cn } from "@/lib/utils";
import { HeatMapItem } from "../types";

/**
 * Function to determine tile size based on market cap
 */
export const getTileSize = (item: HeatMapItem): string => {
  if (!item.marketCap) return 'text-sm';
  
  if (item.marketCap > 500000000000) return 'text-xl'; // > $500B
  if (item.marketCap > 100000000000) return 'text-lg'; // > $100B
  if (item.marketCap > 10000000000) return 'text-base'; // > $10B
  return 'text-sm'; // < $10B
};
