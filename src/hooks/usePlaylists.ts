import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  cover_url: string | null;
  created_at: string;
  track_count?: number;
}

export interface PlaylistTrack {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: number;
  position: number;
}

export const usePlaylists = () => {
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!isAuthenticated) {
      setPlaylists([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = useCallback(async (title: string, description?: string): Promise<Playlist | null> => {
    if (!user) {
      toast.error("Please sign in to create playlists");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("playlists")
        .insert({
          user_id: user.id,
          title,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;

      setPlaylists((prev) => [data, ...prev]);
      toast.success("Playlist created!");
      return data;
    } catch (err) {
      toast.error("Failed to create playlist");
      return null;
    }
  }, [user]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId);

      if (error) throw error;

      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      toast.success("Playlist deleted");
    } catch (err) {
      toast.error("Failed to delete playlist");
    }
  }, []);

  const addTrackToPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    try {
      // Get current max position
      const { data: existing } = await supabase
        .from("playlist_tracks")
        .select("position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { error } = await supabase
        .from("playlist_tracks")
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position: nextPosition,
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("Track already in playlist");
          return;
        }
        throw error;
      }

      toast.success("Added to playlist");
    } catch (err) {
      toast.error("Failed to add track");
    }
  }, []);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("track_id", trackId);

      if (error) throw error;
      toast.success("Removed from playlist");
    } catch (err) {
      toast.error("Failed to remove track");
    }
  }, []);

  const getPlaylistTracks = useCallback(async (playlistId: string): Promise<PlaylistTrack[]> => {
    try {
      const { data, error } = await supabase
        .from("playlist_tracks")
        .select(`
          position,
          tracks (
            id,
            video_id,
            title,
            artists,
            thumbnail,
            duration
          )
        `)
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.tracks.id,
        videoId: item.tracks.video_id,
        title: item.tracks.title,
        artists: item.tracks.artists || [],
        thumbnail: item.tracks.thumbnail,
        duration: item.tracks.duration,
        position: item.position,
      }));
    } catch (err) {
      console.error("Error fetching playlist tracks:", err);
      return [];
    }
  }, []);

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getPlaylistTracks,
    refreshPlaylists: fetchPlaylists,
  };
};
