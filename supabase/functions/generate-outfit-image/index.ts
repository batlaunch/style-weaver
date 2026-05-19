import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json(401, { error: "Unauthorized" });
    }

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const itemDescriptions = items
      .map((item: any) => `${clamp(item?.label, 40)}: ${clamp(item?.colorName, 40)} ${clamp(item?.description, 120)}`)
      .join(", ");

    const genderDesc = gender === "male" ? "male" : "female";
    const safeStyle = clamp(style, 40);
    const prompt = `A rough, loose fashion sketch of a ${genderDesc} mannequin wearing: ${itemDescriptions}. Style cue: ${safeStyle}. Quick gestural drawing style, watercolor-like washes of color suggesting the outfit, minimal detail, artistic and abstract. White background, full body pose. Focus on overall silhouette and color blocking rather than exact garment details. No text, no labels.`;

    console.log("Generating outfit image for user:", claimsData.claims.sub);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return json(429, { error: "Rate limited, please try again in a moment." });
      if (response.status === 402) return json(402, { error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." });
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image generated");

    return json(200, { imageUrl });
  } catch (error) {
    console.error("generate-outfit-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { error: message });
  }
});
