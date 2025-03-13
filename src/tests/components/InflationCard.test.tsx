
/**
 * Tests for InflationCard component
 */
import React from 'react';
import { render } from '@testing-library/react';
import InflationCard from '../../components/inflation/InflationCard';

// Mock theme provider context
jest.mock('../../components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

describe('InflationCard Component', () => {
  const mockIndicator = {
    id: 'CPIAUCSL',
    name: 'Consumer Price Index',
    value: '3.5',
    previous: '3.7',
    change: '-0.2',
    date: '2023-09-01',
    formattedDate: 'Sep 1, 2023',
    trend: Array(12).fill(0).map((_, i) => ({
      date: `2023-${String(i+1).padStart(2, '0')}-01`,
      value: 3 + Math.sin(i/2) * 0.5
    })),
    unit: '%',
  };

  test('renders correctly', () => {
    const { container } = render(<InflationCard indicator={mockIndicator} />);
    expect(container).toMatchSnapshot();
  });

  test('displays the correct inflation rate', () => {
    const { getByText } = render(<InflationCard indicator={mockIndicator} />);
    expect(getByText('3.5%')).toBeInTheDocument();
  });

  test('displays the indicator name', () => {
    const { getByText } = render(<InflationCard indicator={mockIndicator} />);
    expect(getByText('Consumer Price Index')).toBeInTheDocument();
  });

  test('displays the change with correct sign', () => {
    const { getByText } = render(<InflationCard indicator={mockIndicator} />);
    expect(getByText('-0.2%')).toBeInTheDocument();
  });

  test('displays the formatted date', () => {
    const { getByText } = render(<InflationCard indicator={mockIndicator} />);
    expect(getByText('Sep 1, 2023')).toBeInTheDocument();
  });
});
