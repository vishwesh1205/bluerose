import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Repeat, Repeat1, Shuffle, ListMusic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    togglePlay,
    seek,
    setVolume,
    shuffle,
    repeat,
    autoplay,
    toggleShuffle,
    toggleRepeat,
    toggleAutoplay,
    playNext,
    playPrevious,
  } = usePlayer();
  
  const { isLiked, toggleLike } = useLikedTracks();
  const { isAuthenticated } = useAuth();

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTrackId = currentTrack ? `yt:${currentTrack.videoId}` : null;

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleLike = () => {
    if (currentTrackId) {
      toggleLike(currentTrackId);
    }
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-card/95 border-t border-border shadow-2xl z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider 
            value={[progressPercent]} 
            max={100} 
            step={0.1} 
            className="cursor-pointer" 
            onValueChange={handleProgressChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {currentTrack ? (
              <>
                <img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{currentTrack.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{currentTrack.artist}</div>
                </div>
              </>
            ) : (
              <>
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
                  <div className="font-semibold truncate text-muted-foreground">No track selected</div>
                  <div className="text-sm text-muted-foreground truncate">Search or select a song</div>
                </div>
              </>
            )}
            {isAuthenticated && currentTrack && (
              <Button 
                size="icon" 
                variant="ghost" 
                className={`flex-shrink-0 ${currentTrackId && isLiked(currentTrackId) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                onClick={handleLike}
              >
                <Heart className={`w-5 h-5 ${currentTrackId && isLiked(currentTrackId) ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              className={shuffle ? "text-primary" : "text-muted-foreground"}
              onClick={toggleShuffle}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={playPrevious}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            <Button size="icon" variant="ghost" onClick={playNext}>
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className={repeat !== "off" ? "text-primary" : "text-muted-foreground"}
              onClick={toggleRepeat}
            >
              {repeat === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Volume, Autoplay & Queue */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className={autoplay ? "text-primary" : "text-muted-foreground"}
                    onClick={toggleAutoplay}
                  >
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Autoplay {autoplay ? "On" : "Off"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="icon" variant="ghost" className="text-muted-foreground">
              <ListMusic className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setVolume(volume > 0 ? 0 : 70)}
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
            <Slider 
              value={[volume]} 
              max={100} 
              step={1} 
              className="w-24" 
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayer;
