import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  LineChart,
  Sparkles,
  Target,
  Shield,
  Zap,
  Play,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: LineChart,
      title: "Live Market Tracking",
      description:
        "Real-time stock data updates with instant price changes and volume indicators.",
    },
    {
      icon: Sparkles,
      title: "AI Predictions",
      description:
        "Machine learning algorithms analyze patterns to predict buy/sell opportunities.",
    },
    {
      icon: Target,
      title: "Personalized Recommendations",
      description:
        "Tailored stock suggestions based on your risk profile and investment goals.",
    },
    {
      icon: Zap,
      title: "Interactive Visualization",
      description:
        "Dynamic charts and graphs with zoom, hover insights, and comparison tools.",
    },
  ];

  const testimonials = [
    {
      name: "Kashif Khan",
      role: "Day Trader",
      content:
        "StockLens helped me identify profitable patterns I would have missed. The AI predictions are incredibly accurate.",
    },
    {
      name: "Muneeb Khan",
      role: "Portfolio Manager",
      content:
        "The visualization tools make complex data easy to understand. A must-have for serious investors.",
    },
    {
      name: "Ghafoor Khan",
      role: "Beginner Investor",
      content:
        "I'm new to stocks, but StockLens made it simple. The explanations are clear and helpful. Very user-friendly!",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40 bg-gradient-to-br from-background via-secondary/5 to-accent/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-secondary/30 shadow-lg mb-8 animate-scale-in hover-scale cursor-default backdrop-blur-sm">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-sm font-semibold">Trusted by 10,000+ Investors Worldwide</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold mb-8 leading-[1.1] animate-fade-in">
              See Beyond
              <br />
              <span className="relative inline-block">
                <span className="text-gradient">the Market</span>
                <svg className="absolute -bottom-4 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 5 250 5 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" className="animate-fade-in" style={{ animationDelay: "0.5s" }} />
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
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-medium">
              Harness the power of <span className="text-secondary font-bold">AI-driven analytics</span> to transform raw market data into actionable insights. Make smarter investment decisions with confidence.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/auth">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all hover-scale group">
                      Get Started Free
                  <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/stocks">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 hover:bg-secondary/10 hover:border-secondary transition-all">
                  <Play className="mr-2 h-5 w-5" />
                  View Live Stocks
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">99.2%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
              <div className="text-center border-x">
                <div className="text-3xl md:text-4xl font-bold text-success mb-1">$2.4M+</div>
                <div className="text-sm text-muted-foreground">Analyzed Daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Real-time Data</div>
              </div>
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-32 left-10 animate-float hidden xl:block">
            <div className="p-4 rounded-2xl bg-card border border-success/30 shadow-xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="absolute top-40 right-10 animate-float hidden xl:block" style={{ animationDelay: "1s" }}>
            <div className="p-4 rounded-2xl bg-card border border-secondary/30 shadow-xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <div className="absolute bottom-32 left-20 animate-float hidden xl:block" style={{ animationDelay: "1.5s" }}>
            <div className="p-4 rounded-2xl bg-card border border-destructive/30 shadow-xl backdrop-blur-sm">
              <LineChart className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div className="absolute bottom-40 right-32 animate-float hidden xl:block" style={{ animationDelay: "2s" }}>
            <div className="p-4 rounded-2xl bg-card border border-accent/30 shadow-xl backdrop-blur-sm">
              <Target className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
              <span className="text-sm font-semibold text-secondary">Why Choose StockLens</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Powerful Features for
              <br />
              <span className="text-gradient">Smart Investing</span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Everything you need to analyze stocks, predict trends, and maximize returns with AI-powered precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-8 hover-scale cursor-pointer border-2 hover:border-secondary/50 hover:shadow-2xl transition-all animate-slide-up bg-card/50 backdrop-blur-sm relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 w-fit mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-secondary" />
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

      {/* Testimonials Section */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-success/10 border border-success/20 mb-4">
              <span className="text-sm font-semibold text-success">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Trusted by Investors
              <br />
              <span className="text-gradient">Worldwide</span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Join thousands who've transformed their investment strategy with StockLens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 hover-scale animate-fade-in bg-gradient-to-br from-card to-card/50 border-2 hover:border-secondary/30 hover:shadow-2xl transition-all relative overflow-hidden group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-xl">★</span>
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
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-secondary/10 via-accent/5 to-success/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-card border border-secondary/30 mb-6 shadow-lg">
              <span className="text-sm font-semibold text-secondary">Start Your Journey</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Ready to Make
              <br />
              <span className="text-gradient">Smarter Investments?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of investors using AI-powered insights to maximize their returns. Start analyzing stocks in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
              <Link to="/screener">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-lg px-12 py-7 shadow-2xl hover:shadow-secondary/20 transition-all hover-scale group">
                  Get Started Free
                  <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/50 to-accent/50 border-2 border-background" />
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
                <TrendingUp className="h-6 w-6 text-secondary" />
                <span className="text-xl font-heading font-bold">StockLens</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered stock analysis for smarter investing.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/stocks" className="hover:text-secondary">Stocks</Link></li>
                <li><Link to="/screener" className="hover:text-secondary">Screener</Link></li>
                <li><Link to="/analysis" className="hover:text-secondary">Analysis</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-secondary">About</a></li>
                <li><a href="#" className="hover:text-secondary">Blog</a></li>
                <li><a href="#" className="hover:text-secondary">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-secondary">Privacy</a></li>
                <li><a href="#" className="hover:text-secondary">Terms</a></li>
                <li><a href="#" className="hover:text-secondary">Contact</a></li>
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
