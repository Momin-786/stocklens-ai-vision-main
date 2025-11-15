/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error: Deno types for edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: { method: string; json: () => PromiseLike<{ symbols: any; }> | { symbols: any; }; }) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    // @ts-expect-error: Deno global is available in Supabase Edge Functions
        const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

    console.log(`Received request for ${symbols?.length || 0} symbols`);
    
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY not found in environment');
      throw new Error('Alpha Vantage API key not configured');
    }

    if (!symbols || !Array.isArray(symbols)) {
      console.error('Invalid symbols parameter:', symbols);
      throw new Error('Symbols array is required');
    }
     console.log(`Fetching data for symbols: ${symbols.join(', ')}`);

    // Fetch data for each symbol with rate limiting
      const stockData = await Promise.all(
        symbols.map(async (symbol: string, index: number) => {
        try {
           // Add delay to avoid rate limiting (Alpha Vantage free tier: 5 calls/min)
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between calls
          }

          const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          console.log(`Fetching ${symbol}...`);
          
          const quoteResponse = await fetch(quoteUrl);
          const quoteData = await quoteResponse.json();

          console.log(`Response for ${symbol}:`, JSON.stringify(quoteData).substring(0, 200));

          if (quoteData['Note']) {
            console.warn(`API rate limit reached for ${symbol}`);
            return null;
          }

          if (quoteData['Information']) {
            console.warn(`API information message for ${symbol}:`, quoteData['Information']);
            return null;
          }

          const quote = quoteData['Global Quote'];
          
          if (!quote || !quote['05. price']) {
             console.warn(`No quote data available for ${symbol}. Response:`, quoteData);
            return null;
          }

          const price = parseFloat(quote['05. price']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
          const volume = quote['06. volume'];
            const stockInfo = {
            symbol,
            price,
            change,
            changePercent,
            volume: parseInt(volume).toLocaleString(),
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