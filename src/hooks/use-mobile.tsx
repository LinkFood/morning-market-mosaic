
import { useState, useEffect } from 'react';

/**
 * Hook to check if the current viewport matches a media query
 * @param query Media query string (e.g., "(max-width: 768px)")
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Initialize with the current match state if window is available
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    // Default to false if window is not available (SSR)
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Create handler function
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Hook that returns the current orientation
 * @returns 'portrait' or 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * Hook that returns if the device is a mobile device based on screen width
 * @returns Boolean indicating if the device is mobile
 */
export function useMobileDevice(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook to detect touch capability
 * @returns Boolean indicating if touch is supported
 */
export function useTouchCapability(): boolean {
  const [hasTouch, setHasTouch] = useState<boolean>(false);
  
  useEffect(() => {
    const touchQuery = window.matchMedia('(pointer: coarse)');
    setHasTouch(touchQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setHasTouch(event.matches);
    };
    
    touchQuery.addEventListener('change', handler);
    return () => {
      touchQuery.removeEventListener('change', handler);
    };
  }, []);
  
  return hasTouch;
}

export default useMediaQuery;
