import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestedQuestions = [
  "What are the symptoms of PCOS?",
  "How can I track my menstrual cycle?",
  "What foods help with hormonal balance?",
  "Tips for managing menopause symptoms?",
  "When should I see a gynecologist?",
  "How to deal with period cramps naturally?",
];

const CHAT_URL = `https://hecfiimmqhsgwwjxewqt.supabase.co/functions/v1/health-chat`;
const MAX_RETRIES = 2;

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your **NaariCare Health Assistant** 🌸\n\nI'm here to help you with questions about:\n- 🩺 Menstrual health & cycle tracking\n- 💊 PCOS symptoms & management\n- 🌡️ Menopause & hormonal health\n- 🥗 Nutrition & wellness\n- 🧠 Mental health & stress\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamResponse = useCallback(async (apiMessages: { role: string; content: string }[], retryCount = 0): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date()
      }]);

      const updateMessage = (content: string) => {
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId ? { ...m, content } : m
        ));
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateMessage(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateMessage(assistantContent);
            }
          } catch { /* ignore */ }
        }
      }

      return assistantContent;
    } catch (err) {
      clearTimeout(timeout);

      // Auto-retry on network errors
      if (retryCount < MAX_RETRIES && (err instanceof TypeError || (err as Error).name === "AbortError")) {
        console.log(`Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return streamResponse(apiMessages, retryCount + 1);
      }
      throw err;
    }
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const result = await streamResponse(apiMessages);
      if (!result) {
        // Remove empty assistant message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return last?.role === "assistant" && !last.content ? prev.slice(0, -1) : prev;
        });
        setError("No response received. Please try again.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return last?.role === "assistant" && !last.content ? prev.slice(0, -1) : prev;
      });

      toast({
        title: "Connection issue",
        description: "Could not reach the AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => m.id !== lastUserMessage.id));
      setError(null);
      handleSend(lastUserMessage.content);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hello! I'm your **NaariCare Health Assistant** 🌸\n\nHow can I help you today?",
      timestamp: new Date(),
    }]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-28 md:pb-4 flex flex-col">
        <div className="container mx-auto px-3 sm:px-4 flex-1 flex flex-col max-w-3xl">
          {/* Header */}
          <div className="text-center py-4 sm:py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-foreground">AI Health Assistant</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Chat with NaariCare
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Ask any women's health question — get instant, supportive answers
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-md"
                      : "glass-card rounded-bl-md"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm leading-relaxed text-foreground prose prose-sm prose-invert max-w-none [&>ul]:mt-1 [&>ul]:mb-1 [&>ol]:mt-1 [&>ol]:mb-1 [&>p]:my-1.5 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : isLoading ? (
                        <div className="flex gap-1 py-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-xs sm:text-sm text-destructive truncate">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRetry} className="flex-shrink-0">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="glass-card rounded-2xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about women's health..."
              className="flex-1 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={isLoading}
            />
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-muted-foreground hover:text-foreground"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="accent"
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3">
            ⚕️ General information only — always consult a healthcare provider for medical advice.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
