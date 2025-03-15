/**
 * AI-Enhanced Design System
 * Modern, sophisticated color palette and design tokens for the AI-driven trading platform
 */

import { cva } from "class-variance-authority";

// Core palette for AI-themed interface
export const aiColors = {
  // Primary brand colors
  primary: {
    50: 'rgba(68, 107, 242, 0.1)',
    100: 'rgba(68, 107, 242, 0.2)',
    200: 'rgba(68, 107, 242, 0.4)',
    300: 'rgba(68, 107, 242, 0.6)',
    400: 'rgba(68, 107, 242, 0.8)',
    500: '#446BF2', // Main primary color
    600: '#3A59D9',
    700: '#2F48C0',
    800: '#2536A8',
    900: '#1B248F',
  },
  
  // Secondary/accent color - teal
  accent: {
    50: 'rgba(0, 219, 180, 0.1)',
    100: 'rgba(0, 219, 180, 0.2)',
    200: 'rgba(0, 219, 180, 0.4)',
    300: 'rgba(0, 219, 180, 0.6)',
    400: 'rgba(0, 219, 180, 0.8)',
    500: '#00DBB4', // Main accent color
    600: '#00C3A0',
    700: '#00AB8C',
    800: '#009478',
    900: '#007C64',
  },
  
  // Neutral colors for backgrounds and text
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#080B14',
  },
  
  // Status colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  info: '#3B82F6',    // Blue
};

// AI-specific visual elements
export const aiVisuals = {
  // Gradients
  gradients: {
    primary: 'linear-gradient(90deg, #446BF2 0%, #00DBB4 100%)',
    accent: 'linear-gradient(90deg, #00DBB4 0%, #3ABFF8 100%)',
    darkOverlay: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.9) 100%)',
    glow: 'radial-gradient(circle, rgba(68, 107, 242, 0.15) 0%, rgba(68, 107, 242, 0) 70%)',
  },
  
  // Shadows with glow effects
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05), 0 0 4px rgba(68, 107, 242, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 0 8px rgba(68, 107, 242, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05), 0 0 15px rgba(68, 107, 242, 0.15)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.05), 0 0 25px rgba(68, 107, 242, 0.2)',
    highlight: '0 0 10px rgba(0, 219, 180, 0.4)',
  },
  
  // Border radiuses
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  
  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '1000ms',
  },
  
  // Animation curves
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    spring: 'cubic-bezier(0.5, 1.8, 0.7, 0.8)',
  },
};

// Spacing system
export const aiSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

// Typography
export const aiTypography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
  lineHeight: {
    none: 1,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Z-index scale
export const aiZIndex = {
  background: -10,
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
};

// Reusable card styles for AI-enhanced components
export const aiCard = cva(
  "relative rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-neutral-800/80 border border-neutral-700",
        glass: "bg-neutral-900/40 border border-neutral-800/50",
        glow: "bg-neutral-900/60 border border-primary-500/20",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
      intensity: {
        low: "hover:border-primary-500/30",
        medium: "hover:border-primary-500/50 hover:shadow-md",
        high: "hover:border-primary-500/70 hover:shadow-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      intensity: "medium",
    },
  }
);

// AI insight badges with confidence levels
export const aiInsightBadge = cva(
  "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
  {
    variants: {
      confidence: {
        high: "bg-accent-500/20 text-accent-400 border border-accent-500/30",
        medium: "bg-primary-500/20 text-primary-400 border border-primary-500/30",
        low: "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      confidence: "medium",
      size: "sm",
    },
  }
);

export default {
  colors: aiColors,
  visuals: aiVisuals,
  spacing: aiSpacing,
  typography: aiTypography,
  zIndex: aiZIndex,
  card: aiCard,
  insightBadge: aiInsightBadge,
};