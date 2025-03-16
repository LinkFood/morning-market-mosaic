
export interface HeatMapItem {
  id: string;
  name: string;
  value: number;
  change: number;
  marketCap?: number;
  category?: string;
  subCategory?: string;
}

export interface HeatMapProps {
  title?: string;
  data: HeatMapItem[];
  loading?: boolean;
  onItemClick?: (item: HeatMapItem) => void;
  maxItems?: number;
}

export interface HeatMapTileProps {
  item: HeatMapItem;
  onClick?: (item: HeatMapItem) => void;
}

export interface HeatMapLegendProps {
  itemCount: number;
}
