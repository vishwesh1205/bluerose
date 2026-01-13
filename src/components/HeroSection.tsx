import { Play, Music2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAuth } from "@/hooks/useAuth";

interface RecentTrack {
  id: string;
  title: string;
  artists: string[];
  thumbnail: string | null;
  video_id: string;
  duration: number | null;
}

const HeroSection = () => {
  const { user } = useAuth();
  const { loadTrack } = usePlayer();
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = ["For You", "Relax", "Workout", "Focus", "Party", "Travel"];
  const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-amber-600"];

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get the 4 most recent unique tracks from listening history
        const { data: historyData, error: historyError } = await supabase
          .from('listening_history')
          .select('track_id, played_at')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(20);

        if (historyError) throw historyError;

        // Get unique track IDs (first 4)
        const uniqueTrackIds: string[] = [];
        for (const item of historyData || []) {
          if (!uniqueTrackIds.includes(item.track_id) && uniqueTrackIds.length < 4) {
            uniqueTrackIds.push(item.track_id);
          }
        }

        if (uniqueTrackIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch track details
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('id, title, artists, thumbnail, video_id, duration')
          .in('id', uniqueTrackIds);

        if (tracksError) throw tracksError;

        // Maintain order from history
        const orderedTracks = uniqueTrackIds
          .map(id => tracksData?.find(t => t.id === id))
          .filter((t): t is RecentTrack => t !== undefined);

        setRecentTracks(orderedTracks);
      } catch (error) {
        console.error('Error fetching recently played:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyPlayed();
  }, [user]);

  const handlePlayTrack = (track: RecentTrack) => {
    loadTrack({
      id: track.id,
      title: track.title,
      artist: track.artists?.join(', ') || 'Unknown Artist',
      thumbnail: track.thumbnail || '',
      videoId: track.video_id,
      duration: track.duration || 0,
    });
  };
  return <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 custom-scrollbar">
      {/* Welcome & Categories */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-bold mb-6">Good evening</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat, i) => <button key={i} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${i === 0 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
              {cat}
            </button>)}
        </div>
      </div>

      {/* Featured Album Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl group">
        
        
        
      </section>

      {/* Recently Played Grid */}
      {user && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-muted-foreground" />
            Recently Played
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center bg-card border border-border/30 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-16 h-16 bg-muted shrink-0" />
                  <div className="px-4 py-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTracks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentTracks.map((track, index) => (
                <div 
                  key={track.id} 
                  onClick={() => handlePlayTrack(track)}
                  className="group flex items-center bg-card border border-border/30 rounded-xl overflow-hidden hover:bg-muted/60 transition-all cursor-pointer relative"
                >
                  <div className="w-16 h-16 shrink-0 overflow-hidden">
                    {track.thumbnail ? (
                      <img 
                        src={track.thumbnail} 
                        alt={track.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${colors[index % colors.length]} flex items-center justify-center`}>
                        <Music2 size={24} className="text-primary-foreground/80" />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artists?.join(', ') || 'Unknown Artist'}
                    </p>
                  </div>
                  <button className="absolute right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 p-2.5 bg-primary rounded-full shadow-xl transition-all duration-300">
                    <Play size={16} fill="white" className="ml-0.5 text-primary-foreground" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Play some songs to see your recently played tracks here!</p>
          )}
        </div>
      )}

    </div>;
};
export default HeroSection;