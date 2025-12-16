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
    const { message, conversationHistory, stream = false } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing stock chat message: ${message}`);

    const systemPrompt = `You are an expert stock market AI assistant. You help users with:
- Stock analysis and predictions
- Market trends and insights
- Portfolio recommendations
- Technical indicator explanations
- Investment strategies
- General financial advice

Provide clear, concise, and actionable advice. Be professional yet conversational.
Keep responses focused and under 200 words unless detailed analysis is requested.

**Important formatting guidelines:**
- Use markdown formatting for better readability
- Use **bold** for important terms and concepts
- Use bullet points (-) for lists
- Use numbered lists (1., 2., 3.) for step-by-step explanations
- When explaining technical indicators like RSI, use clear structure:
  * What it is (brief definition)
  * How it works (key mechanics)
  * Interpretation (what the values mean)
  * Important considerations (limitations, best practices)

Example for RSI explanation:
**What it is:** RSI is a momentum indicator that measures the magnitude of recent price changes.

**How it works:** It ranges from 0 to 100.
- **Overbought:** Above 70 suggests the asset may be due for a price correction
- **Oversold:** Below 30 suggests the asset may be due for a price bounce
- **Neutral:** Readings between 30 and 70 are considered neutral

**Important Considerations:**
- RSI is most effective when used with other indicators
- It's a lagging indicator, reflecting past price movements
- Don't rely solely on RSI for trading decisions`;

    // Convert chat-style messages into Gemini contents format
    const contents = (conversationHistory || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Use streaming endpoint if requested
    const apiUrl = stream
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?key=${GEMINI_API_KEY}`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API responded with status ${response.status}`);
    }

    if (stream && response.body) {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      // Create a readable stream for the response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim());

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                      fullMessage += text;
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text, done: false })}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: '', done: true, fullMessage })}\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response
      const data = await response.json();
      const aiMessage =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';

      console.log('AI chat response generated successfully');

      return new Response(
        JSON.stringify({ message: aiMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in stock-chat:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate response',
        message: 'I apologize, but I encountered an error. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
