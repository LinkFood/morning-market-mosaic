
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RefreshCw, Cpu } from 'lucide-react';

const StockPickerLoading = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cpu className="mr-2 h-5 w-5" />
          AI-Enhanced Stock Picks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin mb-4">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Analyzing market data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockPickerLoading;
