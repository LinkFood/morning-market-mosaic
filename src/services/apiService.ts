
/**
 * API Service
 * Provides methods for accessing market data from various sources
 */
import apiService, { 
  getHighQualityMarketMovers, 
  getPolygonApiKey 
} from './api';

// Re-export everything from the modular API service
export default apiService;
export { getHighQualityMarketMovers, getPolygonApiKey };
