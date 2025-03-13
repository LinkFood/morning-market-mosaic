
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Check, AlertTriangle } from "lucide-react";
import fedApiService from "@/services/fred";
import { toast } from "sonner";

const FredDebug = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<null | boolean>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await fedApiService.testFredConnection();
      setConnectionStatus(result);
      toast(result ? "Connection successful!" : "Connection failed");
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus(false);
      toast.error("Connection test failed with error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearCache = () => {
    try {
      const count = fedApiService.clearFredCacheData();
      toast.success(`Cleared ${count} cached items`);
      getCacheStats();
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache");
    }
  };

  const getCacheStats = () => {
    try {
      // @ts-ignore - this function might not exist in the type definitions
      const stats = fedApiService.getFredCacheStats?.() || { totalItems: 0, totalBytes: 0, items: [] };
      setCacheStats(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      setCacheStats({ error: "Failed to get cache stats" });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto py-6 px-4">
        <header className="mb-6">
          <div className="flex items-center mb-4">
            <Link to="/fed-dashboard">
              <Button variant="outline" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Federal Reserve API Debug</h1>
          </div>
          <p className="text-muted-foreground">
            Troubleshoot Federal Reserve data loading issues
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Test if the application can connect to the Federal Reserve API.</p>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                {connectionStatus !== null && (
                  <div className="flex items-center">
                    {connectionStatus ? (
                      <>
                        <Check className="text-green-500 mr-2" />
                        <span className="text-green-500">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="text-amber-500 mr-2" />
                        <span className="text-amber-500">Connection Failed</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={clearCache} variant="outline">
                  Clear All Cache
                </Button>
                <Button onClick={getCacheStats} variant="outline">
                  View Cache Stats
                </Button>
              </div>

              {cacheStats && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="text-lg font-medium mb-2">Cache Statistics</h3>
                  <p>Total Items: {cacheStats.totalItems}</p>
                  <p>Total Size: {(cacheStats.totalBytes / 1024).toFixed(2)} KB</p>
                  
                  {cacheStats.items && cacheStats.items.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium">Cached Items:</h4>
                      <div className="max-h-60 overflow-y-auto mt-2">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              <th className="text-left pb-2">Key</th>
                              <th className="text-right pb-2">Size</th>
                              <th className="text-right pb-2">Age</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cacheStats.items.map((item: any, index: number) => (
                              <tr key={index} className="border-b border-muted-foreground/20">
                                <td className="py-1 truncate max-w-[200px]">{item.key}</td>
                                <td className="text-right py-1">{(item.bytes / 1024).toFixed(2)} KB</td>
                                <td className="text-right py-1">
                                  {item.age !== null ? `${item.age}s ago` : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FredDebug;
