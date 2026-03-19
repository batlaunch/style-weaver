import { motion } from "framer-motion";
import mannequinImg from "@/assets/mannequin.png";

interface MannequinDisplayProps {
  isGenerating: boolean;
  hasOutfit: boolean;
  outfitImageUrl?: string | null;
}

const MannequinDisplay = ({ isGenerating, hasOutfit, outfitImageUrl }: MannequinDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center justify-center bg-card rounded-lg border border-border overflow-hidden"
      style={{ minHeight: 420 }}
    >
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-display text-sm text-muted-foreground tracking-wider uppercase">
              Styling outfit…
            </p>
          </div>
        </div>
      )}

      {/* AI generated outfit image */}
      {outfitImageUrl ? (
        <img
          src={outfitImageUrl}
          alt="AI-generated outfit visualization"
          className="max-h-[400px] object-contain transition-opacity duration-500"
        />
      ) : (
        <img
          src={mannequinImg}
          alt="Mannequin display"
          className={`h-[380px] object-contain transition-opacity duration-500 ${
            hasOutfit ? "opacity-30" : "opacity-60"
          }`}
        />
      )}

      {!hasOutfit && !isGenerating && !outfitImageUrl && (
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Upload an item to begin
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default MannequinDisplay;
