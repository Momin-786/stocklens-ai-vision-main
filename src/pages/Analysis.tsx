/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Download,
  MessageSquare,
  Target,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { generateStockReport } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";
import { useStockData } from "@/hooks/useStockData";
import { supabase } from "@/integrations/supabase/client";
import { AIChat } from "@/components/AIChat";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { StockSelector } from "@/components/StockSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Info } from "lucide-react";

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
    "JPM": "JPMorgan Chase",
    "V": "Visa Inc.",
    "WMT": "Walmart Inc.",
    "JNJ": "Johnson & Johnson",
    "PG": "Procter & Gamble",
    "UNH": "UnitedHealth Group",
    "HD": "Home Depot",
    "DIS": "Walt Disney Co."
  };
  return names[symbol] || symbol;
};

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const symbolParam = searchParams.get("symbol") || "AAPL";
  const [selectedSymbol, setSelectedSymbol] = useState(symbolParam);
  const [timeRange, setTimeRange] = useState("1M");
  const { data: stocks, loading } = useStockData();
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [customStockData, setCustomStockData] = useState<any>(null);
  const [loadingCustomStock, setLoadingCustomStock] = useState(false);

  // Update selectedSymbol when URL param changes
  useEffect(() => {
    const urlSymbol = searchParams.get("symbol");
    if (urlSymbol && urlSymbol !== selectedSymbol) {
      setSelectedSymbol(urlSymbol);
      // Clear previous custom stock data when symbol changes
      setCustomStockData(null);
      setAiInsights(null);
    }
  }, [searchParams, selectedSymbol]);

  // Find stock in default list or use custom stock data
  const defaultStock = stocks.find(s => s.symbol === selectedSymbol);
  const stock = defaultStock || customStockData;

  // Generate mock chart data based on current price and change
  const generateMockChartData = () => {
    if (!stock) return [];

    const currentPrice = stock.price;
    const changePercent = stock.changePercent || 0;

    // Determine number of data points based on time range
    const dataPoints = {
      '1D': 24,
      '5D': 25,
      '1M': 30,
      '6M': 26,
      '1Y': 52
    }[timeRange] || 30;

    const data = [];
    const now = new Date();

    // Calculate starting price based on current change
    const startPrice = currentPrice / (1 + changePercent / 100);

    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);

      // Create realistic price movement with some volatility
      const volatility = (Math.random() - 0.5) * (currentPrice * 0.02);
      const trendPrice = startPrice + (currentPrice - startPrice) * progress;
      const price = Math.max(trendPrice + volatility, 0.01);

      // Calculate date based on time range
      let date = new Date(now);
      if (timeRange === '1D') {
        date.setHours(date.getHours() - (dataPoints - i));
      } else if (timeRange === '5D') {
        date.setDate(date.getDate() - (dataPoints - i));
      } else if (timeRange === '1M') {
        date.setDate(date.getDate() - (dataPoints - i));
      } else if (timeRange === '6M') {
        date.setDate(date.getDate() - (dataPoints - i) * 7);
      } else if (timeRange === '1Y') {
        date.setDate(date.getDate() - (dataPoints - i) * 7);
      }

      data.push({
        date: date.toISOString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 5000000
      });
    }

    // Ensure last point is current price
    data[data.length - 1].price = currentPrice;

    return data;
  };

  // Fetch AI prediction function
  const fetchAIPrediction = async () => {
    if (!stock) return;

    setLoadingPrediction(true);
    try {
      console.log('Fetching AI prediction for', stock.symbol);

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

      if (error) {
        console.error('AI prediction error:', error);
        throw error;
      }

      if (data) {
        console.log('AI prediction received:', data);
        setAiInsights({
          ...data,
          symbol: stock.symbol // Include symbol to track which stock this prediction is for
        });
        toast.success('AI prediction loaded');
      } else {
        throw new Error('No data received from AI prediction');
      }
    } catch (error) {
      console.error('Error fetching AI prediction:', error);
      toast.error('Failed to load AI prediction - showing basic analysis');
      // Fallback to basic insights
      setAiInsights({
        signal: stock.changePercent > 0 ? "BUY" : "SELL",
        confidence: Math.min(95, Math.abs(stock.changePercent || 0) * 10 + 60),
        reasoning: "AI prediction temporarily unavailable. Showing basic analysis based on price movement.",
        keyFactors: [
          "Price movement indicator",
          "Technical analysis pending",
          "Volume under review",
          "Market sentiment analysis"
        ],
        indicators: [
          { label: "RSI (14)", value: "N/A", status: "Neutral" },
          { label: "MACD", value: "N/A", status: "Neutral" },
          { label: "50-Day MA", value: "N/A", status: "Neutral" },
          { label: "200-Day MA", value: "N/A", status: "Neutral" }
        ],
        modelUsed: "Gemini 2.5 Flash"
      });
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Fetch custom stock data when symbol is not in default list
  useEffect(() => {
    const fetchCustomStock = async () => {
      // Skip if stock is in default list or already loaded
      if (defaultStock || customStockData?.symbol === selectedSymbol) {
        return;
      }

      // Skip if no symbol or defaulting to AAPL
      if (!selectedSymbol || selectedSymbol === "AAPL") {
        return;
      }

      setLoadingCustomStock(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
          body: { symbols: [selectedSymbol] }
        });

        if (error) throw error;

        if (data?.stocks?.[0]) {
          const stockInfo = data.stocks[0];
          setCustomStockData({
            id: stockInfo.symbol,
            symbol: stockInfo.symbol,
            name: getStockName(stockInfo.symbol),
            price: stockInfo.price,
            change: stockInfo.change,
            changePercent: stockInfo.changePercent,
            volume: stockInfo.volume,
            category: 'custom'
          });
          toast.success(`Loaded data for ${selectedSymbol}`);
        } else {
          toast.error(`No data available for ${selectedSymbol}`);
        }
      } catch (error: any) {
        console.error('Error fetching custom stock data:', error);
        toast.error(`Failed to load data for ${selectedSymbol}`);
      } finally {
        setLoadingCustomStock(false);
      }
    };

    fetchCustomStock();
  }, [selectedSymbol, defaultStock, customStockData]);

  // Handle stock selection change
  const handleStockChange = async (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    navigate(`/analysis?symbol=${newSymbol}`);
    setCustomStockData(null);
    setAiInsights(null);

    // If stock is not in the default list, fetch its data
    if (!stocks.find(s => s.symbol === newSymbol)) {
      setLoadingCustomStock(true);
      try {
        const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
          body: { symbols: [newSymbol] }
        });

        if (error) throw error;

        if (data?.stocks?.[0]) {
          const stockInfo = data.stocks[0];
          setCustomStockData({
            id: stockInfo.symbol,
            symbol: stockInfo.symbol,
            name: getStockName(stockInfo.symbol),
            price: stockInfo.price,
            change: stockInfo.change,
            changePercent: stockInfo.changePercent,
            volume: stockInfo.volume,
            category: 'custom'
          });
        }
      } catch (error) {
        console.error('Error fetching custom stock data:', error);
        toast.error('Failed to load stock data');
      } finally {
        setLoadingCustomStock(false);
      }
    } else {
      setCustomStockData(null);
    }
  };

  // Generate chart data when stock or time range changes
  useEffect(() => {
    if (stock && !loadingCustomStock) {
      setLoadingChart(true);
      const mockData = generateMockChartData();
      setChartData(mockData);
      setLoadingChart(false);

      // Fetch AI prediction after chart data is ready
      if (!aiInsights || aiInsights.symbol !== stock.symbol) {
        fetchAIPrediction();
      }
    }
  }, [selectedSymbol, timeRange, stock, loadingCustomStock]);

  const handleDownloadReport = () => {
    if (!stock || !aiInsights) return;
    generateStockReport({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      prediction: aiInsights.signal,
      confidence: aiInsights.confidence,
      reasoning: aiInsights.reasoning,
      keyFactors: aiInsights.keyFactors
    });
    toast.success("Report downloaded successfully!");
  };

  const timeRanges = ["1D", "5D", "1M", "6M", "1Y"];

  if (loading || loadingCustomStock || (!stock && selectedSymbol)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">
            {loadingCustomStock
              ? `Loading data for ${selectedSymbol}...`
              : loading
                ? "Loading stock data..."
                : "Generating AI prediction..."}
          </p>
          {loadingPrediction && (
            <p className="text-sm text-muted-foreground">
              This may take a moment...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {selectedSymbol ? `Stock "${selectedSymbol}" not found` : "Stock not found"}
          </p>
          <Link to="/stocks">
            <Button>View All Stocks</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show loading if AI insights are not ready yet
  if (!aiInsights && !loadingPrediction) {
    return (
      <div className="min-h-screen bg-background container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RiskDisclaimer pageName="analysis" />
      <AIChat />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/stocks">Stocks</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link to="/stocks">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <StockSelector value={selectedSymbol} onValueChange={handleStockChange} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold">
                  {stock.symbol}
                </h1>
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
              <p className="text-muted-foreground">{stock.name}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Link to="/stocks">
                <Button variant="outline" size="sm">
                  Compare Another
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Overview Card */}
            <Card className="p-6 animate-slide-up">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Price
                  </p>
                  <p className="text-4xl font-bold">${stock.price}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${stock.change >= 0 ? "text-success" : "text-destructive"
                      }`}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="text-lg font-semibold">
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change} ({stock.changePercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {timeRanges.map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              {loadingChart ? (
                <div className="h-80">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        domain={['dataMin - 5', 'dataMax + 5']}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: any) => [`$${value}`, 'Price']}
                        labelFormatter={(date: any) => new Date(date).toLocaleString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    Volume
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">The total number of shares traded today. Higher volume often indicates higher interest.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-lg font-semibold">{stock.volume || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <p className="text-lg font-semibold capitalize">{stock.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Change</p>
                  <p className={`text-lg font-semibold ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change}
                  </p>
                </div>
              </div>
            </Card>

            {/* Technical Analysis */}
            <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                Technical Indicators
              </h2>

              <Tabs defaultValue="indicators">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="indicators">Indicators</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="momentum">Momentum</TabsTrigger>
                </TabsList>

                <TabsContent value="indicators" className="space-y-4 mt-4">
                  {aiInsights?.indicators?.map((indicator: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{indicator.label}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">
                                {indicator.label.includes("RSI") ? "Relative Strength Index. <30 is oversold (good to buy), >70 is overbought (good to sell)." :
                                  indicator.label.includes("MACD") ? "Momentum indicator. Positive values signal upward momentum." :
                                    indicator.label.includes("MA") ? "Moving Average. Shows the average price over a specific period to identify trends." :
                                      "Technical indicator analyzing price trends."}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {indicator.value}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-success text-success"
                        >
                          {indicator.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="patterns" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    Pattern analysis coming soon...
                  </p>
                </TabsContent>

                <TabsContent value="momentum" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    Momentum analysis coming soon...
                  </p>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* AI Prediction Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Prediction Card */}
            <Card className={`p-6 animate-scale-in border-2 ${aiInsights?.signal === "BUY" ? "border-success" :
              aiInsights?.signal === "SELL" ? "border-destructive" :
                "border-secondary" // HOLD or others
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className={`h-5 w-5 ${aiInsights?.signal === "BUY" ? "text-success" :
                    aiInsights?.signal === "SELL" ? "text-destructive" :
                      "text-secondary"
                    }`} />
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-semibold">AI Prediction</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">AI-generated analysis based on technical indicators aiming to predict future price movement.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAIPrediction}
                  disabled={loadingPrediction}
                  className="h-8"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingPrediction ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {loadingPrediction ? "Analyzing..." : `Powered by ${aiInsights?.modelUsed || 'Gemini'}`}
              </p>

              {loadingPrediction ? (
                <div className="space-y-6 py-6">
                  <div className="flex justify-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                  <div className="space-y-4 pt-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6 relative">
                    {/* Signal Circle */}
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-3 ${aiInsights?.signal === "BUY" ? "bg-success/20 border-success" :
                      aiInsights?.signal === "SELL" ? "bg-destructive/20 border-destructive" :
                        "bg-secondary/20 border-secondary"
                      }`}>
                      {aiInsights?.signal === "BUY" ? (
                        <TrendingUp className="h-10 w-10 text-success" />
                      ) : aiInsights?.signal === "SELL" ? (
                        <TrendingDown className="h-10 w-10 text-destructive" />
                      ) : (
                        <Activity className="h-10 w-10 text-secondary" />
                      )}
                    </div>

                    <h3 className={`text-3xl font-bold mb-2 ${aiInsights?.signal === "BUY" ? "text-success" :
                      aiInsights?.signal === "SELL" ? "text-destructive" :
                        "text-secondary"
                      }`}>
                      {aiInsights?.signal || "NEUTRAL"}
                    </h3>

                    {/* Enhanced Confidence Score */}
                    <div className="mt-4 flex flex-col items-center">
                      <div className="relative w-full h-4 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full ${aiInsights?.signal === "BUY" ? "bg-gradient-to-r from-success/50 to-success" :
                            aiInsights?.signal === "SELL" ? "bg-gradient-to-r from-destructive/50 to-destructive" :
                              "bg-gradient-to-r from-secondary/50 to-secondary"
                            }`}
                          style={{ width: `${aiInsights?.confidence || 0}%` }}
                        />
                        {/* Tick marks for scale */}
                        <div className="absolute inset-0 flex justify-between px-1">
                          {[0, 25, 50, 75, 100].map(tick => (
                            <div key={tick} className="h-full w-px bg-background/30" style={{ left: `${tick}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between w-full mt-1 text-xs text-muted-foreground font-medium">
                        <span>Low Confidence</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className={`flex items-center gap-1 cursor-help ${aiInsights?.confidence > 80 ? "font-bold text-foreground" : ""
                                }`}>
                                {Math.round(aiInsights?.confidence || 0)}% Score
                                <Info className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px] text-xs">Indicates the AI's certainty based on pattern strength and data consistency.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span>High Confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-sm leading-relaxed">
                        {aiInsights?.reasoning || "Loading analysis..."}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Key Factors
                      </p>
                      <ul className="space-y-2">
                        {(aiInsights?.keyFactors || []).map((factor: string, i: number) => (
                          <li key={i} className="text-xs flex gap-2 items-start">
                            <span className={`mt-0.5 ${aiInsights?.signal === "BUY" ? "text-success" :
                              aiInsights?.signal === "SELL" ? "text-destructive" :
                                "text-secondary"
                              }`}>
                              ●
                            </span>
                            <span className="text-muted-foreground">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* AI Chat Widget */}
            <Card className="p-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold">Ask AI Assistant</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "Why should I {aiInsights?.signal === "BUY" ? "buy" : "avoid"} {stock.symbol}?"
                  </p>
                </div>

                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm">
                    {aiInsights?.reasoning || "Loading analysis..."}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Click the chat button in the bottom-right corner to ask any questions about stocks!
                </p>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold mb-4">Market Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Day Range</span>
                  <span className="font-medium">$176.20 - $179.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">52 Week Range</span>
                  <span className="font-medium">$164.08 - $198.23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Volume</span>
                  <span className="font-medium">48.2M</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    P/E Ratio
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">Price-to-Earnings Ratio. A higher ratio means the stock is more expensive relative to its earnings.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="font-medium">29.4</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}