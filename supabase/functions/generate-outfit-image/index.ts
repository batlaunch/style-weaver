import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MAX_BODY_BYTES = 256 * 1024; // 256 KB — this endpoint only receives JSON metadata
const MAX_STR = 200;

const clamp = (v: unknown, n = MAX_STR) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, n) : "";

// Gemini's image-generation model, called directly instead of via Lovable's AI gateway.
// Verify this exact model string in Google AI Studio before deploying — Lovable's gateway
// used the alias "google/gemini-2.5-flash-image"; the native Gemini API id may differ
// slightly (e.g. a "-preview" suffix) depending on what's currently released.
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth is optional — anonymous users may generate outfit images.

    // 2. Size-limit the body
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { error: "Payload too large" });
    }
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { return json(400, { error: "Invalid JSON" }); }

    const { items, gender, style } = parsed ?? {};
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return json(400, { error: "Invalid items" });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const itemDescriptions = items
      .map((item: any) => `${clamp(item?.label, 40)}: ${clamp(item?.colorName, 40)} ${clamp(item?.description, 120)}`)
      .join(", ");
    const genderDesc = gender === "male" ? "male" : "female";
    const safeStyle = clamp(style, 40);

    const prompt = `A rough, loose fashion sketch of a ${genderDesc} mannequin wearing: ${itemDescriptions}. Style cue: ${safeStyle}. Quick gestural drawing style, watercolor-like washes of color suggesting the outfit, minimal detail, artistic and abstract. White background, full body pose. Focus on overall silhouette and color blocking rather than exact garment details. No text, no labels.`;

    console.log("Generating outfit image");

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json(429, { error: "Rate limited, please try again in a moment." });
      if (response.status === 403) return json(402, { error: "Gemini API quota or billing issue — check your Google AI Studio account." });
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const imagePart = Array.isArray(parts) ? parts.find((p: any) => p?.inlineData?.data) : undefined;

    if (!imagePart) throw new Error("No image generated");

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return json(200, { imageUrl });
  } catch (error) {
    console.error("generate-outfit-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { error: message });
  }
});
