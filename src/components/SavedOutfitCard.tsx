import { motion } from "framer-motion";
import { Trash2, Clock } from "lucide-react";
import type { SavedOutfit } from "@/lib/outfitTypes";

interface SavedOutfitCardProps {
  outfit: SavedOutfit;
  index: number;
  onDelete: (id: string) => void;
}

const SavedOutfitCard = ({ outfit, index, onDelete }: SavedOutfitCardProps) => {
  const date = new Date(outfit.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group bg-card rounded-lg border border-border overflow-hidden hover:border-accent/40 transition-all"
    >
      {/* AI Generated Image */}
      {outfit.outfitImageUrl && (
        <div className="aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={outfit.outfitImageUrl}
            alt="Generated outfit"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Color swatches */}
      <div className="flex">
        {outfit.palette.map((c, i) => (
          <div
            key={i}
            className="flex-1 h-6"
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
      </div>

      <div className="p-3 space-y-2">
        {/* Style + Harmony badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent">
            {outfit.style}
          </span>
          <span className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            {outfit.harmony}
          </span>
          <span className="text-[10px] font-body text-muted-foreground capitalize">
            {outfit.gender}
          </span>
        </div>

        {/* Items list */}
        <div className="space-y-1">
          {outfit.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-body text-foreground truncate">
                {item.description}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-body">{formattedDate}</span>
          </div>
          <button
            onClick={() => onDelete(outfit.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Remove from gallery"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SavedOutfitCard;
