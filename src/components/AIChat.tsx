import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, X, Send, Sparkles, Mic, MicOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Stock Assistant. Ask me anything about stocks, market trends, or investment strategies!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

 

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('stock-chat', {
        body: {
          message: input,
          conversationHistory
        }
      });

      if (error) throw error;

      const aiResponse: Message = {
        role: "assistant",
        content: data.message || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      toast.error('Failed to get AI response');
      
      const errorResponse: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Stop timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        await transcribeAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      toast.success("Recording started - speak now");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      
      // Check audio size (AssemblyAI has limits)
      const maxSize = 25 * 1024 * 1024; // 25MB limit
      if (audioBlob.size > maxSize) {
        toast.error('Audio file is too large. Please record a shorter clip.');
        setIsTranscribing(false);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          if (!base64Audio) {
            throw new Error('Failed to encode audio data');
          }
          
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) {
            throw error;
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          if (data?.text) {
            setInput(data.text);
            setRecordingTime(0);
            toast.success("Voice transcribed successfully!");
          } else {
            throw new Error('No transcription text returned');
          }
        } catch (err: any) {
          console.error('Error transcribing audio:', err);
          const errorMessage = err?.message || err?.error || 'Failed to transcribe audio. Please try again.';
          toast.error(errorMessage);
        } finally {
          setIsTranscribing(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read audio file. Please try again.');
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio. Please try again.');
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const suggestedQuestions = [
    "What stocks should I buy today?",
    "Analyze AAPL for me",
    "What's the market trend?",
    "Help me understand RSI",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all hover-scale bg-secondary hover:bg-secondary/90"
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl border-2 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-secondary/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-secondary/20">
                <Sparkles className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Stock Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="space-y-2 pt-4">
                  <p className="text-xs text-muted-foreground">Suggested questions:</p>
                  {suggestedQuestions.map((question, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => {
                        setInput(question);
                        setTimeout(handleSend, 100);
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t space-y-3">
            {/* Recording Status Bar */}
            {(isRecording || isTranscribing) && (
              <div className="space-y-2 animate-fade-in">
                {isRecording && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-destructive/40 rounded-full animate-ping" />
                      <div className="relative w-3 h-3 bg-destructive rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-destructive">Recording...</span>
                        <span className="text-xs font-mono text-destructive/80">{formatTime(recordingTime)}</span>
                      </div>
                      {/* Visual waveform bars */}
                      <div className="flex items-end gap-1 h-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-destructive rounded-full animate-pulse"
                            style={{
                              height: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.6s',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopRecording}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Stop
                    </Button>
                  </div>
                )}
                
                {isTranscribing && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <Loader2 className="h-4 w-4 text-secondary animate-spin" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-secondary">Transcribing audio...</span>
                      <Progress value={undefined} className="mt-2 h-1.5 bg-secondary/20" />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant={isRecording ? "destructive" : isTranscribing ? "outline" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTyping || isTranscribing}
                title={isRecording ? "Stop recording" : "Start voice input"}
                className={isRecording ? "animate-pulse" : ""}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Input
                placeholder={
                  isRecording 
                    ? "Listening... Click stop when done" 
                    : isTranscribing 
                    ? "Transcribing your voice..." 
                    : "Ask me anything..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping || isRecording || isTranscribing}
                className={isRecording ? "border-destructive/50" : ""}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isRecording || isTranscribing}
                className="bg-secondary hover:bg-secondary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
