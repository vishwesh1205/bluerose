import { Play, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.1) saturate(0.2)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>

      {/* Abstract floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-primary/80 font-medium text-sm uppercase tracking-widest">AI Powered</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-display">
          <span className="text-foreground">Music that</span>
          <span className="block gradient-text mt-2">
            understands you
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-body">
          Your personal AI music companion. Stream ad-free with emotionally intelligent recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl"
          >
            <Play className="w-5 h-5" />
            Start Listening
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 px-8 py-6 text-lg border-border text-foreground hover:bg-muted/50 rounded-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with AI
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-12 justify-center mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text font-display">100M+</div>
            <div className="text-muted-foreground text-sm mt-1">Songs</div>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text font-display">AD-FREE</div>
            <div className="text-muted-foreground text-sm mt-1">Experience</div>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          <div className="text-center">
            <div className="text-4xl font-bold text-accent font-display">AI</div>
            <div className="text-muted-foreground text-sm mt-1">Powered</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px abstract-line" />
    </section>
  );
};

export default HeroSection;
