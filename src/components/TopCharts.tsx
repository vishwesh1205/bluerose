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
const industries = [{
  id: "kollywood",
  name: "Kollywood",
  language: "Tamil",
  flag: "🎬"
}, {
  id: "tollywood",
  name: "Tollywood",
  language: "Telugu",
  flag: "🎥"
}, {
  id: "bollywood",
  name: "Bollywood",
  language: "Hindi",
  flag: "🎭"
}, {
  id: "mollywood",
  name: "Mollywood",
  language: "Malayalam",
  flag: "🎪"
}, {
  id: "hollywood",
  name: "Hollywood",
  language: "English",
  flag: "🌟"
}, {
  id: "sandalwood",
  name: "Sandalwood",
  language: "Kannada",
  flag: "🎦"
}, {
  id: "kpop",
  name: "K-Pop",
  language: "Korean",
  flag: "🇰🇷"
}];
export const TopCharts = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingRank, setPlayingRank] = useState<number | null>(null);
  const [lastPlayedTrackId, setLastPlayedTrackId] = useState<string | null>(null);
  const {
    loadTrack
  } = usePlayer();
  const fetchChart = useCallback(async (industry: string) => {
    setLoading(true);
    setSelectedIndustry(industry);
    setChartData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/top-charts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          industry
        })
      });
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(searchQuery)}&limit=1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
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
  return <section className="py-8 px-4 relative">
      
    </section>;
};