import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract video info and audio stream URL from YouTube
async function getYouTubeAudioUrl(videoId: string): Promise<{ url: string; title: string } | null> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Fetch the watch page
    const response = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch YouTube page:", response.status);
      return null;
    }

    const html = await response.text();
    
    // Extract player response from the page
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
      console.error("Could not find player response in page");
      return null;
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    
    // Get title
    const title = playerResponse?.videoDetails?.title || "audio";
    
    // Get streaming data
    const streamingData = playerResponse?.streamingData;
    if (!streamingData) {
      console.error("No streaming data available");
      return null;
    }

    // Find audio-only format (preferably 128kbps m4a)
    const adaptiveFormats = streamingData.adaptiveFormats || [];
    
    // Filter for audio formats
    const audioFormats = adaptiveFormats.filter((f: any) => 
      f.mimeType?.includes("audio") && f.url
    );

    if (audioFormats.length === 0) {
      console.error("No audio formats with direct URLs found");
      
      // Check for formats that need signature decryption
      const signedFormats = adaptiveFormats.filter((f: any) => 
        f.mimeType?.includes("audio") && f.signatureCipher
      );
      
      if (signedFormats.length > 0) {
        console.log("Found signed formats but signature decryption not implemented");
      }
      
      return null;
    }

    // Sort by quality (prefer higher bitrate)
    audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
    
    const selectedFormat = audioFormats[0];
    console.log(`Selected audio format: ${selectedFormat.mimeType}, bitrate: ${selectedFormat.bitrate}`);

    return {
      url: selectedFormat.url,
      title: title,
    };
  } catch (error) {
    console.error("Error extracting audio URL:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let videoId: string | null = null;
    let title: string = "audio";

    // Handle both POST body and GET query params
    if (req.method === "POST") {
      const body = await req.json();
      videoId = body.videoId;
      title = body.title || "audio";
    } else {
      const url = new URL(req.url);
      videoId = url.searchParams.get("videoId");
      title = url.searchParams.get("title") || "audio";
    }

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Missing videoId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing download request for videoId: ${videoId}`);

    // Get audio URL from YouTube
    const audioInfo = await getYouTubeAudioUrl(videoId);

    if (audioInfo && audioInfo.url) {
      const safeFilename = (audioInfo.title || title).replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
      
      return new Response(
        JSON.stringify({ 
          status: "success",
          url: audioInfo.url,
          filename: `${safeFilename}.m4a`,
          title: audioInfo.title
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If direct extraction failed, provide user-friendly fallback
    console.log("Direct audio extraction failed");
    
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: "Unable to extract audio. The video may be protected or restricted."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Download failed";
    console.error("Download error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});