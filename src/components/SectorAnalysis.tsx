import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const sectors = [
  {
    name: "Technology",
    performance: 3.2,
    confidence: 85,
    trend: "up",
    stocks: ["AAPL", "MSFT", "GOOGL"],
    prediction: "Strong growth expected in Q4 with AI advancements",
    color: "bg-blue-500"
  },
  {
    name: "Finance",
    performance: 1.8,
    confidence: 72,
    trend: "up",
    stocks: ["JPM", "BAC", "WFC"],
    prediction: "Stable performance, interest rates impact positive",
    color: "bg-green-500"
  },
  {
    name: "Healthcare",
    performance: 0.9,
    confidence: 68,
    trend: "up",
    stocks: ["JNJ", "PFE", "UNH"],
    prediction: "Moderate growth, pharmaceutical sector stable",
    color: "bg-purple-500"
  },
  {
    name: "Energy",
    performance: -1.2,
    confidence: 55,
    trend: "down",
    stocks: ["XOM", "CVX", "COP"],
    prediction: "Volatility expected, oil prices fluctuating",
    color: "bg-yellow-500"
  },
  {
    name: "Consumer",
    performance: 2.1,
    confidence: 78,
    trend: "up",
    stocks: ["AMZN", "WMT", "COST"],
    prediction: "Holiday season boost expected, strong retail",
    color: "bg-pink-500"
  },
  {
    name: "Industrial",
    performance: -0.5,
    confidence: 60,
    trend: "down",
    stocks: ["GE", "BA", "CAT"],
    prediction: "Supply chain concerns, mixed performance",
    color: "bg-orange-500"
  }
];

export const SectorAnalysis = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Sector Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered predictions for major market sectors
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Activity className="h-3 w-3" />
          Live Analysis
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector, index) => (
          <Card 
            key={sector.name} 
            className="p-5 hover:shadow-lg transition-all hover-scale animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sector.color}`} />
                <h3 className="font-semibold text-lg">{sector.name}</h3>
              </div>
              {sector.trend === "up" ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>

            {/* Performance */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-bold ${
                  sector.performance >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {sector.performance >= 0 ? "+" : ""}{sector.performance}%
                </span>
                <span className="text-sm text-muted-foreground">today</span>
              </div>
              
              {/* Confidence Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="font-medium">{sector.confidence}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${sector.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Stocks */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Top Stocks:</p>
              <div className="flex gap-2">
                {sector.stocks.map(stock => (
                  <Badge key={stock} variant="outline" className="text-xs">
                    {stock}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prediction */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {sector.prediction}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
