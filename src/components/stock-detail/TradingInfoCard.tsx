
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StockData } from '@/types/marketTypes';
import VolumeIndicator from '../chart/VolumeIndicator';

interface TradingInfoCardProps {
  stockData: StockData;
}

const TradingInfoCard: React.FC<TradingInfoCardProps> = ({ stockData }) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">Trading Information</CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Open</div>
            <div>${stockData.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">High</div>
            <div>${stockData.high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Low</div>
            <div>${stockData.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Previous Close</div>
            <div>${(stockData.close - stockData.change).toFixed(2)}</div>
          </div>
          {stockData.volume && (
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Volume</div>
              <VolumeIndicator 
                volume={stockData.volume} 
                avgVolume={stockData.volume * 0.8}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingInfoCard;
