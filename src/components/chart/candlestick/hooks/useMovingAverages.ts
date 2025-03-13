
import { CandleData } from '@/types/marketTypes';

export const useMovingAverages = (data: CandleData[]) => {
  // Calculate moving averages
  const calculateMovingAverage = (data: CandleData[], period: number) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`ma${period}`]: null };
      
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.close, 0);
      
      return {
        ...item,
        [`ma${period}`]: sum / period
      };
    });
  };
  
  // Add moving averages to data
  const dataWithMA = (() => {
    if (!data || data.length === 0) return [];
    
    let processedData = [...data];
    
    // Only calculate MAs if we have enough data points
    if (data.length >= 20) {
      processedData = calculateMovingAverage(processedData, 20);
    }
    
    if (data.length >= 50) {
      processedData = calculateMovingAverage(processedData, 50);
    }
    
    return processedData;
  })();

  return {
    dataWithMA,
    calculateMovingAverage
  };
};
