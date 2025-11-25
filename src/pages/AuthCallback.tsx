import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for error in URL hash first
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        console.error('OAuth error in callback:', error, errorDescription);
        toast({
          title: "Authentication failed",
          description: errorDescription || error || "Please try again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if we have OAuth tokens in the URL hash
      const hasAccessToken = hashParams.get('access_token');
      const hasCode = hashParams.get('code');
      
      console.log('OAuth callback detected:', {
        hasAccessToken: !!hasAccessToken,
        hasCode: !!hasCode,
        hashLength: window.location.hash.length,
      });

      // Set up auth state change listener to wait for session
      let sessionReceived = false;
      let timeoutId: NodeJS.Timeout;

      const authStatePromise = new Promise<{ session: any; error: any }>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session ? 'Session received' : 'No session');
            
            if (event === 'SIGNED_IN' && session) {
              sessionReceived = true;
              clearTimeout(timeoutId);
              subscription.unsubscribe();
              resolve({ session, error: null });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              sessionReceived = true;
              clearTimeout(timeoutId);
              subscription.unsubscribe();
              resolve({ session, error: null });
            }
          }
        );

        // Also try to get session directly (in case it's already established)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (session && !sessionReceived) {
            sessionReceived = true;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
            resolve({ session, error: null });
          } else if (!session && !hasAccessToken && !hasCode) {
            // No tokens in URL and no session - likely not an OAuth callback
            clearTimeout(timeoutId);
            subscription.unsubscribe();
            resolve({ session: null, error: new Error('No OAuth tokens found in URL') });
          }
        });

        // Timeout after 10 seconds
        timeoutId = setTimeout(() => {
          if (!sessionReceived) {
            subscription.unsubscribe();
            resolve({ session: null, error: new Error('Timeout waiting for session') });
          }
        }, 10000);
      });

      try {
        // Wait for session with retry logic
        let result = await authStatePromise;
        let attempts = 0;
        const maxAttempts = 3;

        // If no session and we have tokens, retry
        while (!result.session && (hasAccessToken || hasCode) && attempts < maxAttempts) {
          attempts++;
          console.log(`Retrying session check... (${attempts}/${maxAttempts})`);
          
          // Wait a bit longer for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          
          // Try getting session again
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session) {
            result = { session, error: null };
            break;
          }
          
          if (error && (
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('ERR_CONNECTION_RESET')
          )) {
            // Connection error, wait and retry
            if (attempts < maxAttempts) {
              continue;
            }
            result = { session: null, error };
          } else if (error) {
            result = { session: null, error };
            break;
          }
        }

        if (result.error) {
          console.error('Auth callback error:', result.error);
          
          const isConnectionError = result.error.message?.includes('Failed to fetch') ||
            result.error.message?.includes('ERR_CONNECTION_RESET') ||
            result.error.message?.includes('network');

          if (isConnectionError) {
            console.error('Connection error details:', {
              message: result.error.message,
              attempts,
              suggestion: 'Check if Supabase project is paused or network connectivity issues'
            });
            
            toast({
              title: "Connection issue",
              description: "Unable to complete sign in. Please try again in a moment.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Authentication failed",
              description: result.error.message || "Please try again.",
              variant: "destructive",
            });
          }
          navigate("/auth");
          return;
        }

        if (result.session) {
          toast({
            title: "Welcome!",
            description: "You've successfully signed in with Google.",
          });
          navigate("/stocks");
        } else {
          // No session found
          console.warn('No session found after OAuth callback', {
            hasAccessToken: !!hasAccessToken,
            hasCode: !!hasCode,
            urlHash: window.location.hash.substring(0, 100),
          });
          
          toast({
            title: "Sign in incomplete",
            description: "Please try signing in again.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (error: any) {
        console.error('Auth callback exception:', error);
        
        const isConnectionError = error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('ERR_CONNECTION_RESET') ||
          error?.message?.includes('network');

        if (isConnectionError) {
          console.error('Connection error details:', error);
          toast({
            title: "Connection issue",
            description: "Unable to complete sign in. Please try again in a moment.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication failed",
            description: error?.message || "Please try again.",
            variant: "destructive",
          });
        }
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

