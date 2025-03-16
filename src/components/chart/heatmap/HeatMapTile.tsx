
import React from 'react';
import { cn } from "@/lib/utils";
import { HeatMapTileProps } from "./types";
import { getColor } from "./utils/colorUtils";
import { getTileSize } from "./utils/sizeUtils";

const HeatMapTile: React.FC<HeatMapTileProps> = ({ item, onClick }) => {
  return (
    <div 
      className={cn(
        "p-2 rounded border cursor-pointer transition-all hover:shadow-md flex flex-col justify-between",
        getTileSize(item)
      )}
      style={{ backgroundColor: getColor(item.change) }}
      onClick={() => onClick && onClick(item)}
    >
      <div className="font-medium truncate">{item.name}</div>
      <div className="flex justify-between items-center text-xs mt-1">
        <span>${typeof item.value === 'number' ? item.value.toFixed(2) : 'N/A'}</span>
        <span 
          className={cn(
            "font-bold",
            item.change > 0 ? "text-green-800" : item.change < 0 ? "text-red-800" : ""
          )}
        >
          {item.change > 0 ? '+' : ''}
          {typeof item.change === 'number' ? item.change.toFixed(2) : '0.00'}%
        </span>
      </div>
    </div>
  );
};

export default HeatMapTile;
