
import apiClient from './client';
import { StockData } from '@/types/marketTypes';
import { ScoredStock } from '@/services/stockPicker/algorithm';
import { StockAnalysis } from '@/services/stockPicker/aiAnalysis';
import { clearAIAnalysisCache } from '../stockPicker/aiAnalysis';

/**
 * Stock Picker API Service
 * Provides methods for stock analysis and AI-driven insights
 */
const stockPickerService = {
  /**
   * Gets the top stock picks based on a scoring algorithm
   * @param stocks Array of StockData to evaluate
   * @returns Promise containing an array of ScoredStock objects
   */
  async getTopPicks(stocks: StockData[]): Promise<ScoredStock[]> {
    try {
      const response = await apiClient.post<ScoredStock[]>('/stock-picker/algorithm', { stocks });
      return response.data;
    } catch (error) {
      console.error("Error getting top stock picks:", error);
      throw error;
    }
  },

  /**
   * Gets AI-driven analysis for a list of stocks
   * @param stocks Array of ScoredStock objects to analyze
   * @returns Promise containing StockAnalysis data
   */
  async getStockAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
    try {
      const response = await apiClient.post<StockAnalysis>('/stock-picker/ai-analysis', { stocks });
      return response.data;
    } catch (error) {
      console.error("Error getting stock analysis:", error);
      throw error;
    }
  },

  /**
   * Checks the health status of the Gemini API
   * @returns Promise containing health status information
   */
  async checkGeminiAPIHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const response = await apiClient.get<{ healthy: boolean }>('/stock-picker/ai-analysis/health');
      return { healthy: response.data.healthy };
    } catch (error) {
      console.error("Error checking Gemini API health:", error);
      return { healthy: false, error: error.message };
    }
  },
  
  /**
   * Clears the AI analysis cache
   */
  clearAIAnalysisCache
};

export default stockPickerService;
