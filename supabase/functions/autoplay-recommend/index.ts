import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const trackSchema = z.object({
  id: z.string().optional(),
  videoId: z.string().optional(),
  title: z.string().max(500).optional(),
  artist: z.string().max(200).optional(),
  thumbnail: z.string().optional(),
  duration: z.number().optional(),
}).passthrough().nullable().optional();

const historyTrackSchema = z.object({
  id: z.string().optional(),
  videoId: z.string().optional(),
  title: z.string().max(500).optional(),
  artist: z.string().max(200).optional(),
  duration: z.number().optional(),
  playCount: z.number().optional(),
  skipped: z.boolean().optional(),
}).passthrough();

const requestSchema = z.object({
  currentTrack: trackSchema,
  recentTracks: z.array(historyTrackSchema).max(20).optional().default([]),
  likedTracks: z.array(historyTrackSchema).max(20).optional().default([]),
  skippedTrackIds: z.array(z.string()).max(50).optional().default([]),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  userId: z.string().optional(),
});

// Analyze track characteristics from title/artist
function analyzeTrackCharacteristics(title: string, artist: string) {
  const combined = `${title} ${artist}`.toLowerCase();
  
  // Detect language hints
  const languageHints = {
    tamil: /[\u0B80-\u0BFF]|tamil|kollywood|ilayaraja|ar rahman|anirudh|vijay|ajith/i.test(combined),
    telugu: /[\u0C00-\u0C7F]|telugu|tollywood/i.test(combined),
    hindi: /[\u0900-\u097F]|hindi|bollywood|arijit|shreya|neha kakkar/i.test(combined),
    malayalam: /[\u0D00-\u0D7F]|malayalam|mollywood/i.test(combined),
    kannada: /[\u0C80-\u0CFF]|kannada|sandalwood/i.test(combined),
    english: /official|music video|lyrics|feat\.|ft\./i.test(combined) && !/tamil|telugu|hindi|malayalam|kannada/i.test(combined),
  };

  // Detect mood/energy hints
  const moodHints = {
    energetic: /dance|party|beat|energy|hype|fire|lit|bass|drop/i.test(combined),
    romantic: /love|romance|heart|pyaar|kadhal|ishq|prema/i.test(combined),
    sad: /sad|pain|broken|cry|tears|miss|melanchol|emotional/i.test(combined),
    chill: /chill|relax|peace|calm|ambient|soft|acoustic|lofi/i.test(combined),
    motivational: /motivat|inspir|success|rise|power|strong|hustle/i.test(combined),
  };

  // Detect genre hints
  const genreHints = {
    hiphop: /rap|hip.?hop|trap|drill|flow|bars|cypher/i.test(combined),
    electronic: /edm|electronic|house|techno|trance|dubstep|remix|dj/i.test(combined),
    classical: /classical|carnatic|hindustani|raag|raga|instrumental/i.test(combined),
    rock: /rock|metal|punk|grunge|alternative/i.test(combined),
    pop: /pop|chart|hit|top\s?\d+/i.test(combined),
    folk: /folk|traditional|indie|acoustic/i.test(combined),
  };

  return { languageHints, moodHints, genreHints };
}

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

    const { currentTrack, recentTracks, likedTracks, skippedTrackIds, timeOfDay, userId } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Autoplay request for:", currentTrack?.title?.substring(0, 50));

    // Analyze current track characteristics
    const currentCharacteristics = currentTrack 
      ? analyzeTrackCharacteristics(currentTrack.title || '', currentTrack.artist || '')
      : null;

    // Collaborative filtering: Find similar users and their preferences
    let collaborativeInsights = "";
    
    if (userId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Get current user's top 10 most-played track IDs
        const { data: userHistory } = await supabase
          .from('listening_history')
          .select('track_id')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .limit(30);

        const userTrackIds = [...new Set(userHistory?.map(h => h.track_id) || [])].slice(0, 10);

        if (userTrackIds.length > 0) {
          // Find other users who listened to the same tracks
          const { data: similarUsers } = await supabase
            .from('listening_history')
            .select('user_id')
            .in('track_id', userTrackIds)
            .neq('user_id', userId)
            .limit(100);

          const similarUserIds = [...new Set(similarUsers?.map(u => u.user_id) || [])];

          if (similarUserIds.length > 0) {
            // Get tracks that similar users also liked/listened to frequently
            const { data: similarUserTracks } = await supabase
              .from('listening_history')
              .select('track_id')
              .in('user_id', similarUserIds.slice(0, 20))
              .not('track_id', 'in', `(${userTrackIds.join(',')})`)
              .limit(50);

            // Count track frequency among similar users
            const trackCounts: Record<string, number> = {};
            similarUserTracks?.forEach(t => {
              trackCounts[t.track_id] = (trackCounts[t.track_id] || 0) + 1;
            });

            // Get top recommended track IDs
            const topCollabTrackIds = Object.entries(trackCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([id]) => id);

            if (topCollabTrackIds.length > 0) {
              // Fetch track details
              const { data: collabTracks } = await supabase
                .from('tracks')
                .select('title, artists')
                .in('id', topCollabTrackIds);

              if (collabTracks && collabTracks.length > 0) {
                collaborativeInsights = `\n\nUsers with similar taste also enjoy:\n${collabTracks.map(t => 
                  `- ${t.title} by ${(t.artists || []).join(', ')}`
                ).join('\n')}`;
              }
            }
          }
        }
      } catch (collabError) {
        console.error("Collaborative filtering error:", collabError);
        // Continue without collaborative filtering
      }
    }

    // Build characteristic analysis for the prompt
    const characteristicSummary = currentCharacteristics ? `
Current track analysis:
- Language hints: ${Object.entries(currentCharacteristics.languageHints).filter(([, v]) => v).map(([k]) => k).join(', ') || 'unknown'}
- Mood: ${Object.entries(currentCharacteristics.moodHints).filter(([, v]) => v).map(([k]) => k).join(', ') || 'neutral'}
- Genre hints: ${Object.entries(currentCharacteristics.genreHints).filter(([, v]) => v).map(([k]) => k).join(', ') || 'unknown'}` : '';

    // Analyze listening patterns
    const recentArtists = [...new Set(recentTracks.map(t => t.artist).filter(Boolean))].slice(0, 5);
    const likedArtists = [...new Set(likedTracks.map(t => t.artist).filter(Boolean))].slice(0, 5);
    const skippedInfo = skippedTrackIds.length > 0 
      ? `\n\nRecently skipped ${skippedTrackIds.length} tracks - avoid similar ones.`
      : '';

    const systemPrompt = `You are Caffeine's intelligent music recommendation engine using algorithmic recommendations. Your job is to pick the NEXT song that feels natural and seamless, like the user's perfect DJ.

ALGORITHMIC APPROACH:
1. **Acoustic Properties**: Match tempo, energy, mood, and musical style
2. **Listening History**: Weight heavily towards artists and genres the user engages with
3. **Collaborative Filtering**: Consider what users with similar taste enjoy${collaborativeInsights ? ' (data provided below)' : ''}
4. **Language Continuity**: Keep the same language unless transitioning naturally
5. **Skip Avoidance**: Never recommend tracks similar to recently skipped ones

CRITICAL RULES:
- NEVER repeat a song from recent history
- Match the energy level (don't kill the vibe with sudden changes)
- Consider the time of day for mood matching
- Prioritize songs by frequently occurring artists in history/likes
- If unsure about language, default to matching current track's language

TIME-BASED MOOD TARGETS:
- Morning (6-12): Upbeat, energizing, positive
- Afternoon (12-18): Balanced, productive, focused
- Evening (18-22): Relaxing, unwinding, chill
- Night (22-6): Calm, peaceful, ambient

RESPONSE FORMAT: You MUST respond with ONLY a JSON array of 3 song recommendations:
[{"query": "Artist - Song Title", "reason": "brief reason explaining the algorithmic connection"}, ...]

The query should be formatted as "Artist - Song Title" for YouTube search.`;

    const userMessage = `Current song just ended:
Title: ${currentTrack?.title || 'Unknown'}
Artist: ${currentTrack?.artist || 'Unknown'}
${characteristicSummary}

Recent listening history (behavioral signals):
${recentTracks?.slice(0, 8).map((t, i) => 
  `${i + 1}. ${t.title || 'Unknown'} by ${t.artist || 'Unknown'}${t.skipped ? ' (SKIPPED)' : ''}`
).join('\n') || 'No history'}

Frequently appearing artists: ${recentArtists.join(', ') || 'None detected'}

Liked songs (preference signals):
${likedTracks?.slice(0, 5).map((t) => `- ${t.title || 'Unknown'} by ${t.artist || 'Unknown'}`).join('\n') || 'No likes'}

Preferred artists from likes: ${likedArtists.join(', ') || 'None'}${collaborativeInsights}${skippedInfo}

Time of day: ${timeOfDay}

Based on all these signals, pick the next song that keeps the vibe going and feels algorithmically perfect!`;

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
