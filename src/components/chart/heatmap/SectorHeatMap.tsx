import React, { useEffect, useState } from 'react';
import HeatMap, { HeatMapItem } from './HeatMap';
import apiService from '@/services/apiService';
import { StockData } from '@/types/marketTypes';
import { toast } from 'sonner';

// Sector categories and mappings
const SECTORS = [
  'Technology',
  'Healthcare',
  'Financials',
  'Communications',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrials',
  'Energy',
  'Utilities',
  'Basic Materials',
  'Real Estate'
];

interface SectorHeatMapProps {
  title?: string;
  maxItems?: number;
  onStockClick?: (ticker: string) => void;
}

const SectorHeatMap: React.FC<SectorHeatMapProps> = ({
  title = "Sector & Industry Performance",
  maxItems = 100,
  onStockClick
}) => {
  const [loading, setLoading] = useState(true);
  const [sectorData, setSectorData] = useState<HeatMapItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data
  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch sector performance data
        const sectorPerformance = await apiService.getSectorPerformance();
        
        // Fetch major stocks for additional data
        const majorStocks = await apiService.getMajorStocks();
        
        // Combine the data
        const combinedData = createCombinedHeatMapData(sectorPerformance, majorStocks);
        
        setSectorData(combinedData);
      } catch (err) {
        console.error('Error fetching sector data:', err);
        setError('Failed to load sector data');
        toast.error('Failed to load sector data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectorData();
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchSectorData();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle item click
  const handleItemClick = (item: HeatMapItem) => {
    if (onStockClick && item.id.length <= 5) { // Assuming tickers are ≤ 5 chars
      onStockClick(item.id);
    }
  };
  
  // Create combined heat map data from sectors and stocks
  const createCombinedHeatMapData = (
    sectors: Array<{name: string, performance: number}>,
    stocks: StockData[]
  ): HeatMapItem[] => {
    const results: HeatMapItem[] = [];
    
    // Add sector data
    sectors.forEach(sector => {
      results.push({
        id: sector.name,
        name: sector.name,
        value: 0, // Not applicable for sectors
        change: sector.performance,
        category: 'Sectors'
      });
    });
    
    // Add stock data with sector categorization
    stocks.forEach(stock => {
      if (stock.close && stock.changePercent !== undefined) {
        // Assign a sector based on simple logic
        // In a real app, you'd have proper sector data from your API
        let category = 'Other';
        
        // Simple sector assignment based on ticker prefixes/suffixes
        // This is very simplified - in production you'd use actual sector data
        if (['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN', 'NFLX', 'NVDA', 'AMD'].includes(stock.ticker)) {
          category = 'Technology';
        } else if (['JPM', 'BAC', 'GS', 'MS', 'WFC', 'C'].includes(stock.ticker)) {
          category = 'Financials';
        } else if (['JNJ', 'PFE', 'MRK', 'ABBV', 'LLY'].includes(stock.ticker)) {
          category = 'Healthcare';
        } else if (['XOM', 'CVX', 'COP', 'BP'].includes(stock.ticker)) {
          category = 'Energy';
        } else if (['HD', 'AMZN', 'TSLA', 'NKE'].includes(stock.ticker)) {
          category = 'Consumer Cyclical';
        } else if (['WMT', 'PG', 'KO', 'PEP'].includes(stock.ticker)) {
          category = 'Consumer Defensive';
        } else if (['DIS', 'CMCSA', 'VZ', 'T'].includes(stock.ticker)) {
          category = 'Communications';
        }
        
        results.push({
          id: stock.ticker,
          name: stock.ticker,
          value: stock.close,
          change: stock.changePercent,
          marketCap: stock.marketCap,
          category
        });
      }
    });
    
    return results;
  };
  
  return (
    <HeatMap
      title={title}
      data={sectorData}
      loading={loading}
      onItemClick={handleItemClick}
      maxItems={maxItems}
    />
  );
};

export default SectorHeatMap;