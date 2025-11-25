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

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          toast({
            title: "Authentication failed",
            description: sessionError.message || "Please try again.",
            variant: "destructive",
          });
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
          navigate("/auth");
        }
      } catch (error: any) {
        console.error('Auth callback exception:', error);
        toast({
          title: "Authentication failed",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
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

