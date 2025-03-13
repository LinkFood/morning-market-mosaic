
import { toast } from "sonner";
import marketIndices from "./marketIndices";
import sectorPerformance from "./sectorPerformance";
import stocks from "./stocks";
import events from "./events";
import economicIndicators from "./economicIndicators";
import cacheUtils from "./cacheUtils";
import mockData from "./mockData";

// Export individual services
export { 
  marketIndices,
  sectorPerformance,
  stocks,
  events,
  economicIndicators,
  cacheUtils
};

// Export default combined API
export default {
  ...marketIndices,
  ...sectorPerformance,
  ...stocks,
  ...events,
  ...economicIndicators,
  ...cacheUtils
};

// Export mock data for testing
export { mockData };
