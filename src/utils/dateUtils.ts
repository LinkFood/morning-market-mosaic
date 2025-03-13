
import { format, isValid, isAfter, isFuture, parseISO } from "date-fns";

/**
 * Format a date string into a user-friendly format
 * @param dateString ISO date string to format
 * @param formatType 'short', 'long', 'month', 'monthYear'
 * @returns Formatted date string or null if invalid
 */
export function formatDate(
  dateString: string,
  formatType: 'short' | 'long' | 'month' | 'monthYear' = 'short'
): string | null {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    
    // Disallow future dates (likely data errors)
    if (isFuture(date)) {
      console.warn(`Future date detected: ${dateString}, using current date instead`);
      return format(new Date(), getFormatString(formatType));
    }
    
    return format(date, getFormatString(formatType));
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return null;
  }
}

/**
 * Get format string based on format type
 */
function getFormatString(formatType: 'short' | 'long' | 'month' | 'monthYear'): string {
  switch (formatType) {
    case 'long':
      return 'MMMM d, yyyy';
    case 'month':
      return 'MMMM';
    case 'monthYear':
      return 'MMMM yyyy';
    case 'short':
    default:
      return 'MMM d, yyyy';
  }
}

/**
 * Validate date range to ensure dates are valid and in correct order
 * @returns True if valid, false otherwise
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return false;
    }
    
    return !isAfter(start, end);
  } catch (error) {
    return false;
  }
}

/**
 * Format date based on frequency (daily, monthly, quarterly)
 */
export function formatDateByFrequency(dateString: string, frequency: 'daily' | 'monthly' | 'quarterly'): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '';
    
    switch (frequency) {
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'monthly':
        return format(date, 'MMMM yyyy');
      case 'daily':
      default:
        return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return '';
  }
}

/**
 * Determine data frequency based on dates array
 */
export function determineFrequency(dates: string[]): 'daily' | 'monthly' | 'quarterly' {
  if (!dates || dates.length < 2) return 'monthly';
  
  try {
    // Look at consecutive dates to determine frequency
    const date1 = parseISO(dates[0]);
    const date2 = parseISO(dates[1]);
    
    if (!isValid(date1) || !isValid(date2)) return 'monthly';
    
    const diffDays = Math.abs(
      (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays <= 7) return 'daily';
    if (diffDays <= 45) return 'monthly';
    return 'quarterly';
  } catch (error) {
    return 'monthly';
  }
}
