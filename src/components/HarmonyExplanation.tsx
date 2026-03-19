import { motion } from "framer-motion";
import { Info } from "lucide-react";

const HARMONY_EXPLANATIONS: Record<string, string> = {
  Analogous:
    "These colors sit next to each other on the color wheel, sharing similar undertones. This creates a naturally cohesive, harmonious look — nothing clashes because the colors are neighbors. It feels effortless and organic.",
  Complementary:
    "These colors sit directly opposite each other on the color wheel, creating maximum contrast and visual energy. The tension between them makes each color appear more vibrant — perfect for outfits that need a confident, polished pop.",
  Monochromatic:
    "This palette uses different shades and tones of a single color family. By varying lightness and saturation instead of hue, the outfit gains depth and sophistication without any risk of clashing. Texture differences keep it interesting.",
  Triadic:
    "Three colors equally spaced on the color wheel (120° apart). This creates a vibrant, balanced combination where each color energizes the others. One dominates while the others accent — bold but controlled.",
  "Split-Complementary":
    "Instead of the direct opposite color, this uses the two colors adjacent to the complement. It offers strong contrast like complementary harmony, but with more nuance and less visual tension — a sophisticated middle ground.",
};

interface HarmonyExplanationProps {
  harmonyType: string;
}

const HarmonyExplanation = ({ harmonyType }: HarmonyExplanationProps) => {
  const explanation = HARMONY_EXPLANATIONS[harmonyType] || HARMONY_EXPLANATIONS["Analogous"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex gap-3"
    >
      <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <div>
        <h4 className="font-display text-xs uppercase tracking-wider text-accent font-semibold mb-1">
          Why these colors work — {harmonyType} Harmony
        </h4>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          {explanation}
        </p>
      </div>
    </motion.div>
  );
};

export default HarmonyExplanation;
