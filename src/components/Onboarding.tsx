import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  LineChart, 
  Target, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    title: "Welcome to StockLens!",
    description: "Your AI-powered stock analysis platform. Let's take a quick tour to get you started.",
    icon: Sparkles,
    content: "StockLens helps beginners and professionals analyze stocks with confidence using AI predictions and real-time insights."
  },
  {
    title: "Explore Stocks",
    description: "Browse and select stocks from different categories.",
    icon: LineChart,
    content: "Use our stock selection page to filter by category, risk level, and view mini charts. Select stocks to analyze with AI."
  },
  {
    title: "AI-Powered Analysis",
    description: "Get predictions with confidence scores.",
    icon: Target,
    content: "Our AI analyzes patterns and provides BUY/HOLD/SELL recommendations with confidence scores and plain-language explanations."
  },
  {
    title: "Practice Mode",
    description: "Learn risk-free with our mock environment.",
    icon: CheckCircle2,
    content: "Toggle Practice Mode from the navbar to experiment without risk. Perfect for beginners learning the market!"
  },
  {
    title: "Ready to Start!",
    description: "You're all set to start analyzing stocks.",
    icon: TrendingUp,
    content: "Ask our AI Assistant anything, check the Screener for market trends, and build your portfolio. Let's go!"
  }
];

export const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
      // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setIsOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-secondary/20">
              <CurrentIcon className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-base text-center">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <p className="text-sm text-muted-foreground leading-relaxed text-center px-4">
            {steps[currentStep].content}
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Skip Tour
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-secondary hover:bg-secondary/90"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
