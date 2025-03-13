
/**
 * Fed Dashboard Design System
 * 
 * This module provides consistent styling utilities for the Fed Dashboard
 * that can be reused across the application.
 */

import { cva } from "class-variance-authority";

/**
 * Color palette for the Fed Dashboard
 */
export const fedColors = {
  // Primary palette
  primary: {
    50: "#f0f4ff",
    100: "#e0e9fd",
    200: "#c7d7fb",
    300: "#a4bcf8",
    400: "#7c9bf4",
    500: "#5a74ed",
    600: "#4654e3",
    700: "#3a42cd",
    800: "#3238a6",
    900: "#2e3483",
    950: "#1e204d",
  },
  
  // Semantic colors for economic indicators
  economic: {
    // Green shades for positive trends
    positive: {
      light: "#dcfce7",
      default: "#22c55e",
      dark: "#166534",
    },
    // Red shades for negative trends
    negative: {
      light: "#fee2e2",
      default: "#ef4444",
      dark: "#991b1b",
    },
    // Yellow shades for cautionary indicators
    caution: {
      light: "#fef9c3",
      default: "#eab308",
      dark: "#854d0e",
    },
    // Blue shades for neutral or informational indicators
    neutral: {
      light: "#e0f2fe",
      default: "#0ea5e9",
      dark: "#0c4a6e",
    },
  },
  
  // Chart colors (a consistent palette for data visualization)
  chart: [
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#f97316", // orange
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#eab308", // yellow
    "#64748b", // slate
    "#14b8a6", // teal
  ],
};

/**
 * Typography scale for the Fed Dashboard
 */
export const fedTypography = {
  // Heading styles
  heading: {
    1: "text-3xl font-bold tracking-tight",
    2: "text-2xl font-semibold tracking-tight",
    3: "text-xl font-semibold",
    4: "text-lg font-medium",
  },
  // Body text styles
  body: {
    large: "text-base leading-7",
    default: "text-sm leading-6",
    small: "text-xs leading-5",
  },
  // Monospace for numeric data
  mono: "font-mono tracking-tight",
};

/**
 * Reusable card styles for economic indicators
 */
export const indicatorCard = cva(
  "p-4 rounded-lg bg-secondary/50 overflow-hidden transition-all duration-200",
  {
    variants: {
      size: {
        sm: "h-24",
        md: "h-32",
        lg: "h-40",
      },
      trend: {
        positive: "hover:border-emerald-400/50 hover:bg-emerald-50/10",
        negative: "hover:border-red-400/50 hover:bg-red-50/10",
        neutral: "hover:border-blue-400/50 hover:bg-blue-50/10",
        mixed: "hover:border-amber-400/50 hover:bg-amber-50/10",
      },
    },
    defaultVariants: {
      size: "md",
      trend: "neutral",
    },
  }
);

/**
 * Responsive breakpoints for the Fed Dashboard
 */
export const fedBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

/**
 * Utility for getting the trend style based on value and direction
 */
export const getTrendStyle = (value: number, isPositiveGood: boolean = true) => {
  if (value === 0) return "neutral";
  
  const isPositive = value > 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;
  
  return isGood ? "positive" : "negative";
};

/**
 * Format numbers consistently across the dashboard
 */
export const formatFedNumber = (value: number, options?: {
  compact?: boolean,
  decimals?: number,
  prefix?: string,
  suffix?: string,
}) => {
  const {
    compact = false,
    decimals = 2,
    prefix = "",
    suffix = "",
  } = options || {};
  
  let formatted = value;
  let compactSuffix = "";
  
  if (compact) {
    if (Math.abs(value) >= 1e12) {
      formatted = value / 1e12;
      compactSuffix = "T";
    } else if (Math.abs(value) >= 1e9) {
      formatted = value / 1e9;
      compactSuffix = "B";
    } else if (Math.abs(value) >= 1e6) {
      formatted = value / 1e6;
      compactSuffix = "M";
    } else if (Math.abs(value) >= 1e3) {
      formatted = value / 1e3;
      compactSuffix = "K";
    }
  }
  
  return `${prefix}${formatted.toFixed(decimals)}${compactSuffix}${suffix}`;
};
