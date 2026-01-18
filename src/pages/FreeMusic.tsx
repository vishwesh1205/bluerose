import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Play, Loader2, Download, Music, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJamendoSearch, JamendoTrack } from "@/hooks/useJamendoSearch";
import { usePlayer } from "@/contexts/PlayerContext";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import MiniPlayer from "@/components/MiniPlayer";
import { toast } from "sonner";

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const FreeMusicContent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  
  const { results, trending, loading, error, search, fetchTrending, getDownloadUrl, clearResults } = useJamendoSearch();
  const { loadTrack } = usePlayer();

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      search(searchQuery);
    }
  }, [searchQuery, search]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePlayTrack = useCallback((track: JamendoTrack) => {
    const playerTrack = {
      id: track.id,
      videoId: track.videoId,
      title: track.title,
      artist: track.artists.join(", "),
      thumbnail: track.thumbnail,
      duration: track.duration,
      audioUrl: track.audioUrl, // Jamendo provides direct audio URL
    };
    loadTrack(playerTrack);
    navigate("/now-playing");
  }, [loadTrack, navigate]);

  const handleDownload = useCallback(async (track: JamendoTrack) => {
    if (!track.downloadAllowed) {
      toast.error("Download not available for this track");
      return;
    }

    setIsDownloading(track.id);
    toast.info("Starting download...");

    try {
      const downloadInfo = await getDownloadUrl(track.videoId);
      
      if (downloadInfo) {
        // Create hidden link and trigger download
        const link = document.createElement('a');
        link.href = downloadInfo.url;
        link.download = downloadInfo.filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Download failed");
    } finally {
      setIsDownloading(null);
    }
  }, [getDownloadUrl]);

  const displayTracks = results.length > 0 ? results : trending;
  const showingTrending = results.length === 0;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 custom-scrollbar">
          {/* Header */}
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3 mb-2">
              <Music className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Free Music</h2>
              <Badge variant="secondary" className="text-xs">Creative Commons</Badge>
            </div>
            <p className="text-muted-foreground">
              Discover and download free, legal music from Jamendo
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search free music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-6 text-lg bg-card border-border rounded-xl focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                size="icon"
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SearchIcon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
              {error}
            </div>
          )}

          {/* Section Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {showingTrending ? (
                <>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Trending This Week</h3>
                </>
              ) : (
                <h3 className="text-xl font-bold">Search Results</h3>
              )}
            </div>
            {results.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearResults();
                  setSearchQuery("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Track List */}
          {loading && displayTracks.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayTracks.length > 0 ? (
            <div className="space-y-2">
              {displayTracks.map((track) => (
                <div
                  key={track.id}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card border border-border/30 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Play className="w-6 h-6 text-foreground fill-foreground" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artists.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {track.albumName} • {formatDuration(track.duration)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.downloadAllowed && (
                      <Button
                        onClick={() => handleDownload(track)}
                        disabled={isDownloading === track.id}
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-primary"
                        title="Download MP3"
                      >
                        {isDownloading === track.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => handlePlayTrack(track)}
                      size="sm"
                      className="bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Music className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                No tracks found
              </h3>
              <p className="text-muted-foreground/70">
                Try a different search term
              </p>
            </div>
          )}

          {/* License Info */}
          <div className="mt-8 p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
            <p>
              🎵 All music is licensed under Creative Commons. You can legally download and use these tracks.
              Please check individual track licenses for attribution requirements.
            </p>
          </div>
        </div>

        <MusicPlayer />
        <MiniPlayer />
        <MobileNav />
      </main>
    </div>
  );
};

export default FreeMusicContent;