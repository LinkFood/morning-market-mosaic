
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StockPicksEmpty: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Stock Picks
          <Badge variant="outline" className="ml-2">Beta</Badge>
        </CardTitle>
        <CardDescription>Algorithmic stock selection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 text-center text-muted-foreground">
          No stock picks available for current market conditions
        </div>
      </CardContent>
    </Card>
  );
};

export default StockPicksEmpty;
