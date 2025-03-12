
import React from "react";
import EconomicIndicatorCard from "@/components/common/EconomicIndicatorCard";
import { IndicatorData } from "@/components/common/EconomicIndicatorCard";

interface InterestRateCardProps {
  rate: IndicatorData;
}

const InterestRateCard = ({ rate }: InterestRateCardProps) => {
  return <EconomicIndicatorCard indicator={rate} />;
};

export default InterestRateCard;
