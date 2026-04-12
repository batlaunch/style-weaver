import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, style, gender, skinTone, season, itemDescription, lockedItems, regenerateSlot } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build locked items context if any
    const hasLockedItems = lockedItems && lockedItems.length > 0;
    const lockedContext = hasLockedItems
      ? `\n\nIMPORTANT - LOCKED ITEMS: The following items are LOCKED and MUST be kept exactly as specified (same label, color, colorName, and description). Only regenerate the unlocked items around them:\n${lockedItems.map((item: any) => `- ${item.label}: ${item.colorName} ${item.description} (color: ${item.color})`).join("\n")}`
      : "";

    const skinToneContext = skinTone
      ? `\nThe user has a ${skinTone} skin tone. Choose colors that complement and flatter this skin tone. Avoid colors that wash out or clash with ${skinTone} skin.`
      : "";

    const seasonContext = season
      ? `\nThe outfit is for ${season}. Choose fabrics, layers, and colors appropriate for ${season} weather. For example: lighter fabrics and brighter colors for spring/summer, heavier layers and richer tones for fall/winter.`
      : "";

    const systemPrompt = `You are a fashion stylist AI. The user will show you a photo of a clothing item they own. Your job is to:
1. Identify what the item is (e.g. "navy blue crew-neck sweater") and its dominant color
2. Build a complete outfit around that piece, matching the requested style and gender
3. Use color harmony theory (analogous, complementary, monochromatic, triadic, or split-complementary)
4. For each item, provide 3-4 alternative color options that would also work within the same color harmony
${skinToneContext}${seasonContext}

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "uploadedPiece": {
    "label": "Top|Bottom|Shoes|Accessory|Outerwear",
    "color": "#hexcolor",
    "colorName": "Color Name",
    "description": "Brief description of the uploaded item"
  },
  "items": [
    {
      "label": "Top",
      "color": "#hexcolor",
      "colorName": "Color Name",
      "description": "Brief description",
      "altColors": [
        {"hex": "#hexcolor", "name": "Color Name"},
        {"hex": "#hexcolor", "name": "Color Name"},
        {"hex": "#hexcolor", "name": "Color Name"}
      ]
    }
  ],
  "palette": [
    {"hex": "#hexcolor", "name": "Color Name"}
  ],
  "harmony": "Analogous|Complementary|Monochromatic|Triadic|Split-Complementary"
}

IMPORTANT RULES:
- The "items" array MUST include the uploaded piece as one of the items (with its original description)
- The other items complete the outfit around it
- Always include exactly 4 items and 5 palette colors
- Each item MUST have an "altColors" array with 3-4 alternative colors that fit the same harmony type
- The altColors should include the current color as one option, plus 2-3 alternatives
- palette should include the 5 most important colors in the outfit
- Use realistic, wearable color hex codes${lockedContext}`;

    const lockedNote = hasLockedItems
      ? ` Keep these items exactly as they are: ${lockedItems.map((i: any) => `${i.label} (${i.colorName} ${i.description})`).join(", ")}. Only change the unlocked items.`
      : "";

    const regenerateNote = regenerateSlot
      ? ` I want you to ONLY regenerate the "${regenerateSlot}" slot with a completely different option. Keep all other items exactly as specified in the locked items.`
      : "";

    const descriptionHint = itemDescription ? ` The user describes this item as: "${itemDescription}". Use this description to identify the item accurately.` : "";
    const userPrompt = `Here is a clothing item I own.${descriptionHint} Please build a complete ${style === "any" ? "stylish" : style} outfit for a ${gender} around this piece.${style === "any" ? " Pick whatever style you think works best with this piece." : ""}${lockedNote}${regenerateNote}`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: imageBase64 },
          },
        ],
      },
    ];

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    // Parse JSON - handle possible markdown code fences
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const outfit = JSON.parse(cleaned);

    return new Response(JSON.stringify(outfit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-outfit error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
