/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, RefreshCw, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStockData } from "@/hooks/useStockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface StockWithInsights {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  aiInsights?: {
    signal: string;
    confidence: number;
    reasoning: string;
    keyFactors: string[];
  };
  loading?: boolean;
  chartData?: any[];
}

export const StockComparison = () => {
  const { data: availableStocks, loading: stocksLoading } = useStockData();
  const [selectedStocks, setSelectedStocks] = useState<StockWithInsights[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const fetchAIInsights = async (stock: StockWithInsights) => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-ai-prediction', {
        body: {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return null;
    }
  };

  const fetchChartData = async (symbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-historical-data', {
        body: { symbol, timeRange: '1M' }
      });

      if (error) throw error;
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  };

  const addStock = async () => {
    if (!selectedSymbol || !availableStocks) return;
    
    const stock = availableStocks.find(s => s.symbol === selectedSymbol);
    if (!stock) return;

    if (selectedStocks.some(s => s.symbol === selectedSymbol)) {
      toast.error("Stock already added to comparison");
      return;
    }

    const newStock: StockWithInsights = {
      ...stock,
      loading: true
    };

    setSelectedStocks(prev => [...prev, newStock]);
    setSelectedSymbol("");

    // Fetch both chart data and AI insights
    const [insights, chartData] = await Promise.all([
      fetchAIInsights(stock),
      fetchChartData(stock.symbol)
    ]);
    
    setSelectedStocks(prev => 
      prev.map(s => 
        s.symbol === stock.symbol 
          ? { ...s, aiInsights: insights, chartData, loading: false }
          : s
      )
    );
  };

  const removeStock = (symbol: string) => {
    setSelectedStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  const refreshInsights = async (stock: StockWithInsights) => {
    setSelectedStocks(prev =>
      prev.map(s => s.symbol === stock.symbol ? { ...s, loading: true } : s)
    );

    // Fetch both chart data and AI insights
    const [insights, chartData] = await Promise.all([
      fetchAIInsights(stock),
      fetchChartData(stock.symbol)
    ]);

    setSelectedStocks(prev =>
      prev.map(s =>
        s.symbol === stock.symbol
          ? { ...s, aiInsights: insights, chartData, loading: false }
          : s
      )
    );

    toast.success(`${stock.symbol} insights refreshed`);
  };

  return (
    <div className="space-y-6">
      {/* Add Stock Section */}
      <Card className="p-6">
        <h2 className="text-xl font-heading font-semibold mb-4">Compare Stocks</h2>
        {stocksLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading stocks...</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a stock to compare" />
              </SelectTrigger>
              <SelectContent>
                {availableStocks && availableStocks.length > 0 ? (
                  availableStocks.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">No stocks available</div>
                )}
              </SelectContent>
            </Select>
            <Button onClick={addStock} disabled={!selectedSymbol || !availableStocks}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
        )}
      </Card>

      {/* Comparison Grid */}
      {selectedStocks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Add stocks above to compare them side-by-side with AI insights
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedStocks.map((stock) => (
            <Card key={stock.symbol} className="p-6 relative animate-fade-in">
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => removeStock(stock.symbol)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Stock Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold">{stock.symbol}</h3>
                  <Badge
                    variant="outline"
                    className={
                      stock.change >= 0
                        ? "border-success text-success"
                        : "border-destructive text-destructive"
                    }
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stock.changePercent}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
                <p className="text-3xl font-bold mt-2">${stock.price}</p>
                <p
                  className={`text-sm ${
                    stock.change >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}${stock.change} Today
                </p>
              </div>

              {/* Mini Price Chart */}
              {stock.chartData && stock.chartData.length > 0 && (
                <div className="mb-4 h-20 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stock.chartData}>
                      <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke={stock.change >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* AI Insights */}
              {stock.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : stock.aiInsights ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target
                        className={`h-4 w-4 ${
                          stock.aiInsights.signal === "BUY"
                            ? "text-success"
                            : stock.aiInsights.signal === "HOLD"
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      />
                      <span className="font-semibold">AI Prediction</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshInsights(stock)}
                      className="h-7"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>

                  <div
                    className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                      stock.aiInsights.signal === "BUY"
                        ? "bg-success/20 text-success"
                        : stock.aiInsights.signal === "HOLD"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {stock.aiInsights.signal}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Confidence
                      </span>
                      <span className="text-xs font-semibold">
                        {Math.round(stock.aiInsights.confidence)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          stock.aiInsights.signal === "BUY"
                            ? "bg-success"
                            : stock.aiInsights.signal === "HOLD"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${stock.aiInsights.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs leading-relaxed">
                      {stock.aiInsights.reasoning}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-2">Key Factors</p>
                    <ul className="space-y-1">
                      {stock.aiInsights.keyFactors.slice(0, 3).map((factor, i) => (
                        <li key={i} className="text-xs flex gap-2">
                          <span
                            className={
                              stock.aiInsights!.signal === "BUY"
                                ? "text-success"
                                : stock.aiInsights!.signal === "HOLD"
                                ? "text-warning"
                                : "text-destructive"
                            }
                          >
                            {stock.aiInsights!.signal === "BUY" ? "✓" : stock.aiInsights!.signal === "HOLD" ? "●" : "⚠"}
                          </span>
                          <span className="text-muted-foreground">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  AI insights unavailable
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
