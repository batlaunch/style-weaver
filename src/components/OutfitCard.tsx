import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface OutfitCardProps {
  label: string;
  color: string;
  colorName: string;
  description: string;
  index: number;
  onSwap: () => void;
}

const OutfitCard = ({ label, color, colorName, description, index, onSwap }: OutfitCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-card rounded-lg border border-border p-4 hover:border-accent/40 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-md border border-border flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-medium text-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          <p className="text-xs text-accent font-medium mt-1">{colorName}</p>
        </div>
        <button
          onClick={onSwap}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
          title="Swap this item"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default OutfitCard;
