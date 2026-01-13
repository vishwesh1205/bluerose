import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  const navigate = useNavigate();
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
    playPrevious
  } = usePlayer();
  const {
    isLiked,
    toggleLike
  } = useLikedTracks();
  const {
    isAuthenticated
  } = useAuth();
  const progressPercent = duration > 0 ? currentTime / duration * 100 : 0;
  const currentTrackId = currentTrack ? `yt:${currentTrack.videoId}` : null;
  const handleProgressChange = (value: number[]) => {
    const newTime = value[0] / 100 * duration;
    seek(newTime);
  };
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  const handleLike = () => {
    if (currentTrackId) toggleLike(currentTrackId);
  };
  return <div className="hidden md:flex absolute bottom-0 left-0 right-0 h-24 bg-background/80 backdrop-blur-xl border-t border-border/50 px-4 md:px-6 items-center justify-between z-40">
      {/* Left - Track Info (clickable to open Now Playing) */}
      <div 
        className="flex items-center gap-4 w-1/4 cursor-pointer group"
        onClick={() => currentTrack && navigate("/now-playing")}
      >
        {currentTrack ? <>
            <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden shrink-0 shadow-lg shadow-background/40 group-hover:ring-2 group-hover:ring-primary transition-all">
              <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            {isAuthenticated && <button onClick={handleLike} className={`transition-colors hidden lg:block ${currentTrackId && isLiked(currentTrackId) ? "text-accent" : "text-muted-foreground hover:text-accent"}`}>
                <Heart size={18} className={currentTrackId && isLiked(currentTrackId) ? "fill-current" : ""} />
              </button>}
            {currentTrackId && <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="hidden lg:block">
                      <AddToPlaylist trackId={currentTrackId} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border-border">
                    <p>Add to playlist</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>}
          </> : <>
            <div className="w-14 h-14 bg-muted rounded-lg shrink-0"></div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-bold truncate text-muted-foreground">No track playing</p>
              <p className="text-xs text-muted-foreground truncate">Search for music</p>
            </div>
          </>}
      </div>

      {/* Center - Controls */}
      <div className="flex flex-col items-center gap-2 max-w-[40%] flex-1">
        <div className="flex items-center gap-6">
          <Button size="icon" variant="ghost" className={shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"} onClick={toggleShuffle}>
            <Shuffle size={18} />
          </Button>
          <button onClick={playPrevious} className="text-muted-foreground hover:text-foreground transition-all active:scale-90">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center bg-foreground text-background rounded-full hover:scale-105 transition-transform shadow-xl shadow-foreground/5">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => playNext(true)} className="text-muted-foreground hover:text-foreground transition-all active:scale-90">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <Button size="icon" variant="ghost" className={repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"} onClick={toggleRepeat}>
            {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </Button>
        </div>
        <div className="w-full flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 relative group cursor-pointer">
            <Slider value={[progressPercent]} max={100} step={0.1} onValueChange={handleProgressChange} className="cursor-pointer" />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right - Volume & AI */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              
            </TooltipTrigger>
            <TooltipContent className="bg-card border-border">
              <p>AI Autoplay {autoplay ? "On" : "Off"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center gap-2 group w-32">
          <button onClick={() => setVolume(volume > 0 ? 0 : 70)} className="text-muted-foreground hover:text-foreground shrink-0">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
        </div>
      </div>
    </div>;
};
export default MusicPlayer;