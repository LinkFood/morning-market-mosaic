
import React from 'react';
import StockChart from './StockChart';

/**
 * SPY Chart Component
 * Specialized component showing the SPY ETF chart with pre/after market data
 */
const SPYChart: React.FC = () => {
  return (
    <StockChart
      symbol="SPY"
      title="SPY"
      subtitle="SPDR S&P 500 ETF Trust"
      showExtendedHoursToggle={true}
    />
  );
};

export default SPYChart;
