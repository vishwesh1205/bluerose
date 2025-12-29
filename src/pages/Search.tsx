import { useState } from "react";
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
import { PlayerProvider } from "@/contexts/PlayerContext";

const SearchContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading, search, clearResults } = useYouTubeSearch();
  const { loadTrack, addToQueue, queue, playAtIndex } = usePlayer();
  const { likedTrackIds, isLiked } = useLikedTracks();

  const isYouTubeUrl = (text: string) => {
    const youtubePatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    return youtubePatterns.some(pattern => pattern.test(text.trim()));
  };

  const extractVideoId = (text: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = text.trim().match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSearch = async () => {
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
          duration: 0,
        };
        loadTrack(track);
        setSearchQuery("");
      }
    } else {
      await search(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePlayTrack = (track: SearchTrack) => {
    const playerTrack = {
      id: track.id,
      videoId: track.videoId,
      title: track.title,
      artist: track.artists.join(", "),
      thumbnail: track.thumbnail,
      duration: track.duration,
    };
    loadTrack(playerTrack);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
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
            <div className="flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or paste YouTube URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-6 text-lg bg-card border-border rounded-xl focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-8 py-6 bg-primary hover:bg-primary/90 rounded-xl font-medium"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResults}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2">
                {results.map((track) => (
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
                    </div>

                    <div className="flex items-center gap-2">
                      <AddToPlaylist trackId={track.id} />
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
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <SearchIcon className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium text-muted-foreground mb-2">
                Start searching
              </h3>
              <p className="text-muted-foreground/70">
                Search for songs, artists, or paste a YouTube URL to play
              </p>
            </div>
          )}
        </div>

        <MusicPlayer />
        <MobileNav />
      </main>
    </div>
  );
};

const Search = () => {
  return (
    <PlayerProvider>
      <SearchContent />
    </PlayerProvider>
  );
};

export default Search;
