
import React, { ReactNode } from 'react';

interface StockItemProps {
  children: ReactNode;
}

const StockItem: React.FC<StockItemProps> = ({ children }) => {
  return (
    <div className="border-b pb-3 last:border-0">
      {children}
    </div>
  );
};

export default StockItem;
