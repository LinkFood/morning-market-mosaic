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
    liquidity: number; // New score for liquidity
    quality: number;   // New score for stock quality
    composite: number;
  };
  signals: string[];
  marketCap?: number;  // Add market cap if available
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
 * NEW: Calculate liquidity score based on dollar volume and price
 */
function calculateLiquidityScore(stock: StockData): number {
  // No volume or price data
  if (!stock.volume || !stock.close) return 0;
  
  // Calculate dollar volume (rough estimate of liquidity)
  const dollarVolume = stock.volume * stock.close;
  
  // Score based on dollar volume tiers
  if (dollarVolume > 100000000) return 100;      // >$100M - very liquid
  else if (dollarVolume > 50000000) return 90;   // >$50M
  else if (dollarVolume > 20000000) return 80;   // >$20M
  else if (dollarVolume > 10000000) return 70;   // >$10M
  else if (dollarVolume > 5000000) return 60;    // >$5M
  else if (dollarVolume > 1000000) return 50;    // >$1M 
  else if (dollarVolume > 500000) return 30;     // >$500K
  else return 10;                                // Low liquidity
}

/**
 * NEW: Calculate quality score based on price and estimated market cap
 */
function calculateQualityScore(stock: StockData): number {
  let score = 50; // Start with neutral score
  
  // Price-based component (higher prices often indicate more established companies)
  if (stock.close >= 100) score += 20;       // >$100 stocks are often quality companies
  else if (stock.close >= 50) score += 15;   // >$50
  else if (stock.close >= 25) score += 10;   // >$25
  else if (stock.close >= 15) score += 5;    // >$15
  else if (stock.close < 10) score -= 5;     // <$10 (small penalty)
  else if (stock.close < 5) score -= 15;     // <$5 (larger penalty for penny stocks)
  
  // Volume-based quality component
  if (stock.volume && stock.volume > 5000000) score += 10;    // High volume stocks
  else if (stock.volume && stock.volume < 100000) score -= 10; // Very low volume stocks
  
  // Average volume based quality component (consistent interest)
  if (stock.avgVolume && stock.avgVolume > 1000000) score += 10;
  
  // Cap the score
  return Math.min(Math.max(score, 0), 100);
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
  
  // NEW: Quality signals
  if (stock.close >= 50 && stock.volume && stock.volume > 1000000) {
    signals.push("High Quality");
  }
  
  // NEW: Liquidity signals
  if (stock.volume && stock.close && stock.volume * stock.close > 50000000) {
    signals.push("High Liquidity");
  }
  
  return signals;
}

/**
 * Check if a stock meets minimum criteria for consideration
 * IMPROVED: Stronger filters to avoid penny and low-quality stocks
 */
function meetsMinimumCriteria(stock: ScoredStock): boolean {
  // Filter out penny stocks (price < $10 instead of previous $5)
  if (stock.close < 10) {
    console.log(`${stock.ticker} filtered out: low price stock (price $${stock.close.toFixed(2)})`);
    return false;
  }
  
  // Require sufficient volume for liquidity (increased from 500,000)
  if (!stock.volume || stock.volume < 1000000) {
    console.log(`${stock.ticker} filtered out: insufficient volume (${stock.volume?.toLocaleString() || 'unknown'})`);
    return false;
  }
  
  // NEW: Filter based on dollar volume (price * volume) for better liquidity
  const dollarVolume = stock.volume * stock.close;
  if (dollarVolume < 10000000) { // At least $10M in dollar volume
    console.log(`${stock.ticker} filtered out: low dollar volume ($${(dollarVolume/1000000).toFixed(2)}M)`);
    return false;
  }
  
  // NEW: Filter based on quality score
  if (stock.scores.quality < 50) {
    console.log(`${stock.ticker} filtered out: low quality score (${stock.scores.quality})`);
    return false;
  }
  
  // NEW: Filter based on liquidity score
  if (stock.scores.liquidity < 60) {
    console.log(`${stock.ticker} filtered out: low liquidity score (${stock.scores.liquidity})`);
    return false;
  }
  
  // Minimum composite score threshold
  if (stock.scores.composite < 50) { // Increased from 40
    console.log(`${stock.ticker} filtered out: low composite score (${stock.scores.composite})`);
    return false;
  }
  
  // Passed all criteria
  console.log(`${stock.ticker} passed minimum criteria: price $${stock.close.toFixed(2)}, volume ${stock.volume.toLocaleString()}, score ${stock.scores.composite}`);
  return true;
}

/**
 * Main function to evaluate and rank stocks
 * IMPROVED: Now applies pre-filtering and adds new quality metrics
 */
export function evaluateStocks(stocksData: StockData[]): ScoredStock[] {
  // Log the input data for debugging
  console.log(`evaluateStocks called with ${stocksData.length} stocks`);
  
  // IMPROVEMENT: Pre-filter to remove obvious penny stocks and low volume stocks
  // This prevents wasting computation on stocks that will be filtered later
  const preFilteredStocks = stocksData.filter(stock => 
    stock.close >= 10 && // Min price $10
    stock.volume >= 1000000 // Min volume 1M shares
  );
  
  console.log(`Pre-filtered stocks: ${preFilteredStocks.length} of ${stocksData.length} passed`);
  
  const scoredStocks = preFilteredStocks
    .map(stock => {
      // Calculate individual scores
      const momentumScore = calculateMomentumScore(stock);
      const volumeScore = calculateVolumeScore(stock);
      const trendScore = calculateTrendScore(stock);
      const volatilityScore = calculateVolatilityScore(stock);
      const liquidityScore = calculateLiquidityScore(stock);
      const qualityScore = calculateQualityScore(stock);
      
      // Calculate composite score with new weightings
      const compositeScore = Math.round(
        momentumScore * 0.25 + 
        volumeScore * 0.15 + 
        trendScore * 0.20 + 
        volatilityScore * 0.10 +
        liquidityScore * 0.15 +  // New factor
        qualityScore * 0.15      // New factor
      );
      
      // Create scored stock object with all metrics
      const scoredStock: ScoredStock = {
        ...stock,
        scores: {
          momentum: momentumScore,
          volume: volumeScore,
          trend: trendScore,
          volatility: volatilityScore,
          liquidity: liquidityScore, // New score
          quality: qualityScore,     // New score
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