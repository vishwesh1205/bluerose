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
    color: "from-primary to-secondary",
    language: "Tamil",
  },
  {
    id: "tollywood",
    title: "Tollywood", 
    description: "Top Telugu Hits",
    color: "from-secondary to-primary",
    language: "Telugu",
  },
  {
    id: "bollywood",
    title: "Bollywood",
    description: "Top Hindi Hits",
    color: "from-accent to-primary",
    language: "Hindi",
  },
  {
    id: "mollywood",
    title: "Mollywood",
    description: "Top Malayalam Hits",
    color: "from-primary to-accent",
    language: "Malayalam",
  },
  {
    id: "hollywood",
    title: "Hollywood",
    description: "Top English Hits",
    color: "from-secondary to-accent",
    language: "English",
  },
  {
    id: "sandalwood",
    title: "Sandalwood",
    description: "Top Kannada Hits",
    color: "from-accent to-secondary",
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
    <section className="py-20 px-4 relative">
      {/* Section divider line */}
      <div className="absolute top-0 left-0 right-0 h-px tron-line" />
      
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 font-display tracking-wide">
          REGIONAL <span className="text-primary glow-text">PLAYLISTS</span>
        </h2>
        <p className="text-muted-foreground mb-8 tracking-wide">
          The songs everyone's playing right now — updated to match your world
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {industries.map((industry) => (
            <Card 
              key={industry.id}
              className="group relative overflow-hidden bg-card/50 border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_hsl(185_100%_50%/0.2)]"
              onClick={() => playIndustryPlaylist(industry)}
            >
              <div className="p-5">
                <div className={`w-full aspect-square rounded bg-gradient-to-br ${industry.color} mb-4 flex items-center justify-center relative overflow-hidden`}>
                  {/* Grid overlay */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `
                        linear-gradient(hsl(220 20% 4% / 0.8) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(220 20% 4% / 0.8) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <span className="text-5xl font-bold text-primary-foreground drop-shadow-lg font-display relative z-10">
                    {industry.title.charAt(0)}
                  </span>
                  <Button 
                    size="icon"
                    disabled={loadingId === industry.id}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-background/90 hover:bg-background text-primary border border-primary/50 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all glow-primary"
                  >
                    {loadingId === industry.id ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </div>
                <h3 className="font-semibold mb-1 text-foreground tracking-wide">{industry.title}</h3>
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