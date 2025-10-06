import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/AIChat";
import Landing from "./pages/Landing";
import Stocks from "./pages/Stocks";
import Screener from "./pages/Screener";
import Analysis from "./pages/Analysis";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
