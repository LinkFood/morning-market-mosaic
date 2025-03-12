
import React from "react";
import EconomicIndicatorCard from "@/components/common/EconomicIndicatorCard";
import { InflationCardProps } from "./types";

const InflationCard = ({ indicator }: InflationCardProps) => {
  return <EconomicIndicatorCard indicator={indicator} />;
};

export default InflationCard;
