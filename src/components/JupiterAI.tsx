import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Music, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "@/contexts/PlayerContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: {
    query: string;
  }[];
}

const moodSuggestions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Chill" },
  { emoji: "💪", label: "Workout" },
  { emoji: "🌙", label: "Sleepy" },
  { emoji: "💕", label: "Romantic" },
  { emoji: "📚", label: "Focus" },
];

const JupiterAI = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey there! 🎵 I'm Jupiter, your personal music companion. Tell me how you're feeling or what vibe you're looking for, and I'll find the perfect songs for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchingTrack, setSearchingTrack] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { loadTrack } = usePlayer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchAndPlay = async (query: string) => {
    setSearchingTrack(query);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(query)}&limit=1`
      );

      if (!response.ok) throw new Error("Search failed");

      const results = await response.json();
      if (results.length > 0) {
        const track = results[0];
        loadTrack({
          id: track.id,
          videoId: track.videoId,
          title: track.title,
          artist: track.artists?.[0] || track.channelTitle,
          thumbnail: track.thumbnail,
          duration: track.duration || 0,
        });
        toast.success(`Now playing: ${track.title}`);
        navigate("/now-playing");
      } else {
        toast.error(`Couldn't find: ${query}`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for track");
    } finally {
      setSearchingTrack(null);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("ai-music-chat", {
        body: { message: text, conversationHistory },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        recommendations: data.recommendations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again! 🎵",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodClick = (mood: string) => {
    sendMessage(`I'm in the mood for ${mood.toLowerCase()} music`);
  };

  return (
    <section className="py-8 relative">
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">Jupiter AI</h2>
            <p className="text-sm text-muted-foreground">Your mood-based music companion</p>
          </div>
        </div>

        {/* Chat Card */}
        <Card className="glass-effect border-border/30 overflow-hidden">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Song Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.recommendations.map((rec, recIdx) => (
                        <button
                          key={recIdx}
                          onClick={() => searchAndPlay(rec.query)}
                          disabled={searchingTrack !== null}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-left group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/40 transition-colors">
                            {searchingTrack === rec.query ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <Play className="w-4 h-4 text-primary ml-0.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-foreground">
                              {rec.query}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tap to play
                            </p>
                          </div>
                          <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Jupiter is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mood Suggestions */}
          <div className="px-4 py-3 border-t border-border/30">
            <div className="flex flex-wrap gap-2 mb-3">
              {moodSuggestions.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodClick(mood.label)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-sm transition-colors disabled:opacity-50"
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Tell me your mood..."
                disabled={isLoading}
                className="flex-1 bg-muted/50 border-border/50 focus:border-primary"
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default JupiterAI;
