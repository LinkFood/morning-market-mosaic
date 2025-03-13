
import React from "react";
import { useDashboard } from "../DashboardContext";
import CollapsibleComponent from "../CollapsibleComponent";

// Components
import MarketOverview from "@/components/MarketOverview";
import EconomicData from "@/components/EconomicData";
import MajorStocks from "@/components/major-stocks/MajorStocks";
import MarketEvents from "@/components/MarketEvents";
import SectorPerformance from "@/components/SectorPerformance";
import MarketMovers from "@/components/market-movers/MarketMovers";
import SPYChart from "@/components/SPYChart";
import StockPicks from "@/components/stock-picks/StockPicks";
import AIStockPicker from "@/components/stock-picker/AIStockPicker";

const DashboardGrid: React.FC = () => {
  const { 
    stocks, 
    sectors, 
    events, 
    indicators, 
    indices,
    marketMovers,
    stockPicks,
    stockAnalysis,
    marketStatusData, 
    isLoadingMovers,
    isLoadingStockPicks,
    isLoadingAnalysis,
    isLoadingEcon, 
    moversError,
    loadMarketMovers,
    isComponentVisible
  } = useDashboard();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SPY Chart */}
      {isComponentVisible('es1-futures') && (
        <div className={`${isComponentVisible('es1-futures') ? 'lg:col-span-2' : ''}`}>
          <CollapsibleComponent
            componentId="es1-futures"
            title="SPY - S&P 500 ETF"
          >
            <SPYChart />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Overview */}
      {isComponentVisible('market-overview') && (
        <div className={`${isComponentVisible('market-overview') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-overview"
            title="Market Overview"
          >
            <MarketOverview indices={indices} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Economic Data */}
      {isComponentVisible('economic-data') && (
        <div className={`${isComponentVisible('economic-data') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="economic-data"
            title="Economic Indicators"
          >
            <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Stock Picks */}
      {isComponentVisible('stock-picks') && (
        <div className={`${isComponentVisible('stock-picks') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="stock-picks"
            title="Algorithmic Stock Picks"
          >
            <StockPicks 
              stocks={stockPicks} 
              analysis={stockAnalysis}
              isLoading={isLoadingStockPicks}
              isLoadingAnalysis={isLoadingAnalysis}
            />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* AI Stock Picker */}
      {isComponentVisible('ai-stock-picker') && (
        <div className={`${isComponentVisible('ai-stock-picker') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="ai-stock-picker"
            title="AI Stock Recommendations"
          >
            <AIStockPicker />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Major Stocks */}
      {isComponentVisible('major-stocks') && (
        <div className={`${isComponentVisible('major-stocks') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="major-stocks"
            title="Watchlist"
          >
            <MajorStocks stocks={stocks} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Sector Performance */}
      {isComponentVisible('sector-performance') && (
        <div className={`${isComponentVisible('sector-performance') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="sector-performance"
            title="Sector Performance"
          >
            <SectorPerformance sectors={sectors} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Events */}
      {isComponentVisible('market-events') && (
        <div className={`${isComponentVisible('market-events') ? '' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-events"
            title="Market Events"
          >
            <MarketEvents events={events} />
          </CollapsibleComponent>
        </div>
      )}
      
      {/* Market Movers */}
      {isComponentVisible('market-movers') && (
        <div className={`${isComponentVisible('market-movers') ? 'lg:col-span-2' : 'hidden'}`}>
          <CollapsibleComponent
            componentId="market-movers"
            title="Market Movers"
          >
            <MarketMovers 
              gainers={marketMovers.gainers} 
              losers={marketMovers.losers}
              isLoading={isLoadingMovers}
              error={moversError}
              marketStatus={marketStatusData || undefined}
              refreshData={loadMarketMovers}
            />
          </CollapsibleComponent>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
