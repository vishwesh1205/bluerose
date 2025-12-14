import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles, Music, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: { query: string }[];
}

const AICompanion = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm Melodia, your AI music companion 🎵 I can help you discover new music based on your mood, create playlists, or just chat about music. What are you in the mood for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchingTrack, setSearchingTrack] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { loadVideoById } = usePlayer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchAndPlay = async (query: string) => {
    setSearchingTrack(query);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-search", {
        body: { query, maxResults: 1 },
      });

      if (error) throw error;

      const track = data?.results?.[0];
      if (track) {
        loadVideoById(track.videoId, track.title, track.artist);
        toast.success(`Now playing: ${track.title}`);
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

  const handleQuickAction = (mood: string) => {
    sendMessage(`I'm in the mood for ${mood.toLowerCase()}`);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Music <span className="text-primary">Companion</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chat with Melodia to discover music that matches your mood, get personalized
            recommendations, or just talk about your favorite artists.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto backdrop-blur-sm bg-card/50 border-border shadow-2xl">
          <div className="p-6">
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 min-h-[300px] max-h-[400px] overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary rounded-tr-none text-primary-foreground"
                        : "bg-muted rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Recommendations */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs opacity-70">Click to play:</p>
                        {msg.recommendations.map((rec, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="secondary"
                            className="w-full justify-start gap-2 text-left"
                            onClick={() => searchAndPlay(rec.query)}
                            disabled={searchingTrack === rec.query}
                          >
                            {searchingTrack === rec.query ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Music className="w-4 h-4" />
                            )}
                            <span className="truncate">{rec.query}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what you're feeling..."
                className="flex-1 bg-background border-border"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Happy vibes", "Focus mode", "Workout energy", "Sleepy time"].map(
                (mood) => (
                  <Button
                    key={mood}
                    size="sm"
                    variant="outline"
                    className="rounded-full border-primary/30 hover:bg-primary/10"
                    onClick={() => handleQuickAction(mood)}
                    disabled={isLoading}
                  >
                    {mood}
                  </Button>
                )
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AICompanion;
