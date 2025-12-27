import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, TrendingUp, Music, RefreshCw } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";
import AddToPlaylist from "./AddToPlaylist";

interface ChartSong {
  rank: number;
  title: string;
  artists: string[];
  movie: string;
  language: string;
}

interface ChartData {
  industry: string;
  language: string;
  chart: ChartSong[];
  generatedAt: string;
}

const industries = [
  { id: "kollywood", name: "Kollywood", language: "Tamil", flag: "🎬" },
  { id: "tollywood", name: "Tollywood", language: "Telugu", flag: "🎥" },
  { id: "bollywood", name: "Bollywood", language: "Hindi", flag: "🎭" },
  { id: "mollywood", name: "Mollywood", language: "Malayalam", flag: "🎪" },
  { id: "hollywood", name: "Hollywood", language: "English", flag: "🌟" },
  { id: "sandalwood", name: "Sandalwood", language: "Kannada", flag: "🎦" },
  { id: "kpop", name: "K-Pop", language: "Korean", flag: "🇰🇷" },
];

export const TopCharts = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingRank, setPlayingRank] = useState<number | null>(null);
  const [lastPlayedTrackId, setLastPlayedTrackId] = useState<string | null>(null);
  const { loadTrack } = usePlayer();

  const fetchChart = useCallback(async (industry: string) => {
    setLoading(true);
    setSelectedIndustry(industry);
    setChartData(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/top-charts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ industry }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch chart");
      }

      const data: ChartData = await response.json();
      setChartData(data);
      toast.success(`Loaded Top 50 ${industry} chart!`);
    } catch (error) {
      console.error("Chart fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load chart");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlaySong = useCallback(async (song: ChartSong) => {
    setPlayingRank(song.rank);
    
    try {
      const searchQuery = `${song.title} ${song.artists[0]} ${song.movie !== "Single" ? song.movie : ""} ${song.language}`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) throw new Error("Search failed");

      const tracks = await response.json();
      
      if (tracks.length > 0) {
        loadTrack(tracks[0]);
        setLastPlayedTrackId(tracks[0].id);
        toast.success(`Playing: ${song.title}`);
      } else {
        toast.error("Couldn't find this song on YouTube");
      }
    } catch (error) {
      console.error("Play error:", error);
      toast.error("Failed to play song");
    } finally {
      setPlayingRank(null);
    }
  }, [loadTrack]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold";
    if (rank === 2) return "bg-primary/60 text-primary-foreground font-bold";
    if (rank === 3) return "bg-primary/40 text-primary-foreground font-bold";
    if (rank <= 10) return "bg-primary/20 text-primary font-semibold border border-primary/30";
    return "bg-muted text-muted-foreground border border-border";
  };

  // Generate a track ID for playlist purposes
  const getTrackIdForSong = (song: ChartSong) => {
    // Create a deterministic ID from the song info
    return `chart:${song.title.toLowerCase().replace(/\s+/g, '-')}-${song.artists[0]?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`;
  };

  return (
    <section className="py-8 px-4 relative">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-display">Top 50 Charts</h2>
          <Badge variant="outline" className="ml-2 border-primary/30 text-primary">AI Curated</Badge>
        </div>

        <p className="text-muted-foreground mb-6">
          The songs everyone's playing right now — updated to match your world.
        </p>

        {/* Industry Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {industries.map((ind) => (
            <Button
              key={ind.id}
              variant={selectedIndustry === ind.id ? "default" : "outline"}
              size="sm"
              onClick={() => fetchChart(ind.id)}
              disabled={loading}
              className={`gap-2 ${
                selectedIndustry === ind.id 
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0" 
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span>{ind.flag}</span>
              {ind.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="glass-effect border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Generating Top 50 {selectedIndustry} chart...
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Curating the hottest tracks just for you
              </p>
            </CardContent>
          </Card>
        )}

        {/* Chart Display */}
        {chartData && !loading && (
          <Card className="glass-effect border-border/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
              <div>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Music className="h-5 w-5 text-primary" />
                  Top 50 {chartData.industry}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {chartData.language} • Updated {new Date(chartData.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchChart(chartData.industry)}
                disabled={loading}
                className="text-muted-foreground hover:text-primary hover:bg-muted/50"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-1">
                  {chartData.chart.map((song) => (
                    <div
                      key={song.rank}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group border-b border-border/20 last:border-0"
                    >
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${getRankStyle(song.rank)}`}>
                        {song.rank}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artists.join(", ")} • {song.movie}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddToPlaylist 
                          trackId={lastPlayedTrackId || getTrackIdForSong(song)} 
                          className="h-8 w-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted/50"
                          onClick={() => handlePlaySong(song)}
                          disabled={playingRank === song.rank}
                        >
                          {playingRank === song.rank ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedIndustry && !loading && (
          <Card className="glass-effect border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                Select an industry above to see the Top 50 trending songs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
