import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000, "Message content too long"),
});

const requestSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message too long (max 1000 characters)"),
  conversationHistory: z.array(messageSchema).max(50, "Conversation history too long").default([]),
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

    const { message, conversationHistory } = parseResult.data;
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

    console.log("Calling Lovable AI with message:", message.substring(0, 100));

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
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
