import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface SearchTrack {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  thumbnail: string;
  duration: number;
  source: string;
}

// Client-side cache for search results
const searchCache = new Map<string, { data: SearchTrack[]; timestamp: number }>();
const trackCache = new Map<string, { data: SearchTrack; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedSearch = (key: string): SearchTrack[] | null => {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
};

const getCachedTrack = (videoId: string): SearchTrack | null => {
  const cached = trackCache.get(videoId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  trackCache.delete(videoId);
  return null;
};

export const useYouTubeSearch = () => {
  const [results, setResults] = useState<SearchTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string, limit = 20) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    // Check client cache first
    const cacheKey = `${query}:${limit}`;
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      setResults(cached);
      return cached;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=search&q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const tracks: SearchTrack[] = await response.json();
      
      // Cache results
      searchCache.set(cacheKey, { data: tracks, timestamp: Date.now() });
      
      // Also cache individual tracks
      tracks.forEach(track => {
        trackCache.set(track.videoId, { data: track, timestamp: Date.now() });
      });
      
      setResults(tracks);
      return tracks;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrack = useCallback(async (videoId: string): Promise<SearchTrack | null> => {
    // Check cache first
    const cached = getCachedTrack(videoId);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-search?action=track&videoId=${videoId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) return null;

      const track = await response.json();
      trackCache.set(videoId, { data: track, timestamp: Date.now() });
      return track;
    } catch {
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    getTrack,
    clearResults,
  };
};
