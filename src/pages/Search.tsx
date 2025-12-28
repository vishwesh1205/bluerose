import { useState } from "react";
import { Search as SearchIcon, Play, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYouTubeSearch, SearchTrack } from "@/hooks/useYouTubeSearch";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import AddToPlaylist from "@/components/AddToPlaylist";
import Navbar from "@/components/Navbar";
import MusicPlayer from "@/components/MusicPlayer";
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
    
    // Add all results to queue and play selected
    results.forEach((t, idx) => {
      const qTrack = {
        id: t.id,
        videoId: t.videoId,
        title: t.title,
        artist: t.artists.join(", "),
        thumbnail: t.thumbnail,
        duration: t.duration,
      };
      if (idx === results.indexOf(track)) {
        loadTrack(qTrack);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-32 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Search Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text font-display mb-4">
              Search
            </h1>
            <p className="text-muted-foreground text-lg">
              Find your favorite songs, artists, or paste a YouTube URL
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl rounded-2xl" />
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search songs, artists, or paste YouTube URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-6 text-lg bg-card/80 backdrop-blur-sm border-border/50 rounded-xl focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl font-medium"
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
                <h2 className="text-2xl font-bold text-foreground">Results</h2>
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
                    className="group flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card/80 border border-border/30 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Play className="w-6 h-6 text-white fill-white" />
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <SearchIcon className="w-10 h-10 text-primary/60" />
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
      </main>
      <MusicPlayer />
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
