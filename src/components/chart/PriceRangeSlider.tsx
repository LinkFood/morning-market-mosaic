
import React from "react";
import { Slider } from "@/components/ui/slider";

interface PriceRangeSliderProps {
  low: number;
  high: number;
  current: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ low, high, current }) => {
  // Calculate position as percentage
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;
  
  return (
    <div className="flex items-center mt-1 space-x-2 text-xs">
      <span>{low.toFixed(2)}</span>
      <div className="relative flex-1">
        <Slider
          defaultValue={[position]}
          max={100}
          step={1}
          disabled
          className="h-1.5"
        />
        <div 
          className="absolute top-0 w-2 h-2 rounded-full bg-primary border border-background -translate-x-1/2"
          style={{ left: `${position}%` }}
        />
      </div>
      <span>{high.toFixed(2)}</span>
    </div>
  );
};

export default PriceRangeSlider;
