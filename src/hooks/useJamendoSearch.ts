import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JamendoTrack {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: number;
  source: "jamendo";
  audioUrl: string;
  downloadUrl: string;
  downloadAllowed: boolean;
  license: string;
  albumName: string;
}

export function useJamendoSearch() {
  const [results, setResults] = useState<JamendoTrack[]>([]);
  const [trending, setTrending] = useState<JamendoTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('jamendo-search', {
        body: null,
        headers: {},
      });

      // Use fetch with query params since invoke doesn't support them well
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jamendo-search?action=search&q=${encodeURIComponent(query)}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setResults(result.results || []);
    } catch (err) {
      console.error("Jamendo search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jamendo-search?action=trending&limit=15`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setTrending(result.results || []);
    } catch (err) {
      console.error("Jamendo trending error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trending");
    } finally {
      setLoading(false);
    }
  }, []);

  const getDownloadUrl = useCallback(async (trackId: string): Promise<{ url: string; filename: string } | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jamendo-search?action=download&trackId=${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.status === "success") {
        return { url: result.url, filename: result.filename };
      }
      
      return null;
    } catch (err) {
      console.error("Get download URL error:", err);
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    trending,
    loading,
    error,
    search,
    fetchTrending,
    getDownloadUrl,
    clearResults,
  };
}