import { motion } from "framer-motion";
import { User, Users } from "lucide-react";

export type StyleType = "any" | "streetwear" | "old-money" | "minimalist" | "bohemian" | "athleisure" | "classic";
export type GenderType = "male" | "female";
export type SkinTone = "fair" | "light" | "medium" | "olive" | "tan" | "brown" | "dark";

interface StylePreferencesProps {
  style: StyleType;
  gender: GenderType;
  skinTone: SkinTone;
  onStyleChange: (style: StyleType) => void;
  onGenderChange: (gender: GenderType) => void;
  onSkinToneChange: (tone: SkinTone) => void;
}

const STYLES: { value: StyleType; label: string; emoji: string }[] = [
  { value: "any", label: "Surprise Me", emoji: "🎲" },
  { value: "streetwear", label: "Streetwear", emoji: "🔥" },
  { value: "old-money", label: "Old Money", emoji: "🏛" },
  { value: "minimalist", label: "Minimalist", emoji: "◻️" },
  { value: "bohemian", label: "Bohemian", emoji: "🌿" },
  { value: "athleisure", label: "Athleisure", emoji: "⚡" },
  { value: "classic", label: "Classic", emoji: "👔" },
];

const SKIN_TONES: { value: SkinTone; label: string; swatch: string }[] = [
  { value: "fair", label: "Fair", swatch: "#FDEBD0" },
  { value: "light", label: "Light", swatch: "#F5CBA7" },
  { value: "medium", label: "Medium", swatch: "#E0B386" },
  { value: "olive", label: "Olive", swatch: "#C8A96E" },
  { value: "tan", label: "Tan", swatch: "#B07D4B" },
  { value: "brown", label: "Brown", swatch: "#8B5E3C" },
  { value: "dark", label: "Dark", swatch: "#5C3A1E" },
];

const StylePreferences = ({ style, gender, skinTone, onStyleChange, onGenderChange, onSkinToneChange }: StylePreferencesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-5 space-y-5"
    >
      {/* Gender Toggle */}
      <div>
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Outfit For
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onGenderChange("male")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-display text-xs uppercase tracking-wider transition-all ${
              gender === "male"
                ? "bg-foreground text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Male
          </button>
          <button
            onClick={() => onGenderChange("female")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-display text-xs uppercase tracking-wider transition-all ${
              gender === "female"
                ? "bg-foreground text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Female
          </button>
        </div>
      </div>

      {/* Skin Tone */}
      <div>
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Skin Tone
        </h3>
        <div className="flex gap-2">
          {SKIN_TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => onSkinToneChange(t.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-md transition-all ${
                skinTone === t.value
                  ? "bg-secondary ring-2 ring-accent ring-offset-1 ring-offset-card"
                  : "hover:bg-secondary/50"
              }`}
              title={t.label}
            >
              <div
                className="w-6 h-6 rounded-full border border-border"
                style={{ backgroundColor: t.swatch }}
              />
              <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Style
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => onStyleChange(s.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md font-body text-xs transition-all ${
                style === s.value
                  ? "bg-foreground text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StylePreferences;
