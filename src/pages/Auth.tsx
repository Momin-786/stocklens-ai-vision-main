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

// Google Icon SVG Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

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

    // Test connection on mount (non-blocking)
      // Only show warnings for actual issues, not Netlify CORS false positives
      const testConnection = async () => {
        const { testSupabaseConnection } = await import('@/utils/supabaseCheck');
        const result = await testSupabaseConnection();
        
        // Only show warning if it's a real issue (not skipped or Netlify CORS)
        if (!result.connected && !result.skipped && !result.isNetlifyIssue) {
        if (result.isPaused) {
          console.warn('⚠️ Supabase connection test failed - Project might be paused:', result);
          toast({
            title: "Supabase Connection Issue",
            description: result.suggestion || "Your Supabase project might be paused. Check the dashboard.",
            variant: "destructive",
            duration: 10000,
          });
        }
      } else if (result.isNetlifyIssue) {
        // Netlify-specific issue - show helpful message
        console.warn('⚠️ Netlify connection issue detected:', result);
        toast({
          title: "Netlify Configuration Needed",
          description: result.suggestion || "Check Supabase Site URL and Netlify environment variables.",
          variant: "destructive",
          duration: 15000,
        });
      }
    };
    
    testConnection().catch(console.error);

    // Check for OAuth callback in URL hash (Supabase PKCE flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('access_token') || hashParams.get('error')) {
      // OAuth callback detected, redirect to callback handler
      navigate("/auth/callback", { replace: true });
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/stocks");
      }
    }).catch((error) => {
      console.error('Error checking session:', error);
      // If there's a connection error, show a helpful message
      if (error.message?.includes('Failed to fetch') || error.message?.includes('network') || error.message?.includes('ERR_CONNECTION_RESET')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to Supabase. Your project might be paused. Check Supabase Dashboard → Settings → General → Resume Project if paused.",
          variant: "destructive",
          duration: 10000,
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
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const isProduction = import.meta.env.PROD;
        const errorMsg = isProduction
          ? 'Environment variables missing in Netlify. Go to Netlify → Site Settings → Environment Variables and add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then redeploy.'
          : 'Environment variables missing. Check your .env.local file.';
        
        toast({
          title: "Configuration Error",
          description: errorMsg,
          variant: "destructive",
          duration: 15000,
        });
        
        console.error('❌ Missing Supabase environment variables:', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          isProduction,
          fix: isProduction 
            ? 'Add env vars in Netlify Dashboard → Site Settings → Environment Variables → Redeploy'
            : 'Add to .env.local file',
        });
        
        throw new Error(errorMsg);
      }

      // Get redirect URL from environment or use current origin
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      // Remove trailing slash if present, we'll add it in emailRedirectTo
      const cleanRedirectUrl = redirectUrl.replace(/\/$/, '');
      
      console.log('Attempting signup with:', {
        email,
        redirectUrl: cleanRedirectUrl,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...', // Log partial URL for debugging
        hasKey: !!supabaseKey,
        isProduction: import.meta.env.PROD,
        currentOrigin: window.location.origin,
        viteSiteUrl: import.meta.env.VITE_SITE_URL,
      });
      
      // Retry logic for connection issues
      let lastError: any = null;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${cleanRedirectUrl}/`,
              data: {
                full_name: fullName,
              },
            },
          });
          
          // If successful, break out of retry loop
          if (!error) {
            console.log('Signup successful on attempt', attempts + 1);
            // Handle success (moved outside retry loop)
            toast({
              title: "Account created!",
              description: "Go to gmail and verify your email to proceed.",
            });
            return; // Exit function on success
          }
          
          // Log full error details for debugging
          console.error('Signup error details:', {
            message: error.message,
            status: error.status,
            name: error.name,
            error: error,
            fullError: JSON.stringify(error, null, 2),
          });
          
          // Also log to window for easy debugging in production
          if (typeof window !== 'undefined') {
            (window as any).__LAST_SIGNUP_ERROR__ = {
              message: error.message,
              status: error.status,
              name: error.name,
              error: error,
              timestamp: new Date().toISOString(),
            };
          }
          
          // If error is not a connection error, don't retry
          if (!error.message.includes("Failed to fetch") && 
              !error.message.includes("network") && 
              !error.message.includes("connection") &&
              !error.message.includes("ERR_CONNECTION_RESET")) {
            lastError = error;
            break; // Exit retry loop for non-connection errors
          }
          
          lastError = error;
          attempts++;
          
          if (attempts < maxAttempts) {
            console.log(`Retry attempt ${attempts + 1}/${maxAttempts} after connection error...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
          }
        } catch (err: any) {
          lastError = err;
          attempts++;
          
          if (attempts < maxAttempts && (
            err.message?.includes("Failed to fetch") || 
            err.message?.includes("network") || 
            err.message?.includes("connection") ||
            err.message?.includes("ERR_CONNECTION_RESET")
          )) {
            console.log(`Retry attempt ${attempts + 1}/${maxAttempts} after connection error...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          } else {
            break; // Exit retry loop
          }
        }
      }
      
      // Handle error after retries
      const error = lastError;

      if (error) {
        // Log full error object for debugging
        console.error('Signup error (full details):', {
          message: error.message,
          status: error.status,
          name: error.name,
          error: error,
          redirectUrl: cleanRedirectUrl,
          supabaseUrl: supabaseUrl,
        });
        
        // Handle specific error cases
        if (error.message?.includes("already registered") || error.message?.includes("already been registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message?.includes("redirect_to") || error.message?.includes("redirect URL") || error.message?.includes("Invalid redirect_to")) {
          toast({
            title: "Redirect URL Error",
            description: `The redirect URL "${cleanRedirectUrl}/" is not whitelisted in Supabase. Go to Supabase Dashboard → Authentication → URL Configuration and add: ${cleanRedirectUrl}/**`,
            variant: "destructive",
            duration: 20000,
          });
          console.error("Supabase redirect URL error. Make sure your Netlify URL is whitelisted in Supabase:", {
            redirectUrl: cleanRedirectUrl,
            emailRedirectTo: `${cleanRedirectUrl}/`,
            fix: `Add to Supabase Redirect URLs: ${cleanRedirectUrl}/**`,
          });
        } else if (error.message?.includes("CORS") || error.message?.includes("Access-Control-Allow-Origin")) {
          toast({
            title: "CORS Configuration Error",
            description: `Please configure the Site URL in Supabase Dashboard → Authentication → URL Configuration. Set it to: ${cleanRedirectUrl}`,
            variant: "destructive",
            duration: 20000,
          });
          console.error("CORS error detected. Configure Site URL in Supabase Dashboard:", {
            currentSiteUrl: cleanRedirectUrl,
            instructions: `Go to Supabase Dashboard → Authentication → URL Configuration → Set Site URL to: ${cleanRedirectUrl}`,
          });
        } else if (error.message?.includes("Failed to fetch") || error.message?.includes("network") || error.message?.includes("connection") || error.message?.includes("ERR_CONNECTION_RESET")) {
          const isNetlify = window.location.hostname.includes('netlify.app');
          
          // Provide diagnostic help
          console.error("🔍 Connection Error - Run diagnostics:", {
            testConnection: "Run: window.__SUPABASE_DIAGNOSTIC__.testConnection()",
            testDirectUrl: "Run: window.__SUPABASE_DIAGNOSTIC__.testDirectUrl()",
            checkConfig: "Run: window.__SUPABASE_DIAGNOSTIC__.checkConfig()",
            supabaseUrl: supabaseUrl,
            errorDetails: error,
          });
          
          toast({
            title: "Connection Error",
            description: `Cannot connect to Supabase. Open browser console (F12) and run: window.__SUPABASE_DIAGNOSTIC__.testConnection() to diagnose. Check: 1) Project is active in Supabase Dashboard, 2) URL is correct, 3) Network/firewall not blocking.`,
            variant: "destructive",
            duration: 25000,
          });
          
          if (isNetlify) {
            console.warn("Netlify deployment - Also check:", {
              siteUrl: cleanRedirectUrl,
              envVars: "Netlify → Site Settings → Environment Variables",
              supabaseConfig: "Supabase → Authentication → URL Configuration",
            });
            console.error("⚠️ NETWORK BLOCK DETECTED - Requests Not Reaching Supabase", {
              supabaseUrl,
              redirectUrl: cleanRedirectUrl,
              error: error.message,
              errorStatus: error.status,
              errorName: error.name,
              diagnosis: "No logs in Supabase + Browser test fails = Network-level block",
              note: "Localhost works, so Supabase is ACTIVE. Requests are being blocked before reaching Supabase.",
              immediateTests: [
                "1. Try from different browser (Chrome, Firefox, Edge)",
                "2. Try incognito/private mode",
                "3. Disable browser extensions",
                "4. Try from different network (mobile hotspot)",
                "5. Try from different device",
              ],
              checkNetworkTab: [
                "1. Open DevTools → Network tab",
                "2. Try to sign up",
                "3. Click failed request → Timing tab",
                "4. Check where it fails: DNS, Connecting, SSL, etc.",
              ],
              possibleCauses: [
                "1. Browser security policy blocking connection",
                "2. Network/firewall on your end blocking Supabase",
                "3. Browser extension blocking requests",
                "4. Corporate firewall/proxy",
                "5. Regional routing issue",
              ],
              solutions: [
                "1. Test from different browser/network (most likely fix)",
                "2. Check browser extensions",
                "3. Check network firewall settings",
                "4. See NETWORK_BLOCK_SOLUTION.md for full guide",
                "5. Contact Supabase/Netlify support if persists",
              ],
            });
          } else {
            // On localhost, could be paused project
            toast({
              title: "Connection Error - Project Likely Paused",
              description: "Your Supabase project is likely paused. Go to https://app.supabase.com/ → Your Project → Settings → General → Resume Project. Wait 2-3 minutes, then try again.",
              variant: "destructive",
              duration: 15000,
            });
            console.error("⚠️ CONNECTION RESET DETECTED - Most likely cause: Paused Supabase project", {
              supabaseUrl,
              redirectUrl: cleanRedirectUrl,
              error: error.message,
              immediateAction: "Go to https://app.supabase.com/ → Project 'lvmumjsocfvxxxzrdhnq' → Settings → General → Resume Project",
              waitTime: "Wait 2-3 minutes after resuming for services to restart",
              troubleshooting: [
                "1. Open https://app.supabase.com/",
                "2. Select project: lvmumjsocfvxxxzrdhnq",
                "3. Go to Settings → General",
                "4. Look for 'Project Status' - if paused, click 'Resume Project'",
                "5. Wait 2-3 minutes for all services to restart",
                "6. Try signing up again",
              ],
            });
          }
        } else {
          // Show the actual error message to user
          const errorMessage = error.message || error.toString() || "Unknown error occurred";
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
            duration: 15000,
          });
          console.error("Unhandled signup error:", error);
        }
      }
    } catch (error: any) {
      console.error("Signup exception caught:", error);
      toast({
        title: "Sign up failed",
        description: error?.message || error?.toString() || "Please try again.",
        variant: "destructive",
        duration: 15000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const isProduction = import.meta.env.PROD;
        const errorMsg = isProduction
          ? 'Environment variables missing in Netlify. Go to Netlify → Site Settings → Environment Variables and add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then redeploy.'
          : 'Environment variables missing. Check your .env.local file.';
        
        toast({
          title: "Configuration Error",
          description: errorMsg,
          variant: "destructive",
          duration: 15000,
        });
        
        throw new Error(errorMsg);
      }

      // Get redirect URL from environment or use current origin
      const redirectUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const cleanRedirectUrl = redirectUrl.replace(/\/$/, '');

      console.log('Attempting Google OAuth signin with:', {
        redirectUrl: cleanRedirectUrl,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${cleanRedirectUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Google sign in failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      } else {
        // The redirect will happen automatically
        // User will be redirected back to /auth/callback
        console.log('Google OAuth redirect initiated:', data);
      }
    } catch (error: any) {
      console.error('Google sign in exception:', error);
      toast({
        title: "Google sign in failed",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
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
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const isProduction = import.meta.env.PROD;
        const errorMsg = isProduction
          ? 'Environment variables missing in Netlify. Go to Netlify → Site Settings → Environment Variables and add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then redeploy.'
          : 'Environment variables missing. Check your .env.local file.';
        
        toast({
          title: "Configuration Error",
          description: errorMsg,
          variant: "destructive",
          duration: 15000,
        });
        
        console.error('❌ Missing Supabase environment variables:', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          isProduction,
          fix: isProduction 
            ? 'Add env vars in Netlify Dashboard → Site Settings → Environment Variables → Redeploy'
            : 'Add to .env.local file',
        });
        
        throw new Error(errorMsg);
      }

      console.log('Attempting signin with:', {
        email,
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
        isProduction: import.meta.env.PROD,
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
        } else if (error.message.includes("Failed to fetch") || error.message.includes("network") || error.message.includes("connection") || error.message.includes("ERR_CONNECTION_RESET")) {
          const isNetlify = window.location.hostname.includes('netlify.app');
          
          if (isNetlify) {
            toast({
              title: "Netlify Configuration Issue",
              description: "Since localhost works, check: 1) Supabase Site URL configuration, 2) Netlify environment variables are set correctly.",
              variant: "destructive",
              duration: 20000,
            });
            console.error("⚠️ Connection error on Netlify - Configuration issue", {
              supabaseUrl,
              error: error.message,
              fix: "Check Supabase Site URL and Netlify environment variables",
            });
          } else {
            toast({
              title: "Connection Error",
              description: "Unable to connect to Supabase. Your project might be paused. Check Supabase Dashboard and resume if needed.",
              variant: "destructive",
            });
            console.error("Connection error during signin. Possible causes:", {
              supabaseUrl,
              error: error.message,
              troubleshooting: [
                "1. Check if Supabase project is paused (free tier pauses after inactivity)",
                "2. Go to Supabase Dashboard → Settings → General",
                "3. If paused, click 'Resume Project'",
                "4. Wait 1-2 minutes for project to restart",
                "5. Try again",
              ],
            });
          }
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  {loading ? "Connecting..." : "Continue with Google"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <GoogleIcon />
                  {loading ? "Connecting..." : "Start with Google"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

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