import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, TrendingUp, Music, RefreshCw } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";

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
    if (rank === 1) return "bg-primary text-primary-foreground font-bold glow-primary";
    if (rank === 2) return "bg-primary/70 text-primary-foreground font-bold";
    if (rank === 3) return "bg-primary/50 text-primary-foreground font-bold";
    if (rank <= 10) return "bg-primary/20 text-primary font-semibold border border-primary/30";
    return "bg-muted text-muted-foreground border border-border";
  };

  return (
    <section className="py-8 px-4 relative">
      {/* Section divider line */}
      <div className="absolute top-0 left-0 right-0 h-px tron-line" />
      
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-display tracking-wide">TOP 50 CHARTS</h2>
          <Badge variant="outline" className="ml-2 border-primary/50 text-primary">AI Curated</Badge>
        </div>

        <p className="text-muted-foreground mb-6 tracking-wide">
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
              className={`gap-2 tracking-wide ${
                selectedIndustry === ind.id 
                  ? "bg-primary text-primary-foreground glow-primary" 
                  : "border-primary/30 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10"
              }`}
            >
              <span>{ind.flag}</span>
              {ind.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground tracking-wide">
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
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary/10">
              <div>
                <CardTitle className="flex items-center gap-2 font-display tracking-wide">
                  <Music className="h-5 w-5 text-primary" />
                  TOP 50 {chartData.industry.toUpperCase()}
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
                className="text-primary hover:bg-primary/10"
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
                      className="flex items-center gap-3 p-3 rounded hover:bg-primary/5 transition-colors group border-b border-primary/5 last:border-0"
                    >
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${getRankStyle(song.rank)}`}>
                        {song.rank}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{song.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artists.join(", ")} • {song.movie}
                        </p>
                      </div>

                      {/* Play Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10"
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
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedIndustry && !loading && (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-12 w-12 text-primary/30 mb-4" />
              <p className="text-muted-foreground text-center tracking-wide">
                Select an industry above to see the Top 50 trending songs
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};