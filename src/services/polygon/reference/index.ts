
/**
 * Polygon.io Reference Data Service - Index
 * Exports all reference data functionality
 */

// Import all reference modules
import tickerDetailsModule from './tickerDetails';
import sectorPerformanceModule from './sectorPerformance';
import marketHolidaysModule from './marketHolidays';
import companyNewsModule from './companyNews';

// Extract functions from the modules
const { getTickerDetails } = tickerDetailsModule;
const { getSectorPerformance } = sectorPerformanceModule;
const { getMarketHolidays } = marketHolidaysModule;
const { getCompanyNews } = companyNewsModule;

// Export individual functions for direct use
export {
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews
};

// Export default object with all functions
export default {
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews
};
