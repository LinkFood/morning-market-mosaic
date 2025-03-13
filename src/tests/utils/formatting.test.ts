
/**
 * Tests for chart formatting utilities
 */
import { formatChartValue, formatYAxisTick } from '../../components/chart/utils/formatting';

describe('Chart Formatting Utilities', () => {
  describe('formatChartValue', () => {
    test('formats GDP values correctly', () => {
      const value = 22.5;
      const result = formatChartValue(value, 'value', 'GDP Growth');
      expect(result).toBe('$22.5T');
    });

    test('formats payroll values correctly', () => {
      const value = 155.3;
      const result = formatChartValue(value, 'value', 'Nonfarm Payrolls');
      expect(result).toBe('155.3M');
    });

    test('formats rate values correctly', () => {
      const value = 4.25;
      const result = formatChartValue(value, 'value', 'Interest Rate');
      expect(result).toBe('4.25%');
    });

    test('formats large values with K suffix', () => {
      const value = 2500;
      const result = formatChartValue(value, 'value');
      expect(result).toBe('2.5K');
    });

    test('formats very large values with M suffix', () => {
      const value = 3500000;
      const result = formatChartValue(value, 'value');
      expect(result).toBe('3.5M');
    });

    test('formats change values with plus/minus sign', () => {
      expect(formatChartValue(1.25, 'change')).toBe('+1.25%');
      expect(formatChartValue(-0.5, 'change')).toBe('-0.50%');
    });
  });

  describe('formatYAxisTick', () => {
    test('formats GDP axis ticks', () => {
      expect(formatYAxisTick(1200, 'GDP')).toBe('$1T');
      expect(formatYAxisTick(500, 'GDP')).toBe('$500B');
    });

    test('formats payroll axis ticks', () => {
      expect(formatYAxisTick(150, 'Payrolls')).toBe('150M');
    });

    test('formats rate axis ticks', () => {
      expect(formatYAxisTick(5.25, 'Inflation Rate')).toBe('5.25%');
    });

    test('formats large numbers appropriately', () => {
      expect(formatYAxisTick(3500)).toBe('3.5K');
      expect(formatYAxisTick(2500000)).toBe('2.5M');
    });
  });
});
