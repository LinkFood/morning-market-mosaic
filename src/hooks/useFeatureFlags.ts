
import { useState, useEffect } from "react";
import { getFeatureFlags, FeatureFlags } from "@/services/features";

/**
 * Hook that provides access to feature flags with reactive updates
 * @returns Current feature flags state
 */
export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  
  useEffect(() => {
    // Update flags when they change via the custom event
    const handleFlagsUpdate = () => {
      setFlags(getFeatureFlags());
    };
    
    // Listen for feature flag updates
    window.addEventListener('feature_flags_updated', handleFlagsUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('feature_flags_updated', handleFlagsUpdate);
    };
  }, []);
  
  return flags;
}
