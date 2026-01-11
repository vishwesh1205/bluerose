import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const industries = [
  {
    id: "kollywood",
    title: "Kollywood",
    description: "Top Tamil Hits",
    gradient: "from-violet-600 to-purple-500",
    language: "Tamil",
  },
  {
    id: "tollywood",
    title: "Tollywood", 
    description: "Top Telugu Hits",
    gradient: "from-pink-600 to-rose-500",
    language: "Telugu",
  },
  {
    id: "bollywood",
    title: "Bollywood",
    description: "Top Hindi Hits",
    gradient: "from-cyan-500 to-teal-500",
    language: "Hindi",
  },
  {
    id: "mollywood",
    title: "Mollywood",
    description: "Top Malayalam Hits",
    gradient: "from-orange-500 to-amber-500",
    language: "Malayalam",
  },
  {
    id: "hollywood",
    title: "Hollywood",
    description: "Top English Hits",
    gradient: "from-blue-600 to-indigo-500",
    language: "English",
  },
  {
    id: "sandalwood",
    title: "Sandalwood",
    description: "Top Kannada Hits",
    gradient: "from-emerald-500 to-green-500",
    language: "Kannada",
  },
];

const TrendingPlaylists = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { loadTrack, addToQueue } = usePlayer();

  const playIndustryPlaylist = async (industry: typeof industries[0]) => {
    setLoadingId(industry.id);
    try {
      const { data, error } = await supabase.functions.invoke('top-charts', {
        body: { industry: industry.title, language: industry.language }
      });

      if (error) throw error;

      const songs = data?.songs || [];
      if (songs.length === 0) {
        toast.error("No songs found");
        return;
      }

      const firstSong = songs[0];
      const searchResponse = await supabase.functions.invoke('youtube-search', {
        body: { query: `${firstSong.song} ${firstSong.artist} ${industry.language} song` }
      });

      if (searchResponse.data?.results?.length > 0) {
        const result = searchResponse.data.results[0];
        loadTrack({
          id: result.videoId,
          videoId: result.videoId,
          title: result.title,
          artist: result.channelTitle,
          thumbnail: result.thumbnail,
          duration: 0
        });

        for (let i = 1; i < Math.min(5, songs.length); i++) {
          const song = songs[i];
          const queueSearch = await supabase.functions.invoke('youtube-search', {
            body: { query: `${song.song} ${song.artist} ${industry.language} song` }
          });
          if (queueSearch.data?.results?.length > 0) {
            const queueResult = queueSearch.data.results[0];
            addToQueue({
              id: queueResult.videoId,
              videoId: queueResult.videoId,
              title: queueResult.title,
              artist: queueResult.channelTitle,
              thumbnail: queueResult.thumbnail,
              duration: 0
            });
          }
        }

        toast.success(`Playing ${industry.title} Top Hits`);
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      toast.error("Failed to load playlist");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="pt-6 pb-20 px-4 relative">
      {/* Abstract orbs */}
      <div className="absolute -left-20 top-1/2 w-40 h-40 bg-secondary/10 rounded-full blur-[80px]" />
      <div className="absolute -right-20 top-1/3 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
      
      <div className="container mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display">
          Regional <span className="gradient-text">Playlists</span>
        </h2>
        <p className="text-muted-foreground mb-8">
          The songs everyone's playing right now — updated to match your world
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {industries.map((industry) => (
            <Card 
              key={industry.id}
              className="group relative overflow-hidden glass-effect border-border/30 hover:border-primary/30 transition-all duration-300 cursor-pointer"
              onClick={() => playIndustryPlaylist(industry)}
            >
              <div className="p-5">
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${industry.gradient} mb-4 flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-5xl font-bold text-white/90 drop-shadow-lg font-display relative z-10">
                    {industry.title.charAt(0)}
                  </span>
                  <Button 
                    size="icon"
                    disabled={loadingId === industry.id}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white border-0 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                  >
                    {loadingId === industry.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-semibold mb-1 text-foreground">{industry.title}</h3>
                <p className="text-sm text-muted-foreground">{industry.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPlaylists;
