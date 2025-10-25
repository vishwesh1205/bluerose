import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles } from "lucide-react";

const AICompanion = () => {
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
            Chat with our AI to discover music that matches your mood, get personalized recommendations, 
            or just talk about your favorite artists.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto backdrop-blur-sm bg-card/50 border-border shadow-2xl">
          <div className="p-6">
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 min-h-[300px] max-h-[400px] overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                  <p className="text-sm">
                    Hey! I'm your AI music companion 🎵 I can help you discover new music, 
                    create playlists based on your mood, or just chat about music. What are you in the mood for today?
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-primary rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                  <p className="text-sm text-primary-foreground">
                    I'm feeling a bit nostalgic. Can you play something that reminds me of summer evenings?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                  <p className="text-sm">
                    Perfect! I've got just the vibe for you 🌅 I'm creating a playlist with warm, 
                    mellow tracks that capture that golden hour feeling. Think indie folk, soft acoustic, 
                    and gentle electronic beats. Ready to listen?
                  </p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input 
                placeholder="Tell me what you're feeling..." 
                className="flex-1 bg-background border-border"
              />
              <Button size="icon" className="bg-primary hover:bg-primary/90 flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Happy vibes", "Focus mode", "Workout energy", "Sleepy time"].map((mood) => (
                <Button 
                  key={mood}
                  size="sm" 
                  variant="outline"
                  className="rounded-full border-primary/30 hover:bg-primary/10"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AICompanion;
