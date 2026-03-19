import { motion } from "framer-motion";

interface ColorPaletteProps {
  colors: { hex: string; name: string }[];
  harmonyType: string;
}

const ColorPalette = ({ colors, harmonyType }: ColorPaletteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-lg border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Color Harmony
        </h3>
        <span className="text-xs font-body text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10">
          {harmonyType}
        </span>
      </div>
      <div className="flex gap-2">
        {colors.map((c, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className="w-full aspect-square rounded-md border border-border mb-2"
              style={{ backgroundColor: c.hex }}
            />
            <p className="text-[10px] text-muted-foreground font-body">{c.name}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ColorPalette;
