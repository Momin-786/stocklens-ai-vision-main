/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useStockData } from "@/hooks/useStockData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from "recharts";

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export default function Stocks() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState([50]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedStocks, setSearchedStocks] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isPracticeMode } = usePracticeMode();

  const categories = ["All", "technology", "finance", "energy", "healthcare", "consumer"];
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch real stock data from Alpha Vantage (when not in practice mode)
  const { data: realStocks, lastUpdate: realLastUpdate, loading, refetch } = useStockData(!isPracticeMode);

  // Use simulated updates in practice mode
  const { data: practiceStocks, lastUpdate: practiceLastUpdate } = useRealtimeUpdates(realStocks, isPracticeMode);

  // Use appropriate data based on mode and search
  const baseStocks = isPracticeMode ? practiceStocks : realStocks;
  const lastUpdate = isPracticeMode ? practiceLastUpdate : realLastUpdate;

  // Show searched stocks if search is active, otherwise show default stocks
  const stocks = searchQuery && searchedStocks.length > 0 ? searchedStocks : baseStocks;

  const toggleStock = (id: string) => {
    setSelectedStocks((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Simple seeded random function for consistent chart patterns
  const seededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };

  // Generate mini chart data based on stock price and change
  const generateMiniChartData = useCallback((stock: any) => {
    if (!stock || !stock.price) return [];

    const currentPrice = stock.price;
    const changePercent = stock.changePercent || 0;
    const dataPoints = 20; // Number of points for mini chart

    // Use stock ID as seed for consistent patterns
    const seed = stock.id ? stock.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
    const random = seededRandom(seed);

    const data = [];
    // Calculate starting price based on current change
    const startPrice = currentPrice / (1 + changePercent / 100);

    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);

      // Create realistic price movement with some volatility
      const volatility = (random() - 0.5) * (currentPrice * 0.015);
      const trendPrice = startPrice + (currentPrice - startPrice) * progress;
      const price = Math.max(trendPrice + volatility, 0.01);

      data.push({
        index: i,
        price: parseFloat(price.toFixed(2))
      });
    }

    // Ensure last point is current price
    if (data.length > 0) {
      data[data.length - 1].price = currentPrice;
    }

    return data;
  }, []);

  // Search for stocks using Finnhub API
  const searchStocks = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setSearchedStocks([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Call Finnhub search API via edge function
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: {
          search: query,
          limit: 20 // Limit results to avoid too many API calls
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
      toast.error('Failed to search stocks. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch data for selected search result
  const fetchSearchedStockData = async (result: SearchResult) => {
    try {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbols: [result.symbol] }
      });

      if (error) throw error;

      if (data?.stocks && data.stocks.length > 0) {
        const stock = data.stocks[0];
        const newStock = {
          id: stock.symbol,
          symbol: stock.symbol,
          name: result.description || stock.name || result.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          category: "finance" // Default category
        };

        setSearchedStocks([newStock]);
        setSearchQuery(result.symbol);
        setShowSearchResults(false);
        toast.success(`Loaded data for ${result.symbol}`);
      } else {
        toast.error(`No data available for ${result.symbol}`);
      }
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      toast.error(`Failed to fetch data for ${result.symbol}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchStocks(searchQuery.trim());
      } else {
        setSearchResults([]);
        setSearchedStocks([]);
        setShowSearchResults(false);
      }
    }, 500); // 500ms debounce

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

  const handleSearchResultClick = (result: SearchResult) => {
    fetchSearchedStockData(result);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchedStocks([]);
    setShowSearchResults(false);
  };

  const filteredStocks =
    activeCategory === "All"
      ? stocks
      : stocks.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-5xl font-heading font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Stock Selection
              </h1>
              <p className="text-muted-foreground text-lg">
                {isPracticeMode
                  ? "Practice mode - Simulated data updates"
                  : searchQuery && searchedStocks.length > 0
                    ? `Showing search results for "${searchQuery}"`
                    : "Live stock data - Search for any stock symbol or company name"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {loading && (
                <Badge variant="outline" className="bg-muted/50 backdrop-blur-sm border-2 px-3 py-1.5">
                  <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                  Loading...
                </Badge>
              )}
              {!isPracticeMode && !loading && (
                <>
                  <Badge variant="outline" className="bg-success/10 text-success border-success border-2 px-3 py-1.5 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-success mr-2 animate-pulse" />
                    Live Data
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={loading}
                    className="gap-2 border-2 hover:bg-secondary/10 hover:border-secondary transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </>
              )}
              {isPracticeMode && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent border-2 px-3 py-1.5 shadow-sm">
                  Practice Mode
                </Badge>
              )}
            </div>
          </div>
          {!isPracticeMode && !loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 animate-slide-up">
            <Card className="p-6 border-2 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Filter className="h-5 w-5 text-secondary" />
                </div>
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>

              {/* Category Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-4 text-foreground/80">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${activeCategory === cat
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-md scale-105"
                        : "hover:bg-muted hover:border-secondary/50 hover:scale-105"
                        }`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Slider */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-4 text-foreground/80">Risk Tolerance</h3>
                <div className="px-2">
                  <Slider
                    value={riskLevel}
                    onValueChange={setRiskLevel}
                    max={100}
                    step={1}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold shadow-md hover:shadow-lg transition-all">
                Apply Filters
              </Button>
            </Card>

            {/* Selected Stocks Summary */}
            {selectedStocks.length > 0 && (
              <Card className="p-6 animate-scale-in border-2 border-success/20 shadow-lg bg-gradient-to-br from-success/5 to-success/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <h3 className="text-lg font-semibold">
                    Selected ({selectedStocks.length})
                  </h3>
                </div>
                <div className="space-y-3 mb-4">
                  {selectedStocks.map((id) => {
                    const stock = stocks.find((s) => s.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50 hover:bg-background transition-colors"
                      >
                        <span className="font-semibold">{stock?.symbol}</span>
                        <span className="text-muted-foreground font-medium">
                          ${stock?.price?.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link to="/analysis">
                  <Button className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-success-foreground font-semibold shadow-md hover:shadow-lg transition-all">
                    Analyze Selected
                  </Button>
                </Link>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Search & View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <div className="relative flex-1" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    placeholder="Search company name or symbol (e.g., AAPL, Apple)..."
                    className="pl-12 pr-12 h-12 text-base border-2 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm hover:shadow-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                  />
                  {searchQuery && !isSearching && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary animate-spin" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto border-2 shadow-xl bg-card/95 backdrop-blur-md">
                    <div className="p-2 space-y-1">
                      <div className="px-4 py-3 text-sm font-semibold text-foreground border-b bg-muted/30">
                        Search Results ({searchResults.length})
                      </div>
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.symbol}-${index}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/10 rounded-lg transition-all hover:shadow-sm group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base group-hover:text-secondary transition-colors">
                                {result.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-3 text-xs border-2 shrink-0">
                              {result.type}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
                  <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-6 border-2 shadow-xl bg-card/95 backdrop-blur-md">
                    <p className="text-sm text-muted-foreground text-center">
                      No stocks found for "{searchQuery}"
                    </p>
                  </Card>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`h-12 w-12 border-2 transition-all ${viewMode === "grid"
                    ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
                    : "hover:border-secondary/50 hover:bg-muted/50"
                    }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`h-12 w-12 border-2 transition-all ${viewMode === "list"
                    ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
                    : "hover:border-secondary/50 hover:bg-muted/50"
                    }`}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stock Grid/List */}
            {loading && stocks.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl border bg-card text-card-foreground shadow space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-1 text-right">
                        <Skeleton className="h-3 w-12 ml-auto" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredStocks.map((stock, index) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <SpotlightCard
                      key={stock.id}
                      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${selectedStocks.includes(stock.id)
                        ? "border-2 border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-xl scale-[1.02]"
                        : "border-2 hover:border-secondary/50 hover:shadow-xl hover:scale-[1.02] bg-card/60 backdrop-blur-md"
                        } animate-fade-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => navigate(`/analysis?symbol=${stock.symbol}`)}
                      spotlightColor="rgba(var(--secondary), 0.15)"
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isPositive
                        ? "bg-gradient-to-br from-success/5 to-transparent"
                        : "bg-gradient-to-br from-destructive/5 to-transparent"
                        }`} />

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-2xl mb-1 group-hover:text-secondary transition-colors">
                              {stock.symbol}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {stock.name}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs border-2 ml-2 shrink-0 bg-background/50 backdrop-blur-sm"
                          >
                            {stock.category}
                          </Badge>
                        </div>

                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold mb-1">${stock.price?.toFixed(2)}</p>
                            <div
                              className={`flex items-center gap-1.5 text-sm font-semibold ${isPositive
                                ? "text-success"
                                : "text-destructive"
                                }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                              <span>
                                {isPositive ? "+" : ""}
                                {stock.change?.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Volume</p>
                            <p className="text-sm font-semibold">
                              {stock.volume?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Mini Chart */}
                        <div className={`mt-4 h-24 rounded-lg overflow-hidden ${isPositive
                          ? "bg-success/5 border border-success/20"
                          : "bg-destructive/5 border border-destructive/20"
                          }`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={generateMiniChartData(stock)}
                              margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                            >
                              <defs>
                                <linearGradient
                                  id={`gradient-${stock.id?.replace(/[^a-zA-Z0-9]/g, '-') || 'default'}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                                    stopOpacity={0.4}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                                    stopOpacity={0.05}
                                  />
                                </linearGradient>
                              </defs>
                              <YAxis
                                hide
                                domain={['dataMin - dataMin * 0.02', 'dataMax + dataMax * 0.02']}
                              />
                              <Area
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                                strokeWidth={2.5}
                                fill={`url(#gradient-${stock.id?.replace(/[^a-zA-Z0-9]/g, '-') || 'default'})`}
                                dot={false}
                                activeDot={{
                                  r: 3,
                                  fill: isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))",
                                  strokeWidth: 2,
                                  stroke: isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
                                }}
                                isAnimationActive={true}
                                animationDuration={300}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Hover effect border */}
                      <div className={`absolute inset-0 border-2 rounded-lg pointer-events-none transition-opacity duration-300 ${isPositive ? "border-success/20" : "border-destructive/20"
                        } opacity-0 group-hover:opacity-100`} />
                    </SpotlightCard>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
