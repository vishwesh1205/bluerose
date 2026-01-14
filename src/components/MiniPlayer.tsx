import { useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, SkipForward } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

const MiniPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPlaying, currentTrack, currentTime, duration, togglePlay, playNext } = usePlayer();

  // Don't show on the Now Playing page or if no track is loaded
  if (location.pathname === "/now-playing" || !currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40">
      <div 
        className="mx-2 mb-1 rounded-xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg overflow-hidden"
        onClick={() => navigate("/now-playing")}
      >
        {/* Progress bar at top */}
        <div className="h-0.5 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div className="flex items-center gap-3 p-2 pr-3">
          {/* Thumbnail */}
          <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground text-background hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext(true);
              }}
              className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
