import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
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
  
  const [errorDetails, setErrorDetails] = useState<{[key: string]: string | null}>({
    polygon: null,
    gemini: null
  });
  
  const [geminiDetails, setGeminiDetails] = useState<{
    model?: string;
    version?: string;
    endpoint?: string;
    timestamp?: string;
  }>({});
  
  useEffect(() => {
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
    setErrorDetails({
      polygon: null,
      gemini: null
    });
    
    try {
      const { polygonKeyResult, polygonError } = await testPolygonKeyFunction();
      setTestResults(prev => ({ ...prev, polygonEdgeFunction: polygonKeyResult }));
      if (polygonError) {
        setErrorDetails(prev => ({ ...prev, polygon: polygonError }));
      }
      
      const { geminiResult, geminiError } = await testGeminiFunction();
      setTestResults(prev => ({ ...prev, geminiEdgeFunction: geminiResult }));
      if (geminiError) {
        setErrorDetails(prev => ({ ...prev, gemini: geminiError }));
      }
      
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
  
  const testPolygonKeyFunction = async (): Promise<{ polygonKeyResult: boolean, polygonError: string | null }> => {
    try {
      console.log("Testing Polygon API Key function...");
      const { data, error } = await supabase.functions.invoke('get-polygon-api-key');
      
      if (error) {
        console.error("Polygon key function error:", error);
        return { 
          polygonKeyResult: false, 
          polygonError: `Edge function error: ${error.message || error.name || 'Unknown error'}` 
        };
      }
      
      if (!data || !data.apiKey) {
        return { 
          polygonKeyResult: false, 
          polygonError: "No API key returned from edge function" 
        };
      }
      
      console.log("Polygon API Key test successful");
      return { polygonKeyResult: true, polygonError: null };
    } catch (error) {
      console.error("Error testing Polygon key function:", error);
      return { 
        polygonKeyResult: false, 
        polygonError: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };
  
  const testGeminiFunction = async (): Promise<{ geminiResult: boolean, geminiError: string | null }> => {
    try {
      console.log("Testing Gemini function...");
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
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-request-id': `diagnostics-${Date.now()}`
        }
      });
      
      if (error) {
        console.error("Gemini function error:", error);
        return { 
          geminiResult: false, 
          geminiError: `Edge function error: ${error.message || error.name || 'Unknown error'}` 
        };
      }
      
      if (!data) {
        return { 
          geminiResult: false, 
          geminiError: "No data returned from edge function" 
        };
      }
      
      setGeminiDetails({
        model: data.model,
        version: data.functionVersion,
        endpoint: data.modelEndpoint,
        timestamp: data.timestamp
      });
      
      if (data.error) {
        console.error("Gemini API error:", data.error);
        return { 
          geminiResult: false, 
          geminiError: `API error: ${data.error}${data.details ? ` - ${data.details}` : ''}` 
        };
      }
      
      if (data.fromFallback) {
        return {
          geminiResult: true,
          geminiError: "Connected, but using fallback mechanism (AI may be unavailable)"
        };
      }
      
      console.log("Gemini function test successful");
      return { geminiResult: true, geminiError: null };
    } catch (error) {
      console.error("Error testing Gemini function:", error);
      return { 
        geminiResult: false, 
        geminiError: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };
  
  const StatusBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Badge variant="outline">Unknown</Badge>;
    
    return status ? 
      <Badge className="bg-green-500">Available</Badge> : 
      <Badge variant="destructive">Unavailable</Badge>;
  };
  
  return (
    <div className="container mx-auto py-8">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">API Diagnostics</h1>
        </div>
        <p className="text-muted-foreground">
          Check the status of API connections and troubleshoot issues
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
            {errorDetails.polygon && (
              <div className="ml-6 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded border border-amber-200 dark:border-amber-800">
                <p className="font-medium">Error details:</p>
                <p className="font-mono text-xs break-all">{errorDetails.polygon}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span>Gemini Analysis Function:</span>
              <StatusBadge status={testResults.geminiEdgeFunction} />
            </div>
            {errorDetails.gemini && (
              <div className="ml-6 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded border border-amber-200 dark:border-amber-800">
                <p className="font-medium">Error details:</p>
                <p className="font-mono text-xs break-all">{errorDetails.gemini}</p>
              </div>
            )}
            
            {geminiDetails.model && (
              <div className="ml-6 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded border border-blue-200 dark:border-blue-800">
                <p className="font-medium">Gemini API Details:</p>
                <p>Model: {geminiDetails.model}</p>
                <p>Function version: {geminiDetails.version || 'unknown'}</p>
                {geminiDetails.endpoint && <p className="font-mono text-xs break-all">Endpoint: {geminiDetails.endpoint}</p>}
                {geminiDetails.timestamp && <p>Last updated: {new Date(geminiDetails.timestamp).toLocaleString()}</p>}
              </div>
            )}
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
                <li>Confirm the API key is authorized for the Gemini 1.5 Pro model</li>
                <li>If you see a "model not found" error, the API version or model name might be incorrect</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">General Issues</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check Supabase Edge Function logs for detailed error messages</li>
                <li>Verify your Supabase project is active and functioning</li>
                <li>Ensure your network can reach api.polygon.io and generativelanguage.googleapis.com</li>
                <li>For 404 errors with Gemini, verify the API endpoint and model names are correct</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDiagnostics;
