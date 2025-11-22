import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Trash2,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PortfolioComparison } from "@/components/PortfolioComparison";
import { useNotifications } from "@/hooks/useNotifications";
import { usePracticeMode } from "@/contexts/PracticeModeContext";
import { generatePortfolioReport } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const holdingFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long").toUpperCase(),
  name: z.string().min(1, "Company name is required").max(100),
  shares: z.number().positive("Shares must be positive"),
  avg_price: z.number().positive("Price must be positive"),
});

const watchlistFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long").toUpperCase(),
  name: z.string().min(1, "Company name is required").max(100),
});

export default function Portfolio() {
  const { user } = useAuth();
  const { holdings: userHoldings, watchlist: userWatchlist, loading, addHolding, deleteHolding, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [showGreeting, setShowGreeting] = useState(true);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState("holdings");
  const [stockPrices, setStockPrices] = useState<Record<string, { price: number; change: number; changePercent: number }>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const { isPracticeMode } = usePracticeMode();
  
  useNotifications({ enabled: true, interval: 30000 });

  const holdingForm = useForm<z.infer<typeof holdingFormSchema>>({
    resolver: zodResolver(holdingFormSchema),
    defaultValues: {
      symbol: "",
      name: "",
      shares: 0,
      avg_price: 0,
    },
  });

  const watchlistForm = useForm<z.infer<typeof watchlistFormSchema>>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      symbol: "",
      name: "",
    },
  });

  const onAddHolding = async (values: z.infer<typeof holdingFormSchema>) => {
    await addHolding({
      symbol: values.symbol,
      name: values.name,
      shares: values.shares,
      avg_price: values.avg_price
    });
    setShowAddHolding(false);
    holdingForm.reset();
  };

  const onAddWatchlist = async (values: z.infer<typeof watchlistFormSchema>) => {
    await addToWatchlist(values.symbol, values.name);
    setShowAddWatchlist(false);
    watchlistForm.reset();
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real stock prices for portfolio holdings
  useEffect(() => {
    const fetchStockPrices = async () => {
      if (isPracticeMode || userHoldings.length === 0) {
        // In practice mode or no holdings, use simulated prices
        return;
      }

      setLoadingPrices(true);
      try {
        // Get unique symbols from holdings
        const symbols = [...new Set(userHoldings.map(h => h.symbol))];
        
        if (symbols.length === 0) {
          setLoadingPrices(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
          body: { symbols }
        });

        if (error) throw error;

        if (data?.stocks && Array.isArray(data.stocks)) {
          const pricesMap: Record<string, { price: number; change: number; changePercent: number }> = {};
          
          data.stocks.forEach((stock: any) => {
            pricesMap[stock.symbol] = {
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            };
          });

          setStockPrices(pricesMap);
        }
      } catch (error: any) {
        console.error('Error fetching stock prices:', error);
        // Don't show error toast, just use fallback prices
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchStockPrices();

    // Refresh prices every 5 minutes
    const interval = setInterval(fetchStockPrices, 300000);
    return () => clearInterval(interval);
  }, [userHoldings, isPracticeMode]);

  const handleDownloadReport = () => {
    generatePortfolioReport({
      totalValue,
      totalGain,
      gainPercent: Number(totalGainPercent),
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        shares: h.shares,
        avgPrice: h.avgPrice,
        currentPrice: h.currentPrice,
        value: h.value,
        gain: h.gain
      }))
    });
    toast.success("Portfolio report downloaded!");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Calculate portfolio metrics with real or simulated prices
  const holdings = userHoldings.map(h => {
    // Use real price if available, otherwise use simulated (for practice mode or if API fails)
    const priceData = stockPrices[h.symbol];
    const currentPrice = priceData 
      ? priceData.price 
      : isPracticeMode 
        ? h.avg_price * (1 + (Math.random() - 0.5) * 0.1) // Simulated for practice mode
        : h.avg_price; // Fallback to avg price if real price not available
    
    const changePercent = priceData 
      ? priceData.changePercent 
      : isPracticeMode 
        ? (Math.random() - 0.5) * 10 
        : 0;
    
    const value = h.shares * currentPrice;
    const totalCost = h.shares * h.avg_price;
    const gain = value - totalCost;
    const gainPercentValue = totalCost > 0 ? ((gain / totalCost) * 100) : 0;

    return {
      ...h,
      avgPrice: h.avg_price,
      currentPrice,
      value,
      gain,
      gainPercent: gainPercentValue,
      changePercent // For display purposes
    };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0);
  const totalGainPercent = totalValue > 0 ? ((totalGain / (totalValue - totalGain)) * 100).toFixed(2) : "0.00";
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="min-h-screen bg-background py-12">
      {/* Greeting Dialog */}
      <Dialog open={showGreeting} onOpenChange={setShowGreeting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {getGreeting()}, {userName}!
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Here's your portfolio update
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-secondary" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div>
                <p className="text-sm text-muted-foreground">Total Gain</p>
                <p className="text-2xl font-bold text-accent">+${totalGain.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </div>
          <Button onClick={() => setShowGreeting(false)} className="w-full">
            View Full Portfolio
          </Button>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">My Portfolio</h1>
              <p className="text-muted-foreground">Track your investments and performance</p>
            </div>
            <div className="flex gap-2">
              {isPracticeMode && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                  Practice Mode
                </Badge>
              )}
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 animate-scale-in hover-scale border-2 hover:border-secondary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Wallet className="h-6 w-6 text-secondary" />
              </div>
              <Badge variant="outline" className="text-xs">
                Portfolio Value
              </Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ${totalValue.toLocaleString()}
            </h3>
            <div
              className={`flex items-center gap-1 text-sm ${
                parseFloat(totalGainPercent) >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {parseFloat(totalGainPercent) >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="font-semibold">
                ${Math.abs(totalGain).toFixed(2)} ({totalGainPercent}%)
              </span>
            </div>
          </Card>

          <Card className="p-6 animate-scale-in hover-scale border-2 hover:border-success/50 transition-all" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <Badge variant="outline" className="text-xs">
                Total Gain
              </Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1 text-success">
              ${holdings.filter(h => h.gain > 0).reduce((sum, h) => sum + h.gain, 0).toFixed(2)}
            </h3>
            <p className="text-sm text-muted-foreground">
              From {holdings.filter(h => h.gain > 0).length} positions
            </p>
          </Card>

          <Card className="p-6 animate-scale-in hover-scale border-2 hover:border-destructive/50 transition-all" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <Badge variant="outline" className="text-xs">
                Total Loss
              </Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1 text-destructive">
              ${Math.abs(holdings.filter(h => h.gain < 0).reduce((sum, h) => sum + h.gain, 0)).toFixed(2)}
            </h3>
            <p className="text-sm text-muted-foreground">
              From {holdings.filter(h => h.gain < 0).length} positions
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  <h3 className="text-xl font-semibold">Your Holdings</h3>
                  {loadingPrices && !isPracticeMode && (
                    <Badge variant="outline" className="text-xs">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Updating prices...
                    </Badge>
                  )}
                </div>
                <Button 
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => setShowAddHolding(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Avg Price</TableHead>
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Gain/Loss</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Loading portfolio...
                        </TableCell>
                      </TableRow>
                    ) : holdings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No holdings yet. Add your first stock position!
                        </TableCell>
                      </TableRow>
                    ) : holdings.map((holding) => (
                      <TableRow key={holding.id} className="hover:bg-muted/50">
                        <TableCell className="font-semibold">
                          {holding.symbol}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {holding.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {holding.shares}
                        </TableCell>
                        <TableCell className="text-right">
                          ${holding.avgPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${holding.currentPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${holding.value.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              holding.gain >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {holding.gain >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-semibold">
                              ${Math.abs(holding.gain).toFixed(2)}
                              <br />
                              <span className="text-xs">
                                ({holding.gainPercent > 0 ? "+" : ""}
                                {holding.gainPercent}%)
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteHolding(holding.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-secondary" />
                  <h3 className="text-xl font-semibold">Your Watchlist</h3>
                </div>
                <Button 
                  className="bg-secondary hover:bg-secondary/90"
                  onClick={() => setShowAddWatchlist(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    Loading watchlist...
                  </div>
                ) : userWatchlist.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    Your watchlist is empty. Add stocks to track them!
                  </div>
                ) : userWatchlist.map((stock, index) => (
                  <Card
                    key={stock.id}
                    className="p-5 hover-scale cursor-pointer border-2 hover:border-secondary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{stock.symbol}</h4>
                        <p className="text-sm text-muted-foreground">
                          {stock.name}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFromWatchlist(stock.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Added {new Date(stock.created_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  <h3 className="text-xl font-semibold">Transaction History</h3>
                </div>
                <Input
                  placeholder="Search transactions..."
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-4">
                {[
                  {
                    type: "buy",
                    symbol: "AAPL",
                    shares: 50,
                    price: 170.23,
                    date: "2024-01-15",
                  },
                  {
                    type: "buy",
                    symbol: "MSFT",
                    shares: 25,
                    price: 380.45,
                    date: "2024-01-10",
                  },
                  {
                    type: "sell",
                    symbol: "TSLA",
                    shares: 10,
                    price: 245.67,
                    date: "2024-01-08",
                  },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          transaction.type === "buy"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {transaction.type === "buy" ? (
                          <TrendingUp
                            className={`h-5 w-5 ${
                              transaction.type === "buy"
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{transaction.symbol}</span>
                          <Badge
                            variant={
                              transaction.type === "buy" ? "default" : "destructive"
                            }
                          >
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.shares} shares @ ${transaction.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(transaction.shares * transaction.price).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <PortfolioComparison />
          </TabsContent>
        </Tabs>

        {/* Add Holding Dialog */}
        <Dialog open={showAddHolding} onOpenChange={setShowAddHolding}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Stock Position</DialogTitle>
              <DialogDescription>
                Enter the details of your stock holding.
              </DialogDescription>
            </DialogHeader>
            <Form {...holdingForm}>
              <form onSubmit={holdingForm.handleSubmit(onAddHolding)} className="space-y-4">
                <FormField
                  control={holdingForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="AAPL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={holdingForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Apple Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={holdingForm.control}
                  name="shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Shares</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={holdingForm.control}
                  name="avg_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="150.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Add Position</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddHolding(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Watchlist Dialog */}
        <Dialog open={showAddWatchlist} onOpenChange={setShowAddWatchlist}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>
                Enter the stock you want to track.
              </DialogDescription>
            </DialogHeader>
            <Form {...watchlistForm}>
              <form onSubmit={watchlistForm.handleSubmit(onAddWatchlist)} className="space-y-4">
                <FormField
                  control={watchlistForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="AAPL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={watchlistForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Apple Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Add to Watchlist</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddWatchlist(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
             </div>
    </div>
  );
}