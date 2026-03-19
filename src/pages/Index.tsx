import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Shirt } from "lucide-react";
import { Link } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
import MannequinDisplay from "@/components/MannequinDisplay";
import OutfitCard from "@/components/OutfitCard";
import ColorPalette from "@/components/ColorPalette";
import StylePreferences, { type StyleType, type GenderType } from "@/components/StylePreferences";

// Style + gender aware mock outfits
const MOCK_OUTFITS: Record<string, Array<{
  items: { label: string; color: string; colorName: string; description: string }[];
  palette: { hex: string; name: string }[];
  harmony: string;
}>> = {
  "streetwear-male": [
    {
      items: [
        { label: "Top", color: "#1C1C1C", colorName: "Black", description: "Oversized graphic hoodie" },
        { label: "Bottom", color: "#4A4A4A", colorName: "Dark Grey", description: "Cargo joggers" },
        { label: "Shoes", color: "#E8E8E8", colorName: "White", description: "Chunky high-top sneakers" },
        { label: "Accessory", color: "#C0392B", colorName: "Red", description: "Snapback cap" },
      ],
      palette: [
        { hex: "#1C1C1C", name: "Black" }, { hex: "#4A4A4A", name: "Grey" },
        { hex: "#E8E8E8", name: "White" }, { hex: "#C0392B", name: "Red" }, { hex: "#2D2D2D", name: "Charcoal" },
      ],
      harmony: "Monochromatic",
    },
  ],
  "streetwear-female": [
    {
      items: [
        { label: "Top", color: "#E8D5B7", colorName: "Cream", description: "Cropped boxy tee" },
        { label: "Bottom", color: "#5B7553", colorName: "Olive", description: "High-waisted cargo pants" },
        { label: "Shoes", color: "#F5F5F5", colorName: "White", description: "Platform sneakers" },
        { label: "Accessory", color: "#B8860B", colorName: "Gold", description: "Layered chain necklaces" },
      ],
      palette: [
        { hex: "#E8D5B7", name: "Cream" }, { hex: "#5B7553", name: "Olive" },
        { hex: "#F5F5F5", name: "White" }, { hex: "#B8860B", name: "Gold" }, { hex: "#3D4F38", name: "Forest" },
      ],
      harmony: "Analogous",
    },
  ],
  "old-money-male": [
    {
      items: [
        { label: "Top", color: "#2C3E50", colorName: "Navy", description: "Cable-knit V-neck sweater" },
        { label: "Bottom", color: "#D5C4A1", colorName: "Khaki", description: "Pressed chinos" },
        { label: "Shoes", color: "#784212", colorName: "Cognac", description: "Penny loafers" },
        { label: "Accessory", color: "#1A3C34", colorName: "Hunter Green", description: "Silk cravat" },
      ],
      palette: [
        { hex: "#2C3E50", name: "Navy" }, { hex: "#D5C4A1", name: "Khaki" },
        { hex: "#784212", name: "Cognac" }, { hex: "#1A3C34", name: "Hunter" }, { hex: "#ECF0F1", name: "Ivory" },
      ],
      harmony: "Complementary",
    },
  ],
  "old-money-female": [
    {
      items: [
        { label: "Top", color: "#ECF0F1", colorName: "Ivory", description: "Cashmere turtleneck" },
        { label: "Bottom", color: "#2C3E50", colorName: "Navy", description: "Pleated midi skirt" },
        { label: "Shoes", color: "#D5C4A1", colorName: "Beige", description: "Ballet flats" },
        { label: "Accessory", color: "#B8860B", colorName: "Gold", description: "Pearl stud earrings" },
      ],
      palette: [
        { hex: "#ECF0F1", name: "Ivory" }, { hex: "#2C3E50", name: "Navy" },
        { hex: "#D5C4A1", name: "Beige" }, { hex: "#B8860B", name: "Gold" }, { hex: "#8B7D6B", name: "Taupe" },
      ],
      harmony: "Analogous",
    },
  ],
  "minimalist-male": [
    {
      items: [
        { label: "Top", color: "#F5F5F5", colorName: "White", description: "Structured cotton tee" },
        { label: "Bottom", color: "#1C1C1C", colorName: "Black", description: "Slim tapered trousers" },
        { label: "Shoes", color: "#2D2D2D", colorName: "Charcoal", description: "Clean leather sneakers" },
        { label: "Accessory", color: "#C0C0C0", colorName: "Silver", description: "Simple watch" },
      ],
      palette: [
        { hex: "#F5F5F5", name: "White" }, { hex: "#1C1C1C", name: "Black" },
        { hex: "#2D2D2D", name: "Charcoal" }, { hex: "#C0C0C0", name: "Silver" }, { hex: "#808080", name: "Grey" },
      ],
      harmony: "Monochromatic",
    },
  ],
  "minimalist-female": [
    {
      items: [
        { label: "Top", color: "#D5C4A1", colorName: "Sand", description: "Oversized linen shirt" },
        { label: "Bottom", color: "#F5E6D3", colorName: "Cream", description: "Wide-leg trousers" },
        { label: "Shoes", color: "#1C1C1C", colorName: "Black", description: "Pointed mules" },
        { label: "Accessory", color: "#B8860B", colorName: "Gold", description: "Thin cuff bracelet" },
      ],
      palette: [
        { hex: "#D5C4A1", name: "Sand" }, { hex: "#F5E6D3", name: "Cream" },
        { hex: "#1C1C1C", name: "Black" }, { hex: "#B8860B", name: "Gold" }, { hex: "#8B7D6B", name: "Taupe" },
      ],
      harmony: "Monochromatic",
    },
  ],
  "bohemian-male": [
    {
      items: [
        { label: "Top", color: "#8B6F47", colorName: "Camel", description: "Loose woven henley" },
        { label: "Bottom", color: "#5B7553", colorName: "Olive", description: "Relaxed linen pants" },
        { label: "Shoes", color: "#6B4226", colorName: "Brown", description: "Worn leather sandals" },
        { label: "Accessory", color: "#D4A574", colorName: "Tan", description: "Beaded bracelet stack" },
      ],
      palette: [
        { hex: "#8B6F47", name: "Camel" }, { hex: "#5B7553", name: "Olive" },
        { hex: "#6B4226", name: "Brown" }, { hex: "#D4A574", name: "Tan" }, { hex: "#3D4F38", name: "Forest" },
      ],
      harmony: "Analogous",
    },
  ],
  "bohemian-female": [
    {
      items: [
        { label: "Top", color: "#C0392B", colorName: "Terracotta", description: "Flowy peasant blouse" },
        { label: "Bottom", color: "#F1C40F", colorName: "Mustard", description: "Tiered maxi skirt" },
        { label: "Shoes", color: "#8B6F47", colorName: "Camel", description: "Strappy leather sandals" },
        { label: "Accessory", color: "#1ABC9C", colorName: "Turquoise", description: "Statement earrings" },
      ],
      palette: [
        { hex: "#C0392B", name: "Terracotta" }, { hex: "#F1C40F", name: "Mustard" },
        { hex: "#8B6F47", name: "Camel" }, { hex: "#1ABC9C", name: "Turquoise" }, { hex: "#6B4226", name: "Umber" },
      ],
      harmony: "Triadic",
    },
  ],
  "athleisure-male": [
    {
      items: [
        { label: "Top", color: "#2C3E50", colorName: "Navy", description: "Zip-up track jacket" },
        { label: "Bottom", color: "#34495E", colorName: "Slate", description: "Tapered joggers" },
        { label: "Shoes", color: "#E8E8E8", colorName: "White", description: "Running sneakers" },
        { label: "Accessory", color: "#1ABC9C", colorName: "Teal", description: "Sports watch" },
      ],
      palette: [
        { hex: "#2C3E50", name: "Navy" }, { hex: "#34495E", name: "Slate" },
        { hex: "#E8E8E8", name: "White" }, { hex: "#1ABC9C", name: "Teal" }, { hex: "#1A252F", name: "Midnight" },
      ],
      harmony: "Analogous",
    },
  ],
  "athleisure-female": [
    {
      items: [
        { label: "Top", color: "#9B59B6", colorName: "Lavender", description: "Fitted sports bra top" },
        { label: "Bottom", color: "#1C1C1C", colorName: "Black", description: "High-waisted leggings" },
        { label: "Shoes", color: "#F5F5F5", colorName: "White", description: "Knit running shoes" },
        { label: "Accessory", color: "#E8D5B7", colorName: "Cream", description: "Crossbody belt bag" },
      ],
      palette: [
        { hex: "#9B59B6", name: "Lavender" }, { hex: "#1C1C1C", name: "Black" },
        { hex: "#F5F5F5", name: "White" }, { hex: "#E8D5B7", name: "Cream" }, { hex: "#7D3C98", name: "Purple" },
      ],
      harmony: "Complementary",
    },
  ],
  "classic-male": [
    {
      items: [
        { label: "Top", color: "#ECF0F1", colorName: "White", description: "Crisp Oxford shirt" },
        { label: "Bottom", color: "#2C3E50", colorName: "Navy", description: "Tailored dress trousers" },
        { label: "Shoes", color: "#784212", colorName: "Cognac", description: "Cap-toe Oxfords" },
        { label: "Accessory", color: "#C0392B", colorName: "Burgundy", description: "Leather belt" },
      ],
      palette: [
        { hex: "#ECF0F1", name: "White" }, { hex: "#2C3E50", name: "Navy" },
        { hex: "#784212", name: "Cognac" }, { hex: "#C0392B", name: "Burgundy" }, { hex: "#1A252F", name: "Midnight" },
      ],
      harmony: "Complementary",
    },
  ],
  "classic-female": [
    {
      items: [
        { label: "Top", color: "#2C3E50", colorName: "Navy", description: "Fitted blazer" },
        { label: "Bottom", color: "#ECF0F1", colorName: "Ivory", description: "Pencil skirt" },
        { label: "Shoes", color: "#1C1C1C", colorName: "Black", description: "Pointed-toe pumps" },
        { label: "Accessory", color: "#B8860B", colorName: "Gold", description: "Structured handbag" },
      ],
      palette: [
        { hex: "#2C3E50", name: "Navy" }, { hex: "#ECF0F1", name: "Ivory" },
        { hex: "#1C1C1C", name: "Black" }, { hex: "#B8860B", name: "Gold" }, { hex: "#34495E", name: "Slate" },
      ],
      harmony: "Complementary",
    },
  ],
};

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<{
    items: { label: string; color: string; colorName: string; description: string }[];
    palette: { hex: string; name: string }[];
    harmony: string;
  } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("any");
  const [selectedGender, setSelectedGender] = useState<GenderType>("male");

  const handleImageUpload = useCallback((_file: File, preview: string) => {
    setUploadedImage(preview);
    setCurrentOutfit(null);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setCurrentOutfit(null);
  }, []);

  const generateOutfit = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      let style = selectedStyle;
      if (style === "any") {
        const styles: StyleType[] = ["streetwear", "old-money", "minimalist", "bohemian", "athleisure", "classic"];
        style = styles[Math.floor(Math.random() * styles.length)];
      }
      const key = `${style}-${selectedGender}`;
      const outfits = MOCK_OUTFITS[key] || MOCK_OUTFITS["classic-male"];
      setCurrentOutfit(outfits[0]);
      setIsGenerating(false);
    }, 2000);
  }, [selectedStyle, selectedGender]);

  const handleSwapItem = useCallback(
    (itemIndex: number) => {
      if (!currentOutfit) return;
      setIsGenerating(true);
      setTimeout(() => {
        const alternates = [
          { color: "#9B59B6", colorName: "Plum", description: "Silk wrap blouse" },
          { color: "#E67E22", colorName: "Rust", description: "Corduroy trousers" },
          { color: "#1ABC9C", colorName: "Teal", description: "Suede ankle boots" },
          { color: "#F39C12", colorName: "Amber", description: "Woven scarf" },
        ];
        const newItems = [...currentOutfit.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          ...alternates[itemIndex],
        };
        setCurrentOutfit({ ...currentOutfit, items: newItems });
        setIsGenerating(false);
      }, 1200);
    },
    [currentOutfit]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shirt className="w-5 h-5 text-accent" />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              ATELIER
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/color-theory" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Color Theory
            </Link>
            <Link to="/fashion-guide" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Fashion Guide
            </Link>
          </nav>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Build your perfect outfit
          </h2>
          <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto">
            Upload any clothing piece, pick your style and gender, and we'll generate a complete color-coordinated outfit.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Upload + Preferences + Mannequin */}
          <div className="space-y-6">
            <UploadZone
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClearImage}
            />

            <StylePreferences
              style={selectedStyle}
              gender={selectedGender}
              onStyleChange={setSelectedStyle}
              onGenderChange={setSelectedGender}
            />

            <MannequinDisplay
              isGenerating={isGenerating}
              hasOutfit={!!currentOutfit}
            />
          </div>

          {/* Right: Controls + Outfit */}
          <div className="space-y-6">
            {/* Generate Button */}
            <AnimatePresence>
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={generateOutfit}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-foreground text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {currentOutfit ? "New Outfit" : "Generate Outfit"}
                  </button>
                  {currentOutfit && (
                    <button
                      onClick={generateOutfit}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border border-border bg-card text-foreground font-display text-sm uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color Palette */}
            <AnimatePresence>
              {currentOutfit && (
                <ColorPalette
                  colors={currentOutfit.palette}
                  harmonyType={currentOutfit.harmony}
                />
              )}
            </AnimatePresence>

            {/* Outfit Items */}
            <AnimatePresence>
              {currentOutfit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Outfit Breakdown
                  </h3>
                  {currentOutfit.items.map((item, i) => (
                    <OutfitCard
                      key={`${item.label}-${item.colorName}`}
                      label={item.label}
                      color={item.color}
                      colorName={item.colorName}
                      description={item.description}
                      index={i}
                      onSwap={() => handleSwapItem(i)}
                    />
                  ))}
                  <p className="text-xs text-muted-foreground font-body text-center pt-2">
                    Hover over any item and click <RefreshCw className="w-3 h-3 inline" /> to swap it
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!uploadedImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-lg border border-border p-8 text-center"
              >
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-display text-lg font-medium text-foreground">
                  How it works
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground font-body text-left max-w-xs mx-auto">
                  <li className="flex gap-3">
                    <span className="text-accent font-display font-bold">01</span>
                    Upload a photo of any clothing item you own
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-display font-bold">02</span>
                    Choose your style and who the outfit is for
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-display font-bold">03</span>
                    Generate, swap pieces, or regenerate the entire look
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
