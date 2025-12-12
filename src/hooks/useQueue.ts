import { useState, useCallback } from "react";
import { Track } from "./useYouTubePlayer";

export const useQueue = () => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const addMultipleToQueue = useCallback((tracks: Track[]) => {
    setQueue((prev) => [...prev, ...tracks]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  const playNext = useCallback((): Track | null => {
    if (queue.length === 0) return null;

    if (repeat === "one") {
      return queue[currentIndex] || null;
    }

    let nextIndex: number;
    
    if (shuffle) {
      // Get random index excluding current
      const available = queue.map((_, i) => i).filter((i) => i !== currentIndex);
      if (available.length === 0) {
        nextIndex = currentIndex;
      } else {
        nextIndex = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") {
          nextIndex = 0;
        } else {
          return null;
        }
      }
    }

    setCurrentIndex(nextIndex);
    return queue[nextIndex] || null;
  }, [queue, currentIndex, shuffle, repeat]);

  const playPrevious = useCallback((): Track | null => {
    if (queue.length === 0) return null;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeat === "all") {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    setCurrentIndex(prevIndex);
    return queue[prevIndex] || null;
  }, [queue, currentIndex, repeat]);

  const playAtIndex = useCallback((index: number): Track | null => {
    if (index < 0 || index >= queue.length) return null;
    setCurrentIndex(index);
    return queue[index];
  }, [queue]);

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

  const moveInQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      return newQueue;
    });

    // Adjust current index if needed
    if (fromIndex === currentIndex) {
      setCurrentIndex(toIndex);
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex]);

  return {
    queue,
    currentIndex,
    currentTrackInQueue: queue[currentIndex] || null,
    shuffle,
    repeat,
    addToQueue,
    addMultipleToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    playAtIndex,
    toggleShuffle,
    toggleRepeat,
    moveInQueue,
    setQueue,
    setCurrentIndex,
  };
};
