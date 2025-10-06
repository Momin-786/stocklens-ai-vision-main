import { Moon, Sun, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <TrendingUp className="h-6 w-6 text-secondary" />
          <span className="text-xl font-heading font-bold">StockLens</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/stocks"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/stocks") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Stocks
          </Link>
          <Link
            to="/screener"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/screener") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Screener
          </Link>
          <Link
            to="/analysis"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/analysis") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Analysis
          </Link>
          <Link
            to="/portfolio"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/portfolio") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Portfolio
          </Link>
          <Link
            to="/profile"
            className={`text-sm font-medium transition-colors hover:text-secondary ${
              isActive("/profile") ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Login
          </Button>
          <Button size="sm" className="bg-secondary hover:bg-secondary/90">
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
};
