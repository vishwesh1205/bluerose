import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Play, Clock, Heart, MoreHorizontal, Shuffle, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import AddToPlaylist from "@/components/AddToPlaylist";
import MusicPlayer from "@/components/MusicPlayer";
import MobileNav from "@/components/MobileNav";

interface ChartSong {
  rank: number;
  title: string;
  artists: string[];
  movie: string;
  language: string;
}

interface TrackResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

const industries: Record<string, { title: string; description: string; gradient: string; language: string }> = {
  kollywood: {
    title: "Kollywood",
    description: "Top 50 Tamil Hits",
    gradient: "from-violet-600 to-purple-500",
    language: "Tamil",
  },
  tollywood: {
    title: "Tollywood",
    description: "Top 50 Telugu Hits",
    gradient: "from-pink-600 to-rose-500",
    language: "Telugu",
  },
  bollywood: {
    title: "Bollywood",
    description: "Top 50 Hindi Hits",
    gradient: "from-cyan-500 to-teal-500",
    language: "Hindi",
  },
  mollywood: {
    title: "Mollywood",
    description: "Top 50 Malayalam Hits",
    gradient: "from-orange-500 to-amber-500",
    language: "Malayalam",
  },
  hollywood: {
    title: "Hollywood",
    description: "Top 50 English Hits",
    gradient: "from-blue-600 to-indigo-500",
    language: "English",
  },
  sandalwood: {
    title: "Sandalwood",
    description: "Top 50 Kannada Hits",
    gradient: "from-emerald-500 to-green-500",
    language: "Kannada",
  },
};

const Charts = () => {
  const { industry } = useParams<{ industry: string }>();
  const navigate = useNavigate();
  const { loadTrack, addToQueue, currentTrack, isPlaying } = usePlayer();
  
  const [chart, setChart] = useState<ChartSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const industryData = industry ? industries[industry.toLowerCase()] : null;

  useEffect(() => {
    if (!industryData) {
      navigate('/');
      return;
    }
    fetchChart();
  }, [industry]);

  const fetchChart = async () => {
    if (!industry) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('top-charts', {
        body: { industry: industry.toLowerCase() }
      });

      if (error) throw error;
      setChart(data?.chart || []);
    } catch (error) {
      console.error('Error fetching chart:', error);
      toast.error("Failed to load chart");
    } finally {
      setLoading(false);
    }
  };

  const playSong = async (song: ChartSong, index: number) => {
    setLoadingIndex(index);
    try {
      const searchQuery = `${song.title} ${song.artists.join(' ')} ${industryData?.language} song`;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(searchQuery)}&limit=1`
      );

      if (!response.ok) throw new Error('Search failed');

      const results = await response.json();
      if (results.length > 0) {
        const result = results[0];
        loadTrack({
          id: result.id,
          videoId: result.videoId,
          title: result.title,
          artist: result.artists?.[0] || result.channelTitle,
          thumbnail: result.thumbnail,
          duration: result.duration || 0
        });
        setPlayingIndex(index);
        navigate('/now-playing');
      } else {
        toast.error("Couldn't find this song");
      }
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error("Failed to play song");
    } finally {
      setLoadingIndex(null);
    }
  };

  const playAll = async () => {
    if (chart.length === 0) return;
    
    // Play first song
    await playSong(chart[0], 0);
    
    // Add rest to queue (limit to first 10 for performance)
    for (let i = 1; i < Math.min(10, chart.length); i++) {
      const song = chart[i];
      try {
        const searchQuery = `${song.title} ${song.artists.join(' ')} ${industryData?.language} song`;
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(searchQuery)}&limit=1`
        );
        
        if (!response.ok) continue;
        
        const results = await response.json();
        if (results.length > 0) {
          const result = results[0];
          addToQueue({
            id: result.id,
            videoId: result.videoId,
            title: result.title,
            artist: result.artists?.[0] || result.channelTitle,
            thumbnail: result.thumbnail,
            duration: result.duration || 0
          });
        }
      } catch (error) {
        console.error('Error adding to queue:', error);
      }
    }
  };

  if (!industryData) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header with gradient */}
      <div className={`relative bg-gradient-to-b ${industryData.gradient} to-background`}>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="relative z-10 px-4 md:px-8 pt-6 pb-8">
          <Button 
            variant="ghost" 
            size="icon"
            className="mb-4 hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Playlist artwork */}
            <div className={`w-48 h-48 md:w-56 md:h-56 rounded-lg bg-gradient-to-br ${industryData.gradient} shadow-2xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-8xl md:text-9xl font-bold text-white/90 drop-shadow-lg font-display">
                {industryData.title.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Playlist</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-display">
                {industryData.title} Top 50
              </h1>
              <p className="text-white/70 mt-2">{industryData.description}</p>
              <p className="text-white/50 text-sm">{chart.length} songs • Updated daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 md:px-8 py-6 flex items-center gap-4">
        <Button 
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
          onClick={playAll}
          disabled={loading || chart.length === 0}
        >
          {isPlaying && playingIndex === 0 ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Shuffle className="w-5 h-5" />
        </Button>
      </div>

      {/* Song list */}
      <div className="px-4 md:px-8">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border/50 mb-2">
          <span>#</span>
          <span>Title</span>
          <span>Album/Movie</span>
          <span className="flex justify-end">
            <Clock className="w-4 h-4" />
          </span>
        </div>

        {/* Songs */}
        <div className="space-y-1">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-3 items-center">
                <Skeleton className="w-5 h-5" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
                <Skeleton className="w-24 h-4 hidden md:block" />
                <Skeleton className="w-10 h-4 ml-auto" />
              </div>
            ))
          ) : (
            chart.map((song, index) => (
              <div 
                key={`${song.rank}-${song.title}`}
                className="group grid grid-cols-[40px_1fr] md:grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 items-center rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => playSong(song, index)}
              >
                {/* Rank / Play button */}
                <div className="flex items-center justify-center">
                  {loadingIndex === index ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-muted-foreground group-hover:hidden">
                        {playingIndex === index ? (
                          <div className="w-3 h-3 flex items-end gap-0.5">
                            <span className="w-1 h-2 bg-primary animate-pulse" />
                            <span className="w-1 h-3 bg-primary animate-pulse delay-75" />
                            <span className="w-1 h-1.5 bg-primary animate-pulse delay-150" />
                          </div>
                        ) : (
                          song.rank
                        )}
                      </span>
                      <Play className="w-4 h-4 hidden group-hover:block text-foreground" fill="currentColor" />
                    </>
                  )}
                </div>

                {/* Title & Artist */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded bg-gradient-to-br ${industryData.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-semibold text-sm">{song.rank}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${playingIndex === index ? 'text-primary' : 'text-foreground'}`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artists.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Movie/Album - hidden on mobile */}
                <p className="text-sm text-muted-foreground truncate hidden md:block">
                  {song.movie}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer />
      <MobileNav />
    </div>
  );
};

export default Charts;
