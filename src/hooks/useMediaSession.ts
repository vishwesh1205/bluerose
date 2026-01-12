import { useEffect, useCallback } from "react";
import { Track } from "./useYouTubePlayer";

interface UseMediaSessionOptions {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onSeek?: (time: number) => void;
}

/**
 * Hook to integrate with Media Session API for background playback controls.
 * Enables lock screen controls, notification area controls, and hardware media keys.
 */
export const useMediaSession = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeekForward,
  onSeekBackward,
  onNextTrack,
  onPreviousTrack,
  onSeek,
}: UseMediaSessionOptions) => {
  // Update media session metadata when track changes
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;

    // Set metadata for lock screen / notification
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: "Caffeine Music",
      artwork: [
        { src: currentTrack.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "128x128", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "192x192", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "256x256", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "384x384", type: "image/jpeg" },
        { src: currentTrack.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });
  }, [currentTrack]);

  // Update playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Update position state for seek bar on lock screen
  useEffect(() => {
    if (!("mediaSession" in navigator) || !("setPositionState" in navigator.mediaSession)) return;
    if (duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    } catch (e) {
      // Ignore errors if position state is invalid
    }
  }, [currentTime, duration]);

  // Set up action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", onPlay],
      ["pause", onPause],
      ["previoustrack", onPreviousTrack],
      ["nexttrack", onNextTrack],
      ["seekforward", onSeekForward],
      ["seekbackward", onSeekBackward],
    ];

    // Add seek handler if provided
    if (onSeek) {
      handlers.push([
        "seekto",
        (details) => {
          if (details.seekTime !== undefined) {
            onSeek(details.seekTime);
          }
        },
      ]);
    }

    // Register all handlers
    handlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        console.log(`Media Session action "${action}" is not supported`);
      }
    });

    // Cleanup handlers on unmount
    return () => {
      handlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [onPlay, onPause, onSeekForward, onSeekBackward, onNextTrack, onPreviousTrack, onSeek]);
};
