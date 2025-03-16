
import apiClient from './client';
import { EconomicIndicator } from '@/types/marketTypes';

/**
 * Economic API Service
 * Provides methods for accessing economic data
 */
const economicService = {
  /**
   * Fetches economic indicators data
   * @returns Promise containing an array of EconomicIndicator objects
   */
  async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    try {
      const response = await apiClient.get<EconomicIndicator[]>('/economic');
      return response.data;
    } catch (error) {
      console.error("Error fetching economic indicators:", error);
      throw error;
    }
  }
};

export default economicService;
