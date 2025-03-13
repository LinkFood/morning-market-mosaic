
import React, { memo } from "react";
import MarketStatusOverview from "./MarketStatusOverview";
import DashboardGrid from "./components/DashboardGrid";
import FullScreenViews from "./components/FullScreenViews";

const DashboardLayout: React.FC = () => {
  return (
    <>
      {/* Market Status Overview */}
      <MarketStatusOverview />
      
      {/* Dashboard Layout Grid */}
      <DashboardGrid />
      
      {/* Full-screen component views */}
      <FullScreenViews />
    </>
  );
};

export default memo(DashboardLayout);
