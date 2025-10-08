import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface PracticeModeContextType {
  isPracticeMode: boolean;
  togglePracticeMode: () => void;
}

const PracticeModeContext = createContext<PracticeModeContextType | undefined>(undefined);

export const PracticeModeProvider = ({ children }: { children: ReactNode }) => {
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("practiceMode");
    if (savedMode === "true") {
      setIsPracticeMode(true);
    }
  }, []);

  const togglePracticeMode = () => {
    const newMode = !isPracticeMode;
    setIsPracticeMode(newMode);
    localStorage.setItem("practiceMode", String(newMode));
    
    toast.success(
      newMode 
        ? "Practice Mode Enabled - Learn risk-free!" 
        : "Practice Mode Disabled - Using real data",
      {
        description: newMode 
          ? "All trades are simulated. Perfect for learning!" 
          : "You're now viewing real market data."
      }
    );
  };

  return (
    <PracticeModeContext.Provider value={{ isPracticeMode, togglePracticeMode }}>
      {children}
    </PracticeModeContext.Provider>
  );
};

export const usePracticeMode = () => {
  const context = useContext(PracticeModeContext);
  if (context === undefined) {
    throw new Error("usePracticeMode must be used within a PracticeModeProvider");
  }
  return context;
};
