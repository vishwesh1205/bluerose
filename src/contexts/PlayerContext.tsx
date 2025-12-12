import React, { createContext, useContext, ReactNode } from "react";
import { useYouTubePlayer, Track } from "@/hooks/useYouTubePlayer";

interface PlayerContextType {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentTrack: Track | null;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  loadTrack: (track: Track) => void;
  loadVideoById: (videoId: string, title?: string, artist?: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useYouTubePlayer();

  return (
    <PlayerContext.Provider value={player}>
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
