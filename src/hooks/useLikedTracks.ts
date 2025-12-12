import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface LikedTrack {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: number;
  liked_at: string;
}

export const useLikedTracks = () => {
  const { user, isAuthenticated } = useAuth();
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchLikedTracks = useCallback(async () => {
    if (!isAuthenticated) {
      setLikedTracks([]);
      setLikedTrackIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("liked_tracks")
        .select(`
          liked_at,
          tracks (
            id,
            video_id,
            title,
            artists,
            thumbnail,
            duration
          )
        `)
        .order("liked_at", { ascending: false });

      if (error) throw error;

      const tracks = (data || []).map((item: any) => ({
        id: item.tracks.id,
        videoId: item.tracks.video_id,
        title: item.tracks.title,
        artists: item.tracks.artists || [],
        thumbnail: item.tracks.thumbnail,
        duration: item.tracks.duration,
        liked_at: item.liked_at,
      }));

      setLikedTracks(tracks);
      setLikedTrackIds(new Set(tracks.map((t) => t.id)));
    } catch (err) {
      console.error("Error fetching liked tracks:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLikedTracks();
  }, [fetchLikedTracks]);

  const isLiked = useCallback((trackId: string) => {
    return likedTrackIds.has(trackId);
  }, [likedTrackIds]);

  const toggleLike = useCallback(async (trackId: string) => {
    if (!user) {
      toast.error("Please sign in to like tracks");
      return;
    }

    const wasLiked = likedTrackIds.has(trackId);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from("liked_tracks")
          .delete()
          .eq("user_id", user.id)
          .eq("track_id", trackId);

        if (error) throw error;

        setLikedTrackIds((prev) => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
        setLikedTracks((prev) => prev.filter((t) => t.id !== trackId));
        toast.success("Removed from liked songs");
      } else {
        const { error } = await supabase
          .from("liked_tracks")
          .insert({
            user_id: user.id,
            track_id: trackId,
          });

        if (error) throw error;

        setLikedTrackIds((prev) => new Set([...prev, trackId]));
        toast.success("Added to liked songs");
        // Refresh to get full track info
        fetchLikedTracks();
      }
    } catch (err) {
      toast.error(wasLiked ? "Failed to unlike" : "Failed to like");
    }
  }, [user, likedTrackIds, fetchLikedTracks]);

  return {
    likedTracks,
    likedTrackIds,
    loading,
    isLiked,
    toggleLike,
    refreshLikedTracks: fetchLikedTracks,
  };
};
