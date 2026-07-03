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

// Limits
const MAX_BODY_BYTES = 3 * 1024 * 1024; // 3 MB total JSON body
const MAX_IMAGE_B64 = 2_200_000; // ~1.6MB binary
const MAX_DESC = 500;
const MAX_ADD_REQ = 200;
const MAX_ADD_REQ_LIST = 12;

const clampText = (v: unknown, n: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n) : "";

// Gemini API model + endpoint (called directly instead of via Lovable's AI gateway)
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Pulls a Gemini candidate's text parts back into a single string
function extractText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth is optional — anonymous users may generate outfits.

    // 2. Read + size-limit body
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { error: "Payload too large" });
    let body: any;
    try { body = JSON.parse(raw); } catch { return json(400, { error: "Invalid JSON" }); }

    let { imageBase64, style, gender, skinTone, season, occasion, temperatureF, itemDescription, lockedItems, regenerateSlot, avoidItem, regenerationSeed, addPiece, addPieceRequest, addPieceRequests } = body ?? {};

    // 3. Validate / clamp inputs
    if (typeof imageBase64 !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/.test(imageBase64)) {
      return json(400, { error: "Invalid image" });
    }
    if (imageBase64.length > MAX_IMAGE_B64) return json(413, { error: "Image too large" });

    // Split the data URL into the pieces Gemini's inlineData wants
    const imgMatch = imageBase64.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
    if (!imgMatch) return json(400, { error: "Invalid image" });
    const imgMimeType = imgMatch[1];
    const imgData = imgMatch[2];

    style = clampText(style, 40) || "any";
    gender = gender === "male" ? "male" : "female";
    skinTone = clampText(skinTone, 40);
    season = clampText(season, 40);
    occasion = clampText(occasion, 40);
    itemDescription = clampText(itemDescription, MAX_DESC);
    regenerateSlot = clampText(regenerateSlot, 40);
    addPieceRequest = clampText(addPieceRequest, MAX_ADD_REQ);
    if (Array.isArray(addPieceRequests)) {
      addPieceRequests = addPieceRequests
        .map((s: unknown) => clampText(s, MAX_ADD_REQ))
        .filter((s: string) => s.length > 0)
        .slice(0, MAX_ADD_REQ_LIST);
    } else {
      addPieceRequests = undefined;
    }
    if (Array.isArray(lockedItems)) {
      lockedItems = lockedItems.slice(0, 20).map((it: any) => ({
        label: clampText(it?.label, 40),
        color: clampText(it?.color, 16),
        colorName: clampText(it?.colorName, 40),
        description: clampText(it?.description, 200),
      }));
    } else {
      lockedItems = undefined;
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Build locked items context if any
    const hasLockedItems = lockedItems && lockedItems.length > 0;
    const lockedContext = hasLockedItems
      ? `\n\nIMPORTANT - LOCKED ITEMS: The following items are LOCKED and MUST be kept exactly as specified (same label, color, colorName, and description). Only regenerate the unlocked items around them:\n${lockedItems.map((item: any) => `- ${item.label}: ${item.colorName} ${item.description} (color: ${item.color})`).join("\n")}`
      : "";

    const skinToneContext = skinTone
      ? `\nThe user has a ${skinTone} skin tone. Choose colors that complement and flatter this skin tone. Avoid colors that wash out or clash with ${skinTone} skin.`
      : "";

    const SEASON_GUIDANCE: Record<string, string> = {
      "spring": "SPRING: Mild, transitional, often unpredictable weather. THREE rules from menswear stylists: (1) Swap to spring fabrics — cotton, linen, silk, chambray, cotton sweaters, fine merino, light-wash denim, cotton trousers, summer-weight/unlined/partially-lined garments. Box up the wool topcoats, parkas, flannel shirts, chunky cable knits, and thick brushed fabrics. (2) Go LIGHTER, not BRIGHTER — instead of school-bus yellow or kelly green, shift the core neutrals one shade lighter (washed indigo, light-wash denim, lighter olive, lighter brown, lighter grey, washed navy). (3) Layer for chilly mornings — Mac coat (lightweight raincoat-trench) instead of parka, Harrington jacket instead of bomber, unstructured/unlined sport coat instead of flannel sport coat, cotton or fine-merino sweater instead of chunky cable knit, chambray or poplin button-down instead of flannel. Footwear: penny loafer, suede chukka boot, grey or white sneaker, low boot. NO heavy wool overcoats, NO shearling, NO puffer/parka, NO chunky cable-knits, NO snow boots, NO winter beanies.",
      "summer": "SUMMER: Hot weather. Three keys: breathable fabrics, lighter-and-brighter colors, relaxed (not skin-tight) fit. Fabrics: cotton is king (Pima/Supima for tees, poplin for shirts, cotton chinos/shorts), linen is queen (open weave, embrace the wrinkles), Tencel/lyocell blends, lightweight tropical/hopsack wool (PERMITTED for unlined summer sport coats, suits, and trousers — these are designed for heat), chambray, seersucker. AVOID heavy/winter wool (wool overcoats, wool sweaters, flannel, tweed, brushed wool, cable-knit, chunky knit), shearling, fur, puffer/parka/peacoat, fleece, thermal, turtleneck. Pieces to reach for: camp-collar shirt, polo (Supima cotton or linen blend — avoid grainy pique), short-sleeve button-down, t-shirt, chambray shirt with sleeves rolled, summer shorts, cotton or linen chinos, summer suit, UNLINED chore jacket or unstructured sport coat (for AC or evenings only — not as a heat layer). Colors: use the 'lighter and brighter' trick — shift core neutrals lighter (washed blue, light olive, light brown, light grey) and optionally add ONE brighter accent. Footwear: penny loafer (often sockless or with no-show socks), espadrille, driver, boat shoe, huarache, white/grey/canvas sneaker, leather sandal. NO scarves, NO beanies, NO gloves, NO tights, NO heavy leather/moto jackets, NO knee-high or lug-sole winter boots.",
      "fall": "FALL: Cool, layered weather. Fabrics: wool, tweed, corduroy, suede, leather, flannel, mid-weight knits, denim, gabardine. Layers: outerwear is almost always appropriate — trench, leather jacket, blazer, chore coat, overshirt, longline cardigan, moto, field jacket. Colors: rich, warm, earthy — camel, rust, burgundy, forest green, mustard, chocolate, olive, oxblood, cream, charcoal, deep navy. Footwear: chelsea boots, ankle boots, loafers, lug-sole boots, leather sneakers, mary janes with tights. Scarves and hats start to make sense.",
      "winter": "WINTER: Cold weather — outerwear and layering are MANDATORY. Fabrics: heavy wool, cashmere, shearling, faux fur, thick knit, melton, tweed, leather with lining, corduroy, flannel. ALWAYS include a substantial coat or jacket (wool overcoat, puffer, shearling, peacoat, teddy, parka, long wool coat) unless the user explicitly uploaded a winter outerwear piece. Include warm accessories where they fit the style: wool scarf, beanie or felt hat, leather gloves, tights under skirts/dresses. Colors: deep, moody, rich — black, charcoal, ivory, cream, camel, chocolate, burgundy, forest, navy, plum, with metallic or jewel-tone accents. NO linen, NO bare sandals, NO sheer summer fabrics, NO short-sleeve-only looks. Footwear: knee-high boots, lug-sole boots, chelsea boots, shearling-lined boots, leather sneakers — closed and warm.",
      "any": "",
    };
    const SEASON_BAN_WORDS: Record<string, string> = {
      spring: "shearling, fur, puffer, parka, peacoat, heavy wool overcoat, down jacket, thermal underwear, chunky cable-knit, snow boots, Ugg, knee-high winter boots, wool topcoat, flannel shirt",
      summer: "heavy wool, wool coat, wool overcoat, wool topcoat, wool sweater, cashmere sweater, shearling, fur, fleece, puffer, parka, peacoat, overcoat, topcoat, tweed, corduroy, cable-knit, chunky knit, thermal, flannel, turtleneck, beanie, knit hat, scarf, gloves, tights, knee-high boots, lug-sole boots, combat boots, snow boots, Ugg, down jacket, quilted jacket, heavy leather jacket, moto jacket (NOTE: lightweight tropical wool, hopsack wool, fine-gauge cotton knit and unlined linen blazers ARE allowed in summer)",
      fall: "linen, seersucker, sundresses, flip-flops, espadrilles, tank tops, spaghetti straps",
      winter: "linen, seersucker, voile, chiffon, mesh, sleeveless tops, tank tops, spaghetti straps, sundresses, short-sleeve-only looks, sandals, espadrilles, flip-flops, slides, open-toe shoes, sheer fabrics",
    };
    const seasonKey = season && SEASON_GUIDANCE[season] !== undefined ? season : "any";
    const seasonContext = seasonKey !== "any" && SEASON_GUIDANCE[seasonKey]
      ? `\n\nSEASON — this is a HARD constraint and must shape fabrics, layers, colors, AND footwear. Do not produce a look that would be uncomfortable or visually wrong for this season:\n${SEASON_GUIDANCE[seasonKey]}\n\nABSOLUTELY FORBIDDEN for ${seasonKey} — do NOT mention any of these in any item's description (not even as a fabric blend, lining, or trim): ${SEASON_BAN_WORDS[seasonKey]}. If the user's UPLOADED piece happens to contain one of these (e.g. they uploaded a wool coat in summer), keep it but do NOT add any other forbidden items around it.`
      : "";

    // Optional explicit temperature override (Fahrenheit). Takes precedence over season stereotypes.
    const tempNum = typeof temperatureF === "number" && Number.isFinite(temperatureF) ? temperatureF : null;
    let tempContext = "";
    if (tempNum !== null) {
      let band = "";
      if (tempNum >= 90) band = `EXTREME HEAT (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): The wearer will be visibly hot. NO outerwear, NO long sleeves unless very lightweight linen/cotton, NO closed/heavy shoes. Lean on linen, cotton voile, seersucker, breathable knits. Short sleeves, sleeveless, shorts, breezy dresses, sandals/espadrilles/huaraches. Skip scarves, hats only as sun protection (straw, panama, baseball cap).`;
      else if (tempNum >= 78) band = `HOT (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Light, breathable, relaxed-fit pieces. Cotton/linen short sleeves, polos, chinos or shorts, summer dresses. Add an UNLINED sport coat or chore jacket ONLY if formality requires it. No heavy knits, no real outerwear, no boots.`;
      else if (tempNum >= 65) band = `WARM (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Comfortable in a single layer. T-shirt, polo, button-down, light dress, jeans or chinos. A light layer (denim/chore/Harrington jacket, unstructured blazer, cardigan) is optional, not required. Sneakers, loafers, low boots.`;
      else if (tempNum >= 55) band = `MILD / COOL (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Light outerwear is appropriate — Harrington jacket, Mac coat, light trench, denim jacket, unlined sport coat, cardigan, fine-knit sweater. Long sleeves. Loafers, chelsea boots, sneakers. Avoid heavy wool coats and chunky knits — overkill.`;
      else if (tempNum >= 42) band = `CHILLY (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Real outerwear required — trench, mac, leather jacket, wool sport coat, mid-weight wool overcoat, field jacket. Knit sweater or cotton/merino crewneck under it. Closed boots, leather sneakers. A light scarf is appropriate.`;
      else if (tempNum >= 28) band = `COLD (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Heavy coat required — wool overcoat, peacoat, puffer, shearling, parka. Layer a knit (wool, cashmere, chunky knit) under it. Wool scarf, beanie or felt hat, lug-sole or chelsea boots, tights under skirts/dresses.`;
      else band = `FREEZING (${tempNum}°F / ~${Math.round((tempNum - 32) * 5 / 9)}°C): Maximum warmth. Heavy down/wool/shearling coat, thick knit layer, thermal base, wool scarf, beanie, leather gloves, insulated/snow boots. No bare skin where avoidable. Layer aggressively.`;
      tempContext = `\n\nOUTSIDE TEMPERATURE — this overrides any season stereotype. The wearer told us the actual outside temperature is ${tempNum}°F. Build the outfit for THIS temperature, not for an abstract idea of the season. ${band}`;
    }

    const OCCASION_GUIDANCE: Record<string, string> = {
      "work": "WORK / OFFICE: Lean polished and professional. Silhouettes: tailored trouser, pencil or A-line skirt, blazer, button-down, fine knit, midi dress. Textures: wool, twill, fine cotton, leather. Accessories must read minimal and refined — structured top-handle or tote bag, classic watch, stud or small-hoop earrings, delicate necklace, thin leather belt, loafers/pointed flats/low block heel/clean ankle boot. No loud logos, no party-bright accents, no sneakers unless the style is athleisure.",
      "date-night": "DATE NIGHT: Lean elevated and intentional with one clear hero piece (slip skirt, leather jacket, silk shirt, fitted knit, sleek trouser, mini/midi dress). Textures: silk, satin, leather, fine knit, suede. Accessories: ONE statement (sculptural earrings OR bold heel OR small evening bag OR layered gold chains — not all four). Heeled boot, mule, strappy sandal, or polished loafer. Clutch, small shoulder bag, or compact top-handle. Keep palette tight; let texture and fit do the work.",
      "weekend": "WEEKEND / CASUAL: Lean relaxed but considered — not sloppy. Silhouettes: relaxed denim, cargo, wide trouser, tee, sweatshirt, overshirt, chore jacket, casual midi dress. Textures: denim, jersey, fleece, canvas, washed cotton. Accessories: crossbody or tote, cap or bucket hat, slouchy beanie in cold weather, sneakers / chunky loafer / mule / casual boot, simple watch, sunglasses. Layered necklaces or a stack of rings keeps it personal.",
      "event": "EVENT / OCCASION (party, wedding guest, gallery, dinner out): Lean dressy. Silhouettes: midi or maxi dress, jumpsuit, tailored suit, satin skirt + fine knit, blazer + slip combo. Textures: satin, silk, velvet, lace, sequins (one piece only), fine wool. Accessories: clutch or small structured bag, heel or dressy flat (slingback, mule, strappy sandal), statement earrings OR a bold cuff, optional fascinator/hair accessory. Keep it cohesive — one bold accent, supporting pieces quiet.",
      "travel": "TRAVEL: Lean comfortable, layerable, and put-together. Silhouettes: stretch or pull-on trouser, knit dress, button-down, soft tee, longline cardigan, denim jacket, trench, oversized scarf as blanket. Textures: ponte, jersey, fine merino, washed denim, soft leather. Accessories: roomy crossbody or tote (hands-free), comfortable loafer / clean sneaker / low boot, large sunglasses, watch, oversized scarf, minimal jewelry that won't set off security. Avoid stiff fabrics and complicated layering.",
      "any": "",
    };
    const occasionKey = occasion && OCCASION_GUIDANCE[occasion] !== undefined ? occasion : "any";
    const occasionContext = occasionKey !== "any" && OCCASION_GUIDANCE[occasionKey]
      ? `\n\nOCCASION: ${OCCASION_GUIDANCE[occasionKey]}`
      : "";

    const systemPrompt = `You are a Senior Fashion Stylist and Wardrobe Architect. The user will show you a photo of a clothing item they own. Your job is to:
1. Identify what the item is (e.g. "navy blue crew-neck sweater") and its dominant color
2. Build a complete, well-proportioned outfit around that piece, matching the requested style and gender
3. Use color harmony theory (analogous, complementary, monochromatic, triadic, or split-complementary) AND a "Base + Accent" distribution: roughly 60% neutral foundation (black, navy, grey, white, cream, olive, brown), 30% secondary color, 10% pop/accent. The chosen harmony defines WHICH colors relate; the 60/30/10 split defines HOW MUCH of each appears across the outfit.
4. Apply silhouette balance (Rule of Proportions + Rule of Thirds): if the uploaded piece or the top is oversized/relaxed, pair it with slimmer or more structured bottoms; if it is fitted, you may go fuller/wider on the bottom. Avoid oversized-on-oversized or skinny-on-skinny unless the requested style explicitly calls for it (e.g. avant-garde, certain streetwear). Aim to break the body into roughly 1/3 + 2/3 vertical sections (e.g. cropped jacket over long trousers, tucked top + high-rise bottom, belt defining the waist) rather than cutting it 50/50 — this almost always reads more elegant and intentional.
5. For each item, provide 3-4 alternative color options that would also work within the same color harmony AND respect the 60/30/10 role of that item (a neutral piece's alts should stay in the neutral family; an accent piece's alts can be other accent-strength colors).
6. Mix textures and finishes deliberately — a single outfit feels richer when it combines at least two of: smooth (silk, satin, fine knit), structured (wool, denim, leather), soft (cashmere, jersey, suede), and crisp (poplin, twill). Texture contrast lets you keep a tight color palette without the outfit feeling flat.
7. Build around a clear focal point. Pick ONE hero piece per outfit — it can be the uploaded item, a statement accessory (bold bag, sculptural earrings, snakeskin boot, vintage belt), or a strong silhouette — and let the rest of the look support it. Never give an outfit two competing statement pieces; the supporting items should be quieter in color, scale, or texture so the hero reads first.

STYLE ARCHETYPE GUIDANCE — pull from a WIDE range. Match the requested style when given; otherwise pick the archetype that flatters the uploaded piece best, and feel free to draw inspiration from named aesthetics and style icons (French girl / Jane Birkin, quiet luxury / Sofia Richie, old money / Ralph Lauren, Brigitte Bardot, Cary Grant tailoring, dark academia, coastal grandmother, mob wife, gorpcore, Y2K, cottagecore, techwear, western, indie sleaze, balletcore, stealth wealth) — vary inspiration across generations so outfits do not feel same-y:
- Minimalist: high-quality basics, monochromatic or tonal palettes, no logos, clean lines, one subtle accessory.
- Streetwear: bold/oversized silhouettes, graphic elements, statement sneakers, layered accessories, hat or cap optional.
- Americana / Workwear: durable fabrics (denim, leather, canvas, flannel), earth tones, sturdy boots, leather belt.
- Classic / Androgynous: gender-neutral cuts, boxy blazers, straight-leg trousers, loafers or clean sneakers, watch.
- Avant-Garde: experimental shapes, asymmetry, unexpected proportions, high-contrast textures.
- Quiet Luxury / Old Money: tonal neutrals, cashmere, leather, gold hardware, no visible branding, structured bag.
- Boho: flowy fabrics, layered jewelry, woven/straw textures, earthy palette, scarves and hats.
- Preppy: tailored basics, knits, pleats, loafers, headbands, structured top-handle bag.
- Vintage / Editorial: era-anchored references (60s mod, 70s flare, 90s grunge, Y2K) updated with one modern element.
- Athleisure / Gorpcore: technical fabrics, sneakers or trail shoes, crossbody or sling bag, cap or beanie.
- Romantic / Balletcore: soft fabrics, ribbons, ballet flats, delicate jewelry, blush/cream palette.
- Western, Cottagecore, Dark Academia, Coastal, Techwear, etc.: lean on their established conventions while still respecting proportion balance and the 60/30/10 color split.

CREATIVE BREADTH — actively VARY your suggestions. Do not default to the same safe pieces every time. Rotate through unexpected-but-correct choices: pleated trouser vs. straight jean vs. cargo vs. midi skirt vs. tailored short; loafer vs. mary jane vs. western boot vs. mesh flat vs. retro sneaker; trench vs. moto vs. chore coat vs. cropped cardigan vs. waistcoat. Consider an unexpected high/low pairing (slip dress + chore jacket, tailored trouser + graphic tee, sequined skirt + crew sweater) when the style allows — these feel modern rather than catalog-perfect. Ask yourself: "would a real stylist make a more interesting choice here?"

ACCESSORIES — they are NOT optional decoration; they are what takes the look from "wearing clothes" to "wearing an outfit". Treat accessory slots with the same intent as main garments and ALWAYS include at least one deliberate accessory beyond shoes (jewelry, bag, belt, hat, scarf, sunglasses, or hair piece). Apply these PAIRING RULES strictly:

1. COLOR ROLE — Decide each accessory's color role before picking it:
   - If the outfit's garments cover the full 60/30/10 split, accessories should echo Base or Secondary colors so they recede.
   - If the garments are all-neutral, give ONE accessory the 10% Accent role and let it carry the pop color (e.g. red bag, emerald earrings, mustard scarf).
   - Accessory colors must come from the same harmony as the palette (Analogous, Complementary, Monochromatic, Triadic, or Split-Complementary) — never introduce a hue that breaks the harmony.

2. METAL TONE — Pick ONE dominant metal (gold, silver, rose gold, gunmetal, brass) and use it across watch, jewelry, belt buckle, and bag hardware. Mixing is only allowed if it is clearly intentional (e.g. a two-tone watch) — never accidentally. Match metal warmth to the palette undertone: warm palettes (cream, camel, rust, olive) → gold or brass; cool palettes (navy, grey, black, icy blue) → silver or gunmetal; rose gold sits between.

3. LEATHER COORDINATION — Shoes, belt, and bag form a "leather triangle". They do NOT have to match exactly, but they MUST share an undertone family:
   - All cool blacks together, OR all warm browns together (tan / cognac / chocolate), OR all whites/creams together.
   - Crossing families is only acceptable as a deliberate contrast accent (e.g. all-black outfit with one cognac belt as the 10% accent) — and only once per outfit.
   - For belts specifically: if the outfit has belt loops or a defined waist moment, INCLUDE a belt. Its leather + buckle metal must match the shoes/bag and the chosen metal tone above.

4. JEWELRY LAYERING — When picking jewelry, follow stylist convention: layer pieces of varied lengths/widths for depth, but anchor with one focal piece. If earrings are the statement, keep necklace delicate or skip it. If a chunky necklace is the statement, keep earrings tiny. Rings and a watch can always coexist with the above.

5. BAG ↔ SHOE LOGIC — Bag style should agree with the shoes' formality: sneakers/casual boots → tote, crossbody, bucket, sling; loafers/flats/low boots → top-handle, hobo, structured shoulder; heels/dressy flats → clutch, mini bag, small top-handle. A clutch with sneakers reads wrong unless the style explicitly calls for it.

6. SCALE — Match accessory size to garment volume. Voluminous/flowy garments → smaller, finer accessories. Clean/minimal garments → can take one larger, sculptural accessory. Never pair oversized jewelry with oversized garments AND a large bag — pick one big thing.

7. OCCASION OVERLAY — Tailor accessories to the occasion. Casual = lightweight & functional (cap, crossbody, sneakers, watch). Work = minimal & polished (stud earrings, structured bag, classic watch, thin belt). Evening/Event = one bold statement (clutch, sculptural earrings, heeled boot). Travel = hands-free, comfortable, security-friendly.

CATEGORIES TO ROTATE THROUGH (do not always pick the same): footwear (loafer / mary jane / ballet flat / western boot / chelsea / mule / sneaker / heel / sandal), bag (tote / crossbody / clutch / top-handle / bucket / sling / hobo), belt (waist or hip — one of the single biggest outfit upgraders), jewelry (watch, earrings from studs to statement, necklace from delicate to chunky, layered chains, rings, bracelet/cuff), hat (cap, beret, bucket, wide-brim, beanie), scarf (silk neckerchief, oversized wool, bandana), sunglasses, hair accessory (silk scrunchie, claw clip, headband), gloves in cold weather.
${skinToneContext}${seasonContext}${tempContext}${occasionContext}

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
      "colorRole": "Base|Secondary|Accent",
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
  "harmony": "Analogous|Complementary|Monochromatic|Triadic|Split-Complementary",
  "rationale": "1-2 sentence styling rationale explaining the proportion balance and 60/30/10 color logic of THIS specific outfit"
}

The "rationale" field MUST be 1-2 concise sentences (max ~250 chars) that explain the SPECIFIC proportion choice (e.g. oversized top balanced with slim bottom) AND the SPECIFIC 60/30/10 color split for this outfit (e.g. "charcoal grounds 60%, cream softens 30%, brass accents 10%"). Make it feel like a real stylist's note — concrete, no generic platitudes.

IMPORTANT RULES:
- The "items" array MUST include the uploaded piece as one of the items (with its original description)
- The other items complete the outfit around it
- The outfit MUST include the core essentials: a Top, a Bottom, Shoes, and at least one Accessory or Outerwear (4 items minimum)
- You DECIDE whether to include 4, 5, or 6 total items based on what the outfit genuinely needs. Add extra pieces (e.g. Outerwear, a second Accessory like a hat/bag/belt/scarf/jewelry/sunglasses, or a layering piece) ONLY when they meaningfully improve the look given the style, season, and uploaded piece. For example: cold seasons (fall/winter) often warrant outerwear and a scarf; streetwear/avant-garde styles often warrant extra accessories; minimalist styles usually stay at 4. Do not pad items just to hit 6.
- When generating from scratch (no locked items), total items should be between 4 and 6. Never fewer than 4. When the user explicitly asks to add another piece, you may exceed 6 — always respect the requested total.
- Each item MUST have a distinct "label" — use one of: Top, Bottom, Shoes, Outerwear, Accessory, Hat, Bag, Belt, Scarf, Jewelry, Sunglasses. If you include multiple accessories, give them their specific label (e.g. "Hat", "Bag") rather than repeating "Accessory".
- Each item MUST have an "altColors" array with 3-4 alternative colors that fit the same harmony type
- The altColors should include the current color as one option, plus 2-3 alternatives
- palette should include the 5 most important colors in the outfit
- Use realistic, wearable color hex codes
- Each item MUST have a "colorRole" field: "Base" for the ~60% neutral foundation pieces, "Secondary" for the ~30% supporting color pieces, and "Accent" for the ~10% pop pieces. Roles should sum visually to the 60/30/10 split — typically 2-3 Base items, 1-2 Secondary items, and 1 (rarely 2) Accent item. The Accent role is reserved for the pop color, even if the item itself is small (e.g. a bold bag or shoes).${lockedContext}`;

    const lockedNote = hasLockedItems
      ? ` Keep these items exactly as they are: ${lockedItems.map((i: any) => `${i.label} (${i.colorName} ${i.description})`).join(", ")}. Only change the unlocked items.`
      : "";

    const avoidNote = avoidItem
      ? ` AVOID this previous "${avoidItem.label}" — do NOT return anything similar: previous was "${avoidItem.colorName} ${avoidItem.description}" (hex ${avoidItem.color}). The new ${avoidItem.label} MUST differ in BOTH color family AND silhouette/material from the previous one. Pick a meaningfully different garment (e.g. different cut, fabric, or styling detail) in a different hue while still respecting the harmony and 60/30/10 roles.`
      : "";
    const seedNote = regenerationSeed ? ` Variation seed: ${regenerationSeed} — use this to explore a fresh direction you haven't tried before.` : "";
    const regenerateNote = regenerateSlot
      ? ` I want you to ONLY regenerate the "${regenerateSlot}" slot with a completely different option. Keep all other items exactly as specified in the locked items.${avoidNote}${seedNote}`
      : "";

    const existingLabels = hasLockedItems ? lockedItems.map((i: any) => i.label).join(", ") : "";

    // Normalize add-piece request list: prefer explicit array, else split single string on commas/newlines.
    const rawList: string[] = Array.isArray(addPieceRequests)
      ? addPieceRequests
      : (typeof addPieceRequest === "string" ? addPieceRequest.split(/[\n,]+/) : []);
    const cleanedList = rawList
      .map((s) => (typeof s === "string" ? s.trim().slice(0, 200) : ""))
      .filter((s) => s.length > 0);
    const addCount = addPiece ? Math.max(1, Math.min(cleanedList.length || 1, 12)) : 0;
    const singleRequest = cleanedList.length === 1 ? cleanedList[0] : "";

    const addPieceNote = addPiece
      ? ` The user wants to ADD ${addCount} MORE piece${addCount > 1 ? "s" : ""} to the existing outfit. Keep ALL locked items EXACTLY as they are (do not modify their label, color, colorName, or description). Then return the FULL items array including all the locked items PLUS exactly ${addCount} brand-new additional piece${addCount > 1 ? "s" : ""}.${
          cleanedList.length > 1
            ? ` THE USER SPECIFICALLY REQUESTS THESE NEW PIECES (add one piece per entry, in this order):\n${cleanedList.map((s, i) => `${i + 1}. "${s}"`).join("\n")}\nHonor each request — add a piece for each entry that matches the description as closely as possible while still fitting the outfit's style, palette (60/30/10), and harmony. Pick the most appropriate label for each (Outerwear, Hat, Bag, Belt, Scarf, Jewelry, Sunglasses, Accessory, Top, Bottom, Shoes, etc.).`
            : singleRequest
              ? ` THE USER SPECIFICALLY REQUESTS: "${singleRequest}". Honor this request — add a piece that matches their description as closely as possible while still fitting the outfit's style, palette (60/30/10), and harmony. Pick the most appropriate label for it (Outerwear, Hat, Bag, Belt, Scarf, Jewelry, Sunglasses, Accessory, etc.).`
              : ` Choose whichever extra piece makes the most sense for the style and season (e.g. an extra accessory like a hat, bag, belt, scarf, jewelry, sunglasses, or a layering piece like outerwear).`
        } Each new piece MUST have a label that is NOT already used in the existing outfit (existing labels: ${existingLabels}). If multiple new pieces share a category (e.g. two accessories), give them distinct specific labels (e.g. "Hat" and "Belt") — never reuse a label. The total number of items in the response must equal ${(lockedItems?.length || 0) + addCount}.`
      : "";

    const descriptionHint = itemDescription ? ` The user describes this item as: "${itemDescription}". Use this description to identify the item accurately.` : "";
    const userPrompt = `Here is a clothing item I own.${descriptionHint} Please build a complete ${style === "any" ? "stylish" : style} outfit for a ${gender} around this piece.${style === "any" ? " Pick whatever style you think works best with this piece." : ""}${lockedNote}${regenerateNote}${addPieceNote}`;

    // Gemini's request shape: systemInstruction is separate from the conversational `contents`.
    // The first user turn carries both the text prompt and the inline image data.
    const contents: any[] = [
      {
        role: "user",
        parts: [
          { text: userPrompt },
          { inlineData: { mimeType: imgMimeType, data: imgData } },
        ],
      },
    ];

    const callGemini = async (turns: any[], temperature: number) => {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: turns,
          generationConfig: { temperature },
        }),
      });
      return res;
    };

    const response = await callGemini(contents, regenerateSlot ? 1.1 : 0.9);

    if (!response.ok) {
      if (response.status === 429) {
        return json(429, { error: "Rate limited, please try again in a moment." });
      }
      if (response.status === 403) {
        return json(402, { error: "Gemini API quota or billing issue — check your Google AI Studio account." });
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = extractText(data);

    if (!content) throw new Error("No response from AI");

    // Parse JSON - handle possible markdown code fences
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let outfit = JSON.parse(cleaned);

    // Season consistency check: catch winter outerwear in summer, summer fabrics in winter, etc.
    const SEASON_BANS: Record<string, { banned: RegExp; reason: string }> = {
      summer: {
        banned: /\b((?<!tropical |lightweight |light[- ]weight |fresco |hopsack |summer[- ]weight |fine[- ]gauge |fine )wool(?! blend| trouser| trousers)|cashmere sweater|shearling|fur coat|fleece|puffer|parka|peacoat|wool overcoat|wool topcoat|wool coat|tweed|corduroy|cable[- ]?knit|chunky knit|thermal|flannel(?!ette)|turtleneck|beanie|knit hat|wool scarf|wool gloves|leather gloves|knee[- ]?high boot|lug[- ]?sole boot|combat boot|snow boot|ugg|down jacket|quilted jacket|heavy leather jacket|moto jacket)\b/i,
        reason: "winter/cold-weather fabrics or outerwear are inappropriate for summer",
      },
      winter: {
        banned: /\b(linen|seersucker|voile|chiffon|mesh|sleeveless|tank top|spaghetti strap|sundress|short sleeve|shorts(?!\s*suit)|sandal|espadrille|flip[- ]?flop|slide|open[- ]?toe|sheer)\b/i,
        reason: "summer/warm-weather fabrics, bare skin, or open footwear are inappropriate for winter",
      },
      spring: {
        banned: /\b(shearling|fur coat|puffer|parka|peacoat|heavy overcoat|wool overcoat|wool topcoat|down jacket|thermal|chunky cable[- ]?knit|snow boot|ugg|knee[- ]?high winter boot)\b/i,
        reason: "heavy winter outerwear is inappropriate for spring",
      },
      fall: {
        banned: /\b(linen|seersucker|sundress|flip[- ]?flop|espadrille|tank top|spaghetti strap)\b/i,
        reason: "high-summer fabrics and footwear are inappropriate for fall",
      },
    };

    const lockedLabels = new Set((lockedItems || []).map((i: any) => i?.label));
    const uploadedDesc = (outfit?.uploadedPiece?.description || "").toLowerCase();
    // Skip the season ban regex when an explicit temperature is set — the temperature guidance leads.
    const seasonBan = (seasonKey !== "any" && tempNum === null) ? SEASON_BANS[seasonKey] : undefined;

    const findViolations = (items: any[]) =>
      (items || [])
        .filter((it: any) => it && !lockedLabels.has(it.label))
        // Skip the uploaded piece itself — user uploaded it, we don't override it
        .filter((it: any) => {
          const d = (it.description || "").toLowerCase();
          return !(uploadedDesc && d && uploadedDesc.includes(d.slice(0, 20)));
        })
        .map((it: any) => {
          const text = `${it.colorName || ""} ${it.description || ""} ${it.label || ""}`;
          const m = text.match(seasonBan!.banned);
          return m ? { label: it.label, description: it.description, match: m[0] } : null;
        })
        .filter(Boolean) as Array<{ label: string; description: string; match: string }>;

    if (seasonBan && Array.isArray(outfit?.items)) {
      let lastContent = content;
      let attempt = 0;
      const MAX_RETRIES = 2;
      // Gemini uses "model" (not "assistant") for the model's own turn in conversation history
      let runningTurns = contents;

      while (attempt < MAX_RETRIES) {
        const violations = findViolations(outfit.items);
        if (violations.length === 0) break;
        attempt++;
        console.log(`Season violations (attempt ${attempt}/${MAX_RETRIES}):`, seasonKey, violations);

        const fixNote = `\n\nSEASON VIOLATION (attempt ${attempt}) — your response STILL includes items that do NOT fit ${seasonKey}: ${violations
          .map((v) => `"${v.label}: ${v.description}" (offending term: "${v.match}")`)
          .join("; ")}. ${seasonBan.reason}. FORBIDDEN WORDS for ${seasonKey}: ${SEASON_BAN_WORDS[seasonKey]}. Regenerate the FULL outfit JSON now. Replace those items with TRULY season-appropriate alternatives. Do not just rename — change the actual fabric and garment type. Keep locked items and the uploaded piece unchanged.`;

        runningTurns = [
          ...runningTurns,
          { role: "model", parts: [{ text: lastContent }] },
          { role: "user", parts: [{ text: fixNote }] },
        ];

        const retryResponse = await callGemini(runningTurns, 0.5);

        if (!retryResponse.ok) break;
        const retryData = await retryResponse.json();
        const retryContent = extractText(retryData);
        if (!retryContent) break;
        lastContent = retryContent;
        let retryCleaned = retryContent.trim();
        if (retryCleaned.startsWith("```")) {
          retryCleaned = retryCleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        try {
          const retried = JSON.parse(retryCleaned);
          if (retried?.items?.length) outfit = retried;
        } catch (e) {
          console.error("Retry parse failed:", e);
          break;
        }
      }

      // Final fallback: drop offending OPTIONAL items (Outerwear, Scarf, Hat, Jewelry, Sunglasses, Bag, Belt, Accessory)
      const remaining = findViolations(outfit.items || []);
      if (remaining.length > 0) {
        const OPTIONAL_LABELS = new Set(["Outerwear", "Scarf", "Hat", "Jewelry", "Sunglasses", "Bag", "Belt", "Accessory"]);
        const violatingDescs = new Set(remaining.map((v) => v.description));
        const filtered = outfit.items.filter((it: any) => {
          if (!violatingDescs.has(it?.description)) return true;
          if (OPTIONAL_LABELS.has(it?.label)) {
            console.log("Dropping unfixable optional item:", it.label, it.description);
            return false;
          }
          return true; // keep essentials even if violating — better than empty slot
        });
        outfit.items = filtered;
      }
    }

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
