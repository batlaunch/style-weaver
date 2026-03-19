import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const HARMONIES = [
  {
    name: "Analogous",
    description:
      "Colors that sit next to each other on the color wheel. They share undertones, creating a cohesive, calming look that feels naturally coordinated.",
    example: "Think olive green, sage, and soft teal — earthy and effortless.",
    colors: ["#5B7553", "#7A9B6D", "#4A8B7F", "#3D6B5E", "#8FAE84"],
    tip: "Great for casual, everyday outfits. Pick one dominant shade and let the others support it.",
  },
  {
    name: "Complementary",
    description:
      "Colors that sit directly opposite each other on the color wheel. They create visual tension and energy — perfect for making a statement.",
    example: "Navy blue with burnt orange, or burgundy with forest green.",
    colors: ["#2C3E50", "#E67E22", "#1A252F", "#D35400", "#34495E"],
    tip: "Use one color as the base (60-70% of the outfit) and the complement as an accent — a pocket square, belt, or shoes.",
  },
  {
    name: "Triadic",
    description:
      "Three colors equally spaced on the color wheel (120° apart). Bold but balanced — each color energizes the others without clashing.",
    example: "Red, yellow, and blue — or more subtly, terracotta, mustard, and slate blue.",
    colors: ["#C0392B", "#F1C40F", "#2980B9", "#E74C3C", "#3498DB"],
    tip: "Let one color dominate, use the second for accents, and the third sparingly — like jewelry or a pattern detail.",
  },
  {
    name: "Monochromatic",
    description:
      "Different shades, tints, and tones of a single hue. This creates depth and sophistication without any risk of clashing.",
    example: "Charcoal, grey, silver, and off-white — an all-neutral power move.",
    colors: ["#1C1C1C", "#3D3D3D", "#6B6B6B", "#9E9E9E", "#D5D5D5"],
    tip: "Vary textures to keep it interesting — a matte knit with glossy leather and woven fabric prevents the look from falling flat.",
  },
  {
    name: "Split-Complementary",
    description:
      "Instead of the direct opposite, you use the two colors adjacent to the complement. Slightly less contrast than complementary, but still vibrant.",
    example: "Blue paired with red-orange and yellow-orange.",
    colors: ["#2980B9", "#E74C3C", "#F39C12", "#1F6F9F", "#D4780A"],
    tip: "A safer alternative to complementary. The two 'split' colors are close enough to feel related while still popping against the base.",
  },
];

