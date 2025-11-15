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
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHoldings(data || []);
    } catch (error: any) {
      console.error('Error fetching holdings:', error);
      toast({
        title: "Failed to load portfolio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setWatchlist(data || []);
    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
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
      fetchHoldings();
      fetchWatchlist();
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