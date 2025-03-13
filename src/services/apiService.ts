
// Re-export the refactored services under the old apiService name for backward compatibility
import marketService from './market';

// Export the legacy apiService
export default marketService;

// Re-export the cacheUtils functions for backward compatibility
export const { getCacheTimestamp, clearAllCacheData } = marketService;
