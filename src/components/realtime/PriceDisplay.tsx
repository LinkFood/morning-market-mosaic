
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PriceDisplayProps {
  value: number;
  previousValue?: number;
  precision?: number;
  showIndicator?: boolean;
  prefix?: string;
  className?: string;
}

export function PriceDisplay({
  value,
  previousValue,
  precision = 2,
  showIndicator = true,
  prefix = '$',
  className = ''
}: PriceDisplayProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Determine direction of change
    if (previousValue !== undefined && value !== previousValue) {
      setDirection(value > previousValue ? 'up' : 'down');
      setAnimate(true);
      
      // Reset animation after 1 second
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    setDisplayValue(value);
  }, [value, previousValue]);
  
  // Format value with proper precision
  const formattedValue = `${prefix}${displayValue.toFixed(precision)}`;
  
  return (
    <span 
      className={cn(
        'transition-colors font-mono relative', 
        {
          'text-green-500 dark:text-green-400': animate && direction === 'up',
          'text-red-500 dark:text-red-400': animate && direction === 'down',
          'animate-pulse': animate
        },
        className
      )}
      data-direction={direction}
    >
      {formattedValue}
      
      {showIndicator && direction && (
        <span 
          className={cn(
            'ml-1 inline-flex items-center',
            {
              'text-green-500 dark:text-green-400': direction === 'up',
              'text-red-500 dark:text-red-400': direction === 'down'
            }
          )}
        >
          {direction === 'up' ? 
            <ArrowUp className="h-3 w-3" /> : 
            <ArrowDown className="h-3 w-3" />
          }
        </span>
      )}
    </span>
  );
}

export default PriceDisplay;
