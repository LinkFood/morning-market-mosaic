
import RealtimeService from './RealtimeService';
// Fix type exports by adding the 'type' keyword
export type { DataUpdateType, UpdateEventCallback } from './DataSubscriptionManager';

// Create and initialize realtime service
const realtimeService = new RealtimeService();
realtimeService.init();

// Export as a singleton
export const realtime = realtimeService;

// Default export
export default {
  realtime
};
