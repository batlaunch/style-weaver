import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StyleType = "any" | "casual" | "smart-casual" | "business-casual" | "business-professional" | "cocktail" | "evening-formal" | "streetwear" | "minimalist" | "old-money" | "preppy" | "athleisure" | "vintage" | "utility" | "techwear" | "gorpcore" | "dark-academia" | "soft-boy" | "skater" | "rock-grunge" | "bohemian" | "classic" | "cottagecore" | "coquette" | "eclectic-grandpa";
export type GenderType = "male" | "female";
export type SkinTone = "fair" | "light" | "medium" | "olive" | "tan" | "brown" | "dark";
export type SeasonType = "any" | "spring" | "summer" | "fall" | "winter";

interface StylePreferencesProps {
  style: StyleType;
  gender: GenderType;
  skinTone: SkinTone;
  season: SeasonType;
  onStyleChange: (style: StyleType) => void;
  onGenderChange: (gender: GenderType) => void;
  onSkinToneChange: (tone: SkinTone) => void;
  onSeasonChange: (season: SeasonType) => void;
}

const MALE_STYLES: { value: StyleType; label: string; emoji: string }[] = [
  { value: "any", label: "Surprise Me", emoji: "🎲" },
  { value: "casual", label: "Casual", emoji: "👕" },
  { value: "smart-casual", label: "Smart Casual", emoji: "🧥" },
  { value: "business-casual", label: "Business Casual", emoji: "👔" },
  { value: "business-professional", label: "Business Professional", emoji: "🤵" },
  { value: "cocktail", label: "Cocktail Attire", emoji: "🍸" },
  { value: "streetwear", label: "Streetwear", emoji: "🔥" },
  { value: "minimalist", label: "Minimalist", emoji: "◻️" },
  { value: "old-money", label: "Old Money / Preppy", emoji: "🏛" },
  { value: "athleisure", label: "Athleisure", emoji: "⚡" },
  { value: "vintage", label: "Vintage / Retro", emoji: "📻" },
  { value: "utility", label: "Utility / Workwear", emoji: "🔧" },
  { value: "techwear", label: "Techwear", emoji: "🖤" },
  { value: "gorpcore", label: "Gorpcore", emoji: "🏔" },
  { value: "dark-academia", label: "Dark Academia", emoji: "📚" },
  { value: "soft-boy", label: "Soft Boy", emoji: "🌸" },
  { value: "skater", label: "Skater", emoji: "🛹" },
  { value: "rock-grunge", label: "Rock / Grunge", emoji: "🎸" },
  { value: "bohemian", label: "Bohemian", emoji: "🌿" },
  { value: "classic", label: "Classic", emoji: "👔" },
];

const FEMALE_STYLES: { value: StyleType; label: string; emoji: string }[] = [
  { value: "any", label: "Surprise Me", emoji: "🎲" },
  { value: "casual", label: "Casual", emoji: "👕" },
  { value: "smart-casual", label: "Smart Casual", emoji: "🧥" },
  { value: "business-casual", label: "Business Casual", emoji: "👔" },
  { value: "business-professional", label: "Business Professional", emoji: "💼" },
  { value: "cocktail", label: "Cocktail / Semi-Formal", emoji: "🍸" },
  { value: "evening-formal", label: "Evening Formal / Black Tie", emoji: "✨" },
  { value: "streetwear", label: "Streetwear", emoji: "🔥" },
  { value: "minimalist", label: "Minimalist / Clean Girl", emoji: "◻️" },
  { value: "old-money", label: "Old Money / Quiet Luxury", emoji: "🏛" },
  { value: "preppy", label: "Preppy", emoji: "🎀" },
  { value: "bohemian", label: "Boho / Bohemian Chic", emoji: "🌿" },
  { value: "athleisure", label: "Athleisure", emoji: "⚡" },
  { value: "vintage", label: "Vintage / Retro", emoji: "📻" },
  { value: "cottagecore", label: "Cottagecore", emoji: "🌼" },
  { value: "dark-academia", label: "Dark Academia", emoji: "📚" },
  { value: "rock-grunge", label: "Grunge / Edgy", emoji: "🎸" },
  { value: "coquette", label: "Coquette", emoji: "🎀" },
  { value: "gorpcore", label: "Utility / Gorpcore", emoji: "🏔" },
  { value: "eclectic-grandpa", label: "Eclectic Grandpa", emoji: "🧶" },
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

const SEASONS: { value: SeasonType; label: string; emoji: string }[] = [
  { value: "any", label: "Any Season", emoji: "🔄" },
  { value: "spring", label: "Spring", emoji: "🌸" },
  { value: "summer", label: "Summer", emoji: "☀️" },
  { value: "fall", label: "Fall", emoji: "🍂" },
  { value: "winter", label: "Winter", emoji: "❄️" },
];

const StylePreferences = ({ style, gender, skinTone, season, onStyleChange, onGenderChange, onSkinToneChange, onSeasonChange }: StylePreferencesProps) => {
  const styles = gender === "male" ? MALE_STYLES : FEMALE_STYLES;
  const currentStyle = styles.find((s) => s.value === style);

  // Reset to "any" if current style isn't available for selected gender
  const handleGenderChange = (g: GenderType) => {
    onGenderChange(g);
    const availableStyles = g === "male" ? MALE_STYLES : FEMALE_STYLES;
    if (!availableStyles.find((s) => s.value === style)) {
      onStyleChange("any");
    }
  };

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
            onClick={() => handleGenderChange("male")}
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
            onClick={() => handleGenderChange("female")}
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

      {/* Style Selection - Dropdown */}
      <div>
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Style
        </h3>
        <Select value={style} onValueChange={(val) => onStyleChange(val as StyleType)}>
          <SelectTrigger className="w-full bg-card border-border text-foreground font-body text-sm">
            <SelectValue>
              {currentStyle && (
                <span className="flex items-center gap-2">
                  <span>{currentStyle.emoji}</span>
                  {currentStyle.label}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {styles.map((s) => (
              <SelectItem key={s.value} value={s.value} className="font-body text-sm">
                <span className="flex items-center gap-2">
                  <span>{s.emoji}</span>
                  {s.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

export default StylePreferences;
