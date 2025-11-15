import { StockComparison } from "@/components/StockComparison";
import { AIChat } from "@/components/AIChat";
import { RiskDisclaimer } from "@/components/RiskDisclaimer";

export default function Comparison() {
  return (
    <div className="min-h-screen bg-background">
      <RiskDisclaimer pageName="comparison" />
      <AIChat />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">Stock Comparison</h1>
          <p className="text-muted-foreground">
            Compare multiple stocks side-by-side with AI-powered insights
          </p>
        </div>
        <StockComparison />
      </div>
    </div>
  );
}