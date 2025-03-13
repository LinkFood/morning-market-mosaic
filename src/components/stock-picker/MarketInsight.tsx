
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface MarketInsightProps {
  insight: string;
}

const MarketInsight: React.FC<MarketInsightProps> = ({ insight }) => {
  return (
    <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
      <h3 className="font-medium flex items-center mb-2">
        <TrendingUp className="h-4 w-4 mr-2" />
        Market Insight
      </h3>
      <p className="text-sm">{insight}</p>
    </div>
  );
};

export default MarketInsight;
