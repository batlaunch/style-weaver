import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Leaf, Snowflake, Flower2 } from "lucide-react";

const SEASONS = [
  {
    name: "Spring",
    icon: Flower2,
    vibe: "Fresh, light, and optimistic",
    palette: ["#7CB9A8", "#F5E6D3", "#D4A574", "#A8C686", "#ECB4B4"],
    paletteNames: ["Sage", "Cream", "Camel", "Moss", "Blush"],
    fabrics: "Lightweight cotton, chambray, light denim, linen blends, jersey knit",
    keyPieces: [
      "Light-wash denim jacket — the ultimate spring layering piece",
      "Pastel or muted knitwear — soft colors that mirror the season",
      "Canvas sneakers or suede loafers — breathable, casual footwear",
      "Chinos in sand, olive, or stone — earthy neutrals that pair with everything",
    ],
    tips: [
      "Layer strategically — mornings are cool, afternoons are warm. A light jacket you can remove is essential.",
      "Swap dark winter neutrals for warmer tones: navy → light blue, black → charcoal, dark brown → tan.",
      "Floral patterns and soft prints feel natural in spring without being costume-y.",
      "Transition boots to lighter footwear — canvas, suede, or clean leather sneakers.",
    ],
    colorAdvice: "Spring favors soft, desaturated colors — think pastels with warmth. Sage green, dusty rose, light lavender, and warm cream all work beautifully. Avoid high-contrast combinations; aim for tonal outfits that feel airy.",
  },
  {
    name: "Summer",
    icon: Sun,
    vibe: "Relaxed, breathable, and effortless",
    palette: ["#ECF0F1", "#1ABC9C", "#F5E6D3", "#2980B9", "#E8D5B7"],
    paletteNames: ["White", "Teal", "Sand", "Ocean", "Linen"],
    fabrics: "Linen, seersucker, lightweight cotton, Tencel, open-weave knits",
    keyPieces: [
      "Linen shirt (relaxed fit) — the quintessential summer piece",
      "Tailored shorts in neutral tones — elevated casual",
      "Breathable sneakers or leather sandals — keep feet cool",
      "A lightweight unstructured blazer — for summer evenings",
    ],
    tips: [
      "Linen wrinkles — embrace it. It's part of the charm, not a flaw.",
      "Lighter colors reflect heat. White, cream, and pale blue will keep you cooler than dark tones.",
      "Minimize layers. One well-chosen piece beats three sweaty ones.",
      "Invest in quality sunglasses — they're the #1 summer accessory and protect your eyes.",
    ],
    colorAdvice: "Summer is your license for white, off-white, and light neutrals. Add pops of ocean blue, coral, or teal. Monochromatic white/cream outfits feel luxurious. Avoid heavy, dark palettes — they absorb heat and look out of season.",
  },
  {
    name: "Fall",
    icon: Leaf,
    vibe: "Rich, warm, and textured",
    palette: ["#C0392B", "#8B6F47", "#2C3E50", "#D4A574", "#5B7553"],
    paletteNames: ["Rust", "Camel", "Navy", "Tan", "Olive"],
    fabrics: "Wool, flannel, corduroy, suede, heavyweight cotton, tweed, cashmere",
    keyPieces: [
      "A well-fitted overcoat in camel or charcoal — the fall essential",
      "Chunky knit sweaters — texture is king in autumn",
      "Suede boots — Chelsea or chukka styles work perfectly",
      "Corduroy trousers — rich texture in warm tones",
    ],
    tips: [
      "Fall is the best season for layering. Start thin, build outward: tee → shirt → sweater → jacket.",
      "Earth tones dominate: rust, burgundy, olive, camel, mustard. They mirror the changing leaves.",
      "Mix textures aggressively — corduroy with wool, suede with denim, flannel with leather.",
      "Scarves become functional and stylish. A wool or cashmere scarf elevates any outfit.",
    ],
    colorAdvice: "Fall's palette is warm and saturated — burgundy, burnt orange, forest green, mustard, and deep camel. These rich tones work in analogous harmonies. Pair rust with olive, or navy with camel for classic complementary combinations.",
  },
  {
    name: "Winter",
    icon: Snowflake,
    vibe: "Structured, dramatic, and refined",
    palette: ["#1C1C1C", "#2C3E50", "#ECF0F1", "#C0392B", "#B8860B"],
    paletteNames: ["Black", "Navy", "Ivory", "Burgundy", "Gold"],
    fabrics: "Heavy wool, cashmere, leather, down, merino, velvet, heavyweight flannel",
    keyPieces: [
      "A quality wool overcoat — the foundation of winter style",
      "Cashmere sweater — warmth without bulk",
      "Leather boots with a sturdy sole — practical and polished",
      "Merino wool base layers — invisible warmth under everything",
    ],
    tips: [
      "Invest in outerwear — your coat IS your outfit for months. Make it count.",
      "Dark, rich colors dominate: black, navy, charcoal, deep burgundy, forest green.",
      "Fit matters even more with layers. A too-big coat makes everything look sloppy.",
      "Accessories earn their keep: a quality scarf, gloves, and beanie are both functional and fashionable.",
    ],
    colorAdvice: "Winter favors high contrast and drama. Black and white, navy and cream, charcoal and burgundy — these bold pairings cut through grey winter days. Metallic accents (gold jewelry, silver hardware) add warmth to dark palettes.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const SeasonalGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Seasonal Style Guide
          </h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-10 space-y-16">
        <motion.section {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Dress for every season
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Each season demands a different approach to fabric, color, and layering. Understanding seasonal dressing isn't about buying a new wardrobe four times a year — it's about knowing which pieces to rotate forward and how to adapt your palette.
          </p>
        </motion.section>

        {SEASONS.map((season, si) => {
          const Icon = season.icon;
          return (
            <motion.section
              key={season.name}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 * si }}
              className="space-y-6"
            >
              {/* Season Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground">{season.name}</h3>
                  <p className="font-body text-sm text-muted-foreground italic">{season.vibe}</p>
                </div>
              </div>

              {/* Palette */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h4 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Seasonal Palette
                </h4>
                <div className="flex gap-3 mb-4">
                  {season.palette.map((c, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="w-full aspect-square rounded-md border border-border" style={{ backgroundColor: c }} />
                      <p className="text-[10px] text-muted-foreground font-body mt-1">{season.paletteNames[i]}</p>
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{season.colorAdvice}</p>
              </div>

              {/* Fabrics */}
              <div className="bg-secondary/30 rounded-lg px-5 py-4">
                <h4 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Go-To Fabrics
                </h4>
                <p className="font-body text-sm text-foreground/80">{season.fabrics}</p>
              </div>

              {/* Key Pieces */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h4 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Essential Pieces
                </h4>
                <div className="space-y-3">
                  {season.keyPieces.map((piece, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="font-display text-xs font-bold text-accent mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{piece}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h4 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Styling Tips
                </h4>
                <div className="space-y-3">
                  {season.tips.map((tip, i) => (
                    <p key={i} className="font-body text-sm text-muted-foreground leading-relaxed">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>

              {si < SEASONS.length - 1 && (
                <div className="border-b border-border pt-4" />
              )}
            </motion.section>
          );
        })}

        <div className="text-center pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            ← Back to Outfit Generator
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SeasonalGuide;
