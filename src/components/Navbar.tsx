/* eslint-disable react-hooks/rules-of-hooks */
import { Moon, Sun, TrendingUp, FlaskConical, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FeedbackDialog } from "@/components/FeedbackDialog";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Redirect to auth if not logged in and not on landing or auth page
    if (!loading && !user && location.pathname !== "/" && location.pathname !== "/auth") {
      navigate("/auth");
    }
  }, [user, loading, location.pathname, navigate]);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

  };

  const isActive = (path: string) => location.pathname === path;

  // Market status logic (simple version)
  const isMarketOpen = () => {
    const now = new Date();
    // Convert to EST
    const estTime = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(estTime);

    const day = estDate.getDay(); // 0 is Sunday, 6 is Saturday
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();

    // Check if weekend
    if (day === 0 || day === 6) return false;

    // Market hours roughly 9:30 AM - 4:00 PM EST
    const timeInMinutes = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 30;
    const marketClose = 16 * 60;

    return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
  };

  const marketOpen = isMarketOpen();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to={user ? "/stocks" : "/"} className="flex items-center gap-2 hover-scale group">
            <div className="p-1.5 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              StockLens
            </span>
          </Link>

          {/* Market Status Indicator - Desktop */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-border/50 text-xs font-medium">
            <div className={`h-2 w-2 rounded-full ${marketOpen ? "bg-success animate-pulse shadow-[0_0_8px_hsl(var(--success))]" : "bg-muted-foreground"}`} />
            <span className={marketOpen ? "text-success font-semibold" : "text-muted-foreground"}>
              {marketOpen ? "Market Open" : "Market Closed"}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {!user && (
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/")
                ? "text-secondary bg-secondary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              Home
            </Link>
          )}
          <Link
            to="/stocks"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/stocks")
              ? "text-secondary bg-secondary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            Stocks
          </Link>
          {/* <Link
            to="/screener"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/screener") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Screener
          </Link> */}
          <Link
            to="/comparison"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/comparison")
              ? "text-secondary bg-secondary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            Compare
          </Link>
          <Link
            to="/analysis"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/analysis")
              ? "text-secondary bg-secondary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            Analysis
          </Link>
          <Link
            to="/portfolio"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/portfolio")
              ? "text-secondary bg-secondary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            Portfolio
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive("/profile")
              ? "text-secondary bg-secondary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hover:bg-muted/50"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          {user ? (
            <>
              <FeedbackDialog />
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2 hover:bg-muted/50 border-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex border-2 hover:bg-muted/50"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="bg-secondary hover:bg-secondary/90 shadow-sm"
                onClick={() => navigate("/auth")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
