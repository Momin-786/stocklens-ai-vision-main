import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeRange = '1M' } = await req.json();
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    console.log(`Fetching historical data for ${symbol}, range: ${timeRange}`);

    const { resolution, from, to } = getTimeRangeParams(timeRange);

    // Fetch historical data from Finnhub
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.s === 'no_data') {
      throw new Error('No historical data available for this symbol');
    }

    // Transform Finnhub data to our format
    const historicalData = data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      price: parseFloat(data.c[index].toFixed(2)),
      volume: data.v[index],
    }));

    return new Response(
      JSON.stringify({ 
        symbol,
        timeRange,
        data: historicalData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in fetch-historical-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function getTimeRangeParams(timeRange: string) {
  const now = Math.floor(Date.now() / 1000);
  let resolution = 'D'; // Daily by default
  let from = now;

  switch (timeRange) {
    case '1D':
      resolution = '5'; // 5-minute intervals
      from = now - 24 * 60 * 60;
      break;
    case '5D':
      resolution = '15'; // 15-minute intervals
      from = now - 5 * 24 * 60 * 60;
      break;
    case '1M':
      resolution = 'D'; // Daily
      from = now - 30 * 24 * 60 * 60;
      break;
    case '6M':
      resolution = 'D'; // Daily
      from = now - 180 * 24 * 60 * 60;
      break;
    case '1Y':
      resolution = 'W'; // Weekly
      from = now - 365 * 24 * 60 * 60;
      break;
    default:
      from = now - 30 * 24 * 60 * 60;
  }

  return { resolution, from, to: now };
}
