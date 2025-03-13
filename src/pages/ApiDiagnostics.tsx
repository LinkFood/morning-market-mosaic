
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getServiceStatus } from '@/services/initialization';
import { getFeatureFlags } from '@/services/features';
import { toast } from 'sonner';

const ApiDiagnostics = () => {
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState({
    polygonApi: false,
    fredApi: false,
    geminiApi: false,
    initialized: false,
    error: null as string | null
  });
  
  const [featureFlags, setFeatureFlags] = useState(getFeatureFlags());
  const [testResults, setTestResults] = useState<{[key: string]: boolean | null}>({
    polygon: null,
    fred: null,
    gemini: null,
    polygonEdgeFunction: null,
    geminiEdgeFunction: null
  });
  
  useEffect(() => {
    // Get initial service status
    const status = getServiceStatus();
    setServiceStatus(status);
    setFeatureFlags(getFeatureFlags());
    setLoading(false);
  }, []);
  
  const runDiagnostics = async () => {
    setLoading(true);
    setTestResults({
      polygon: null,
      fred: null,
      gemini: null,
      polygonEdgeFunction: null,
      geminiEdgeFunction: null
    });
    
    try {
      // Test Polygon API key edge function
      const polygonKeyResult = await testPolygonKeyFunction();
      setTestResults(prev => ({ ...prev, polygonEdgeFunction: polygonKeyResult }));
      
      // Test Gemini edge function
      const geminiResult = await testGeminiFunction();
      setTestResults(prev => ({ ...prev, geminiEdgeFunction: geminiResult }));
      
      // Get updated service status
      const status = getServiceStatus();
      setServiceStatus(status);
      setFeatureFlags(getFeatureFlags());
      
      toast.success("Diagnostics completed");
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast.error("Error running diagnostics");
    } finally {
      setLoading(false);
    }
  };
  
  const testPolygonKeyFunction = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-polygon-api-key');
      
      if (error) {
        console.error("Polygon key function error:", error);
        return false;
      }
      
      return !!data?.apiKey;
    } catch (error) {
      console.error("Error testing Polygon key function:", error);
      return false;
    }
  };
  
  const testGeminiFunction = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-stock-analysis', {
        body: { 
          stocks: [
            {
              ticker: "TEST",
              close: 100,
              changePercent: 0,
              signals: ["test"],
              scores: { composite: 50 }
            }
          ] 
        }
      });
      
      if (error) {
        console.error("Gemini function error:", error);
        return false;
      }
      
      return !!data && !data.error;
    } catch (error) {
      console.error("Error testing Gemini function:", error);
      return false;
    }
  };
  
  // Render status badge
  const StatusBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Badge variant="outline">Unknown</Badge>;
    
    return status ? 
      <Badge className="bg-green-500">Available</Badge> : 
      <Badge variant="destructive">Unavailable</Badge>;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Service Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current status of application services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Polygon API:</span>
                <StatusBadge status={serviceStatus.polygonApi} />
              </div>
              <div className="flex justify-between items-center">
                <span>FRED API:</span>
                <StatusBadge status={serviceStatus.fredApi} />
              </div>
              <div className="flex justify-between items-center">
                <span>Gemini API:</span>
                <StatusBadge status={serviceStatus.geminiApi} />
              </div>
              <div className="flex justify-between items-center">
                <span>Overall Status:</span>
                <StatusBadge status={serviceStatus.initialized} />
              </div>
              
              {serviceStatus.error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{serviceStatus.error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Feature Flags Card */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Current application feature flags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(featureFlags).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span>{key}:</span>
                  {value ? 
                    <Badge className="bg-green-500">Enabled</Badge> : 
                    <Badge variant="secondary">Disabled</Badge>
                  }
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Connection Tests Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Tests</CardTitle>
          <CardDescription>Test individual API connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Polygon API Key Function:</span>
              <StatusBadge status={testResults.polygonEdgeFunction} />
            </div>
            <div className="flex justify-between items-center">
              <span>Gemini Analysis Function:</span>
              <StatusBadge status={testResults.geminiEdgeFunction} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={runDiagnostics}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Diagnostics
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Troubleshooting Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Steps to resolve API connection issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Polygon API Issues</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verify the POLYGON_API_KEY is set in Supabase Edge Function environment</li>
                <li>Check that the get-polygon-api-key function is deployed</li>
                <li>Ensure your Polygon.io API key is active and has sufficient quota</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Gemini API Issues</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verify the GEMINI_API_KEY is set in Supabase Edge Function environment</li>
                <li>Check that the gemini-stock-analysis function is deployed</li>
                <li>Ensure your Gemini API key is active and has sufficient quota</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">General Issues</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check Supabase Edge Function logs for detailed error messages</li>
                <li>Verify your Supabase project is active and functioning</li>
                <li>Ensure your network can reach api.polygon.io and generativelanguage.googleapis.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDiagnostics;
