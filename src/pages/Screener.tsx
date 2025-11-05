import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Play } from "lucide-react";
import { toast } from "sonner";
import { SectorAnalysis } from "@/components/SectorAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { Badge } from "@/components/ui/badge";

export default function Screener() {
  const [stockSymbol, setStockSymbol] = useState("ZIM");
  const [stockType, setStockType] = useState("all");
  const [timeRange, setTimeRange] = useState("1M");
  const [scale, setScale] = useState("5min");
  const [analysisType, setAnalysisType] = useState("short");
  const [isLoading, setIsLoading] = useState(false);
  const { isPracticeMode } = usePracticeMode();

  const timeRanges = ["1D", "1W", "1M", "3M", "1Y", "5Y"];
  const scales = ["5s", "5min", "5V"];

  const performanceData = [
    { name: "ZIM", color: "#3B82F6", change: 12.5 },
    { name: "6Y Index", color: "#10B981", change: 8.2 },
    { name: "FDY", color: "#F59E0B", change: -2.1 },
    { name: "10X", color: "#EF4444", change: -15.3 },
  ];

  const heatmapData = [
    { symbol: "DKS", change: 2.3, color: "success" },
    { symbol: "HD", change: 1.8, color: "success" },
    { symbol: "UNP", change: -0.5, color: "destructive" },
    { symbol: "AMZN", change: 3.2, color: "success" },
    { symbol: "CMCSA", change: -1.2, color: "destructive" },
    { symbol: "UPS", change: 0.9, color: "success" },
    { symbol: "CVS", change: -2.1, color: "destructive" },
    { symbol: "TWX", change: 1.5, color: "success" },
    { symbol: "FDX", change: -0.8, color: "destructive" },
    { symbol: "WMT", change: 2.1, color: "success" },
    { symbol: "MCD", change: 1.2, color: "success" },
    { symbol: "COST", change: 2.8, color: "success" },
    { symbol: "NKE", change: -1.5, color: "destructive" },
    { symbol: "AAPL", change: 3.8, color: "success" },
    { symbol: "WBA", change: -2.3, color: "destructive" },
    { symbol: "MSFT", change: 2.9, color: "success" },
  ];

  const handlePullData = () => {
    setIsLoading(true);
    toast.success("Pulling latest market data...");
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Data updated successfully!");
    }, 2000);
  };

  const handleRunAnalysis = () => {
    setIsLoading(true);
    toast.info(`Running ${analysisType === "short" ? "Short Term" : "Long Term"} Analysis...`);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Analysis complete! Check the results below.");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
       <RiskDisclaimer pageName="screener" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Stock Screener & Analysis
              </h1>
              <p className="text-muted-foreground">
                Real-time market performance tracking and analysis
              </p>
            </div>
            {isPracticeMode && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                Practice Mode
              </Badge>
            )}
          </div>
        </div>

        {/* Screener Controls */}
        <Card className="p-6 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Stock Symbol */}
            <div>
              <Label className="text-sm mb-2">Stock Symbol</Label>
              <Input
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol"
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add up to 10 stocks
              </p>
            </div>

            {/* Watch List */}
            <div>
              <Label className="text-sm mb-2">Watch List</Label>
              <Select defaultValue="portfolio">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">My Portfolio</SelectItem>
                  <SelectItem value="tech">Tech Stocks</SelectItem>
                  <SelectItem value="trending">Trending Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Compare With */}
            <div>
              <Label className="text-sm mb-2">Compare With</Label>
              <Input
                placeholder="APPL, MSFT..."
                className="uppercase"
              />
            </div>

            {/* Filter by Industry */}
            <div>
              <Label className="text-sm mb-2">Filter by Industry</Label>
              <Select defaultValue="technology">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pull Data Button */}
            <div className="flex items-end">
              <Button
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={handlePullData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Pull Data
              </Button>
            </div>
          </div>

          {/* Stock Type & Scale */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm mb-2 block">Stock Type:</Label>
              <RadioGroup
                value={stockType}
                onValueChange={setStockType}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">All Stocks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dividends" id="dividends" />
                  <Label htmlFor="dividends" className="cursor-pointer">With Dividends</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-dividends" id="no-dividends" />
                  <Label htmlFor="no-dividends" className="cursor-pointer">No Dividends</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Scale:</Label>
              <div className="flex gap-2">
                {scales.map((s) => (
                  <Button
                    key={s}
                    variant={scale === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScale(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold">
                Performance Chart
              </h2>
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

            {/* Chart Area */}
            <div className="h-96 bg-card border rounded-lg p-4 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                <span>50%</span>
                <span>40%</span>
                <span>30%</span>
                <span>20%</span>
                <span>10%</span>
                <span>0%</span>
                <span>-10%</span>
                <span>-20%</span>
                <span>-30%</span>
              </div>

              {/* Chart Lines */}
              <div className="ml-12 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-full border-t border-muted/20" />
                  ))}
                </div>

                {/* Performance lines */}
                <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                  {/* Blue line (ZIM) */}
                  <path
                    d="M 0,250 Q 50,200 100,180 T 200,160 T 300,140 T 400,50 T 500,80 T 600,60 T 700,90 T 800,85"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    className="animate-fade-in"
                  />
                  {/* Green line (6Y Index) */}
                  <path
                    d="M 0,270 Q 50,260 100,250 T 200,230 T 300,200 T 400,180 T 500,170 T 600,160 T 700,150 T 800,140"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    className="animate-fade-in"
                    style={{ animationDelay: "0.1s" }}
                  />
                  {/* Orange line (FDY) */}
                  <path
                    d="M 0,150 Q 50,155 100,150 T 200,145 T 300,160 T 400,155 T 500,165 T 600,170 T 700,175 T 800,280"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    className="animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                  />
                  {/* Red line (10X) */}
                  <path
                    d="M 0,160 Q 50,180 100,190 T 200,210 T 300,230 T 400,250 T 500,260 T 600,270 T 700,280 T 800,290"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3"
                    className="animate-fade-in"
                    style={{ animationDelay: "0.3s" }}
                  />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="ml-12 mt-2 flex justify-between text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Now</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {performanceData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({item.change >= 0 ? "+" : ""}
                    {item.change}%)
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Market Heatmap */}
            <Card className="p-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-xl font-heading font-bold mb-2">
                Market Heatmap
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Industry Performance
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {heatmapData.map((stock, i) => (
                  <div
                    key={i}
                    className={`
                      p-3 rounded-lg text-center cursor-pointer
                      transition-all hover:scale-105 hover:shadow-lg
                      ${
                        stock.color === "success"
                          ? "bg-success/80 hover:bg-success"
                          : "bg-destructive/80 hover:bg-destructive"
                      }
                      text-white font-semibold
                      animate-scale-in
                    `}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="text-sm">{stock.symbol}</div>
                    <div className="text-xs mt-1">
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-gradient-to-r from-destructive via-destructive/50 to-muted rounded" />
                  <span className="text-muted-foreground">Strong Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Strong Gain</span>
                  <div className="w-12 h-2 bg-gradient-to-r from-muted via-success/50 to-success rounded" />
                </div>
              </div>
            </Card>

            {/* Run Analysis */}
            <Card className="p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-xl font-heading font-bold mb-4">
                Run Analysis
              </h3>

              <RadioGroup
                value={analysisType}
                onValueChange={setAnalysisType}
                className="space-y-4 mb-6"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="short" id="short" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="short" className="cursor-pointer font-semibold">
                      Short Term
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      1-30 days analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="long" id="long" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="long" className="cursor-pointer font-semibold">
                      Long Term
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      90+ days analysis
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <Button
                className="w-full bg-success hover:bg-success/90 text-white"
                onClick={handleRunAnalysis}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Analysis
              </Button>
            </Card>
          </div>
        </div>

        {/* Sector Analysis Section */}
        <div className="mt-12">
          <SectorAnalysis />
        </div>
      </div>
    </div>
  );
}
