import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Repeat, Repeat1, Shuffle, ListMusic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AddToPlaylist from "./AddToPlaylist";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const { isPlaying, currentTime, duration, volume, currentTrack, togglePlay, seek, setVolume, shuffle, repeat, autoplay, toggleShuffle, toggleRepeat, toggleAutoplay, playNext, playPrevious } = usePlayer();
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
    if (currentTrackId) toggleLike(currentTrackId);
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-background/90 border-t border-border/50 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <Slider value={[progressPercent]} max={100} step={0.1} className="cursor-pointer" onValueChange={handleProgressChange} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {currentTrack ? (
              <>
                <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-14 h-14 rounded-lg object-cover border border-border/50" />
                <div className="min-w-0">
                  <div className="font-medium truncate text-foreground">{currentTrack.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{currentTrack.artist}</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-lg bg-muted border border-border/50 flex items-center justify-center flex-shrink-0">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1 bg-primary/50 rounded-full" style={{ height: '20px' }} />
                    ))}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate text-muted-foreground">No track selected</div>
                  <div className="text-sm text-muted-foreground/70 truncate">Search or select a song</div>
                </div>
              </>
            )}
            {currentTrack && (
              <div className="flex items-center gap-1">
                {isAuthenticated && (
                  <Button size="icon" variant="ghost" className={`flex-shrink-0 ${currentTrackId && isLiked(currentTrackId) ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`} onClick={handleLike}>
                    <Heart className={`w-5 h-5 ${currentTrackId && isLiked(currentTrackId) ? "fill-current" : ""}`} />
                  </Button>
                )}
                {currentTrackId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <AddToPlaylist trackId={currentTrackId} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border">
                        <p>Add to playlist</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className={shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"} onClick={toggleShuffle}>
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={playPrevious} className="text-muted-foreground hover:text-foreground">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button size="icon" className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={playNext} className="text-muted-foreground hover:text-foreground">
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className={repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"} onClick={toggleRepeat}>
              {repeat === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className={autoplay ? "text-accent" : "text-muted-foreground hover:text-accent"} onClick={toggleAutoplay}>
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border"><p>AI Autoplay {autoplay ? "On" : "Off"}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground"><ListMusic className="w-5 h-5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setVolume(volume > 0 ? 0 : 70)} className="text-muted-foreground hover:text-foreground">
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MusicPlayer;
