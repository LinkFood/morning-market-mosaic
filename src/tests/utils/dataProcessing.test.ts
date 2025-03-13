
/**
 * Tests for data processing utilities
 */
import { normalizeChartData } from '../../components/chart/utils/dataProcessing';

describe('Data Processing Utilities', () => {
  describe('normalizeChartData', () => {
    const testData = [
      { date: '2023-01-01', series1: 10, series2: 1000 },
      { date: '2023-02-01', series1: 20, series2: 2000 },
      { date: '2023-03-01', series1: 30, series2: 3000 },
    ];

    test('normalizes data with very different scales', () => {
      const result = normalizeChartData(testData, ['series1', 'series2'], 'date');
      
      // Check that normalized values were added
      expect(result[0]).toHaveProperty('series1_normalized');
      expect(result[0]).toHaveProperty('series2_normalized');
      
      // Check that the normalized values are on the same scale (0-100)
      expect(result[0].series1_normalized).toBe(0);  // Min value
      expect(result[2].series1_normalized).toBe(100); // Max value
      
      expect(result[0].series2_normalized).toBe(0);  // Min value
      expect(result[2].series2_normalized).toBe(100); // Max value
    });

    test('leaves data unchanged when scales are similar', () => {
      const similarData = [
        { date: '2023-01-01', series1: 10, series2: 12 },
        { date: '2023-02-01', series1: 20, series2: 18 },
        { date: '2023-03-01', series1: 30, series2: 25 },
      ];
      
      const result = normalizeChartData(similarData, ['series1', 'series2'], 'date');
      
      // Should return the original data without normalization
      expect(result).toEqual(similarData);
    });

    test('handles empty data arrays', () => {
      const result = normalizeChartData([], ['series1'], 'date');
      expect(result).toEqual([]);
    });

    test('handles empty dataKeys arrays', () => {
      const result = normalizeChartData(testData, [], 'date');
      expect(result).toEqual(testData);
    });

    test('handles area and bar suffixes in dataKeys', () => {
      const result = normalizeChartData(
        testData, 
        ['series1_area', 'series2_bar'], 
        'date'
      );
      
      expect(result[0]).toHaveProperty('series1_normalized');
      expect(result[0]).toHaveProperty('series2_normalized');
    });
  });
});
