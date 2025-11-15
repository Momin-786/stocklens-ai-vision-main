/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StockData } from "./useRealtimeUpdates";

export const useStockData = (enabled: boolean = true) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  // Popular stock symbols
  const defaultSymbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "META", "NVDA", "JPM", "V", "WMT",
    "JNJ", "PG", "UNH", "HD", "DIS"
  ];

  const fetchStockData = async () => {
    if (!enabled) {
      // Still provide demo data even when disabled
      const demoStocks = defaultSymbols.map((symbol, index) => ({
        id: symbol,
        symbol,
        name: getStockName(symbol),
        price: Math.round((150 + Math.random() * 100) * 100) / 100,
        change: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        changePercent: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
        volume: (Math.floor(Math.random() * 10000000) + 1000000).toLocaleString(),
        category: getCategory(index)
      }));
      setStocks(demoStocks);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching stock data from Alpha Vantage...");

      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { symbols: defaultSymbols }
      });

      if (error) throw error;

      if (data?.stocks && data.stocks.length > 0) {
        // Categorize stocks
        const categorizedStocks = data.stocks.map((stock: any, index: number) => ({
          id: stock.symbol,
          symbol: stock.symbol,
          name: getStockName(stock.symbol),
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          category: getCategory(index)
        }));

        setStocks(categorizedStocks);
        setLastUpdate(new Date());
        console.log(`Successfully loaded ${categorizedStocks.length} stocks`);
        if (data.total_retrieved && data.total_requested && data.total_retrieved < data.total_requested) {
          toast({
            title: "Partial Stock Data",
            description: `Showing ${data.total_retrieved} of ${data.total_requested} stocks due to API rate limits.`,
            variant: "default"
          });
        }  
      } else {
        console.warn('No stock data returned from API - might be rate limited');
        toast({
          title: "Limited Stock Data",
          description: "Using demo data. Alpha Vantage API may be rate limited (5 calls/min, 100/day for free tier).",
          variant: "default"
        });
        
        // Provide demo data when API fails
     const demoStocks = defaultSymbols.map((symbol, index) => ({
          id: symbol,
          symbol,
          name: getStockName(symbol),
           price: Math.round((150 + Math.random() * 100) * 100) / 100,
          change: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
          changePercent: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
          volume: (Math.floor(Math.random() * 10000000) + 1000000).toLocaleString(),
          category: getCategory(index)
        }));
        
        setStocks(demoStocks);
        setLastUpdate(new Date());
         toast({
          title: "Demo Data Active",
          description: "Alpha Vantage API rate limit reached (25 calls/day). Showing realistic sample data.",
        });
    }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error fetching stock data:", error);
 const demoStocks = defaultSymbols.map((symbol, index) => ({
        id: symbol,
        symbol,
        name: getStockName(symbol),
        price: Math.round((150 + Math.random() * 100) * 100) / 100,
        change: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        changePercent: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
        volume: (Math.floor(Math.random() * 10000000) + 1000000).toLocaleString(),
        category: getCategory(index)
      }));
      
      setStocks(demoStocks);
      setLastUpdate(new Date());
      
      toast({
        title: "Using Demo Data",
        description: "Network error - showing sample data instead.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();

    // Refresh every 5 minutes to avoid rate limits
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, [enabled]);

  return { data: stocks, lastUpdate, loading, refetch: fetchStockData };
};

// Helper functions
const getStockName = (symbol: string): string => {
  const names: Record<string, string> = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "TSLA": "Tesla Inc.",
    "META": "Meta Platforms",
    "NVDA": "NVIDIA Corp.",
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

const getCategory = (index: number): string => {
  const categories = ["technology", "finance", "healthcare", "consumer", "energy"];
  return categories[index % categories.length];
};