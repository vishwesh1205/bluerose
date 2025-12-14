import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Melodia, a warm and friendly AI music companion. You understand music deeply and help users discover songs based on their mood, feelings, and preferences.

Your personality:
- Warm, enthusiastic, and emotionally intelligent
- Use music-related emojis sparingly (🎵, 🎶, 🌅, ✨)
- Keep responses concise but engaging
- Be conversational and friendly

When recommending music:
1. Understand the user's mood or request
2. Suggest 3-5 specific songs that match their vibe
3. Format recommendations as a JSON array at the END of your response like this:
   [RECOMMENDATIONS]
   [{"query": "Artist - Song Title"}, {"query": "Artist - Song Title"}]
   [/RECOMMENDATIONS]

The query should be formatted as "Artist - Song Title" for best YouTube search results.

Examples of moods you understand:
- Happy, energetic, upbeat
- Chill, relaxed, peaceful
- Nostalgic, melancholic
- Romantic, dreamy
- Focus, study, concentration
- Workout, pump-up
- Sleepy, calming

Always be helpful and make music discovery feel personal and fun!`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI with message:", message);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response received:", content.substring(0, 200));

    // Parse recommendations from response
    let recommendations: { query: string }[] = [];
    const recMatch = content.match(/\[RECOMMENDATIONS\]\s*([\s\S]*?)\s*\[\/RECOMMENDATIONS\]/);
    
    if (recMatch) {
      try {
        recommendations = JSON.parse(recMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse recommendations:", e);
      }
    }

    // Clean the message (remove the recommendations block)
    const cleanMessage = content.replace(/\[RECOMMENDATIONS\][\s\S]*?\[\/RECOMMENDATIONS\]/, '').trim();

    return new Response(JSON.stringify({ 
      message: cleanMessage,
      recommendations 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in ai-music-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
