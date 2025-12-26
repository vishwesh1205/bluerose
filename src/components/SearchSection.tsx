import { useState, useCallback, useEffect } from "react";
import { Search, Play, Music2, Loader2, Plus, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { useYouTubeSearch, SearchTrack } from "@/hooks/useYouTubeSearch";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
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

  const handlePlayUrl = () => {
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      loadVideoById(videoId);
      setYoutubeUrl("");
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      await search(searchQuery);
    }
  }, [searchQuery, search]);

  const handlePlayTrack = (track: SearchTrack) => {
    loadVideoById(track.videoId, track.title, track.artists[0] || "Unknown Artist");
  };

  const displayTracks = hasSearched && results.length > 0 ? results : (!hasSearched ? demoTracks : []);

  return (
    <section className="py-16 px-4 relative">
      {/* Section divider line */}
      <div className="absolute top-0 left-0 right-0 h-px tron-line" />
      
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8 font-display tracking-wide">
          <span className="text-primary glow-text">SEARCH</span> & PLAY
        </h2>

        {/* YouTube URL Input */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
              <Input
                type="text"
                placeholder="Paste YouTube URL or Video ID..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="pl-10 bg-background/50 border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handlePlayUrl()}
              />
            </div>
            <Button 
              onClick={handlePlayUrl} 
              disabled={!isReady || !youtubeUrl}
              className="bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider uppercase glow-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          </div>
        </Card>

        {/* Search Input */}
        <div className="mb-8">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/50" />
              <Input
                type="text"
                placeholder="Search for songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchQuery.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground tracking-wider uppercase"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
          {hasSearched && (
            <div className="text-center mt-2">
              <button 
                onClick={() => { clearResults(); setHasSearched(false); setSearchQuery(""); }}
                className="text-sm text-primary/70 hover:text-primary transition-colors"
              >
                Clear search results
              </button>
            </div>
          )}
        </div>

        {/* Section Title */}
        <h3 className="text-xl font-semibold mb-4 text-center tracking-wide">
          {hasSearched && results.length > 0 
            ? `Found ${results.length} results`
            : hasSearched && results.length === 0 
            ? "No results found"
            : "QUICK PLAY"}
        </h3>

        {/* Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayTracks.map((track) => (
            <Card
              key={track.id}
              className="group p-4 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_15px_hsl(185_100%_50%/0.15)]"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {track.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.join(", ")}
                  </p>
                  {track.duration > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(track.duration)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isAuthenticated && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className={isLiked(track.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked(track.id) ? "fill-current" : ""}`} />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
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
          <p className="text-center text-muted-foreground mt-4 text-sm">
            Loading player...
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchSection;