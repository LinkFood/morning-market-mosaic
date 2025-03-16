
import marketService from './marketService';
import economicService from './economicService';
import stockPickerService from './stockPickerService';
import enhancedMarketService, { getHighQualityMarketMovers } from './enhancedMarketService';
import polygonKeyService, { getPolygonApiKey } from './polygonKeyService';

/**
 * API Service
 * Main entry point for all API services
 */
const apiService = {
  ...marketService,
  ...economicService,
  ...stockPickerService,
};

export default apiService;
export { 
  marketService,
  economicService,
  stockPickerService,
  enhancedMarketService,
  polygonKeyService,
  getHighQualityMarketMovers,
  getPolygonApiKey
};
