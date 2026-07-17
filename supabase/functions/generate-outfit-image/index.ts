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
// Fashion terms that trip image-model NSFW filters despite being innocent.
const sanitizeFashion = (s: string) =>
  s.replace(/\bnude\b/gi, "beige")
   .replace(/\bsheer\b/gi, "lightweight")
   .replace(/\bbackless\b/gi, "open-back")
   .replace(/\bstrapless\b/gi, "off-shoulder")
   .replace(/\bplunge\b/gi, "deep-v")
   .replace(/\bbodysuit\b/gi, "fitted top")
   .replace(/\bbare\b/gi, "uncovered");
// Cloudflare Workers AI — FLUX-1-schnell (fast text-to-image).
// Called via Cloudflare's REST API from this Deno edge function.
// Free tier: 10,000 neurons/day; requests beyond the limit FAIL (no billing) on the free plan.
const CF_MODEL = "@cf/black-forest-labs/flux-1-schnell";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth is optional — anonymous users may generate outfit images.

    // Size-limit the body
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

    const CF_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const CF_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN");
    if (!CF_ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID is not configured");
    if (!CF_API_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN is not configured");

    const itemDescriptions = items
      .map((item: any) => `${clamp(item?.label, 40)}: ${clamp(item?.colorName, 40)} ${clamp(item?.description, 120)}`)
      .join(", ");
    const genderDesc = gender === "male" ? "male" : "female";
    const safeStyle = clamp(style, 40);

    // FLUX responds well to comma-separated style keywords more than long prose,
    // so the prompt is slightly restructured versus the old Gemini version.
    const prompt = `Loose watercolor fashion illustration sketch of a ${genderDesc} mannequin wearing: ${itemDescriptions}. Style: ${safeStyle}. Gestural quick-sketch linework, soft watercolor washes, minimal detail, elegant fashion-designer croquis, white background, full body pose, focus on silhouette and color blocking. No text, no labels, no watermark.`;

    console.log("Generating outfit image via Cloudflare Workers AI");

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;
   const callCF = (p: string) =>
      fetch(cfUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: sanitizeFashion(p).slice(0, 2000), steps: 6 }),
      });

    let response = await callCF(prompt);

    // If the content filter still objects (code 3030), retry once with a minimal prompt.
    if (!response.ok && response.status === 400) {
      const errText = await response.text();
      console.error("Cloudflare AI 400:", errText);
      if (errText.includes("3030") || errText.toLowerCase().includes("nsfw")) {
        const minimalItems = items
          .map((item: any) => `${clamp(item?.colorName, 40)} ${clamp(item?.label, 40)}`)
          .join(", ");
        const minimalPrompt = `Loose watercolor fashion illustration of a ${genderDesc} mannequin wearing: ${minimalItems}. Gestural sketch, soft watercolor washes, white background, full body.`;
        console.log("Retrying with minimal prompt after NSFW flag");
        response = await callCF(minimalPrompt);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare AI error:", response.status, errorText);
      if (response.status === 429) {
        return json(429, { error: "Daily free image quota reached — try again tomorrow." });
      }
      if (response.status === 401 || response.status === 403) {
        return json(500, { error: "Cloudflare credentials invalid — check CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN secrets." });
      }
      throw new Error(`Cloudflare AI error: ${response.status}`);
    }

    // FLUX-1-schnell returns JSON: { result: { image: "<base64>" }, success: true }
    // Some other CF image models return raw binary instead — handle both shapes.
    const contentType = response.headers.get("content-type") || "";
    let base64Image: string | undefined;
    let mimeType = "image/jpeg"; // FLUX-schnell outputs JPEG

    if (contentType.includes("application/json")) {
      const data = await response.json();
      base64Image = data?.result?.image;
      if (!data?.success && !base64Image) {
        console.error("Cloudflare AI unexpected JSON:", JSON.stringify(data).slice(0, 500));
      }
    } else {
      // Binary image body (e.g. if the model is swapped to SDXL later): convert to base64
      mimeType = contentType.includes("png") ? "image/png" : "image/jpeg";
      const buf = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < buf.length; i += CHUNK) {
        binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
      }
      base64Image = btoa(binary);
    }

    if (!base64Image) throw new Error("No image generated");

    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    return json(200, { imageUrl });
  } catch (error) {
    console.error("generate-outfit-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { error: message });
  }
});