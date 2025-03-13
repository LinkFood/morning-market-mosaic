
import React from 'react';
import { SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StockDetailFooterProps {
  ticker: string;
  handleSheetClose: () => void;
}

const StockDetailFooter: React.FC<StockDetailFooterProps> = ({ ticker, handleSheetClose }) => {
  return (
    <SheetFooter className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
      <div className="flex justify-between w-full">
        <Button
          variant="outline"
          onClick={handleSheetClose}
        >
          Close
        </Button>
        <Button onClick={() => toast.info(`Added ${ticker} to watchlist`)}>
          Add to Watchlist
        </Button>
      </div>
    </SheetFooter>
  );
};

export default StockDetailFooter;
