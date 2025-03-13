
import React from "react";
import { SortAsc, SortDesc, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockData } from "@/types/marketTypes";
import SparklineChart from "../chart/SparklineChart";
import PriceRangeSlider from "../chart/PriceRangeSlider";
import VolumeIndicator from "../chart/VolumeIndicator";
import StockRowDetails from "./StockRowDetails";
import { useStockDetail } from "../StockDetail";

type SortKey = 'ticker' | 'close' | 'change' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

interface MajorStocksTableProps {
  stocks: StockData[];
  sparklines: {[key: string]: number[]};
  expandedRows: {[key: string]: boolean};
  stockDetails: {[key: string]: any};
  watchlist: string[];
  sortConfig: { key: SortKey; direction: SortDirection };
  loadingDetails: {[key: string]: boolean};
  toggleRowExpansion: (ticker: string) => void;
  toggleWatchlist: (ticker: string) => void;
  requestSort: (key: SortKey) => void;
}

const MajorStocksTable: React.FC<MajorStocksTableProps> = ({
  stocks,
  sparklines,
  expandedRows,
  stockDetails,
  watchlist,
  sortConfig,
  loadingDetails,
  toggleRowExpansion,
  toggleWatchlist,
  requestSort,
}) => {
  const { openStockDetail } = useStockDetail();

  const handleStockClick = (ticker: string) => {
    openStockDetail(ticker);
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="h-4 w-4 inline-block ml-1" /> 
      : <SortDesc className="h-4 w-4 inline-block ml-1" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-muted-foreground text-sm">
            <th className="pb-2 cursor-pointer" onClick={() => requestSort('ticker')}>
              Ticker {getSortIndicator('ticker')}
            </th>
            <th className="pb-2 cursor-pointer" onClick={() => requestSort('close')}>
              Close {getSortIndicator('close')}
            </th>
            <th className="pb-2 cursor-pointer" onClick={() => requestSort('change')}>
              Change {getSortIndicator('change')}
            </th>
            <th className="pb-2 cursor-pointer hidden sm:table-cell" onClick={() => requestSort('volume')}>
              Volume {getSortIndicator('volume')}
            </th>
            <th className="pb-2 hidden sm:table-cell">Range</th>
            <th className="pb-2">Trend</th>
            <th className="pb-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <React.Fragment key={stock.ticker}>
              <tr 
                className={`border-t border-border hover:bg-muted/30 transition-colors 
                  ${watchlist.includes(stock.ticker) ? 'bg-muted/20' : ''}`}
                onClick={() => handleStockClick(stock.ticker)}
              >
                <td className="py-3 font-medium flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock.ticker);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${watchlist.includes(stock.ticker) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                  {stock.ticker}
                </td>
                <td className="py-3">${stock.close.toFixed(2)}</td>
                <td className={`py-3 ${
                  stock.change > 0 
                    ? "text-positive flex items-center gap-1" 
                    : stock.change < 0 
                    ? "text-negative flex items-center gap-1" 
                    : "text-muted-foreground"
                }`}>
                  {stock.change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                    stock.change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                  {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                </td>
                <td className="py-3 hidden sm:table-cell">
                  {stock.volume ? 
                    <VolumeIndicator volume={stock.volume} avgVolume={stock.volume * 0.8} /> :
                    "N/A"
                  }
                </td>
                <td className="py-3 hidden sm:table-cell">
                  <PriceRangeSlider low={stock.low} high={stock.high} current={stock.close} />
                </td>
                <td className="py-3">
                  <div className="h-8 w-24">
                    {sparklines[stock.ticker] && (
                      <SparklineChart 
                        data={sparklines[stock.ticker]} 
                        positive={stock.change >= 0}
                      />
                    )}
                  </div>
                </td>
                <td className="py-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(stock.ticker);
                    }}
                  >
                    {expandedRows[stock.ticker] ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                </td>
              </tr>
              
              {expandedRows[stock.ticker] && (
                <tr className="bg-muted/10">
                  <td colSpan={7} className="py-3 px-4">
                    <StockRowDetails 
                      stock={stock}
                      stockDetails={stockDetails[stock.ticker]}
                      isLoading={loadingDetails[stock.ticker]}
                      onViewDetailsClick={() => openStockDetail(stock.ticker)}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          
          {stocks.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                No stocks available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MajorStocksTable;
