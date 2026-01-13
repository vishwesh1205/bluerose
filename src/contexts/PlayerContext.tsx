import React, { createContext, useContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useYouTubePlayer, Track } from "@/hooks/useYouTubePlayer";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useLikedTracks } from "@/hooks/useLikedTracks";
import { useAuth } from "@/hooks/useAuth";
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
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playNext: (wasSkipped?: boolean) => void;
  playPrevious: () => void;
  playAtIndex: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleAutoplay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useYouTubePlayer();
  const { user } = useAuth();
  const { likedTracks, likedTrackIds } = useLikedTracks();
  
  // Queue state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [autoplay, setAutoplay] = useState(true);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [skippedTrackIds, setSkippedTrackIds] = useState<string[]>([]);
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

      console.log("Fetching algorithmic recommendation...");
      
      // Build liked tracks data for the recommendation engine
      const likedTracksData = recentTracks
        .filter(t => likedTrackIds.has(t.id))
        .map(t => ({ title: t.title, artist: t.artist, id: t.id }));
      
      // Add skipped info to recent tracks
      const recentTracksWithSkips = recentTracks.map(t => ({
        title: t.title,
        artist: t.artist,
        id: t.id,
        videoId: t.videoId,
        skipped: skippedTrackIds.includes(t.videoId),
      }));

      const { data, error } = await supabase.functions.invoke('autoplay-recommend', {
        body: {
          currentTrack: player.currentTrack,
          recentTracks: recentTracksWithSkips,
          likedTracks: likedTracksData,
          skippedTrackIds: skippedTrackIds.slice(0, 20),
          timeOfDay,
          userId: user?.id,
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
  }, [player.currentTrack, recentTracks, likedTrackIds, skippedTrackIds, user?.id, isAutoplayLoading, player]);

  // Detect track end for auto-next
  useEffect(() => {
    const isNearEnd = player.duration > 0 && player.currentTime >= player.duration - 1;
    const wasPaying = prevIsPlaying.current && !player.isPlaying;
    
    if (wasPaying && isNearEnd) {
      if (repeat === "one") {
        player.seek(0);
        player.play();
      } else if (queue.length > 0 && queueIndex < queue.length - 1) {
        // Play next in queue (natural end, not skipped)
        playNextTrack(false);
      } else if (repeat === "all" && queue.length > 0) {
        // Loop back to start
        playNextTrack(false);
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

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      
      // Update queueIndex if needed
      if (fromIndex === queueIndex) {
        setQueueIndex(toIndex);
      } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
        setQueueIndex((prev) => prev - 1);
      } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
        setQueueIndex((prev) => prev + 1);
      }
      
      return newQueue;
    });
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playNextTrack = useCallback((wasSkipped = false) => {
    // Track skipped songs for recommendation improvement
    if (wasSkipped && player.currentTrack?.videoId) {
      setSkippedTrackIds(prev => {
        const updated = [player.currentTrack!.videoId, ...prev].slice(0, 50);
        return updated;
      });
    }
    
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

  // Seek forward/backward handlers for media session
  const seekForward = useCallback(() => {
    const newTime = Math.min(player.currentTime + 10, player.duration);
    player.seek(newTime);
  }, [player]);

  const seekBackward = useCallback(() => {
    const newTime = Math.max(player.currentTime - 10, 0);
    player.seek(newTime);
  }, [player]);

  // Enable Media Session API for background playback controls
  useMediaSession({
    currentTrack: player.currentTrack,
    isPlaying: player.isPlaying,
    currentTime: player.currentTime,
    duration: player.duration,
    onPlay: player.play,
    onPause: player.pause,
    onSeekForward: seekForward,
    onSeekBackward: seekBackward,
    onNextTrack: playNextTrack,
    onPreviousTrack: playPreviousTrack,
    onSeek: player.seek,
  });

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
      reorderQueue,
      clearQueue,
      playNext: (wasSkipped?: boolean) => playNextTrack(wasSkipped),
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
