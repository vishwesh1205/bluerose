import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, Repeat, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

const MusicPlayer = () => {
  return (
    <Card className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-card/95 border-t border-border shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider defaultValue={[33]} max={100} step={1} className="cursor-pointer" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1:24</span>
            <span>3:45</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-white/80 rounded-full animate-wave"
                    style={{ 
                      height: '24px',
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">Midnight Dreams</div>
              <div className="text-sm text-muted-foreground truncate">The Dreamers</div>
            </div>
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary/80 flex-shrink-0">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost">
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button size="icon" className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
              <Play className="w-6 h-6 ml-0.5" />
            </Button>
            <Button size="icon" variant="ghost">
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayer;
