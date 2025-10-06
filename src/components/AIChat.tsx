import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mockAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("buy") || lowerMessage.includes("should i invest")) {
      return "Based on current market analysis, I'd recommend diversifying your portfolio. Consider factors like your risk tolerance, investment timeline, and market volatility. For specific stock recommendations, check the Analysis page for AI-powered predictions with confidence scores.";
    } else if (lowerMessage.includes("aapl") || lowerMessage.includes("apple")) {
      return "Apple (AAPL) is currently showing strong fundamentals with positive momentum indicators. The stock is trading above both 50-day and 200-day moving averages, suggesting a bullish trend. Check the Analysis page for detailed AI predictions.";
    } else if (lowerMessage.includes("market") || lowerMessage.includes("trend")) {
      return "Current market conditions show moderate volatility with tech sector leading gains. The Market Heatmap on the Screener page provides real-time industry performance. I recommend monitoring key indicators like RSI and MACD for timing your trades.";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      return "I can help you with:\n• Stock analysis and predictions\n• Market trends and insights\n• Portfolio recommendations\n• Technical indicator explanations\n• Investment strategies\n\nJust ask me anything!";
    } else {
      return "That's an interesting question! Based on current market data and AI analysis, I suggest checking the Screener for real-time performance charts and the Analysis page for detailed predictions. What specific stocks are you interested in?";
    }
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: mockAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
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
