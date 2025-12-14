import React, { createContext, useContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useYouTubePlayer, Track } from "@/hooks/useYouTubePlayer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlayerContextType {
  // Player state
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: Track | null;
  
  // Player controls
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  loadTrack: (track: Track) => void;
  loadVideoById: (videoId: string, title?: string, artist?: string) => void;
  
  // Queue controls
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  autoplay: boolean;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playAtIndex: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleAutoplay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useYouTubePlayer();
  
  // Queue state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [autoplay, setAutoplay] = useState(true);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [isAutoplayLoading, setIsAutoplayLoading] = useState(false);
  
  // Track end detection
  const prevIsPlaying = useRef(player.isPlaying);
  const prevCurrentTime = useRef(player.currentTime);

  // Track recently played songs for recommendations
  useEffect(() => {
    if (player.currentTrack) {
      setRecentTracks(prev => {
        const filtered = prev.filter(t => t.videoId !== player.currentTrack?.videoId);
        return [player.currentTrack!, ...filtered].slice(0, 10);
      });
    }
  }, [player.currentTrack?.videoId]);

  // Smart autoplay when queue ends
  const fetchAutoplayRecommendation = useCallback(async () => {
    if (!player.currentTrack || isAutoplayLoading) return;
    
    setIsAutoplayLoading(true);
    
    try {
      const hour = new Date().getHours();
      let timeOfDay = "afternoon";
      if (hour >= 6 && hour < 12) timeOfDay = "morning";
      else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
      else if (hour >= 18 && hour < 22) timeOfDay = "evening";
      else timeOfDay = "night";

      console.log("Fetching autoplay recommendation...");
      
      const { data, error } = await supabase.functions.invoke('autoplay-recommend', {
        body: {
          currentTrack: player.currentTrack,
          recentTracks: recentTracks,
          likedTracks: [], // Could fetch from useLikedTracks if needed
          timeOfDay
        }
      });

      if (error) {
        console.error("Autoplay error:", error);
        return;
      }

      const recommendations = data?.recommendations || [];
      
      if (recommendations.length > 0) {
        // Search for the first recommendation
        for (const rec of recommendations) {
          try {
            const searchResponse = await supabase.functions.invoke('youtube-search', {
              body: { query: rec.query, maxResults: 1 }
            });
            
            const results = searchResponse.data?.items || [];
            if (results.length > 0) {
              const video = results[0];
              const track: Track = {
                id: video.id.videoId,
                videoId: video.id.videoId,
                title: video.snippet.title,
                artist: video.snippet.channelTitle,
                thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
                duration: 0,
              };
              
              // Add to queue and play
              setQueue(prev => [...prev, track]);
              setQueueIndex(prev => prev + 1);
              player.loadTrack(track);
              
              toast.success(`Playing next: ${track.title}`, {
                description: rec.reason || "Based on your listening"
              });
              
              break; // Found a track, stop searching
            }
          } catch (searchError) {
            console.error("Search error for recommendation:", searchError);
          }
        }
      }
    } catch (error) {
      console.error("Autoplay recommendation failed:", error);
    } finally {
      setIsAutoplayLoading(false);
    }
  }, [player.currentTrack, recentTracks, isAutoplayLoading, player]);

  // Detect track end for auto-next
  useEffect(() => {
    const isNearEnd = player.duration > 0 && player.currentTime >= player.duration - 1;
    const wasPaying = prevIsPlaying.current && !player.isPlaying;
    
    if (wasPaying && isNearEnd) {
      if (repeat === "one") {
        player.seek(0);
        player.play();
      } else if (queue.length > 0 && queueIndex < queue.length - 1) {
        // Play next in queue
        playNextTrack();
      } else if (repeat === "all" && queue.length > 0) {
        // Loop back to start
        playNextTrack();
      } else if (autoplay && !isAutoplayLoading) {
        // Queue ended, fetch AI recommendation
        fetchAutoplayRecommendation();
      }
    }
    
    prevIsPlaying.current = player.isPlaying;
    prevCurrentTime.current = player.currentTime;
  }, [player.isPlaying, player.currentTime, player.duration, repeat, autoplay, queue.length, queueIndex]);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playNextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex: number;
    
    if (shuffle) {
      const available = queue.map((_, i) => i).filter((i) => i !== queueIndex);
      if (available.length === 0) {
        nextIndex = queueIndex;
      } else {
        nextIndex = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }

    setQueueIndex(nextIndex);
    const track = queue[nextIndex];
    if (track) {
      player.loadTrack(track);
    }
  }, [queue, queueIndex, shuffle, repeat, player]);

  const playPreviousTrack = useCallback(() => {
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (player.currentTime > 3) {
      player.seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeat === "all") {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    setQueueIndex(prevIndex);
    const track = queue[prevIndex];
    if (track) {
      player.loadTrack(track);
    }
  }, [queue, queueIndex, repeat, player]);

  const playAtIndex = useCallback((index: number) => {
    if (index < 0 || index >= queue.length) return;
    setQueueIndex(index);
    const track = queue[index];
    if (track) {
      player.loadTrack(track);
    }
  }, [queue, player]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => !prev);
  }, []);

  // Enhanced loadVideoById that adds to queue
  const loadVideoById = useCallback((videoId: string, title?: string, artist?: string) => {
    const track: Track = {
      id: videoId,
      videoId,
      title: title || "Unknown Title",
      artist: artist || "Unknown Artist",
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: 0,
    };
    
    // Add to queue and play
    setQueue((prev) => {
      const newQueue = [...prev, track];
      setQueueIndex(newQueue.length - 1);
      return newQueue;
    });
    
    player.loadTrack(track);
  }, [player]);

  return (
    <PlayerContext.Provider value={{
      ...player,
      loadVideoById,
      queue,
      queueIndex,
      shuffle,
      repeat,
      autoplay,
      addToQueue,
      removeFromQueue,
      clearQueue,
      playNext: playNextTrack,
      playPrevious: playPreviousTrack,
      playAtIndex,
      toggleShuffle,
      toggleRepeat,
      toggleAutoplay,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
