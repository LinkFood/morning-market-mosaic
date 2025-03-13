
/**
 * Features Module
 * Re-exports from features/index.ts to avoid circular dependencies
 */

import { 
  updateFeatureFlags, 
  getFeatureFlags, 
  isFeatureEnabled,
  setFeatureFlag,
  initializeFeatureFlags,
  DEFAULT_FLAGS 
} from './features/index';

import type { FeatureFlags } from './features/types';

export { 
  updateFeatureFlags, 
  getFeatureFlags, 
  isFeatureEnabled,
  setFeatureFlag,
  initializeFeatureFlags,
  DEFAULT_FLAGS 
};

export type { FeatureFlags };
