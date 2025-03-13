
/**
 * Feature Flags Service - Simplified import path
 * Re-exports functionality from the features module
 */

import { 
  FeatureFlags, 
  initializeFeatureFlags, 
  updateFeatureFlags, 
  getFeatureFlags, 
  isFeatureEnabled, 
  setFeatureFlag 
} from './features';

export {
  type FeatureFlags,
  initializeFeatureFlags,
  updateFeatureFlags,
  getFeatureFlags,
  isFeatureEnabled,
  setFeatureFlag
};
