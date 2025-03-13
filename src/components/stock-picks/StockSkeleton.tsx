
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StockSkeletonProps {
  count?: number;
}

const StockSkeleton: React.FC<StockSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
};

export default StockSkeleton;
