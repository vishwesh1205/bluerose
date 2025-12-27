import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartSong {
  rank: number;
  title: string;
  artists: string[];
  movie: string;
  language: string;
}

// Input validation schema
const requestSchema = z.object({
  industry: z.enum([
    'kollywood', 'tollywood', 'bollywood', 'mollywood', 
    'hollywood', 'sandalwood', 'kpop', 'jpop'
  ], { errorMap: () => ({ message: "Invalid industry. Must be one of: kollywood, tollywood, bollywood, mollywood, hollywood, sandalwood, kpop, jpop" }) }),
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

    // Normalize industry to lowercase for validation
    if (body && typeof body === 'object' && 'industry' in body) {
      (body as Record<string, unknown>).industry = String((body as Record<string, unknown>).industry).toLowerCase();
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

    const { industry } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const industryLanguageMap: Record<string, string> = {
      'kollywood': 'Tamil',
      'tollywood': 'Telugu',
      'bollywood': 'Hindi',
      'mollywood': 'Malayalam',
      'hollywood': 'English',
      'sandalwood': 'Kannada',
      'kpop': 'Korean',
      'jpop': 'Japanese'
    };

    const language = industryLanguageMap[industry] || industry;

    console.log(`Generating Top 50 chart for ${industry} (${language})`);

    const systemPrompt = `You are an expert music chart curator specializing in ${industry} (${language} language) music.

Generate a Top 50 trending songs chart following these strict rules:

SELECTION CRITERIA (in order of priority):
1. Language must be ${language}
2. Recent popularity (trending on streaming platforms, YouTube, social media)
3. User engagement signals (viral tracks, reel music, playlist favorites)
4. Recency bias (newer hits get priority, classics only if currently trending)
5. Artist & movie buzz (new releases, promotional tracks)

RANKING RULES:
- Mix blockbuster hits with rising songs
- Avoid songs from the same movie back-to-back
- Balance genres: romance, mass/dance, melody, emotional

OUTPUT FORMAT (JSON array):
Return EXACTLY 50 songs as a JSON array with this structure:
[
  {
    "rank": 1,
    "title": "Song Name",
    "artists": ["Artist1", "Artist2"],
    "movie": "Movie/Album Name",
    "language": "${language}"
  }
]

IMPORTANT:
- Use real, actual song names that exist
- Include currently popular and trending songs from 2023-2024
- Mix established hits with newer releases
- Return ONLY the JSON array, no other text`;

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
          { role: "user", content: `Generate the current Top 50 trending ${industry} songs chart. Focus on songs that are popular RIGHT NOW in ${language} music. Return only the JSON array.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing chart...");

    // Extract JSON from response
    let chart: ChartSong[] = [];
    try {
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        chart = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse chart:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to generate chart. Please try again." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and ensure 50 songs
    const validChart = chart
      .filter((song: any) => song.title && song.artists && song.rank)
      .slice(0, 50)
      .map((song: any, index: number) => ({
        rank: index + 1,
        title: song.title,
        artists: Array.isArray(song.artists) ? song.artists : [song.artists],
        movie: song.movie || "Single",
        language: song.language || language
      }));

    console.log(`Generated chart with ${validChart.length} songs`);

    return new Response(
      JSON.stringify({ 
        industry,
        language,
        chart: validChart,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in top-charts function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
