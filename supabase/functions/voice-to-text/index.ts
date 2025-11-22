import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Expected JSON with audio field.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { audio } = requestData;
    
    console.log('Voice-to-text function called');
    console.log('Audio data received:', audio ? `Yes (${typeof audio}, length: ${typeof audio === 'string' ? audio.length : 'N/A'})` : 'No');
    
    if (!audio) {
      console.error('No audio data provided in request');
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audio data is base64
    if (typeof audio !== 'string' || audio.length === 0) {
      console.error('Invalid audio data format:', typeof audio, audio?.length);
      return new Response(
        JSON.stringify({ error: 'Invalid audio data format. Expected base64 string.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking for ASSEMBLYAI_API_KEY...');
    const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!ASSEMBLYAI_API_KEY) {
      console.error('ASSEMBLYAI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Transcription service not configured. Please set ASSEMBLYAI_API_KEY in Supabase project settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('ASSEMBLYAI_API_KEY found, proceeding with transcription request...');

    // Calculate approximate audio size (base64 is ~33% larger than raw)
    const estimatedSizeBytes = (audio.length * 3) / 4;
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB limit for upload endpoint
    
    let assemblyAIRequestBody;
    
    // Using upload endpoint approach (recommended by AssemblyAI)
    // This works better with various audio formats (WebM, MP3, etc.)
    if (estimatedSizeBytes > maxSizeBytes) {
      throw new Error(`Audio file is too large (${Math.round(estimatedSizeBytes / 1024 / 1024)}MB). Maximum size is 25MB.`);
    }

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(audio)) {
      throw new Error('Invalid base64 audio data format');
    }

    // Convert base64 to buffer for upload
    const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));

    console.log('Uploading audio to AssemblyAI...');
    
    // Step 1: Upload audio file to AssemblyAI
    // Note: The upload endpoint accepts raw binary data (audio buffer)
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        // AssemblyAI detects format automatically from the binary data
      },
      body: audioBuffer,
    });

    if (!uploadResponse.ok) {
      const uploadErrorText = await uploadResponse.text();
      console.error('AssemblyAI upload error:', uploadErrorText);
      let uploadErrorMessage = `Audio upload failed: ${uploadResponse.status}`;
      
      try {
        const uploadErrorJson = JSON.parse(uploadErrorText);
        uploadErrorMessage = uploadErrorJson.error || uploadErrorJson.message || uploadErrorMessage;
      } catch {
        uploadErrorMessage = uploadErrorText || uploadErrorMessage;
      }
      
      throw new Error(uploadErrorMessage);
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;

    if (!audioUrl) {
      throw new Error('No upload URL returned from AssemblyAI');
    }

    console.log('Audio uploaded successfully, URL:', audioUrl);

    // Step 2: Create transcript using the uploaded audio URL
    assemblyAIRequestBody = {
      audio_url: audioUrl,
    };

    console.log('Creating transcript with audio_url...');
    
    const createResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(assemblyAIRequestBody),
    });

    console.log('AssemblyAI response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      let errorMessage = `Transcription create failed: ${createResponse.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
        console.error('AssemblyAI error details:', errorJson);
      } catch {
        console.error('AssemblyAI error text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    let transcriptData;
    try {
      transcriptData = await createResponse.json();
    } catch (parseError) {
      console.error('Failed to parse AssemblyAI response:', parseError);
      throw new Error('Invalid response from transcription service');
    }

    const { id } = transcriptData;
    if (!id) {
      console.error('No transcript ID in response:', transcriptData);
      throw new Error('No transcript ID returned from AssemblyAI');
    }
    
    console.log('Transcript ID received:', id);

    // Poll AssemblyAI until transcription is complete
    let transcriptText = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        method: 'GET',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('AssemblyAI status error:', errorText);
        throw new Error(`Transcription status failed: ${statusResponse.status}`);
      }

      const statusJson = await statusResponse.json();

      if (statusJson.status === 'completed') {
        transcriptText = statusJson.text || '';
        break;
      }

      if (statusJson.status === 'error') {
        throw new Error(statusJson.error || 'Transcription failed with error status');
      }

      // Not finished yet; wait a bit before polling again
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!transcriptText) {
      throw new Error('Transcription timed out before completion');
    }

    return new Response(
      JSON.stringify({ text: transcriptText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in voice-to-text:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      cause: error?.cause,
    });
    
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.DENO_ENV === 'development' ? error?.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
