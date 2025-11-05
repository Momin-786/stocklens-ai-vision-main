import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface RiskDisclaimerProps {
  pageName: string;
}

export function RiskDisclaimer({ pageName }: RiskDisclaimerProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const disclaimerDisabled = localStorage.getItem("riskDisclaimerDisabled");
    const hasSeenDisclaimer = sessionStorage.getItem(`riskDisclaimer_${pageName}`);
    
    if (disclaimerDisabled !== "true" && !hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, [pageName]);

  const handleAccept = () => {
    sessionStorage.setItem(`riskDisclaimer_${pageName}`, "true");
    
    if (dontShowAgain) {
      localStorage.setItem("riskDisclaimerDisabled", "true");
    }
    
    setShowDisclaimer(false);
  };

  return (
    <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Risk Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              Important Disclaimer
            </p>
            <p>
              Trading and investing in stocks carries risk. The information provided on this platform is for educational and informational purposes only and should not be considered as financial advice.
            </p>
            <p className="font-medium text-foreground">
              We are not responsible for any financial losses you may incur.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Past performance does not guarantee future results</li>
              <li>You may lose some or all of your investment</li>
              <li>Always do your own research before investing</li>
              <li>Consult with a licensed financial advisor</li>
            </ul>
            
            <div className="flex items-start gap-2 pt-2">
              <Checkbox 
                id="dontShow" 
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <Label 
                htmlFor="dontShow" 
                className="text-xs cursor-pointer leading-tight"
              >
                Don't show this warning again (you can re-enable it in Profile settings)
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={handleAccept}
            className="bg-secondary hover:bg-secondary/90"
          >
            I Understand & Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}