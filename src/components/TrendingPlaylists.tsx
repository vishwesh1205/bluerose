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
    color: "from-yellow-500 to-orange-500",
    language: "Tamil",
  },
  {
    id: "tollywood",
    title: "Tollywood", 
    description: "Top Telugu Hits",
    color: "from-blue-500 to-purple-500",
    language: "Telugu",
  },
  {
    id: "bollywood",
    title: "Bollywood",
    description: "Top Hindi Hits",
    color: "from-pink-500 to-red-500",
    language: "Hindi",
  },
  {
    id: "mollywood",
    title: "Mollywood",
    description: "Top Malayalam Hits",
    color: "from-green-500 to-teal-500",
    language: "Malayalam",
  },
  {
    id: "hollywood",
    title: "Hollywood",
    description: "Top English Hits",
    color: "from-indigo-500 to-blue-500",
    language: "English",
  },
  {
    id: "sandalwood",
    title: "Sandalwood",
    description: "Top Kannada Hits",
    color: "from-amber-500 to-yellow-500",
    language: "Kannada",
  },
];

const TrendingPlaylists = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { loadTrack, addToQueue } = usePlayer();

  const playIndustryPlaylist = async (industry: typeof industries[0]) => {
    setLoadingId(industry.id);
    try {
      // Fetch top charts for this industry
      const { data, error } = await supabase.functions.invoke('top-charts', {
        body: { industry: industry.title, language: industry.language }
      });

      if (error) throw error;

      const songs = data?.songs || [];
      if (songs.length === 0) {
        toast.error("No songs found");
        return;
      }

      // Search and play the first song
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

        // Add next few songs to queue
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
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Regional <span className="text-primary">Playlists</span>
        </h2>
        <p className="text-muted-foreground mb-8">The songs everyone's playing right now — updated to match your world</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {industries.map((industry) => (
            <Card 
              key={industry.id}
              className="group relative overflow-hidden backdrop-blur-sm bg-card/50 border-border hover:bg-card/80 transition-all duration-300 cursor-pointer"
              onClick={() => playIndustryPlaylist(industry)}
            >
              <div className="p-6">
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${industry.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="text-4xl font-bold text-white/90 drop-shadow-lg">
                    {industry.title.charAt(0)}
                  </span>
                  <Button 
                    size="icon"
                    disabled={loadingId === industry.id}
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl"
                  >
                    {loadingId === industry.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-semibold mb-1">{industry.title}</h3>
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
