/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";
import { Link, useSearchParams } from "react-router-dom";
import { generateStockReport } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useStockData } from "@/hooks/useStockData";
import { supabase } from "@/integrations/supabase/client";

export default function Analysis() {
    const [searchParams] = useSearchParams();
  const symbolParam = searchParams.get("symbol") || "AAPL";
  const [timeRange, setTimeRange] = useState("1M");
  const { isPracticeMode } = usePracticeMode();
  const { data: stocks, loading } = useStockData();
  
const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  
  const stock = stocks.find(s => s.symbol === symbolParam) || stocks[0];

  // Fetch AI prediction when stock data is available
  useEffect(() => {
    const fetchAIPrediction = async () => {
      if (!stock) return;
      
      setLoadingPrediction(true);
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
        
        if (data) {
          setAiInsights(data);
        }
      } catch (error) {
        console.error('Error fetching AI prediction:', error);
        toast.error('Failed to load AI prediction');
        // Fallback to basic insights
        setAiInsights({
          signal: stock.changePercent > 0 ? "BUY" : "SELL",
          confidence: Math.min(95, Math.abs(stock.changePercent || 0) * 10 + 60),
          reasoning: "AI prediction temporarily unavailable. Showing basic analysis.",
          keyFactors: [
            "Price movement indicator",
            "Technical analysis pending",
            "Volume under review",
            "Market sentiment analysis"
          ]
        });
      } finally {
        setLoadingPrediction(false);
      }
    };

    fetchAIPrediction();
  }, [stock?.symbol]);

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

  if (loading || !aiInsights) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
<p className="text-muted-foreground">
          {loading ? "Loading stock data..." : "Generating AI prediction..."}
        </p>
              </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Stock not found</p>
          <Link to="/stocks">
            <Button>View All Stocks</Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
          <RiskDisclaimer pageName="analysis" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link to="/stocks">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
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
          </div>

          <div className="flex gap-2">
            {isPracticeMode && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                Practice Mode
              </Badge>
            )}
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
                    className={`flex items-center gap-1 mt-1 ${
                      stock.change >= 0 ? "text-success" : "text-destructive"
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

              {/* Chart Placeholder */}
              <div className="h-80 bg-muted/30 rounded-lg flex items-end gap-1 px-4 pb-4">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-secondary to-secondary/40"
                    style={{
                      height: `${Math.random() * 70 + 30}%`,
                      opacity: 0.8 + Math.random() * 0.2,
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-lg font-semibold">{stock.volume || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-lg font-semibold capitalize">{stock.category}</p>
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Change</p>
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
                  {[
                    { label: "RSI (14)", value: "62.3", status: "Bullish" },
                    { label: "MACD", value: "+1.24", status: "Bullish" },
                    { label: "50-Day MA", value: "$174.50", status: "Above" },
                    { label: "200-Day MA", value: "$168.20", status: "Above" },
                  ].map((indicator, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded"
                    >
                      <span className="font-medium">{indicator.label}</span>
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
  <Card className={`p-6 animate-scale-in border-2 ${aiInsights?.signal === "BUY" ? "border-success" : "border-destructive"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={`h-5 w-5 ${aiInsights?.signal === "BUY" ? "text-success" : "text-destructive"}`} />
                <h2 className="text-lg font-semibold">AI Prediction</h2>
              </div>

               <p className="text-xs text-muted-foreground mb-4">
                {loadingPrediction ? "Analyzing..." : "Powered by GEMINI AI"}
              </p>

              {loadingPrediction ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${aiInsights.signal === "BUY" ? "bg-success/20 border-success" : "bg-destructive/20 border-destructive"} border-4 mb-3`}>
                      {aiInsights.signal === "BUY" ? (
                        <TrendingUp className="h-10 w-10 text-success" />
                      ) : (
                        <TrendingDown className="h-10 w-10 text-destructive" />
                      )}
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${aiInsights.signal === "BUY" ? "text-success" : "text-destructive"}`}>
                      {aiInsights.signal}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${aiInsights.signal === "BUY" ? "bg-success" : "bg-destructive"}`}
                          style={{ width: `${aiInsights.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round(aiInsights.confidence)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence Score
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {aiInsights.reasoning}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Key Factors
                      </p>
                      <ul className="space-y-2">
                        {aiInsights.keyFactors.map((factor, i) => (
                          <li key={i} className="text-xs flex gap-2">
                            <span className={aiInsights.signal === "BUY" ? "text-success" : "text-destructive"}>
                              {aiInsights.signal === "BUY" ? "✓" : "⚠"}
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
                   "Why should I {aiInsights.signal === "BUY" ? "buy" : "avoid"} {stock.symbol}?"
                  </p>
                </div>

                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-sm">
                    {aiInsights.reasoning}
                  </p>
                </div>

                 <Button className="w-full bg-secondary hover:bg-secondary/90" disabled>
                  AI Chat Coming Soon
                </Button>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P/E Ratio</span>
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
 