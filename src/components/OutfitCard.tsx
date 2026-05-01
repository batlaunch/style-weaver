import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown, X } from "lucide-react";

interface OutfitCardProps {
  label: string;
  color: string;
  colorName: string;
  description: string;
  index: number;
  isLocked?: boolean;
  isRegenerating?: boolean;
  canRemove?: boolean;
  colorRole?: "Base" | "Secondary" | "Accent";
  altColors?: { hex: string; name: string }[];
  onRegenerate: () => void;
  onRemove?: () => void;
  onColorPick?: (hex: string, name: string) => void;
}

const ROLE_STYLES: Record<string, { label: string; cls: string }> = {
  Base: { label: "Base · 60%", cls: "bg-muted text-muted-foreground border-border" },
  Secondary: { label: "Secondary · 30%", cls: "bg-secondary text-foreground border-border" },
  Accent: { label: "Accent · 10%", cls: "bg-accent/15 text-accent border-accent/40" },
};

const OutfitCard = ({ label, color, colorName, description, index, isLocked, isRegenerating, canRemove, colorRole, altColors, onRegenerate, onRemove, onColorPick }: OutfitCardProps) => {
  const [showColors, setShowColors] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`group relative bg-card rounded-lg border p-4 transition-all duration-300 ${
        isLocked
          ? "border-accent/50 bg-accent/5"
          : "border-border hover:border-accent/40"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Clickable color swatch */}
        <button
          onClick={() => {
            if (altColors && altColors.length > 0 && !isLocked) {
              setShowColors(!showColors);
            }
          }}
          className={`w-14 h-14 rounded-md border border-border flex-shrink-0 relative transition-transform ${
            altColors && altColors.length > 0 && !isLocked ? "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-accent/40" : "cursor-default"
          }`}
          style={{ backgroundColor: color }}
          title={altColors && altColors.length > 0 && !isLocked ? "Click to change color" : colorName}
        >
          {altColors && altColors.length > 0 && !isLocked && (
            <ChevronDown className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 text-accent bg-card rounded-full border border-border transition-transform ${showColors ? "rotate-180" : ""}`} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-sm font-medium text-foreground uppercase tracking-wider">
              {label}
            </p>
            {colorRole && ROLE_STYLES[colorRole] && (
              <span
                className={`font-display text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${ROLE_STYLES[colorRole].cls}`}
                title={`This piece plays the ${colorRole.toLowerCase()} role in the 60/30/10 color split`}
              >
                {ROLE_STYLES[colorRole].label}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          <p className="text-xs text-accent font-medium mt-1">{colorName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
            title="Regenerate this item"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          </button>
          {canRemove && onRemove && (
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Remove this item"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alternative color picker */}
      <AnimatePresence>
        {showColors && altColors && altColors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">
                Alternative colors in harmony
              </p>
              <div className="flex gap-2 flex-wrap">
                {altColors.map((ac, ci) => (
                  <button
                    key={ci}
                    onClick={() => {
                      onColorPick?.(ac.hex, ac.name);
                      setShowColors(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-all hover:ring-2 hover:ring-accent/40 ${
                      ac.hex.toLowerCase() === color.toLowerCase()
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: ac.hex }}
                    />
                    <span className="text-xs font-body text-muted-foreground">{ac.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OutfitCard;
