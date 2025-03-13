
/**
 * Stock Picker Algorithm Service
 * Implements rule-based scoring system for stock selection
 */
import { StockData } from "@/types/marketTypes";

// Extend StockData with scores and signals
export interface ScoredStock extends StockData {
  scores: {
    momentum: number;
    volume: number;
    trend: number;
    volatility: number;
    composite: number;
  };
  signals: string[];
}

/**
 * Calculate the momentum score (0-100) based on recent price action
 */
function calculateMomentumScore(stock: StockData): number {
  // Simple momentum calculation based on recent performance
  const changeWeight = 40; // Weight for today's change
  const normalizedChange = Math.min(Math.max(stock.changePercent, -5), 5); // Clamp between -5% and 5%
  const changeScore = ((normalizedChange + 5) / 10) * 100 * (changeWeight / 100);
  
  // Could be expanded with more factors like: Moving average relationships, RSI, etc.
  
  return Math.min(Math.round(changeScore), 100);
}

/**
 * Calculate the volume score (0-100) based on volume patterns
 */
function calculateVolumeScore(stock: StockData): number {
  // Basic check if volume data exists
  if (!stock.volume) return 50; // Neutral score if no volume data
  
  // Calculate volume ratio compared to average (if available)
  let volumeRatio = 1;
  if (stock.avgVolume && stock.avgVolume > 0) {
    volumeRatio = stock.volume / stock.avgVolume;
  }
  
  // Score based on volume ratio
  let volumeScore = 50; // Neutral starting point
  
  if (volumeRatio > 3) volumeScore = 100; // Extremely high volume
  else if (volumeRatio > 2) volumeScore = 85;
  else if (volumeRatio > 1.5) volumeScore = 75;
  else if (volumeRatio > 1) volumeScore = 60;
  else if (volumeRatio < 0.5) volumeScore = 40;
  else if (volumeRatio < 0.3) volumeScore = 30;
  
  return volumeScore;
}

/**
 * Calculate trend score (0-100) based on price direction
 */
function calculateTrendScore(stock: StockData): number {
  // Without historical data, use a simplified approach
  if (stock.change > 0) {
    return 70 + Math.min(Math.round(stock.changePercent * 3), 30); // 70-100 for positive
  } else if (stock.change < 0) {
    return 30 + Math.min(Math.round(stock.changePercent * -3), 30); // 30-60 for negative
  }
  return 50; // Neutral if no change
}

/**
 * Calculate volatility score based on high-low range
 */
function calculateVolatilityScore(stock: StockData): number {
  if (!stock.high || !stock.low || !stock.open) return 50;
  
  const dayRange = ((stock.high - stock.low) / stock.open) * 100;
  
  // Convert range to a score
  if (dayRange < 0.5) return 30; // Very low volatility
  if (dayRange < 1) return 40;
  if (dayRange < 2) return 60;
  if (dayRange < 3) return 70;
  if (dayRange < 5) return 80;
  return 90; // Very high volatility
}

/**
 * Identify notable signals for a stock
 */
function identifySignals(stock: StockData): string[] {
  const signals: string[] = [];
  
  // Price action signals
  if (stock.changePercent > 5) signals.push("Strong Bullish");
  else if (stock.changePercent > 2) signals.push("Bullish");
  else if (stock.changePercent < -5) signals.push("Strong Bearish");
  else if (stock.changePercent < -2) signals.push("Bearish");
  
  // Volume signals
  if (stock.volume && stock.avgVolume && stock.volume > stock.avgVolume * 2) {
    signals.push("High Volume");
    
    // Volume with direction
    if (stock.changePercent > 0) signals.push("Accumulation");
    else if (stock.changePercent < 0) signals.push("Distribution");
  }
  
  // Day range signals
  if (stock.high && stock.low && stock.open) {
    const dayRange = ((stock.high - stock.low) / stock.open) * 100;
    if (dayRange > 5) signals.push("High Volatility");
  }
  
  return signals;
}

/**
 * Check if a stock meets minimum criteria for consideration
 */
function meetsMinimumCriteria(stock: ScoredStock): boolean {
  // Relaxed volume filter - to show more stocks
  if (stock.volume && stock.volume < 50000) return false;
  
  // Relaxed minimum composite score threshold
  if (stock.scores.composite < 40) return false;
  
  return true;
}

/**
 * Main function to evaluate and rank stocks
 */
export function evaluateStocks(stocksData: StockData[]): ScoredStock[] {
  // Log the input data for debugging
  console.log(`evaluateStocks called with ${stocksData.length} stocks`);
  
  const scoredStocks = stocksData
    .map(stock => {
      // Calculate individual scores
      const momentumScore = calculateMomentumScore(stock);
      const volumeScore = calculateVolumeScore(stock);
      const trendScore = calculateTrendScore(stock);
      const volatilityScore = calculateVolatilityScore(stock);
      
      // Calculate composite score with weightings
      const compositeScore = Math.round(
        momentumScore * 0.35 + 
        volumeScore * 0.25 + 
        trendScore * 0.25 + 
        volatilityScore * 0.15
      );
      
      // Create scored stock object with all metrics
      const scoredStock: ScoredStock = {
        ...stock,
        scores: {
          momentum: momentumScore,
          volume: volumeScore,
          trend: trendScore,
          volatility: volatilityScore,
          composite: compositeScore
        },
        signals: identifySignals(stock)
      };
      
      return scoredStock;
    })
    .filter(stock => meetsMinimumCriteria(stock))
    .sort((a, b) => b.scores.composite - a.scores.composite);
  
  // Log how many stocks passed the criteria
  console.log(`${scoredStocks.length} stocks passed minimum criteria`);
  
  // Return the top 5 stocks (or fewer if less available)
  return scoredStocks.slice(0, 5);
}

export default {
  evaluateStocks
};
