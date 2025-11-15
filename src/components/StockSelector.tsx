import { useState } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function StockSelector({ value, onValueChange }: StockSelectorProps) {
  const [open, setOpen] = useState(false);

  const allStocks = [
    { label: "International Stocks", stocks: INTERNATIONAL_STOCKS },
    { label: "Pakistan Stocks", stocks: PAKISTAN_STOCKS },
  ];

  const selectedStock = [...INTERNATIONAL_STOCKS, ...PAKISTAN_STOCKS].find(
    (stock) => stock.symbol === value
  );

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
              {selectedStock.symbol} - {selectedStock.name}
            </span>
          ) : (
            "Select stock..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search stocks..." />
          <CommandList>
            <CommandEmpty>No stock found.</CommandEmpty>
            {allStocks.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.stocks.map((stock) => (
                  <CommandItem
                    key={stock.symbol}
                    value={`${stock.symbol} ${stock.name}`}
                    onSelect={() => {
                      onValueChange(stock.symbol);
                      setOpen(false);
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
