
// Re-export all processors from their specialized modules
export {
  processInflationData,
  processInterestRateData,
  processGrowthData,
  processEmploymentData,
  processMarketData
} from "./processors/index.ts";
