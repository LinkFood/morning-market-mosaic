
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoredStock } from "@/services/stockPicker/algorithm";
import { Star, TrendingUp, Volume2, Shuffle } from "lucide-react";

interface StockPicksProps {
  stocks: ScoredStock[];
  isLoading: boolean;
}

const StockPicks: React.FC<StockPicksProps> = ({ stocks, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Stock Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">Loading stock picks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Stock Picks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center p-6">
            No stock picks available at this time. Try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Top Stock Picks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stocks.map((stock) => (
            <StockPickCard key={stock.ticker} stock={stock} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface StockPickCardProps {
  stock: ScoredStock;
}

const StockPickCard: React.FC<StockPickCardProps> = ({ stock }) => {
  const { ticker, name, changePercent, scores, signals } = stock;
  
  // Format the score to be out of 100
  const formatScore = (score: number) => `${score}/100`;
  
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{ticker}</h3>
          <p className="text-sm text-muted-foreground">{name || ticker}</p>
        </div>
        <div className="flex items-center">
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            changePercent > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 
            'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3 mt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Momentum: {formatScore(scores.momentum)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-purple-500" />
          <span className="text-sm">Volume: {formatScore(scores.volume)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-sm">Trend: {formatScore(scores.trend)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4 text-amber-500" />
          <span className="text-sm">Volatility: {formatScore(scores.volatility)}</span>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs font-medium uppercase text-muted-foreground mb-1">Signals</div>
        <div className="flex flex-wrap gap-1">
          {signals.map((signal, index) => (
            <span 
              key={`${ticker}-${index}`}
              className={`px-2 py-0.5 rounded-full text-xs ${
                signal.includes('Bullish') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                signal.includes('Bearish') ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
              }`}
            >
              {signal}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-4 bg-muted/50 rounded-full h-2">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" 
          style={{ width: `${scores.composite}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Composite Score</span>
        <span className="font-medium">{scores.composite}/100</span>
      </div>
    </div>
  );
};

export default StockPicks;
