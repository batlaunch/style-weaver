import { motion } from "framer-motion";
import { RefreshCw, Lock, Unlock } from "lucide-react";

interface OutfitCardProps {
  label: string;
  color: string;
  colorName: string;
  description: string;
  index: number;
  isLocked: boolean;
  onSwap: () => void;
  onToggleLock: () => void;
}

const OutfitCard = ({ label, color, colorName, description, index, isLocked, onSwap, onToggleLock }: OutfitCardProps) => {
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
        <div
          className="w-14 h-14 rounded-md border border-border flex-shrink-0"
          style={{ backgroundColor: color }}
        />
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
    </motion.div>
  );
};

export default OutfitCard;
