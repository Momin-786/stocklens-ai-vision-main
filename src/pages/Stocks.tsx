import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
    RefreshCw,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { useStockData } from "@/hooks/useStockData";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";

export default function Stocks() {
   const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState([50]);
  const { isPracticeMode } = usePracticeMode();

 const categories = ["All", "technology", "finance", "energy", "healthcare", "consumer"];
  const [activeCategory, setActiveCategory] = useState("All");


  const { data: realStocks, lastUpdate: realLastUpdate, loading, refetch } = useStockData(!isPracticeMode);
  
  // Use simulated updates in practice mode
  const { data: practiceStocks, lastUpdate: practiceLastUpdate } = useRealtimeUpdates(realStocks, isPracticeMode);
  
  // Use appropriate data based on mode
  const stocks = isPracticeMode ? practiceStocks : realStocks;
  const lastUpdate = isPracticeMode ? practiceLastUpdate : realLastUpdate;


  const toggleStock = (id: string) => {
    setSelectedStocks((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredStocks =
    activeCategory === "All"
      ? stocks
      : stocks.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Stock Selection
              </h1>
              <p className="text-muted-foreground">
                {isPracticeMode 
                  ? "Practice mode - Simulated data updates" 
                  : "Real-time stock data from Alpha Vantage"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
               {loading && (
                <Badge variant="outline" className="bg-muted">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Loading...
                </Badge>
              )}
              {!isPracticeMode && !loading && (
                <>
                  <Badge variant="outline" className="bg-success/10 text-success border-success">
                    Live Data
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </>
              )}
              {isPracticeMode && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                  Practice Mode
                </Badge>
              )}
            </div>
          </div>
           {!isPracticeMode && !loading && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6 animate-slide-up">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-secondary" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              {/* Category Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                 variant={activeCategory === cat ? "default" : "outline"}
                      className="cursor-pointer hover-scale"
                      onClick={() => setActiveCategory(cat)}
                    >
                     {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Slider */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Risk Tolerance</h3>
                <Slider
                  value={riskLevel}
                  onValueChange={setRiskLevel}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <Button className="w-full bg-secondary hover:bg-secondary/90">
                Apply Filters
              </Button>
            </Card>

            {/* Selected Stocks Summary */}
            {selectedStocks.length > 0 && (
              <Card className="p-6 animate-scale-in">
                <h3 className="text-sm font-medium mb-3">
                  Selected ({selectedStocks.length})
                </h3>
                <div className="space-y-2">
                  {selectedStocks.map((id) => {
                    const stock = stocks.find((s) => s.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{stock?.symbol}</span>
                        <span className="text-muted-foreground">
                          ${stock?.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link to="/analysis">
                  <Button className="w-full mt-4 bg-success hover:bg-success/90">
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search company name or symbol..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Grid/List */}
             {loading && stocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-muted-foreground">Loading stock data...</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "space-y-3"
                }
              >
                {filteredStocks.map((stock, index) => (
                <Card
                  key={stock.id}
                  className={`p-5 cursor-pointer transition-all hover-scale ${
                    selectedStocks.includes(stock.id)
                      ? "border-2 border-secondary bg-secondary/5"
                      : "border hover:border-secondary/50"
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/analysis?symbol=${stock.symbol}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stock.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stock.category}
                    </Badge>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">${stock.price}</p>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          stock.change >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>
                          {stock.change >= 0 ? "+" : ""}
                          {stock.change} ({stock.changePercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Volume</p>
                      <p className="text-sm font-medium">{stock.volume}</p>
                    </div>
                  </div>

                  {/* Mini Chart Placeholder */}
                  <div className="mt-4 h-16 bg-muted/30 rounded flex items-end gap-1 px-2 pb-2">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${
                          stock.change >= 0 ? "bg-success/60" : "bg-destructive/60"
                        }`}
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                        }}
                      />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
