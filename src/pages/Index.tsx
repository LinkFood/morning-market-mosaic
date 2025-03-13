
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Market Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Dashboard</CardTitle>
            <CardDescription>View market data and stock information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access real-time market data, stock quotes, and technical analysis.</p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fed Dashboard</CardTitle>
            <CardDescription>Track economic indicators and Fed data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Monitor interest rates, inflation metrics, and other economic indicators.</p>
          </CardContent>
          <CardFooter>
            <Link to="/fed-dashboard">
              <Button>Go to Fed Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Diagnostics</CardTitle>
            <CardDescription>Check API connections and troubleshoot issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Verify Polygon and Gemini API keys and diagnose connection problems.</p>
          </CardContent>
          <CardFooter>
            <Link to="/api-diagnostics">
              <Button variant="outline">Run Diagnostics</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