const COLOR_WHEEL_BASICS = [
  { label: "Warm Colors", desc: "Red, orange, yellow — energetic and inviting. They advance visually, making areas look larger.", colors: ["#C0392B", "#E67E22", "#F1C40F"] },
  { label: "Cool Colors", desc: "Blue, green, purple — calming and recessive. They create depth and feel more understated.", colors: ["#2980B9", "#27AE60", "#8E44AD"] },
  { label: "Neutrals", desc: "Black, white, grey, beige, navy, olive — the foundation of every wardrobe. They bridge warm and cool tones.", colors: ["#2C3E50", "#BDC3C7", "#D5C4A1"] },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const ColorTheory = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Color Theory for Fashion
          </h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-10 space-y-16">
        {/* Intro */}
        <motion.section {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Why colors matter in fashion
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Color is the first thing people notice about an outfit — before fit, fabric, or brand. Understanding how colors interact lets you build outfits that feel intentional and polished. You don't need to memorize rules; you just need to understand the relationships between colors.
          </p>
        </motion.section>

        {/* Color Wheel Basics */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            The Basics
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {COLOR_WHEEL_BASICS.map((group) => (
              <div key={group.label} className="bg-card border border-border rounded-lg p-5">
                <div className="flex gap-2 mb-3">
                  {group.colors.map((c) => (
                    <div
                      key={c}
                      className="w-8 h-8 rounded-md border border-border"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <h4 className="font-display text-sm font-semibold text-foreground">{group.label}</h4>
                <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">{group.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Harmonies */}
        <section className="space-y-8">
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Color Harmonies
            </h3>
            <p className="font-body text-muted-foreground text-sm max-w-xl">
              These are the proven relationships between colors. Each harmony creates a different mood and level of contrast in your outfit.
            </p>
          </motion.div>

          {HARMONIES.map((h, i) => (
            <motion.div
              key={h.name}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-display text-lg font-semibold text-foreground">{h.name}</h4>
                    <span className="text-[10px] font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 uppercase tracking-wider">
                      Harmony
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{h.description}</p>
                  <p className="font-body text-sm text-foreground/70 mt-2 italic">"{h.example}"</p>
                  <div className="mt-4 bg-secondary/50 rounded-md px-4 py-3">
                    <p className="font-body text-xs text-foreground/80">
                      <span className="font-display font-semibold text-accent">Styling tip:</span> {h.tip}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {h.colors.map((c, ci) => (
                    <div key={ci} className="text-center">
                      <div
                        className="w-12 h-12 rounded-md border border-border"
                        style={{ backgroundColor: c }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* The 60-30-10 Rule */}
        <motion.section {...fadeUp} transition={{ duration: 0.5 }} className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">
            The 60-30-10 Rule
          </h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
            The most reliable formula for balanced outfits. Borrowed from interior design, it works perfectly for fashion:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-foreground">60%</div>
              <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mt-1">Dominant Color</p>
              <p className="font-body text-xs text-muted-foreground mt-2">Your base — usually a neutral. Think trousers + top or a suit.</p>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-accent">30%</div>
              <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mt-1">Secondary Color</p>
              <p className="font-body text-xs text-muted-foreground mt-2">Supports the base. A jacket, cardigan, or contrasting shirt.</p>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-foreground/60">10%</div>
              <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mt-1">Accent Color</p>
              <p className="font-body text-xs text-muted-foreground mt-2">The pop — accessories, shoes, a pocket square, or watch strap.</p>
            </div>
          </div>
        </motion.section>

        {/* Skin Tone Section */}
        <motion.section {...fadeUp} transition={{ duration: 0.5 }} className="space-y-6">
          <div>
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Colors & Skin Tones
            </h3>
            <p className="font-body text-muted-foreground text-sm max-w-xl">
              Your skin's undertone — warm, cool, or neutral — determines which colors make you glow versus wash you out. Here's how to identify your undertone and choose accordingly.
            </p>
          </div>

          {/* How to Find Your Undertone */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-display text-lg font-semibold text-foreground mb-3">
              Finding Your Undertone
            </h4>
            <div className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
              <p><span className="font-display font-semibold text-foreground">Vein test:</span> Look at the veins on your inner wrist in natural light. Green veins = warm undertone. Blue/purple veins = cool undertone. Mix of both = neutral.</p>
              <p><span className="font-display font-semibold text-foreground">Jewelry test:</span> Does gold or silver jewelry look better on you? Gold = warm. Silver = cool. Both = neutral.</p>
              <p><span className="font-display font-semibold text-foreground">White paper test:</span> Hold a white sheet next to your face. If your skin looks yellowish, you're warm. Pinkish or bluish = cool. Neither = neutral.</p>
            </div>
          </div>

          {/* Warm Undertone */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-display text-lg font-semibold text-foreground">Warm Undertones</h4>
              <span className="text-[10px] font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 uppercase tracking-wider">Yellow / Peachy / Golden</span>
            </div>
            <div className="flex gap-2 mb-4">
              {["#C0392B", "#E67E22", "#F1C40F", "#5B7553", "#8B6F47"].map((c) => (
                <div key={c} className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              <span className="font-display font-semibold text-accent">Best colors:</span> Earth tones, warm reds, coral, peach, mustard, olive, warm browns, cream, camel, terracotta.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              <span className="font-display font-semibold text-foreground/60">Avoid:</span> Icy blues, stark white, cool greys, and neon pink — these can make warm skin look sallow.
            </p>
          </div>

          {/* Cool Undertone */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-display text-lg font-semibold text-foreground">Cool Undertones</h4>
              <span className="text-[10px] font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 uppercase tracking-wider">Pink / Red / Blue</span>
            </div>
            <div className="flex gap-2 mb-4">
              {["#2980B9", "#8E44AD", "#1ABC9C", "#2C3E50", "#C0392B"].map((c) => (
                <div key={c} className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              <span className="font-display font-semibold text-accent">Best colors:</span> True blues, emerald green, lavender, plum, cool grey, navy, raspberry, icy pastels, bright white.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              <span className="font-display font-semibold text-foreground/60">Avoid:</span> Orange, warm yellows, and earthy browns — these can make cool skin look ruddy or washed out.
            </p>
          </div>

          {/* Neutral Undertone */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-display text-lg font-semibold text-foreground">Neutral Undertones</h4>
              <span className="text-[10px] font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 uppercase tracking-wider">Balanced</span>
            </div>
            <div className="flex gap-2 mb-4">
              {["#2C3E50", "#D5C4A1", "#5B7553", "#9B59B6", "#E67E22"].map((c) => (
                <div key={c} className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              <span className="font-display font-semibold text-accent">Best colors:</span> You're lucky — most colors work. Jade green, dusty rose, soft navy, muted teal, blush, and medium-toned neutrals are especially flattering.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              <span className="font-display font-semibold text-foreground/60">Tip:</span> Lean into muted, mid-tone colors rather than extremes. Overly saturated or overly pastel shades may overpower your balanced complexion.
            </p>
          </div>

          {/* Deep / Dark Skin */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="font-display text-lg font-semibold text-foreground">Deep & Dark Skin Tones</h4>
              <span className="text-[10px] font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 uppercase tracking-wider">Rich & Vibrant</span>
            </div>
            <div className="flex gap-2 mb-4">
              {["#F1C40F", "#ECF0F1", "#E74C3C", "#27AE60", "#8E44AD"].map((c) => (
                <div key={c} className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              <span className="font-display font-semibold text-accent">Best colors:</span> Bold, saturated colors shine — bright white, cobalt blue, emerald, royal purple, vibrant red, and rich gold. Deep skin provides beautiful contrast with strong colors.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              <span className="font-display font-semibold text-foreground/60">Tip:</span> Don't shy away from color. Muted, washed-out tones can disappear against deeper skin. Go bold and saturated — it's your superpower.
            </p>
          </div>
        </motion.section>

        <div className="text-center pb-10">
          <Link
            to="/fashion-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Continue to Fashion Guide →
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ColorTheory;
