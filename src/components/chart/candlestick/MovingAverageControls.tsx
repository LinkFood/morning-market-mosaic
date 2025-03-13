
import React from 'react';

interface MovingAverageControlsProps {
  showMA20: boolean;
  showMA50: boolean;
  setShowMA20: (show: boolean) => void;
  setShowMA50: (show: boolean) => void;
}

const MovingAverageControls: React.FC<MovingAverageControlsProps> = ({
  showMA20,
  showMA50,
  setShowMA20,
  setShowMA50
}) => {
  return (
    <div className="mb-2 flex justify-end space-x-4">
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id="ma20"
          checked={showMA20}
          onChange={() => setShowMA20(!showMA20)}
          className="h-3 w-3 rounded text-primary"
        />
        <label htmlFor="ma20" className="text-xs cursor-pointer">
          20-day MA
        </label>
      </div>
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id="ma50"
          checked={showMA50}
          onChange={() => setShowMA50(!showMA50)}
          className="h-3 w-3 rounded text-primary"
        />
        <label htmlFor="ma50" className="text-xs cursor-pointer">
          50-day MA
        </label>
      </div>
    </div>
  );
};

export default MovingAverageControls;
