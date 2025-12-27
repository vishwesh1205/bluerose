import { useState, useCallback } from "react";
import { Search, Play, Loader2, Heart, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { useYouTubeSearch, SearchTrack } from "@/hooks/useYouTubeSearch";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";
import AddToPlaylist from "./AddToPlaylist";

const formatDuration = (seconds: number): string => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const demoTracks: SearchTrack[] = [
  {
    id: "yt:jfKfPfyJRdk",
    videoId: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio",
    artists: ["Lofi Girl"],
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg",
    duration: 0,
    source: "youtube",
  },
  {
    id: "yt:5qap5aO4i9A",
    videoId: "5qap5aO4i9A",
    title: "Lofi Hip Hop Mix",
    artists: ["Chillhop Music"],
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg",
    duration: 0,
    source: "youtube",
  },
  {
    id: "yt:lTRiuFIWV54",
    videoId: "lTRiuFIWV54",
    title: "Relaxing Jazz Piano",
    artists: ["Cafe Music BGM"],
    thumbnail: "https://img.youtube.com/vi/lTRiuFIWV54/mqdefault.jpg",
    duration: 0,
    source: "youtube",
  },
  {
    id: "yt:DWcJFNfaw9c",
    videoId: "DWcJFNfaw9c",
    title: "Study With Me",
    artists: ["The Sherry Formula"],
    thumbnail: "https://img.youtube.com/vi/DWcJFNfaw9c/mqdefault.jpg",
    duration: 0,
    source: "youtube",
  },
];

const SearchSection = () => {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { loadVideoById, isReady } = usePlayer();
  const { results, loading, search, clearResults } = useYouTubeSearch();
  const { isLiked, toggleLike } = useLikedTracks();
  const { isAuthenticated } = useAuth();

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTubeUrl = (input: string): boolean => {
    return input.includes('youtube.com') || input.includes('youtu.be') || /^[a-zA-Z0-9_-]{11}$/.test(input.trim());
  };

  const handleSubmit = useCallback(async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Check if it's a YouTube URL or video ID
    if (isYouTubeUrl(trimmedQuery)) {
      const videoId = extractVideoId(trimmedQuery);
      if (videoId) {
        loadVideoById(videoId);
        setQuery("");
        return;
      }
    }

    // Otherwise, perform search
    setHasSearched(true);
    await search(trimmedQuery);
  }, [query, search, loadVideoById]);

  const handlePlayTrack = (track: SearchTrack) => {
    loadVideoById(track.videoId, track.title, track.artists[0] || "Unknown Artist");
  };

  const displayTracks = hasSearched && results.length > 0 ? results : (!hasSearched ? demoTracks : []);

  return (
    <section className="py-16 px-4 relative">
      {/* Abstract decorative orbs */}
      <div className="absolute w-64 h-64 bg-primary/20 -left-32 top-20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-48 h-48 bg-secondary/20 right-0 top-40 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <h2 className="text-3xl font-bold text-center mb-8 font-display">
          <span className="gradient-text">Search</span> & Play
        </h2>

        {/* Unified Search Input */}
        <Card className="p-6 mb-8 glass-effect gradient-border border-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary/60" />
                <div className="w-px h-4 bg-border" />
                <Link2 className="w-4 h-4 text-secondary/60" />
              </div>
              <Input
                type="text"
                placeholder="Search songs, artists or paste YouTube URL..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-20 h-12 bg-background/50 border-border/50 focus:border-primary/50 text-foreground placeholder:text-muted-foreground rounded-lg text-base"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !query.trim() || !isReady}
              className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium rounded-lg transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Search for any song or paste a YouTube link to play instantly
          </p>
        </Card>

        {/* Clear results button */}
        {hasSearched && (
          <div className="text-center mb-6">
            <button 
              onClick={() => { clearResults(); setHasSearched(false); setQuery(""); }}
              className="text-sm text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Clear search results
            </button>
          </div>
        )}

        {/* Section Title */}
        <h3 className="text-lg font-medium mb-4 text-center text-muted-foreground">
          {hasSearched && results.length > 0 
            ? `Found ${results.length} results`
            : hasSearched && results.length === 0 
            ? "No results found"
            : "Quick Play"}
        </h3>

        {/* Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayTracks.map((track) => (
            <Card
              key={track.id}
              className="group p-4 glass-effect border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="relative cursor-pointer flex-shrink-0"
                  onClick={() => handlePlayTrack(track)}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-medium truncate cursor-pointer hover:text-primary transition-colors text-sm"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {track.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artists.join(", ")}
                  </p>
                  {track.duration > 0 && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDuration(track.duration)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {isAuthenticated && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${isLiked(track.id) ? "text-secondary" : "text-muted-foreground hover:text-secondary"}`}
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked(track.id) ? "fill-current" : ""}`} />
                    </Button>
                  )}
                  <AddToPlaylist trackId={track.id} className="h-8 w-8" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!isReady && (
          <p className="text-center text-muted-foreground mt-6 text-sm">
            Loading player...
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
