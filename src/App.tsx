import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CommandMenu } from "@/components/CommandMenu";
import { AIChat } from "@/components/AIChat";
import { Onboarding } from "@/components/Onboarding";
import { PracticeModeProvider } from "@/contexts/PracticeModeContext";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Stocks from "./pages/Stocks";
import Screener from "./pages/Screener";
import Analysis from "./pages/Analysis";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Comparison from "./pages/Comparison";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to stocks if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/stocks" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const showNavbar = user !== null; // Only show navbar when logged in

  return (
    <>
      <CommandMenu />
      {showNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/stocks"
          element={
            <ProtectedRoute>
              <Stocks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/screener"
          element={
            <ProtectedRoute>
              <Screener />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparison"
          element={
            <ProtectedRoute>
              <Comparison />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNavbar && <AIChat />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PracticeModeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Onboarding />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </PracticeModeProvider>
  </QueryClientProvider>
);

export default App;
