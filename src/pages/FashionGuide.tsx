import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shirt, Ruler, Layers, Palette, Scissors, Star } from "lucide-react";

const PRINCIPLES = [
  {
    icon: Ruler,
    title: "Fit is Everything",
    content: [
      "The most expensive outfit will look cheap if it doesn't fit. The most affordable outfit will look intentional if it fits well.",
      "Shoulders should end at your shoulder bone. Trouser hems should break once at the shoe. Sleeves should show a sliver of shirt cuff under a jacket.",
      "Find a good tailor — a $15 alteration on a $40 shirt will outperform a $200 shirt that doesn't fit.",
    ],
  },
  {
    icon: Layers,
    title: "Layering Creates Depth",
    content: [
      "Layering isn't just for warmth — it adds visual complexity and lets you mix textures and tones.",
      "Start with a fitted base layer, add a mid-layer with structure (a button-up, cardigan, or vest), and finish with an outer layer that frames the look.",
      "Vary the lengths: a longer coat over a shorter jacket over a tucked shirt creates a cascading silhouette that draws the eye.",
    ],
  },
  {
    icon: Palette,
    title: "Build a Capsule Wardrobe",
    content: [
      "A capsule wardrobe is a curated collection of versatile pieces that all work together. Start with 15-20 core items.",
      "Neutrals first: well-fitting dark jeans, tailored chinos (navy, grey, khaki), plain tees and shirts in white, black, and grey.",
      "Add 3-5 accent pieces — a statement jacket, patterned shirt, or colored knitwear — that inject personality into your neutral base.",
    ],
  },
  {
    icon: Scissors,
    title: "Texture & Fabric Matter",
    content: [
      "Mixing textures creates visual interest even in monochromatic outfits. Pair matte with sheen, rough with smooth.",
      "Cotton and linen for casual warmth. Wool and cashmere for refined structure. Denim and canvas for rugged edge.",
      "A simple rule: the shinier and smoother the fabric, the more formal it reads. Matte and textured fabrics feel casual.",
    ],
  },
  {
    icon: Star,
    title: "Accessories as Finishing Touches",
    content: [
      "Accessories are the easiest way to elevate an outfit. A watch, belt, or pair of sunglasses can transform basics into a look.",
      "Match your metals: if your watch is silver, your belt buckle and ring should lean silver too.",
      "Less is more. One statement accessory (a bold watch, a patterned scarf) beats five competing pieces.",
    ],
  },
  {
    icon: Shirt,
    title: "Dress for the Occasion",
    content: [
      "Context matters more than trends. A perfectly styled streetwear outfit is wrong at a formal dinner, and vice versa.",
      "When in doubt, slightly overdress — it shows respect and intention. You can always remove a layer or loosen a collar.",
      "Understand dress codes: 'smart casual' means structured pieces in relaxed fabrics. 'Business casual' means no tie but yes to a collared shirt.",
    ],
  },
];

const QUICK_TIPS = [
  "Iron or steam your clothes — wrinkles undermine even great outfits.",
  "Match your belt to your shoes in leather color.",
  "No more than 3 colors in one outfit (neutrals don't count).",
  "Cuff your jeans or chinos to show ankle — it creates a cleaner line.",
  "Invest in shoes. People notice them more than you think.",
  "When mixing patterns, vary the scale (small stripes with large plaid).",
  "Dark colors slenderize; light colors add visual volume.",
  "Tuck in your shirt if wearing a belt — otherwise the belt is invisible.",
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const FashionGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Fashion Fundamentals
          </h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-10 space-y-16">
        {/* Intro */}
        <motion.section {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
            The foundations of great style
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            Fashion isn't about following every trend — it's about understanding a few timeless principles and applying them with confidence. These fundamentals will serve you whether you're building your first wardrobe or refining an existing one.
          </p>
        </motion.section>

        {/* Principles */}
        <section className="space-y-6">
          <motion.h3
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Core Principles
          </motion.h3>

          {PRINCIPLES.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-md bg-accent/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-foreground">{p.title}</h4>
                </div>
                <div className="space-y-3">
                  {p.content.map((paragraph, pi) => (
                    <p key={pi} className="font-body text-sm text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Quick Tips */}
        <motion.section {...fadeUp} transition={{ duration: 0.5 }}>
          <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Quick Reference
          </h3>
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-display text-lg font-semibold text-foreground mb-4">
              8 Rules to Live By
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {QUICK_TIPS.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="font-display text-xs font-bold text-accent mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

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

export default FashionGuide;
