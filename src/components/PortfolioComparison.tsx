import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Portfolio {
  name: string;
  value: number;
  gain: number;
  gainPercent: number;
  holdings: number;
  topStock: string;
  topStockGain: number;
}

const portfolios: Portfolio[] = [
  {
    name: "Main Portfolio",
    value: 45234.56,
    gain: 3456.78,
    gainPercent: 8.28,
    holdings: 8,
    topStock: "AAPL",
    topStockGain: 12.5
  },
  {
    name: "Tech Focus",
    value: 28900.00,
    gain: 2340.50,
    gainPercent: 8.82,
    holdings: 5,
    topStock: "MSFT",
    topStockGain: 15.3
  },
  {
    name: "Dividend Income",
    value: 52100.25,
    gain: 1890.75,
    gainPercent: 3.76,
    holdings: 12,
    topStock: "JNJ",
    topStockGain: 5.2
  }
];

export const PortfolioComparison = () => {
  const totalValue = portfolios.reduce((sum, p) => sum + p.value, 0);
  const totalGain = portfolios.reduce((sum, p) => sum + p.gain, 0);
  const avgGainPercent = (totalGain / (totalValue - totalGain)) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-secondary/10 to-accent/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Combined Value</p>
            <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Gain</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-success">
                +${totalGain.toFixed(2)}
              </p>
              <span className="text-lg text-success">({avgGainPercent.toFixed(2)}%)</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Holdings</p>
            <p className="text-3xl font-bold">
              {portfolios.reduce((sum, p) => sum + p.holdings, 0)}
            </p>
          </div>
        </div>
      </Card>

      {/* Individual Portfolios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {portfolios.map((portfolio, index) => (
          <Card 
            key={portfolio.name} 
            className="p-5 hover:shadow-lg transition-all hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{portfolio.name}</h3>
                <p className="text-xs text-muted-foreground">{portfolio.holdings} holdings</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>

            {/* Value */}
            <div className="mb-4">
              <p className="text-2xl font-bold">${portfolio.value.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-1 ${
                portfolio.gain >= 0 ? "text-success" : "text-destructive"
              }`}>
                {portfolio.gain >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  +${portfolio.gain.toFixed(2)} ({portfolio.gainPercent}%)
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Performance</span>
                <span className="font-medium">{portfolio.gainPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all"
                  style={{ width: `${Math.min(portfolio.gainPercent * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Top Performer */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Top Performer</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{portfolio.topStock}</span>
                <span className="text-sm text-success">+{portfolio.topStockGain}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
