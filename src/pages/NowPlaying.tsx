import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
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
  ListMusic,
  GripVertical,
  X,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddToPlaylist from "@/components/AddToPlaylist";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const NowPlayingContent = () => {
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
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
    queueIndex,
    playAtIndex,
    removeFromQueue,
    reorderQueue
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderQueue(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Generate gradient based on track
  const gradientColors = currentTrack 
    ? "from-primary/30 via-secondary/20 to-background" 
    : "from-muted/30 to-background";

  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientColors} flex flex-col relative`}>
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
          onClick={() => setShowQueue(!showQueue)}
          className={`text-foreground hover:bg-foreground/10 ${showQueue ? 'text-primary' : ''}`}
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
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`transition-colors ${
              showQueue ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <ListMusic size={28} />
            {upcomingTracks.length > 0 && (
              <span className="sr-only">{upcomingTracks.length} songs in queue</span>
            )}
          </button>
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
            onClick={() => playNext(true)}
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

        {/* Queue Info Button */}
        {queue.length > 1 && (
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className="mt-8 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <span>Track {queueIndex + 1} of {queue.length}</span>
            {showQueue ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        )}
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border rounded-t-3xl max-h-[60vh] flex flex-col z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-lg">Queue</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQueue(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {/* Now Playing */}
            {currentTrack && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Now Playing</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-primary">{currentTrack.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Up Next */}
            {upcomingTracks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Up Next</p>
                <div className="space-y-1">
                  {upcomingTracks.map((track, index) => {
                    const actualIndex = queueIndex + 1 + index;
                    return (
                      <div
                        key={`${track.videoId}-${actualIndex}`}
                        draggable
                        onDragStart={() => handleDragStart(actualIndex)}
                        onDragOver={(e) => handleDragOver(e, actualIndex)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer group transition-colors ${
                          draggedIndex === actualIndex ? 'opacity-50 bg-muted' : ''
                        }`}
                        onClick={() => playAtIndex(actualIndex)}
                      >
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                          <GripVertical size={18} />
                        </div>
                        <img 
                          src={track.thumbnail} 
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(actualIndex);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {upcomingTracks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ListMusic size={40} className="mx-auto mb-3 opacity-50" />
                <p>No upcoming tracks</p>
                <p className="text-sm">Search for music to add to your queue</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default NowPlayingContent;
