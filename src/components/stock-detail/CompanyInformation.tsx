
import React from 'react';
import { ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TickerDetails } from '@/types/marketTypes';

interface CompanyInformationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  stockDetails: TickerDetails | null;
}

const CompanyInformation: React.FC<CompanyInformationProps> = ({
  isOpen,
  onOpenChange,
  isLoading,
  stockDetails
}) => {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="mb-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Company Information</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : stockDetails ? (
          <div className="space-y-4">
            {stockDetails.description && (
              <p className="text-sm text-muted-foreground">
                {stockDetails.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stockDetails.exchange && (
                <div>
                  <div className="text-xs text-muted-foreground">Exchange</div>
                  <div>{stockDetails.exchange}</div>
                </div>
              )}
              {stockDetails.sector && (
                <div>
                  <div className="text-xs text-muted-foreground">Industry</div>
                  <div>{stockDetails.sector}</div>
                </div>
              )}
              {stockDetails.employees && (
                <div>
                  <div className="text-xs text-muted-foreground">Employees</div>
                  <div>{stockDetails.employees.toLocaleString()}</div>
                </div>
              )}
              {stockDetails.listDate && (
                <div>
                  <div className="text-xs text-muted-foreground">Listed Date</div>
                  <div>{stockDetails.listDate}</div>
                </div>
              )}
            </div>
            
            {stockDetails.homepageUrl && (
              <div className="mt-2">
                <a
                  href={stockDetails.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center text-sm"
                >
                  Visit company website
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            )}
            
            {stockDetails.address && Object.values(stockDetails.address).some(v => v) && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Headquarters</div>
                <address className="text-sm not-italic">
                  {stockDetails.address.address1}<br />
                  {stockDetails.address.city}, {stockDetails.address.state} {stockDetails.address.postalCode}
                </address>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No company information available.
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CompanyInformation;
