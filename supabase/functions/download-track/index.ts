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

    // Use SaveFrom/Y2mate style API endpoint
    const apiUrl = "https://api.vevioz.com/api/button/mp3";
    
    // Try to get download link from vevioz API
    const formData = new URLSearchParams();
    formData.append("url", `https://www.youtube.com/watch?v=${videoId}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: formData,
    });

    if (apiResponse.ok) {
      const html = await apiResponse.text();
      console.log("API response received, parsing...");
      
      // Parse the response to extract download links
      const downloadMatch = html.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/);
      
      if (downloadMatch && downloadMatch[1]) {
        const downloadUrl = downloadMatch[1];
        console.log("Found download URL");
        
        return new Response(
          JSON.stringify({ 
            status: "success",
            url: downloadUrl,
            filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.mp3`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback: Use a direct conversion service
    console.log("Primary API failed, trying fallback...");
    
    // Use ytmp3 API as fallback
    const fallbackUrl = `https://yt1s.com/api/ajaxSearch/index`;
    const fallbackBody = new URLSearchParams();
    fallbackBody.append("q", `https://www.youtube.com/watch?v=${videoId}`);
    fallbackBody.append("vt", "mp3");

    const fallbackResponse = await fetch(fallbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: fallbackBody,
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      console.log("Fallback response:", JSON.stringify(fallbackData).slice(0, 200));
      
      if (fallbackData.status === "ok" && fallbackData.vid) {
        // Get conversion link
        const convertUrl = `https://yt1s.com/api/ajaxConvert/convert`;
        const convertBody = new URLSearchParams();
        convertBody.append("vid", fallbackData.vid);
        convertBody.append("k", fallbackData.links?.mp3?.["mp3128"]?.k || "");

        const convertResponse = await fetch(convertUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: convertBody,
        });

        if (convertResponse.ok) {
          const convertData = await convertResponse.json();
          if (convertData.status === "ok" && convertData.dlink) {
            return new Response(
              JSON.stringify({ 
                status: "success",
                url: convertData.dlink,
                filename: `${title.replace(/[^a-zA-Z0-9\s]/g, '')}.mp3`
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // If all APIs fail, provide a user-friendly message
    console.log("All download APIs failed");
    return new Response(
      JSON.stringify({ 
        status: "error",
        error: "Download service temporarily unavailable. Please try again later."
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