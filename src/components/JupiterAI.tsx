import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Music, Loader2, Play, Bot, Zap } from "lucide-react";
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
const moodSuggestions = [{
  emoji: "😊",
  label: "Happy",
  color: "from-yellow-500 to-orange-500"
}, {
  emoji: "😌",
  label: "Chill",
  color: "from-blue-500 to-cyan-500"
}, {
  emoji: "💪",
  label: "Workout",
  color: "from-red-500 to-pink-500"
}, {
  emoji: "🌙",
  label: "Sleepy",
  color: "from-indigo-500 to-purple-500"
}, {
  emoji: "💕",
  label: "Romantic",
  color: "from-pink-500 to-rose-500"
}, {
  emoji: "📚",
  label: "Focus",
  color: "from-green-500 to-emerald-500"
}];
const JupiterAI = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey there! 🎵 I'm Jupiter, your personal music companion. Tell me how you're feeling or what vibe you're looking for, and I'll find the perfect songs for you!"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchingTrack, setSearchingTrack] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    loadTrack
  } = usePlayer();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const searchAndPlay = async (query: string) => {
    setSearchingTrack(query);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(query)}&limit=1`);
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
          duration: track.duration || 0
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
    const userMessage: Message = {
      role: "user",
      content: text
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      const {
        data,
        error
      } = await supabase.functions.invoke("ai-music-chat", {
        body: {
          message: text,
          conversationHistory
        }
      });
      if (error) throw error;
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        recommendations: data.recommendations
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to get response");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again! 🎵"
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleMoodClick = (mood: string) => {
    sendMessage(`I'm in the mood for ${mood.toLowerCase()} music`);
  };
  return <section className="py-10 relative">
      {/* Background glow effects */}
      <div className="absolute left-1/4 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute right-1/4 bottom-0 w-48 h-48 bg-secondary/5 rounded-full blur-[80px]" />
      
      <div className="container mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
              Jupiter <span className="gradient-text">AI</span>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </h2>
            <p className="text-sm text-muted-foreground">Your intelligent music companion • Powered by AI</p>
          </div>
        </div>

        {/* Main Chat Card */}
        <Card className="glass-effect border-border/40 overflow-hidden shadow-xl shadow-black/20">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
              <div className="flex-1" />
              <span className="text-xs text-muted-foreground/60">Ask me anything about music</span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/5">
            {messages.map((msg, idx) => <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted/80 text-foreground border border-border/30"}`}>
                  {msg.role === "assistant" && <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-primary">Jupiter</span>
                    </div>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Song Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && <div className="mt-4 space-y-2">
                      {msg.recommendations.map((rec, recIdx) => <button key={recIdx} onClick={() => searchAndPlay(rec.query)} disabled={searchingTrack !== null} className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/60 hover:bg-background/90 transition-all text-left group border border-border/20 hover:border-primary/30 hover:shadow-md">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0 group-hover:from-primary/50 group-hover:to-secondary/50 transition-all">
                            {searchingTrack === rec.query ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate text-foreground">
                              {rec.query}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tap to play instantly
                            </p>
                          </div>
                          <Music className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                        </button>)}
                    </div>}
                </div>
              </div>)}

            {isLoading && <div className="flex justify-start">
                <div className="bg-muted/80 rounded-2xl px-4 py-3 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                      animationDelay: '0ms'
                    }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                      animationDelay: '150ms'
                    }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                      animationDelay: '300ms'
                    }} />
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">
                        Finding your vibe...
                      </span>
                    </div>
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Mood Suggestions & Input */}
          <div className="px-5 py-4 border-t border-border/30 bg-gradient-to-r from-transparent via-muted/20 to-transparent">
            {/* Mood Pills */}
            

            {/* Input Area */}
            <div className="flex gap-3">
              <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Tell me your mood or ask for recommendations..." disabled={isLoading} className="flex-1 bg-muted/50 border-border/50 focus:border-primary h-12 text-sm rounded-xl" />
              <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>;
};
export default JupiterAI;