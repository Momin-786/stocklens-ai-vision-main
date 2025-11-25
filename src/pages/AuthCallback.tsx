import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for error in URL hash or query params
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search.substring(1));
      const error = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

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

      // Check if we have OAuth tokens in URL (hash or query params)
      const hasAccessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const hasCode = hashParams.get('code') || queryParams.get('code');
      const hasHash = window.location.hash.length > 0;
      const hasQuery = window.location.search.length > 0;
      
      console.log('OAuth callback check:', {
        hasAccessToken: !!hasAccessToken,
        hasCode: !!hasCode,
        hasHash,
        hasQuery,
        hashLength: window.location.hash.length,
        queryLength: window.location.search.length,
      });

      // If no tokens and no hash/query, user might have navigated here directly
      // Check if there's already a session first
      if (!hasAccessToken && !hasCode && !hasHash && !hasQuery) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Already logged in, redirect to stocks
          navigate("/stocks");
          return;
        }
        // No session and no OAuth tokens, redirect to auth
        console.log('No OAuth tokens found, redirecting to auth');
        navigate("/auth");
        return;
      }

      // Set up auth state change listener to wait for session
      // Supabase with detectSessionInUrl: true should automatically process the callback
      // With PKCE flow, we get a 'code' that needs to be exchanged for tokens
      let sessionReceived = false;
      let timeoutId: NodeJS.Timeout;
      let subscription: any = null;

      const authStatePromise = new Promise<{ session: any; error: any }>((resolve) => {
        // Listen for all auth state changes
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session ? 'Session received' : 'No session');
            
            // PKCE flow events: CODE_EXCHANGED, SIGNED_IN, or TOKEN_REFRESHED
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'CODE_EXCHANGED') && session) {
              sessionReceived = true;
              if (timeoutId) clearTimeout(timeoutId);
              if (sub) sub.unsubscribe();
              resolve({ session, error: null });
            }
          }
        );
        subscription = sub;

        // Also check for existing session immediately and periodically
        const checkSession = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !sessionReceived) {
            sessionReceived = true;
            if (timeoutId) clearTimeout(timeoutId);
            if (sub) sub.unsubscribe();
            resolve({ session, error: null });
            return true;
          }
          return false;
        };

        // Check immediately
        checkSession();

        // If we have a code, Supabase needs to exchange it - check periodically
        if (hasCode) {
          const intervalId = setInterval(async () => {
            const found = await checkSession();
            if (found) {
              clearInterval(intervalId);
            }
          }, 500); // Check every 500ms

          // Clear interval on timeout
          setTimeout(() => clearInterval(intervalId), 20000);
        }

        // Timeout after 20 seconds (longer for PKCE code exchange)
        timeoutId = setTimeout(() => {
          if (!sessionReceived) {
            if (sub) sub.unsubscribe();
            // Don't treat timeout as error if we have code - Supabase might still be processing
            if (hasAccessToken || hasCode) {
              resolve({ session: null, error: new Error('Timeout waiting for session - Supabase may still be processing') });
            } else {
              resolve({ session: null, error: null }); // No tokens, just redirect
            }
          }
        }, 20000);
      });

      try {
        // Wait for session - Supabase should process the OAuth callback automatically
        let result = await authStatePromise;
        let attempts = 0;
        const maxAttempts = 3;

        // If no session but we have code/tokens, retry (Supabase might still be processing PKCE exchange)
        while (!result.session && (hasAccessToken || hasCode) && attempts < maxAttempts) {
          attempts++;
          console.log(`Waiting for Supabase to process OAuth code exchange... (${attempts}/${maxAttempts})`);
          
          // Wait longer for Supabase to process the code exchange
          await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
          
          // Try getting session again
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session) {
            result = { session, error: null };
            break;
          }
          
          // If we have a code but no session, try refreshing the session
          if (hasCode && !session && attempts === 1) {
            console.log('Attempting to refresh session after code exchange...');
            try {
              // Trigger a session refresh which might complete the code exchange
              await supabase.auth.refreshSession();
              // Wait a bit and check again
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: { session: refreshedSession } } = await supabase.auth.getSession();
              if (refreshedSession) {
                result = { session: refreshedSession, error: null };
                break;
              }
            } catch (refreshError) {
              console.log('Session refresh attempt:', refreshError);
            }
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

        if (result.error && result.error.message !== 'Timeout waiting for session - Supabase may still be processing') {
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
          // No session found - might still be processing or failed
          if (hasAccessToken || hasCode) {
            console.warn('No session found but OAuth code/tokens present - may still be processing', {
              hasAccessToken: !!hasAccessToken,
              hasCode: !!hasCode,
              urlHash: window.location.hash.substring(0, 100),
            });
            
            // For PKCE flow with code, try one more time with longer wait
            if (hasCode) {
              console.log('Waiting additional time for PKCE code exchange...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Try refreshing session
              try {
                await supabase.auth.refreshSession();
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (e) {
                console.log('Refresh attempt:', e);
              }
              
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                toast({
                  title: "Welcome!",
                  description: "You've successfully signed in with Google.",
                });
                navigate("/stocks");
                return;
              }
            } else {
              // Has access token, wait a bit more
              await new Promise(resolve => setTimeout(resolve, 2000));
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                toast({
                  title: "Welcome!",
                  description: "You've successfully signed in with Google.",
                });
                navigate("/stocks");
                return;
              }
            }
          }
          
          console.warn('No session found after OAuth callback');
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

