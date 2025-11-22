/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error: Deno types for edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: { method: string; json: () => PromiseLike<{ symbols?: any; search?: string; limit?: number; }> | { symbols?: any; search?: string; limit?: number; }; }) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { symbols, search, limit = 20 } = requestBody;
    // @ts-expect-error: Deno global is available in Supabase Edge Functions
    const apiKey = Deno.env.get('FINNHUB_API_KEY');

    if (!apiKey) {
      console.error('FINNHUB_API_KEY not found in environment');
      throw new Error('Finnhub API key not configured');
    }

    // Handle search request FIRST (before checking for symbols)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      console.log(`Searching for: ${search}`);
      
      const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(search.trim())}&token=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Search API error:', searchResponse.status, errorText);
        throw new Error(`Search API error: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();

      // Filter and format results
      const results = (searchData.result || [])
        .slice(0, limit)
        .map((item: any) => ({
          symbol: item.symbol,
          description: item.description || '',
          displaySymbol: item.displaySymbol || item.symbol,
          type: item.type || 'stock'
        }))
        .filter((item: any) => 
          item.type === 'Common Stock' || 
          item.type === 'stock' ||
          item.type === 'Equity'
        );

      console.log(`Found ${results.length} search results`);

      return new Response(
        JSON.stringify({ searchResults: results }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Handle symbol data fetch
    console.log(`Received request for ${symbols?.length || 0} symbols`);
    
    if (!symbols || !Array.isArray(symbols)) {
      console.error('Invalid symbols parameter:', symbols);
      throw new Error('Either "search" query or "symbols" array is required');
    }
    
    console.log(`Fetching data for symbols: ${symbols.join(', ')}`);

    // Fetch data for each symbol from Finnhub
    const stockData = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
          console.log(`Fetching ${symbol}...`);
          
          const quoteResponse = await fetch(quoteUrl);
          const quoteData = await quoteResponse.json();

          console.log(`Response for ${symbol}:`, JSON.stringify(quoteData).substring(0, 200));

          // Finnhub returns an object with fields: c (current), d (change), dp (change percent), v (volume), etc.
          if (quoteData.c == null) {
            console.warn(`No quote data available for ${symbol}. Response:`, quoteData);
            return null;
          }

          const price = parseFloat(quoteData.c.toFixed(2));
          const change = quoteData.d != null ? parseFloat(quoteData.d.toFixed(2)) : 0;
          const changePercent = quoteData.dp != null ? parseFloat(quoteData.dp.toFixed(2)) : 0;
          const volume = quoteData.v;

          const stockInfo = {
            symbol,
            price,
            change,
            changePercent,
            volume: volume != null ? Number(volume).toLocaleString() : "N/A",
          };

          console.log(`Successfully fetched ${symbol}:`, stockInfo);
          return stockInfo;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validData = stockData.filter(data => data !== null);
    console.log(`Successfully fetched ${validData.length} out of ${symbols.length} stocks`);

    if (validData.length === 0) {
      console.warn('No valid stock data retrieved. Possible rate limiting or API issues.');
    }

    return new Response(
       JSON.stringify({ 
        stocks: validData,
        total_requested: symbols.length,
        total_retrieved: validData.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in fetch-stock-data function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
       JSON.stringify({ error: error.message, details: error.stack }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});