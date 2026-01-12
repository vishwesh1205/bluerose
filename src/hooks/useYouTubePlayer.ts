import { useState, useEffect, useCallback, useRef } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

interface UseYouTubePlayerReturn {
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

export const useYouTubePlayer = (): UseYouTubePlayerReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateInterval = useRef<number | null>(null);
  const pendingTrackRef = useRef<Track | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    // Create hidden container for player
    if (!containerRef.current) {
      const container = document.createElement("div");
      container.id = "youtube-player-container";
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "1px";
      container.style.height = "1px";
      document.body.appendChild(container);
      containerRef.current = container;

      const playerDiv = document.createElement("div");
      playerDiv.id = "youtube-player";
      container.appendChild(playerDiv);
    }

    // Load API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else if (window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  const initPlayer = useCallback(() => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player("youtube-player", {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          playerRef.current?.setVolume(volume);
          playerRef.current?.unMute();
          
          // If there's a pending track, play it now
          if (pendingTrackRef.current) {
            const track = pendingTrackRef.current;
            pendingTrackRef.current = null;
            playerRef.current?.loadVideoById(track.videoId);
            playerRef.current?.playVideo();
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          
          if (event.data === window.YT.PlayerState.PLAYING) {
            const dur = playerRef.current?.getDuration() || 0;
            setDuration(dur);
            
            // Start time update interval
            if (timeUpdateInterval.current) {
              clearInterval(timeUpdateInterval.current);
            }
            timeUpdateInterval.current = window.setInterval(() => {
              const time = playerRef.current?.getCurrentTime() || 0;
              setCurrentTime(time);
            }, 500);
          } else {
            if (timeUpdateInterval.current) {
              clearInterval(timeUpdateInterval.current);
            }
          }
        },
      },
    });
  }, [volume]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol);
    setVolumeState(vol);
  }, []);

  const loadTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    
    if (!playerRef.current) {
      // Player not ready yet - store for later
      pendingTrackRef.current = track;
      return;
    }
    
    playerRef.current.loadVideoById(track.videoId);
    playerRef.current.unMute();
    playerRef.current.playVideo();
  }, []);

  const loadVideoById = useCallback((videoId: string, title = "Unknown Title", artist = "Unknown Artist") => {
    const track: Track = {
      id: videoId,
      videoId,
      title,
      artist,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: 0,
    };
    setCurrentTrack(track);
    
    if (!playerRef.current) {
      // Player not ready yet - store for later
      pendingTrackRef.current = track;
      return;
    }
    
    playerRef.current.loadVideoById(videoId);
    playerRef.current.unMute();
    playerRef.current.playVideo();
  }, []);

  return {
    isReady,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    loadTrack,
    loadVideoById,
  };
};
