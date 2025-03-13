
/**
 * Mock SPY Stock Data Generator
 * 
 * This module provides realistic SPY (S&P 500 ETF) price data for different time frames
 * when real API data is unavailable.
 */
import { CandleData } from '@/types/marketTypes';
import { TimeFrame } from '@/components/chart/TimeFrameSelector';

/**
 * Generate realistic mock SPY stock data for a given time frame
 */
export function generateMockSPYData(timeFrame: TimeFrame): CandleData[] {
  const data: CandleData[] = [];
  const now = new Date();
  const baseValue = 505.75; // Current SPY price as of March 2025
  let startDate = new Date(now);
  let dataPoints = 30;
  let interval = 24 * 60 * 60 * 1000; // 1 day in ms
  
  // Configure data generation based on timeframe
  switch (timeFrame) {
    case '1D':
      startDate = new Date(now);
      startDate.setHours(9, 30, 0, 0); // Market open at 9:30 AM
      dataPoints = 78; // ~6.5 hours of trading in 5-min intervals
      interval = 5 * 60 * 1000; // 5 minutes
      break;
    case '1W':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      dataPoints = 7 * 8; // 7 days with 8 points per day
      interval = 3 * 60 * 60 * 1000; // 3 hours
      break;
    case '1M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      dataPoints = 22; // ~22 trading days in a month
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '3M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      dataPoints = 66; // ~66 trading days in 3 months
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '6M':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      dataPoints = 132; // ~132 trading days in 6 months
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      dataPoints = 252; // ~252 trading days in a year
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '5Y':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      dataPoints = 60; // Monthly data for 5 years
      interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
    case 'MAX':
      startDate = new Date(2010, 0, 1);
      dataPoints = (now.getFullYear() - 2010) * 12; // Monthly since 2010
      interval = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
  }
  
  // Create reasonable price movements for SPY
  let currentPrice = baseValue;
  // Adjust volatility based on time frame
  let volatility = 0.5; // Base volatility in percent
  if (timeFrame === '1D') volatility = 0.08;
  if (timeFrame === '1W') volatility = 0.15;
  if (timeFrame === '5Y' || timeFrame === 'MAX') volatility = 0.8;
  
  // Add slight upward bias for longer timeframes (reflecting market's historical upward trend)
  let upwardBias = 0;
  if (timeFrame === '1Y' || timeFrame === '5Y' || timeFrame === 'MAX') {
    upwardBias = 0.03; // 0.03% upward bias per interval
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startDate.getTime() + (i * interval);
    const date = new Date(timestamp);
    
    // Skip weekends if not 1D timeframe
    if (timeFrame !== '1D' && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }
    
    // Calculate random price movement with slight upward bias
    const randomMove = ((Math.random() * 2) - 1) * volatility; // Random between -vol and +vol
    const move = randomMove + upwardBias;
    
    // Apply the move to current price
    const prevPrice = currentPrice;
    currentPrice = currentPrice * (1 + move / 100);
    
    // Create open, high, low values that make sense
    const open = prevPrice;
    // High and low should be relative to open/close range
    const min = Math.min(open, currentPrice);
    const max = Math.max(open, currentPrice);
    const range = max - min;
    
    // High is above the max by 0-50% of the range
    const high = max + (range * (Math.random() * 0.5));
    // Low is below the min by 0-50% of the range
    const low = min - (range * (Math.random() * 0.5));
    
    // Generate realistic volume
    // SPY averages around 80-120 million shares daily
    let volume = Math.floor(Math.random() * 40000000) + 80000000;
    if (timeFrame === '1D') {
      // Lower volume for intraday periods (divided by number of 5-min periods in a day)
      volume = Math.floor(volume / 78);
    }
    
    // Add the candle data
    data.push({
      date: date.toISOString(),
      timestamp: timestamp,
      open: open,
      high: high,
      low: low,
      close: currentPrice,
      volume: volume,
    });
  }
  
  // Sort by timestamp just to be safe
  return data.sort((a, b) => a.timestamp - b.timestamp);
}
