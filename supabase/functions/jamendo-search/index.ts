import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JAMENDO_API_URL = "https://api.jamendo.com/v3.0";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("JAMENDO_CLIENT_ID");
    if (!clientId) {
      console.error("JAMENDO_CLIENT_ID not configured");
      return new Response(
        JSON.stringify({ error: "Jamendo API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "search";
    
    if (action === "search") {
      const query = url.searchParams.get("q");
      const limit = url.searchParams.get("limit") || "20";
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: "Missing search query" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Searching Jamendo for: ${query}`);

      const searchUrl = `${JAMENDO_API_URL}/tracks/?client_id=${clientId}&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.headers?.status !== "success") {
        console.error("Jamendo API error:", data);
        return new Response(
          JSON.stringify({ error: data.headers?.error_message || "Search failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Transform results to match our app's format
      const tracks = data.results.map((track: any) => ({
        id: `jamendo:${track.id}`,
        videoId: track.id.toString(),
        title: track.name,
        artists: [track.artist_name],
        thumbnail: track.album_image || track.image,
        duration: parseInt(track.duration) || 0,
        source: "jamendo",
        audioUrl: track.audio,
        downloadUrl: track.audiodownload,
        downloadAllowed: track.audiodownload_allowed,
        license: track.license_ccurl,
        albumName: track.album_name,
      }));

      console.log(`Found ${tracks.length} tracks`);

      return new Response(
        JSON.stringify({ results: tracks }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "trending") {
      const limit = url.searchParams.get("limit") || "15";
      
      console.log("Fetching trending Jamendo tracks");

      const trendingUrl = `${JAMENDO_API_URL}/tracks/?client_id=${clientId}&format=json&limit=${limit}&order=popularity_week&include=musicinfo&audioformat=mp32`;
      
      const response = await fetch(trendingUrl);
      const data = await response.json();

      if (data.headers?.status !== "success") {
        console.error("Jamendo API error:", data);
        return new Response(
          JSON.stringify({ error: data.headers?.error_message || "Failed to fetch trending" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tracks = data.results.map((track: any) => ({
        id: `jamendo:${track.id}`,
        videoId: track.id.toString(),
        title: track.name,
        artists: [track.artist_name],
        thumbnail: track.album_image || track.image,
        duration: parseInt(track.duration) || 0,
        source: "jamendo",
        audioUrl: track.audio,
        downloadUrl: track.audiodownload,
        downloadAllowed: track.audiodownload_allowed,
        license: track.license_ccurl,
        albumName: track.album_name,
      }));

      console.log(`Found ${tracks.length} trending tracks`);

      return new Response(
        JSON.stringify({ results: tracks }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "download") {
      const trackId = url.searchParams.get("trackId");
      
      if (!trackId) {
        return new Response(
          JSON.stringify({ error: "Missing trackId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Getting download URL for track: ${trackId}`);

      // Get track details including download URL
      const trackUrl = `${JAMENDO_API_URL}/tracks/?client_id=${clientId}&format=json&id=${trackId}&audioformat=mp32`;
      
      const response = await fetch(trackUrl);
      const data = await response.json();

      if (data.headers?.status !== "success" || !data.results?.[0]) {
        return new Response(
          JSON.stringify({ error: "Track not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const track = data.results[0];
      
      if (!track.audiodownload_allowed) {
        return new Response(
          JSON.stringify({ error: "Download not allowed for this track" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          status: "success",
          url: track.audiodownload,
          filename: `${track.name} - ${track.artist_name}.mp3`,
          title: track.name,
          artist: track.artist_name,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Request failed";
    console.error("Jamendo API error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});