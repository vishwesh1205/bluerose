import { useState } from "react";
import { Search, Play, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePlayer } from "@/contexts/PlayerContext";

// Demo tracks with real YouTube video IDs (royalty-free music)
const demoTracks = [
  {
    id: "1",
    videoId: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio",
    artist: "Lofi Girl",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg",
  },
  {
    id: "2",
    videoId: "5qap5aO4i9A",
    title: "Lofi Hip Hop Mix",
    artist: "Chillhop Music",
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg",
  },
  {
    id: "3",
    videoId: "lTRiuFIWV54",
    title: "Relaxing Jazz Piano",
    artist: "Cafe Music BGM",
    thumbnail: "https://img.youtube.com/vi/lTRiuFIWV54/mqdefault.jpg",
  },
  {
    id: "4",
    videoId: "DWcJFNfaw9c",
    title: "Study With Me",
    artist: "The Sherry Formula",
    thumbnail: "https://img.youtube.com/vi/DWcJFNfaw9c/mqdefault.jpg",
  },
];

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const { loadVideoById, loadTrack, isReady } = usePlayer();

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

  const filteredTracks = demoTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Play Any YouTube Video
          </span>
        </h2>

        {/* YouTube URL Input */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Music2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Paste YouTube URL or Video ID..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === "Enter" && handlePlayUrl()}
              />
            </div>
            <Button 
              onClick={handlePlayUrl} 
              disabled={!isReady || !youtubeUrl}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example: https://youtube.com/watch?v=dQw4w9WgXcQ or just the video ID
          </p>
        </Card>

        {/* Search Demo Tracks */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search demo tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        {/* Demo Tracks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTracks.map((track) => (
            <Card
              key={track.id}
              className="group p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 cursor-pointer"
              onClick={() => loadTrack({ ...track, duration: 0 })}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
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
