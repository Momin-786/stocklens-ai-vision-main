/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Target, RefreshCw, Plus, X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStockData } from "@/hooks/useStockData";
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

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export const StockComparison = () => {
  const { data: availableStocks, loading: stocksLoading } = useStockData();
  const [selectedStocks, setSelectedStocks] = useState<StockWithInsights[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Search for stocks using API
  const searchStocks = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { 
          search: query,
          limit: 20
        }
      });

      if (error) throw error;

      if (data?.searchResults && Array.isArray(data.searchResults)) {
        setSearchResults(data.searchResults);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error: any) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchStocks(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStocks]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to get stock name
  const getStockName = (symbol: string): string => {
    const names: Record<string, string> = {
      "AAPL": "Apple Inc.",
      "MSFT": "Microsoft Corp.",
      "GOOGL": "Alphabet Inc.",
      "AMZN": "Amazon.com Inc.",
      "TSLA": "Tesla Inc.",
      "META": "Meta Platforms",
      "NVDA": "NVIDIA Corp.",
      "ORCL": "Oracle Corp.",
    };
    return names[symbol] || symbol;
  };

  // Fetch stock data for a symbol
  const fetchStockData = async (symbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbols: [symbol] }
      });

      if (error) throw error;

      if (data?.stocks?.[0]) {
        const stockInfo = data.stocks[0];
        return {
          symbol: stockInfo.symbol,
          name: getStockName(stockInfo.symbol),
          price: stockInfo.price,
          change: stockInfo.change,
          changePercent: stockInfo.changePercent,
          volume: stockInfo.volume,
        };
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  };

  const handleSearchResultClick = async (result: SearchResult) => {
    setShowSearchResults(false);
    await addStockFromSymbol(result.symbol, result.description);
  };

  const addStockFromSymbol = async (symbol: string, name?: string) => {
    if (selectedStocks.some(s => s.symbol === symbol)) {
      toast.error("Stock already added to comparison");
      return;
    }

    // Check if stock is in available stocks first
    const availableStock = availableStocks?.find(s => s.symbol === symbol);
    
    if (availableStock) {
      // Use available stock data
      const newStock: StockWithInsights = {
        ...availableStock,
        loading: true
      };

      setSelectedStocks(prev => [...prev, newStock]);
      setSelectedSymbol("");
      setSearchQuery("");

      // Fetch both chart data and AI insights
      const [insights, chartData] = await Promise.all([
        fetchAIInsights(newStock),
        fetchChartData(symbol)
      ]);
      
      setSelectedStocks(prev => 
        prev.map(s => 
          s.symbol === symbol 
            ? { ...s, aiInsights: insights, chartData, loading: false }
            : s
        )
      );
    } else {
      // Fetch stock data from API
      const stockData = await fetchStockData(symbol);
      
      if (!stockData) {
        toast.error(`Failed to fetch data for ${symbol}`);
        return;
      }

      const newStock: StockWithInsights = {
        ...stockData,
        name: name || stockData.name,
        loading: true
      };

      setSelectedStocks(prev => [...prev, newStock]);
      setSelectedSymbol("");
      setSearchQuery("");

      // Fetch both chart data and AI insights
      const [insights, chartData] = await Promise.all([
        fetchAIInsights(newStock),
        fetchChartData(symbol)
      ]);
      
      setSelectedStocks(prev => 
        prev.map(s => 
          s.symbol === symbol 
            ? { ...s, aiInsights: insights, chartData, loading: false }
            : s
        )
      );
    }
  };

  const addStock = async () => {
    if (!selectedSymbol) return;
    
    // Check if it's from available stocks
    const stock = availableStocks?.find(s => s.symbol === selectedSymbol);
    
    if (stock) {
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
      setSearchQuery("");

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
    } else {
      // Try to fetch from API
      await addStockFromSymbol(selectedSymbol);
    }
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
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search any stock symbol or company name..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSymbol(e.target.value);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedSymbol) {
                    e.preventDefault();
                    addStock();
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSymbol("");
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                      Search Results ({searchResults.length})
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.symbol}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{result.symbol}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {result.type}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
              
              {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No stocks found for "{searchQuery}"
                  </p>
                </Card>
              )}
            </div>
            <Button 
              onClick={addStock} 
              disabled={!selectedSymbol || isSearching}
              className="bg-secondary hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
          
          {/* Quick select from available stocks */}
          {availableStocks && availableStocks.length > 0 && !searchQuery && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">Quick add:</span>
              {availableStocks.slice(0, 7).map((stock) => (
                <Button
                  key={stock.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSymbol(stock.symbol);
                    setSearchQuery(stock.symbol);
                    addStockFromSymbol(stock.symbol, stock.name);
                  }}
                  disabled={selectedStocks.some(s => s.symbol === stock.symbol)}
                  className="text-xs"
                >
                  {stock.symbol}
                </Button>
              ))}
            </div>
          )}
        </div>
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
