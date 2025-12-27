import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const searchParamsSchema = z.object({
  q: z.string().min(1, "Query is required").max(200, "Query too long"),
  limit: z.number().int().min(1).max(50).default(20),
});

const trackParamsSchema = z.object({
  videoId: z.string().min(1, "Video ID is required").max(20, "Invalid video ID").regex(/^[a-zA-Z0-9_-]+$/, "Invalid video ID format"),
});

// Parse ISO 8601 duration to seconds
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Simple in-memory cache with expiration
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "search";
    
    // Initialize Supabase client for caching to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "search") {
      // Validate input parameters
      const rawLimit = url.searchParams.get("limit");
      const parseResult = searchParamsSchema.safeParse({
        q: url.searchParams.get("q"),
        limit: rawLimit ? parseInt(rawLimit, 10) : 20,
      });

      if (!parseResult.success) {
        console.log("Validation error:", parseResult.error.issues);
        return new Response(
          JSON.stringify({ error: "Invalid input", details: parseResult.error.issues.map(i => i.message) }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { q: query, limit } = parseResult.data;
      console.log(`Searching YouTube for: ${query} (limit: ${limit})`);
      
      // Check cache first
      const cacheKey = `search:${query}:${limit}`;
      const cached = getCached(cacheKey);
      if (cached) {
        console.log("Returning cached results");
        return new Response(JSON.stringify(cached), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Search YouTube
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&maxResults=${limit}&key=${YOUTUBE_API_KEY}`;
      const searchResp = await fetch(searchUrl);
      
      if (!searchResp.ok) {
        const errorText = await searchResp.text();
        console.error("YouTube search error:", errorText);
        return new Response(
          JSON.stringify({ error: "YouTube API error" }),
          { status: searchResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const searchData = await searchResp.json();
      const videoIds = searchData.items?.map((item: any) => item.id.videoId).filter(Boolean).join(",");

      if (!videoIds) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get video details for duration and better thumbnails
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const videosResp = await fetch(videosUrl);
      const videosData = await videosResp.json();

      const results = videosData.items?.map((v: any) => ({
        id: `yt:${v.id}`,
        videoId: v.id,
        title: v.snippet.title,
        artists: [v.snippet.channelTitle],
        thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
        duration: parseISO8601Duration(v.contentDetails.duration),
        source: "youtube",
        channelTitle: v.snippet.channelTitle,
        publishedAt: v.snippet.publishedAt,
      })) || [];

      // Cache results
      setCache(cacheKey, results);

      // Store tracks in database for future reference
      if (results.length > 0) {
        const tracksToUpsert = results.map((r: any) => ({
          id: r.id,
          video_id: r.videoId,
          title: r.title,
          artists: r.artists,
          duration: r.duration,
          thumbnail: r.thumbnail,
          source: r.source,
          metadata: { channelTitle: r.channelTitle, publishedAt: r.publishedAt },
        }));

        const { error: upsertError } = await supabase
          .from("tracks")
          .upsert(tracksToUpsert, { onConflict: "id", ignoreDuplicates: true });
        
        if (upsertError) {
          console.log("Track upsert note:", upsertError.message);
        }
      }

      console.log(`Found ${results.length} tracks`);
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "track") {
      // Validate input parameters
      const parseResult = trackParamsSchema.safeParse({
        videoId: url.searchParams.get("videoId"),
      });

      if (!parseResult.success) {
        console.log("Validation error:", parseResult.error.issues);
        return new Response(
          JSON.stringify({ error: "Invalid input", details: parseResult.error.issues.map(i => i.message) }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { videoId } = parseResult.data;
      const trackId = `yt:${videoId}`;
      
      // Check database cache first
      const { data: cachedTrack } = await supabase
        .from("tracks")
        .select("*")
        .eq("id", trackId)
        .maybeSingle();

      if (cachedTrack) {
        console.log("Returning cached track from database");
        return new Response(JSON.stringify({
          id: cachedTrack.id,
          videoId: cachedTrack.video_id,
          title: cachedTrack.title,
          artists: cachedTrack.artists,
          duration: cachedTrack.duration,
          thumbnail: cachedTrack.thumbnail,
          source: cachedTrack.source,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch from YouTube
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const videosResp = await fetch(videosUrl);
      const videosData = await videosResp.json();

      if (!videosData.items || videosData.items.length === 0) {
        return new Response(
          JSON.stringify({ error: "Video not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const v = videosData.items[0];
      const track = {
        id: trackId,
        videoId: v.id,
        title: v.snippet.title,
        artists: [v.snippet.channelTitle],
        thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
        duration: parseISO8601Duration(v.contentDetails.duration),
        source: "youtube",
      };

      // Cache to database
      await supabase.from("tracks").upsert({
        id: track.id,
        video_id: track.videoId,
        title: track.title,
        artists: track.artists,
        duration: track.duration,
        thumbnail: track.thumbnail,
        source: track.source,
        metadata: { channelTitle: v.snippet.channelTitle },
      }, { onConflict: "id" });

      return new Response(JSON.stringify(track), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'search' or 'track'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in youtube-search function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
