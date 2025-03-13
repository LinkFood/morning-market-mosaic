
import * as dataService from './dataService';
import { getEconomicIndicators } from './dataService';
import { FREDEconomicData, EconomicSeries } from './types';

/**
 * Test FRED API connection 
 * @returns Promise with test data or false if connection fails
 */
export async function testFredConnection(): Promise<FREDEconomicData | boolean> {
  try {
    // Test with a simple query
    const data = await getEconomicIndicators(['UNRATE'], 1);
    return data && data.length > 0 ? data[0] : false;
  } catch (error) {
    console.error("FRED API connection test failed:", error);
    return false;
  }
}

export default {
  getEconomicIndicators,
  testFredConnection
};
