
import React, { useState } from 'react';
import StockDetailDrawer from './StockDetailDrawer';

interface StockDetailContextType {
  openStockDetail: (ticker: string) => void;
  isOpen: boolean;
  currentTicker: string | null;
}

const StockDetailContext = React.createContext<StockDetailContextType>({
  openStockDetail: () => {},
  isOpen: false,
  currentTicker: null,
});

export const useStockDetail = () => React.useContext(StockDetailContext);

export const StockDetailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTicker, setCurrentTicker] = useState<string | null>(null);

  const openStockDetail = (ticker: string) => {
    setCurrentTicker(ticker);
    setIsOpen(true);
  };

  return (
    <StockDetailContext.Provider value={{ openStockDetail, isOpen, currentTicker }}>
      {children}
      {isOpen && currentTicker && (
        <StockDetailDrawer 
          ticker={currentTicker} 
          open={isOpen} 
          onOpenChange={setIsOpen}
        />
      )}
    </StockDetailContext.Provider>
  );
};
