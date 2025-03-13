
import React from 'react';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import StockHeader from './StockHeader';
import StockItem from './StockItem';
import StockScore from './StockScore';

interface AlgorithmTabProps {
  stockPicks: ScoredStock[];
}

const AlgorithmTab: React.FC<AlgorithmTabProps> = ({ stockPicks }) => {
  return (
    <div className="space-y-4">
      {stockPicks.map((stock) => (
        <StockItem key={stock.ticker}>
          <div className="flex items-center justify-between">
            <StockHeader stock={stock} />
            <StockScore stock={stock} />
          </div>
        </StockItem>
      ))}
    </div>
  );
};

export default AlgorithmTab;
