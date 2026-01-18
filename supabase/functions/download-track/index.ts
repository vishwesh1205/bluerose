import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const title = url.searchParams.get("title") || "audio";

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Missing videoId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing download request for videoId: ${videoId}`);

    // Use cobalt.tools API for audio extraction
    const cobaltResponse = await fetch("https://api.cobalt.tools/", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        audioFormat: "mp3",
        isAudioOnly: true,
        filenameStyle: "basic",
      }),
    });

    if (!cobaltResponse.ok) {
      console.error("Cobalt API error:", await cobaltResponse.text());
      
      // Fallback: return a redirect URL that user can use
      return new Response(
        JSON.stringify({ 
          status: "redirect",
          url: `https://api.cobalt.tools/api/json`,
          message: "Direct download not available, please try again later"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cobaltData = await cobaltResponse.json();
    console.log("Cobalt response:", JSON.stringify(cobaltData));

    if (cobaltData.status === "error") {
      return new Response(
        JSON.stringify({ error: cobaltData.text || "Failed to process video" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the download URL
    const downloadUrl = cobaltData.url || cobaltData.audio;
    
    if (!downloadUrl) {
      return new Response(
        JSON.stringify({ error: "No download URL available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: "success",
        url: downloadUrl,
        filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.mp3`
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