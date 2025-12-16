import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  Sparkles,
  Target,
  Shield,
  Zap,
  Play,
  Moon,
  Sun,
  ArrowRight,
  Check,
  BarChart3,
  Brain,
  TrendingDown,
} from "lucide-react";

export default function Landing() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const features = [
    {
      icon: LineChart,
      title: "Live Market Tracking",
      description: "Real-time stock data updates with instant price changes and volume indicators.",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
    },
    {
      icon: Sparkles,
      title: "AI Predictions",
      description: "Machine learning algorithms analyze patterns to predict buy/sell opportunities.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description: "Tailored stock suggestions based on your risk profile and investment goals.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
    },
    {
      icon: Zap,
      title: "Interactive Visualization",
      description: "Dynamic charts and graphs with zoom, hover insights, and comparison tools.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    },
  ];

  const benefits = [
    "Real-time market data",
    "AI-powered predictions",
    "Advanced charting tools",
    "Portfolio tracking",
    "Risk analysis",
    "24/7 support",
  ];

  const testimonials = [
    {
      name: "Kashif Khan",
      role: "Day Trader",
      content: "StockLens helped me identify profitable patterns I would have missed. The AI predictions are incredibly accurate.",
      rating: 5,
    },
    {
      name: "Muneeb Khan",
      role: "Portfolio Manager",
      content: "The visualization tools make complex data easy to understand. A must-have for serious investors.",
      rating: 5,
    },
    {
      name: "Ghafoor Khan",
      role: "Beginner Investor",
      content: "I'm new to stocks, but StockLens made it simple. The explanations are clear and helpful. Very user-friendly!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-lg"
          : "bg-transparent"
          }`}
      >
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 hover-scale group">
            <div className="p-1.5 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              StockLens
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex hover:bg-muted/50 dark:hover:bg-secondary/20 dark:hover:text-secondary transition-colors"
              >
                Sign In
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg border-2 hover:bg-muted/50 transition-all"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Link to="/auth">
              <Button
                size="sm"
                className="bg-secondary hover:bg-secondary/90 shadow-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 min-h-screen flex items-center bg-gradient-to-br from-background via-secondary/5 to-accent/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float opacity-60" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float opacity-60"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" />

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 border border-secondary/30 shadow-lg mb-8 animate-scale-in hover-scale cursor-default backdrop-blur-sm">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold">Trusted by 10,000+ Investors Worldwide</span>
            </div>

            {/* Main Headline with Animation */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold mb-6 md:mb-8 leading-[1.1] animate-fade-in">
              See Beyond
              <br />
              <span className="relative inline-block">
                <span className="text-gradient bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  the Market
                </span>
                <svg
                  className="absolute -bottom-3 md:-bottom-4 left-0 w-full"
                  height="12"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 5 250 5 298 10"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-draw"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--secondary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-medium px-4">
              Harness the power of{" "}
              <span className="text-secondary font-bold">AI-driven analytics</span> to transform
              raw market data into actionable insights. Make smarter investment decisions with
              confidence.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center mb-12 md:mb-16 animate-slide-up px-4"
              style={{ animationDelay: "0.2s" }}
            >
              <Link to="/auth" className="w-full sm:w-auto group">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 shadow-xl hover:shadow-2xl transition-all hover-scale group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-white/10 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </Link>
              <Link to="/stocks" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 border-2 hover:bg-secondary/10 hover:border-secondary dark:hover:bg-secondary/20 dark:hover:text-secondary transition-all group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  View Live Stocks
                </Button>
              </Link>
            </div>

            {/* Stats Row with Counter Animation */}
            <div
              className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in px-4"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary mb-1 group-hover:scale-110 transition-transform">
                  99.2%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center border-x border-border/50 group">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-success mb-1 group-hover:scale-110 transition-transform">
                  $2.4M+
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Analyzed Daily</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-1 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Real-time Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-32 left-10 animate-float hidden xl:block">
          <div className="p-4 rounded-2xl bg-card/80 border border-success/30 shadow-xl backdrop-blur-sm hover:scale-110 transition-transform">
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </div>
        <div
          className="absolute top-40 right-10 animate-float hidden xl:block"
          style={{ animationDelay: "1s" }}
        >
          <div className="p-4 rounded-2xl bg-card/80 border border-secondary/30 shadow-xl backdrop-blur-sm hover:scale-110 transition-transform">
            <Sparkles className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <div
          className="absolute bottom-32 left-20 animate-float hidden xl:block"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="p-4 rounded-2xl bg-card/80 border border-destructive/30 shadow-xl backdrop-blur-sm hover:scale-110 transition-transform">
            <LineChart className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div
          className="absolute bottom-40 right-32 animate-float hidden xl:block"
          style={{ animationDelay: "2s" }}
        >
          <div className="p-4 rounded-2xl bg-card/80 border border-accent/30 shadow-xl backdrop-blur-sm hover:scale-110 transition-transform">
            <Target className="h-8 w-8 text-accent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16 animate-fade-in px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
              <span className="text-sm font-semibold text-secondary">Why Choose StockLens</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 md:mb-6">
              Powerful Features for
              <br />
              <span className="text-gradient">Smart Investing</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Everything you need to analyze stocks, predict trends, and maximize returns with
              AI-powered precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-6 md:p-8 hover-scale cursor-pointer border-2 hover:border-secondary/50 hover:shadow-2xl transition-all duration-300 animate-slide-up bg-card/80 backdrop-blur-sm relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div
                    className={`p-4 rounded-xl ${feature.bgColor} ${feature.borderColor} border w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-3 group-hover:text-secondary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="animate-fade-in">
              <div className="inline-block px-4 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
                <span className="text-sm font-semibold text-success">What You Get</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-6">
                Everything You Need to
                <br />
                <span className="text-gradient">Succeed</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                StockLens provides all the tools and insights you need to make informed investment
                decisions and grow your portfolio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-1.5 rounded-full bg-success/10">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 border-2 border-secondary/20">
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <div className="font-semibold">Stock Analysis</div>
                            <div className="text-xs text-muted-foreground">Real-time data</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-bold">+2.5%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 px-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
              <span className="text-sm font-semibold text-success">Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 md:mb-6">
              Trusted by Investors
              <br />
              <span className="text-gradient">Worldwide</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
              Join thousands who've transformed their investment strategy with StockLens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 md:p-8 hover-scale animate-fade-in bg-gradient-to-br from-card to-card/50 border-2 hover:border-secondary/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xl">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/30 to-accent/30 flex items-center justify-center font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-secondary/10 via-accent/5 to-success/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-card/80 border border-secondary/30 mb-6 shadow-lg backdrop-blur-sm">
              <span className="text-sm font-semibold text-secondary">Start Your Journey</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-4 md:mb-6 leading-tight px-4">
              Ready to Make
              <br />
              <span className="text-gradient">Smarter Investments?</span>
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Join thousands of investors using AI-powered insights to maximize their returns.
              Start analyzing stocks in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center mb-10 md:mb-12 px-4">
              <Link to="/auth" className="w-full sm:w-auto group">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base sm:text-lg px-10 sm:px-12 py-6 sm:py-7 shadow-2xl hover:shadow-secondary/20 transition-all hover-scale group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-white/10 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/50 to-accent/50 border-2 border-background"
                    />
                  ))}
                </div>
                <span className="text-sm">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-yellow-500 text-xl">★★★★★</span>
                <span className="text-sm">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-secondary/10">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-xl font-heading font-bold">StockLens</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered stock analysis for smarter investing.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">Email:</span> momina7863@gmail.com</p>
                <p><span className="font-medium text-foreground">Location:</span> Gujranwala</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/stocks" className="hover:text-secondary transition-colors">
                    Stocks
                  </Link>
                </li>
                <li>
                  <Link to="/screener" className="hover:text-secondary transition-colors">
                    Screener
                  </Link>
                </li>
                <li>
                  <Link to="/analysis" className="hover:text-secondary transition-colors">
                    Analysis
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 StockLens. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
