
import React from "react";

export type TimeFrame = "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

interface TimeFrameSelectorProps {
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  timeFrame,
  setTimeFrame
}) => {
  const timeFrameOptions: TimeFrame[] = ["1M", "3M", "6M", "1Y", "5Y", "MAX"];
  
  return (
    <div className="flex justify-end mb-2 space-x-1">
      {timeFrameOptions.map(period => (
        <button 
          key={period}
          className={`px-2 py-1 text-xs rounded ${timeFrame === period ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
          onClick={() => setTimeFrame(period)}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export default TimeFrameSelector;
