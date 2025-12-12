import React, { createContext, useContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useYouTubePlayer, Track } from "@/hooks/useYouTubePlayer";

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
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playAtIndex: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useYouTubePlayer();
  
  // Queue state
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  
  // Track end detection
  const prevIsPlaying = useRef(player.isPlaying);
  const prevCurrentTime = useRef(player.currentTime);
  
  // Detect track end for auto-next
  useEffect(() => {
    const isNearEnd = player.duration > 0 && player.currentTime >= player.duration - 1;
    const wasPaying = prevIsPlaying.current && !player.isPlaying;
    
    if (wasPaying && isNearEnd && queue.length > 0) {
      // Track ended, play next
      if (repeat === "one") {
        player.seek(0);
        player.play();
      } else {
        playNextTrack();
      }
    }
    
    prevIsPlaying.current = player.isPlaying;
    prevCurrentTime.current = player.currentTime;
  }, [player.isPlaying, player.currentTime, player.duration]);

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
      addToQueue,
      removeFromQueue,
      clearQueue,
      playNext: playNextTrack,
      playPrevious: playPreviousTrack,
      playAtIndex,
      toggleShuffle,
      toggleRepeat,
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
