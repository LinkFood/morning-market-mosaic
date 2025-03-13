
import React from 'react';
import { ScoredStock } from '@/services/stockPicker/algorithm';

interface StockHeaderProps {
  stock: ScoredStock;
  className?: string;
}

const StockHeader: React.FC<StockHeaderProps> = ({ stock, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <span className="font-medium text-lg">{stock.ticker}</span>
        <div className="flex">
          <span className="text-sm text-muted-foreground">
            ${stock.close.toFixed(2)} · {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
