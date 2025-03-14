
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StockPicksEmptyProps {
  onRetry?: () => Promise<void>;
}

const StockPicksEmpty: React.FC<StockPicksEmptyProps> = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">No Stock Picks Available</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any stock recommendations at this time.
        </p>
        {onRetry && (
          <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StockPicksEmpty;
