import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL hash
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

        // Supabase automatically handles the OAuth callback with PKCE flow
        // The session should be established automatically when detectSessionInUrl is true
        // Wait a bit for the session to be processed
        await new Promise(resolve => setTimeout(resolve, 500));

        // Retry logic for connection reset errors
        let session = null;
        let sessionError = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !session) {
          try {
            const result = await supabase.auth.getSession();
            session = result.data.session;
            sessionError = result.error;

            if (session) {
              break; // Success, exit retry loop
            }

            // If it's a connection reset error, retry
            if (sessionError && (
              sessionError.message?.includes('Failed to fetch') ||
              sessionError.message?.includes('ERR_CONNECTION_RESET') ||
              sessionError.message?.includes('network')
            )) {
              attempts++;
              if (attempts < maxAttempts) {
                console.warn(`Connection reset, retrying... (${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                continue;
              }
            } else {
              // Not a connection error, don't retry
              break;
            }
          } catch (err: any) {
            if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_RESET')) {
              attempts++;
              if (attempts < maxAttempts) {
                console.warn(`Connection error, retrying... (${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                continue;
              }
            }
            sessionError = err;
            break;
          }
        }

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          
          // Only show user-friendly errors, not technical connection errors
          const isConnectionError = sessionError.message?.includes('Failed to fetch') ||
            sessionError.message?.includes('ERR_CONNECTION_RESET') ||
            sessionError.message?.includes('network');

          if (isConnectionError) {
            // Log detailed error to console only
            console.error('Connection error details:', {
              message: sessionError.message,
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
              description: sessionError.message || "Please try again.",
              variant: "destructive",
            });
          }
          navigate("/auth");
          return;
        }

        if (session) {
          toast({
            title: "Welcome!",
            description: "You've successfully signed in with Google.",
          });
          navigate("/stocks");
        } else {
          // No session found, redirect to auth
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
        
        // Check if it's a connection error
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

