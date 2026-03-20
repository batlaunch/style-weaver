import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Lock, Unlock, ChevronDown } from "lucide-react";

interface OutfitCardProps {
  label: string;
  color: string;
  colorName: string;
  description: string;
  index: number;
  isLocked: boolean;
  altColors?: { hex: string; name: string }[];
  onSwap: () => void;
  onToggleLock: () => void;
  onColorPick?: (hex: string, name: string) => void;
}

const OutfitCard = ({ label, color, colorName, description, index, isLocked, altColors, onSwap, onToggleLock, onColorPick }: OutfitCardProps) => {
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
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-medium text-foreground uppercase tracking-wider">
              {label}
            </p>
            {isLocked && (
              <span className="text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                Locked
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          <p className="text-xs text-accent font-medium mt-1">{colorName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-md transition-all ${
              isLocked
                ? "text-accent bg-accent/10 hover:bg-accent/20"
                : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            title={isLocked ? "Unlock this item" : "Lock this item"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          {!isLocked && (
            <button
              onClick={onSwap}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Swap this item"
            >
              <RefreshCw className="w-4 h-4" />
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
