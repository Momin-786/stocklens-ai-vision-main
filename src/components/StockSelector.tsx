import { useState, useEffect, useCallback, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INTERNATIONAL_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "DIS", name: "Walt Disney Co." },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "INTC", name: "Intel Corp." },
  { symbol: "VZ", name: "Verizon Communications Inc." },
  { symbol: "KO", name: "Coca-Cola Co." },
];

const PAKISTAN_STOCKS = [
  { symbol: "HBL.PSX", name: "Habib Bank Limited" },
  { symbol: "ENGRO.PSX", name: "Engro Corporation" },
  { symbol: "OGDC.PSX", name: "Oil & Gas Development Company" },
  { symbol: "PPL.PSX", name: "Pakistan Petroleum Limited" },
  { symbol: "PSO.PSX", name: "Pakistan State Oil" },
  { symbol: "LUCK.PSX", name: "Lucky Cement Limited" },
  { symbol: "MCB.PSX", name: "MCB Bank Limited" },
  { symbol: "UBL.PSX", name: "United Bank Limited" },
  { symbol: "MEBL.PSX", name: "Meezan Bank Limited" },
  { symbol: "BAFL.PSX", name: "Bank Alfalah Limited" },
  { symbol: "HUBC.PSX", name: "Hub Power Company" },
  { symbol: "FFC.PSX", name: "Fauji Fertilizer Company" },
  { symbol: "FFBL.PSX", name: "Fauji Fertilizer Bin Qasim" },
  { symbol: "DAWH.PSX", name: "Dawood Hercules Corporation" },
  { symbol: "SNGP.PSX", name: "Sui Northern Gas Pipelines" },
];

interface StockSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export function StockSelector({ value, onValueChange }: StockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDefaultStocks, setShowDefaultStocks] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search for stocks using API
  const searchStocks = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setShowDefaultStocks(true);
      return;
    }

    setIsSearching(true);
    setShowDefaultStocks(false);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stock-data', {
        body: { 
          search: query,
          limit: 30 // Show more results in selector
        }
      });

      if (error) throw error;

      if (data?.searchResults && Array.isArray(data.searchResults)) {
        setSearchResults(data.searchResults);
      } else {
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
      // Don't show toast for every search error to avoid spam
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchStocks(searchQuery.trim());
      }, 500);
    } else {
      setSearchResults([]);
      setShowDefaultStocks(true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchStocks]);

  // Find selected stock from default list or search results
  const selectedStock = [...INTERNATIONAL_STOCKS, ...PAKISTAN_STOCKS].find(
    (stock) => stock.symbol === value
  ) || searchResults.find((stock) => stock.symbol === value);

  const allStocks = [
    { label: "International Stocks", stocks: INTERNATIONAL_STOCKS },
    { label: "Pakistan Stocks", stocks: PAKISTAN_STOCKS },
  ];

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setShowDefaultStocks(true);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedStock ? (
            <span className="truncate">
              {selectedStock.symbol} - {('name' in selectedStock ? selectedStock.name : selectedStock.description)}
            </span>
          ) : value ? (
            <span className="truncate">{value}</span>
          ) : (
            "Select stock..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput 
              placeholder="Search any stock symbol or company name..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDefaultStocks(true);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CommandList>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : showDefaultStocks && !searchQuery ? (
              <>
                {allStocks.map((group) => (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.stocks.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        value={`${stock.symbol} ${stock.name}`}
                        onSelect={() => {
                          onValueChange(stock.symbol);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === stock.symbol ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground">
                            {stock.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            ) : searchResults.length > 0 ? (
              <CommandGroup heading={`Search Results (${searchResults.length})`}>
                {searchResults.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={`${stock.symbol} ${stock.description}`}
                    onSelect={() => {
                      onValueChange(stock.symbol);
                      setOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowDefaultStocks(true);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === stock.symbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                          {stock.type}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {stock.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>
                {searchQuery ? `No stocks found for "${searchQuery}"` : "No stock found."}
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
