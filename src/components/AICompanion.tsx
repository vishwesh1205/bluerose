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
  recommendations?: {
    query: string;
  }[];
}
const AICompanion = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hey! I'm Melodia, your AI music companion 🎵 I can help you discover new music based on your mood, create playlists, or just chat about music. What are you in the mood for today?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchingTrack, setSearchingTrack] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    loadVideoById
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
      const {
        data,
        error
      } = await supabase.functions.invoke("youtube-search", {
        body: {
          query,
          maxResults: 1
        }
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
  const handleQuickAction = (mood: string) => {
    sendMessage(`I'm in the mood for ${mood.toLowerCase()}`);
  };
  return <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      

      
    </section>;
};
export default AICompanion;