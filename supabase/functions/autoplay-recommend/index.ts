import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const trackSchema = z.object({
  title: z.string().max(500).optional(),
  artist: z.string().max(200).optional(),
}).passthrough().nullable().optional();

const historyTrackSchema = z.object({
  title: z.string().max(500).optional(),
  artist: z.string().max(200).optional(),
}).passthrough();

const requestSchema = z.object({
  currentTrack: trackSchema,
  recentTracks: z.array(historyTrackSchema).max(20).optional().default([]),
  likedTracks: z.array(historyTrackSchema).max(20).optional().default([]),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      console.log("Validation error:", parseResult.error.issues);
      return new Response(JSON.stringify({ 
        error: "Invalid input", 
        details: parseResult.error.issues.map(i => i.message) 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { currentTrack, recentTracks, likedTracks, timeOfDay } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Autoplay request for:", currentTrack?.title?.substring(0, 50));

    const systemPrompt = `You are an intelligent music recommendation engine for autoplay. Your job is to pick the NEXT song that feels natural and seamless.

RULES:
1. SAME LANGUAGE: Keep the same language as the current song
2. SAME/SIMILAR GENRE: Match the genre closely
3. SIMILAR MOOD & ENERGY: Don't kill the vibe
4. ARTIST SIMILARITY: Similar artists or commonly liked together
5. NEVER repeat the same song
6. Avoid sudden mood or language changes
7. Keep the flow smooth and emotionally consistent

Consider time of day:
- Morning (6-12): Upbeat, energizing
- Afternoon (12-18): Balanced, productive
- Evening (18-22): Relaxing, chill
- Night (22-6): Calm, peaceful

You MUST respond with ONLY a JSON array of 3 song recommendations (fallback options if first fails):
[{"query": "Artist - Song Title", "reason": "brief reason"}, ...]

The query should be formatted as "Artist - Song Title" for YouTube search.`;

    const userMessage = `Current song just ended:
Title: ${currentTrack?.title || 'Unknown'}
Artist: ${currentTrack?.artist || 'Unknown'}

Recent listening history (last 5 songs):
${recentTracks?.slice(0, 5).map((t) => `- ${t.title || 'Unknown'} by ${t.artist || 'Unknown'}`).join('\n') || 'No history'}

Liked songs (sample):
${likedTracks?.slice(0, 5).map((t) => `- ${t.title || 'Unknown'}`).join('\n') || 'No likes'}

Time of day: ${timeOfDay}

Pick the next song that keeps the vibe going!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI autoplay response:", content.substring(0, 300));

    // Parse JSON recommendations from response
    let recommendations: { query: string; reason: string }[] = [];
    
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse recommendations:", e);
      // Fallback: create a recommendation based on current track
      if (currentTrack?.artist) {
        recommendations = [{ 
          query: `${currentTrack.artist} popular songs`, 
          reason: "Similar artist" 
        }];
      }
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in autoplay-recommend:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
