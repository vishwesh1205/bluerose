import { Play, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Animated Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          <span className="text-accent font-medium">Powered by AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Music That
          <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Understands You
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Your personal AI music companion. Stream ad-free from YouTube Music with emotionally intelligent recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg shadow-primary/20">
            <Play className="w-5 h-5" />
            Start Listening
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-lg rounded-full border-primary/30 hover:bg-primary/10">
            <MessageCircle className="w-5 h-5" />
            Chat with AI
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 justify-center mt-16 text-sm">
          <div>
            <div className="text-3xl font-bold text-primary">100M+</div>
            <div className="text-muted-foreground">Songs Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-secondary">Ad-Free</div>
            <div className="text-muted-foreground">Pure Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">AI-Powered</div>
            <div className="text-muted-foreground">Smart Recommendations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
