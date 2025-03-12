
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import fedApiService from "@/services/fedApiService";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "success" | "error" | "loading";
  message: string;
  timestamp: Date;
}

const FredDebug = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    setResults(prev => [{
      ...result,
      timestamp: new Date()
    }, ...prev]);
  };

  const testEdgeFunction = async () => {
    setIsLoading(true);
    try {
      const response = await fedApiService.getEconomicSeries("FEDFUNDS", true);
      addResult({
        name: "Edge Function Test",
        status: "success",
        message: `Successfully connected to Edge Function. Latest Fed Funds Rate: ${response.value}%`
      });
    } catch (error) {
      addResult({
        name: "Edge Function Test",
        status: "error",
        message: `Edge Function Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCaching = async () => {
    setIsLoading(true);
    try {
      console.log("Testing cache mechanism...");
      
      // First call - should hit the API
      const start = performance.now();
      await fedApiService.getEconomicSeries("FEDFUNDS");
      const firstCallTime = performance.now() - start;
      
      // Second call - should use cache
      const cacheStart = performance.now();
      await fedApiService.getEconomicSeries("FEDFUNDS");
      const secondCallTime = performance.now() - cacheStart;
      
      addResult({
        name: "Cache Test",
        status: "success",
        message: `Cache working: First call: ${firstCallTime.toFixed(2)}ms, Second call: ${secondCallTime.toFixed(2)}ms`
      });
    } catch (error) {
      addResult({
        name: "Cache Test",
        status: "error",
        message: `Cache Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    try {
      fedApiService.clearFredCacheData();
      addResult({
        name: "Clear Cache",
        status: "success",
        message: "Cache cleared successfully"
      });
    } catch (error) {
      addResult({
        name: "Clear Cache",
        status: "error",
        message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>FRED API Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={testEdgeFunction} 
                disabled={isLoading}
              >
                Test Edge Function
              </Button>
              <Button 
                onClick={testCaching} 
                disabled={isLoading}
              >
                Test Cache
              </Button>
              <Button 
                onClick={clearCache} 
                disabled={isLoading}
                variant="outline"
              >
                Clear Cache
              </Button>
            </div>

            <div className="space-y-2">
              {results.map((result, index) => (
                <Alert key={index} variant={result.status === "error" ? "destructive" : "default"}>
                  <div className="flex items-center gap-2">
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <span className="font-medium">{result.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                        <p className="mt-1">{result.message}</p>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FredDebug;
