/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avg_price: number;
  currentPrice?: number;
  value?: number;
  gain?: number;
  gainPercent?: number;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = async () => {
    if (!user) return;
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        // Check if table doesn't exist (common after deployment)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('portfolio_holdings table does not exist. Please run migrations.');
          setHoldings([]);
          return;
        }
        throw error;
      }
      
      setHoldings(data || []);
    } catch (error: any) {
      console.error('Error fetching holdings:', error);
      
      // Check for CORS errors
      const isCorsError = error.message?.includes('CORS') || 
                         error.message?.includes('Failed to fetch') ||
                         error.message?.includes('Access-Control-Allow-Origin');
      
      // Only show toast for actual errors, not timeouts or missing tables
      if (error.message !== 'Request timeout' && !error.message?.includes('does not exist')) {
        if (isCorsError) {
          // Log CORS error to console with helpful message
          console.error('CORS Error: Please configure Supabase Site URL to https://lenstock.netlify.app in Supabase Dashboard → Authentication → URL Configuration');
          // Don't show toast for CORS - it's a configuration issue, not a user error
        } else {
          toast({
            title: "Failed to load portfolio",
            description: error.message || 'Network error. Please check your connection.',
            variant: "destructive"
          });
        }
      }
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    if (!user) return;
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const queryPromise = supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        // Check if table doesn't exist (common after deployment)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('watchlist table does not exist. Please run migrations.');
          setWatchlist([]);
          return;
        }
        throw error;
      }
      
      setWatchlist(data || []);
    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
      // Silently handle errors to avoid spam - set empty array
      setWatchlist([]);
    }
  };

  const addHolding = async (holding: Omit<Holding, 'id'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .insert([{
          user_id: user.id,
          symbol: holding.symbol,
          name: holding.name,
          shares: holding.shares,
          avg_price: holding.avg_price
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Holding added to portfolio"
      });
      
      fetchHoldings();
    } catch (error: any) {
      toast({
        title: "Failed to add holding",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteHolding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Holding removed from portfolio"
      });
      
      fetchHoldings();
    } catch (error: any) {
      toast({
        title: "Failed to remove holding",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addToWatchlist = async (symbol: string, name: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('watchlist')
        .insert([{
          user_id: user.id,
          symbol,
          name
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${symbol} added to watchlist`
      });
      
      fetchWatchlist();
    } catch (error: any) {
      toast({
        title: "Failed to add to watchlist",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Removed from watchlist"
      });
      
      fetchWatchlist();
    } catch (error: any) {
      toast({
        title: "Failed to remove from watchlist",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      // Add a small delay to avoid race conditions
      const timer = setTimeout(() => {
        fetchHoldings();
        fetchWatchlist();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setHoldings([]);
      setWatchlist([]);
      setLoading(false);
    }
  }, [user]);

  return {
    holdings,
    watchlist,
    loading,
    addHolding,
    deleteHolding,
    addToWatchlist,
    removeFromWatchlist,
    refetch: () => {
      fetchHoldings();
      fetchWatchlist();
    }
  };
};