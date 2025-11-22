# Voice-to-Text Transcription Error Troubleshooting

## Error: `{"error":"Transcription create failed: 400"}`

This error indicates that AssemblyAI is rejecting the transcription request. Here's how to fix it:

## Common Causes & Solutions

### 1. **Missing AssemblyAI API Key** (Most Common)

**Problem**: The `ASSEMBLYAI_API_KEY` environment variable is not set in Supabase.

**Solution**:
1. Get your AssemblyAI API key:
   - Go to [https://www.assemblyai.com/](https://www.assemblyai.com/)
   - Sign up or log in
   - Go to your dashboard and copy your API key

2. Set it in Supabase:
   - Go to your Supabase Dashboard: https://supabase.com/dashboard
   - Select your project
   - Go to **Project Settings** → **Edge Functions** → **Secrets**
   - Click **Add new secret**
   - Name: `ASSEMBLYAI_API_KEY`
   - Value: Your AssemblyAI API key
   - Click **Save**

3. Redeploy the function:
   ```bash
   supabase functions deploy voice-to-text
   ```

### 2. **Audio Format Issue**

**Problem**: WebM format might not be fully supported by AssemblyAI's `audio_data` field.

**Solution**: 
- The function now has better error messages that will tell you the exact issue
- AssemblyAI supports: MP3, WAV, M4A, FLAC, OGG, OPUS, WebM
- For larger files (>5MB), consider using `audio_url` instead of `audio_data`

### 3. **Audio File Too Large**

**Problem**: AssemblyAI has limits on `audio_data` size (typically 5MB).

**Solution**: 
- The client now checks file size and shows an error if too large
- For longer recordings, we'd need to implement audio_url upload instead

### 4. **Invalid API Key Format**

**Problem**: The API key might be incorrectly formatted.

**Solution**:
- Ensure the API key doesn't have extra spaces or newlines
- Copy it directly from AssemblyAI dashboard
- In Supabase, make sure there are no quotes around the value

## Testing

After fixing the API key, test the transcription:

1. Make sure your Supabase function is deployed with the latest code
2. Try recording a short audio clip in the AI Chat interface
3. Check the browser console for detailed error messages

## Debugging

To see detailed error messages:

1. Check Supabase Function Logs:
   - Go to Supabase Dashboard
   - Navigate to **Edge Functions** → **voice-to-text** → **Logs**
   - Look for error messages

2. Check Browser Console:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages when you try to transcribe

## Updated Error Messages

The function now returns more detailed errors:
- Missing API key: "Transcription service not configured..."
- Invalid audio: "Invalid audio data format..."
- AssemblyAI errors: Actual error message from AssemblyAI API

## Alternative Solution: Use Different Audio Format

If WebM continues to cause issues, you might need to:
1. Convert audio to MP3/WAV before sending
2. Or use AssemblyAI's upload endpoint first, then use `audio_url`

## Still Having Issues?

1. Verify your AssemblyAI account is active and has credits
2. Check AssemblyAI status page for service issues
3. Review AssemblyAI API documentation: https://www.assemblyai.com/docs/

