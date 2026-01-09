import { useNavigate } from "react-router-dom";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AddToPlaylist from "@/components/AddToPlaylist";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const NowPlayingContent = () => {
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
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
    queue,
    queueIndex
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
    if (currentTrackId) toggleLike(currentTrackId);
  };

  // Generate gradient based on track
  const gradientColors = currentTrack 
    ? "from-primary/30 via-secondary/20 to-background" 
    : "from-muted/30 to-background";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientColors} flex flex-col`}>
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-foreground hover:bg-foreground/10"
        >
          <ChevronDown size={28} />
        </Button>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Now Playing
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/playlists")}
          className="text-foreground hover:bg-foreground/10"
        >
          <ListMusic size={24} />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Album Art */}
        <div className="w-full max-w-sm md:max-w-md aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-background/80">
          {currentTrack ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ListMusic size={80} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="w-full max-w-sm md:max-w-md text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold truncate mb-2">
            {currentTrack?.title || "No track playing"}
          </h1>
          <p className="text-muted-foreground text-lg truncate">
            {currentTrack?.artist || "Search for music to play"}
          </p>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-6 mb-8">
          {isAuthenticated && currentTrackId && (
            <button
              onClick={handleLike}
              className={`transition-colors ${
                isLiked(currentTrackId) ? "text-accent" : "text-muted-foreground hover:text-accent"
              }`}
            >
              <Heart size={28} className={isLiked(currentTrackId) ? "fill-current" : ""} />
            </button>
          )}
          {currentTrackId && <AddToPlaylist trackId={currentTrackId} />}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm md:max-w-md mb-8">
          <Slider
            value={[progressPercent]}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-8 mb-8">
          <Button
            size="icon"
            variant="ghost"
            className={`w-12 h-12 ${shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={24} />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={playPrevious}
            className="w-14 h-14 text-foreground hover:bg-foreground/10"
          >
            <SkipBack size={32} fill="currentColor" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-transform shadow-xl"
          >
            {isPlaying ? (
              <Pause size={40} fill="currentColor" />
            ) : (
              <Play size={40} fill="currentColor" className="ml-1" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={playNext}
            className="w-14 h-14 text-foreground hover:bg-foreground/10"
          >
            <SkipForward size={32} fill="currentColor" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className={`w-12 h-12 ${repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={toggleRepeat}
          >
            {repeat === "one" ? <Repeat1 size={24} /> : <Repeat size={24} />}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 w-full max-w-xs">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 70)}
            className="text-muted-foreground hover:text-foreground"
          >
            {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        {/* Queue Info */}
        {queue.length > 1 && (
          <div className="mt-8 text-sm text-muted-foreground">
            Track {queueIndex + 1} of {queue.length}
          </div>
        )}
      </div>
    </div>
  );
};

const NowPlaying = () => {
  return (
    <PlayerProvider>
      <NowPlayingContent />
    </PlayerProvider>
  );
};

export default NowPlaying;
