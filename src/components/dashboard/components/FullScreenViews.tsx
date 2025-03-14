
import React from "react";
import { useDashboard } from "../DashboardContext";
import FullScreenComponent from "../FullScreenComponent";

// Components
import MarketOverview from "@/components/MarketOverview";
import EconomicData from "@/components/EconomicData";
import MajorStocks from "@/components/major-stocks/MajorStocks";
import MarketEvents from "@/components/MarketEvents";
import SectorPerformance from "@/components/SectorPerformance";
import MarketMovers from "@/components/market-movers/MarketMovers";
import ES1FuturesChart from "@/components/ES1FuturesChart";
import StockPicks from "@/components/stock-picks/StockPicks";

const FullScreenViews: React.FC = () => {
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
    expandedComponent,
    setExpandedComponent,
    loadMarketMovers,
    loadStockPicks
  } = useDashboard();

  if (!expandedComponent) return null;

  return (
    <>
      {expandedComponent === 'market-overview' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Market Overview"
        >
          <MarketOverview indices={indices} />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'es1-futures' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="S&P 500 Futures"
        >
          <div className="h-[80vh]">
            <ES1FuturesChart />
          </div>
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'economic-data' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Economic Indicators"
        >
          <EconomicData indicators={indicators} isLoading={isLoadingEcon} />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'stock-picks' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Algorithmic Stock Picks"
        >
          <StockPicks 
            stocks={stockPicks} 
            analysis={stockAnalysis}
            isLoading={isLoadingStockPicks}
            isLoadingAnalysis={isLoadingAnalysis}
            onRefresh={loadStockPicks}
          />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'major-stocks' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Watchlist"
        >
          <MajorStocks stocks={stocks} />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'sector-performance' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Sector Performance"
        >
          <SectorPerformance sectors={sectors} />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'market-events' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
          title="Market Events"
        >
          <MarketEvents events={events} />
        </FullScreenComponent>
      )}
      
      {expandedComponent === 'market-movers' && (
        <FullScreenComponent 
          isOpen={true} 
          onClose={() => setExpandedComponent(null)}
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
        </FullScreenComponent>
      )}
    </>
  );
};

export default FullScreenViews;
