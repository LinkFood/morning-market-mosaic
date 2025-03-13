
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
import ES1FuturesChart from "@/components/ES1FuturesChart";

const DashboardGrid: React.FC = () => {
  const { 
    stocks, 
    sectors, 
    events, 
    indicators, 
    indices,
    marketMovers,
    marketStatusData, 
    isLoadingMovers,
    isLoadingEcon, 
    moversError,
    loadMarketMovers,
    isComponentVisible
  } = useDashboard();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ES1 Futures Chart */}
      {isComponentVisible('es1-futures') && (
        <div className={`${isComponentVisible('es1-futures') ? 'lg:col-span-2' : ''}`}>
          <CollapsibleComponent
            componentId="es1-futures"
            title="S&P 500 Futures"
          >
            <ES1FuturesChart />
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
