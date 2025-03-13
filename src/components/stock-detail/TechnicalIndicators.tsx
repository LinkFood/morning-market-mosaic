
import React from 'react';
import { Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TechnicalIndicatorsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  isOpen,
  onOpenChange
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="mb-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Technical Indicators</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2">
        <Tabs defaultValue="rsi">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rsi">RSI</TabsTrigger>
            <TabsTrigger value="macd">MACD</TabsTrigger>
            <TabsTrigger value="bollinger">Bollinger Bands</TabsTrigger>
          </TabsList>
          <TabsContent value="rsi" className="pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Relative Strength Index (RSI) is a momentum indicator that measures the 
                magnitude of recent price changes to evaluate overbought or oversold 
                conditions.
              </p>
            </div>
            <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
              <p className="text-sm text-muted-foreground">
                RSI chart will be implemented in a future update
              </p>
            </div>
          </TabsContent>
          <TabsContent value="macd" className="pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Moving Average Convergence Divergence (MACD) is a trend-following 
                momentum indicator that shows the relationship between two moving 
                averages of a security's price.
              </p>
            </div>
            <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
              <p className="text-sm text-muted-foreground">
                MACD chart will be implemented in a future update
              </p>
            </div>
          </TabsContent>
          <TabsContent value="bollinger" className="pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Bollinger Bands are a technical analysis tool defined by a set of 
                trendlines plotted two standard deviations away from a simple 
                moving average of the security's price.
              </p>
            </div>
            <div className="h-[200px] mt-4 flex items-center justify-center border rounded">
              <p className="text-sm text-muted-foreground">
                Bollinger Bands chart will be implemented in a future update
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TechnicalIndicators;
