import { Play, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.15) saturate(0.3)',
          }}
        />
        {/* Tron grid overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(185 100% 50% / 0.05) 1px, transparent 1px),
              linear-gradient(90deg, hsl(185 100% 50% / 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      {/* Animated Glow Lines */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
          <span className="text-primary font-medium tracking-[0.3em] text-sm uppercase">AI Powered</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight font-display">
          <span className="text-foreground">MUSIC THAT</span>
          <span className="block text-primary glow-text mt-2">
            UNDERSTANDS YOU
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-body tracking-wide">
          Your personal AI music companion. Stream ad-free with emotionally intelligent recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold tracking-wider uppercase glow-primary"
          >
            <Play className="w-5 h-5" />
            Start Listening
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 px-8 py-6 text-lg border-primary/50 text-primary hover:bg-primary/10 hover:border-primary tracking-wider uppercase"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with AI
          </Button>
        </div>

        {/* Stats with Tron styling */}
        <div className="flex flex-wrap gap-12 justify-center mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary glow-text font-display">100M+</div>
            <div className="text-muted-foreground text-sm tracking-widest uppercase mt-1">Songs</div>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <div className="text-center">
            <div className="text-4xl font-bold text-primary glow-text font-display">AD-FREE</div>
            <div className="text-muted-foreground text-sm tracking-widest uppercase mt-1">Experience</div>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
          <div className="text-center">
            <div className="text-4xl font-bold text-accent font-display">AI</div>
            <div className="text-muted-foreground text-sm tracking-widest uppercase mt-1">Powered</div>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px tron-line" />
    </section>
  );
};

export default HeroSection;