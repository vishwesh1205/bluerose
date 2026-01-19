import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYouTubeSearch, SearchTrack } from "@/hooks/useYouTubeSearch";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import AddToPlaylist from "@/components/AddToPlaylist";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";
import MiniPlayer from "@/components/MiniPlayer";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
const SearchContent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const {
    results,
    loading,
    search,
    clearResults
  } = useYouTubeSearch();
  const {
    loadTrack
  } = usePlayer();
  const {
    isLiked
  } = useLikedTracks();
  const lastSearchedRef = useRef("");
  const isYouTubeUrl = (text: string) => {
    const youtubePatterns = [/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/, /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
    return youtubePatterns.some(pattern => pattern.test(text.trim()));
  };
  const extractVideoId = (text: string): string | null => {
    const patterns = [/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/, /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
    for (const pattern of patterns) {
      const match = text.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Auto-search on debounced query change
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed && trimmed.length >= 2 && !isYouTubeUrl(trimmed) && trimmed !== lastSearchedRef.current) {
      lastSearchedRef.current = trimmed;
      search(trimmed);
    }
  }, [debouncedQuery, search]);
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    if (isYouTubeUrl(searchQuery)) {
      const videoId = extractVideoId(searchQuery);
      if (videoId) {
        const track = {
          id: videoId,
          videoId: videoId,
          title: "Loading...",
          artist: "Unknown Artist",
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: 0
        };
        loadTrack(track);
        navigate("/now-playing");
        setSearchQuery("");
      }
    } else {
      lastSearchedRef.current = searchQuery.trim();
      await search(searchQuery);
    }
  }, [searchQuery, search, loadTrack, navigate]);
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  const handlePlayTrack = useCallback((track: SearchTrack) => {
    const playerTrack = {
      id: track.id,
      videoId: track.videoId,
      title: track.title,
      artist: track.artists.join(", "),
      thumbnail: track.thumbnail,
      duration: track.duration
    };
    console.log("Playing track:", playerTrack);
    loadTrack(playerTrack);
    navigate("/now-playing");
  }, [loadTrack, navigate]);
  return <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AppSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 custom-scrollbar">
          {/* Search Header */}
          <div className="mb-8 mt-2">
            <h2 className="text-3xl font-bold mb-2">Search</h2>
            <p className="text-muted-foreground">
              Find your favorite songs, artists, or paste a YouTube URL
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            
          </div>

          {/* Results */}
          {results.length > 0 && <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Results</h3>
                <Button variant="ghost" size="sm" onClick={clearResults} className="text-muted-foreground hover:text-foreground">
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2">
                {results.map(track => <div key={track.id} className="group flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card border border-border/30 hover:border-primary/30 transition-all duration-300">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      <button onClick={() => handlePlayTrack(track)} className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
                    </div>

                    <div className="flex items-center gap-2">
                      <AddToPlaylist trackId={track.id} />
                      <Button onClick={() => handlePlayTrack(track)} size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>
            </div>}

          {/* Empty State */}
          {results.length === 0 && !loading && <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <SearchIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                Start searching
              </h3>
              <p className="text-muted-foreground/70">
                Search for songs, artists, or paste a YouTube URL to play
              </p>
            </div>}
        </div>

        <MusicPlayer />
        <MiniPlayer />
        <MobileNav />
      </main>
    </div>;
};
export default SearchContent;