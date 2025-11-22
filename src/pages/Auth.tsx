/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";
import { z } from "zod";
import { checkSupabaseConfig } from "@/utils/supabaseCheck";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Check Supabase configuration on mount
    const configCheck = checkSupabaseConfig();
    if (!configCheck.valid) {
      console.error('Supabase configuration issues detected:', configCheck.issues);
      // Don't block the UI, but log the issues for debugging
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/stocks");
      }
    }).catch((error) => {
      console.error('Error checking session:', error);
      // If there's a connection error, show a helpful message
      if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to authentication service. Please check your configuration.",
          variant: "destructive",
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/stocks");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      // Get redirect URL from environment or use current origin
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      
      console.log('Attempting signup with:', {
        email,
        redirectUrl,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...', // Log partial URL for debugging
      });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${redirectUrl}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      console.log('Signup response:', { data: data?.user ? 'User created' : 'No user', error: error?.message });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes("redirect_to") || error.message.includes("redirect URL")) {
          toast({
            title: "Configuration Error",
            description: "Please contact support. The redirect URL needs to be configured.",
            variant: "destructive",
          });
          console.error("Supabase redirect URL error. Make sure your Vercel URL is whitelisted in Supabase:", redirectUrl);
        } else if (error.message.includes("CORS") || error.message.includes("Access-Control-Allow-Origin")) {
          toast({
            title: "CORS Configuration Error",
            description: "Please configure the Site URL in Supabase Dashboard → Authentication → URL Configuration. Set it to: " + redirectUrl,
            variant: "destructive",
          });
          console.error("CORS error detected. Configure Site URL in Supabase Dashboard:", {
            currentSiteUrl: redirectUrl,
            instructions: "Go to Supabase Dashboard → Authentication → URL Configuration → Set Site URL to: " + redirectUrl,
          });
        } else if (error.message.includes("Failed to fetch") || error.message.includes("network") || error.message.includes("connection")) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            variant: "destructive",
          });
          console.error("Network error. Check:", {
            supabaseUrl,
            redirectUrl,
            error: error.message,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Account created!",
          description: "Go to gmail and verify your email to proceed.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      console.log('Attempting signin with:', {
        email,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Signin response:', { data: data?.user ? 'User signed in' : 'No user', error: error?.message });

      if (error) {
        console.error('Signin error:', error);
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Email or password is incorrect.",
            variant: "destructive",
          });
        } else if (error.message.includes("Failed to fetch") || error.message.includes("network") || error.message.includes("connection")) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            variant: "destructive",
          });
          console.error("Network error during signin:", {
            supabaseUrl,
            error: error.message,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Stock Screener</h1>
          </div>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to access real-time stock data and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;