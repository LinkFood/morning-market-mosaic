
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Database } from "lucide-react";
import fedApiService from "@/services/fred";
import { TimeSpan } from "@/services/fred/types";
import { toast } from "sonner";
import { getFredCacheStats } from "@/services/fred/cacheUtils";

interface TestResult {
  name: string;
  status: "success" | "error" | "loading";
  message: string;
  timestamp: Date;
}

interface CacheStats {
  totalItems: number;
  totalBytes: number;
  averageBytes: number;
  items: Array<{
    key: string;
    bytes: number;
    timestamp?: Date | null;
    age?: number | null;
    error?: string;
  }>;
}

const FredDebug = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    setResults(prev => [{
      ...result,
      timestamp: new Date()
    }, ...prev]);
  };

  const testEdgeFunction = async () => {
    setIsLoading(true);
    try {
      const response = await fedApiService.getEconomicSeries("FEDFUNDS", TimeSpan.ONE_MONTH, true);
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
      // Update cache stats after clearing
      displayCacheStats();
    } catch (error) {
      addResult({
        name: "Clear Cache",
        status: "error",
        message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const displayCacheStats = () => {
    const stats = getFredCacheStats();
    setCacheStats(stats);
    addResult({
      name: "Cache Statistics",
      status: "success",
      message: `Found ${stats.totalItems} cached items using ${formatBytes(stats.totalBytes)}`
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Unknown';
    return date.toLocaleString();
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
                onClick={displayCacheStats}
                disabled={isLoading}
                variant="outline"
              >
                View Cache Stats
              </Button>
              <Button 
                onClick={clearCache} 
                disabled={isLoading}
                variant="outline"
              >
                Clear Cache
              </Button>
            </div>

            {cacheStats && (
              <Card className="bg-secondary/30 mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Cache Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-2">
                    <p>Total items: <span className="font-medium">{cacheStats.totalItems}</span></p>
                    <p>Total size: <span className="font-medium">{formatBytes(cacheStats.totalBytes)}</span></p>
                    <p>Average size: <span className="font-medium">{formatBytes(cacheStats.averageBytes)}</span></p>
                  </div>
                  
                  {cacheStats.items.length > 0 && (
                    <div className="mt-4 overflow-auto max-h-48 text-xs">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Cache Key</th>
                            <th className="text-center py-1">Size</th>
                            <th className="text-right py-1">Last Updated</th>
                            <th className="text-right py-1">Age</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cacheStats.items.map((item, i) => (
                            <tr key={i} className="border-b border-secondary/30">
                              <td className="py-1 truncate max-w-[180px]">{item.key}</td>
                              <td className="py-1 text-center">{formatBytes(item.bytes)}</td>
                              <td className="py-1 text-right">{formatDate(item.timestamp)}</td>
                              <td className="py-1 text-right">
                                {item.age !== null ? `${item.age}s ago` : 'Unknown'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
