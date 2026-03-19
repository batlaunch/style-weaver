import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Shirt } from "lucide-react";
import { Link } from "react-router-dom";
import UploadZone from "@/components/UploadZone";
import MannequinDisplay from "@/components/MannequinDisplay";
import OutfitCard from "@/components/OutfitCard";
import ColorPalette from "@/components/ColorPalette";

// Mock outfit data using color theory harmonies
const MOCK_OUTFITS = [
  {
    items: [
      { label: "Top", color: "#5B7553", colorName: "Sage Green", description: "Relaxed linen button-up" },
      { label: "Bottom", color: "#F5E6D3", colorName: "Cream", description: "High-waisted wide-leg trousers" },
      { label: "Shoes", color: "#8B6F47", colorName: "Camel", description: "Suede loafers" },
      { label: "Accessory", color: "#D4A574", colorName: "Tan", description: "Woven leather belt" },
    ],
    palette: [
      { hex: "#5B7553", name: "Sage" },
      { hex: "#F5E6D3", name: "Cream" },
      { hex: "#8B6F47", name: "Camel" },
      { hex: "#D4A574", name: "Tan" },
      { hex: "#3D4F38", name: "Forest" },
    ],
    harmony: "Analogous",
  },
  {
    items: [
      { label: "Top", color: "#2C3E50", colorName: "Navy", description: "Structured blazer" },
      { label: "Bottom", color: "#ECF0F1", colorName: "Off-White", description: "Tailored slim chinos" },
      { label: "Shoes", color: "#784212", colorName: "Cognac", description: "Oxford leather shoes" },
      { label: "Accessory", color: "#C0392B", colorName: "Burgundy", description: "Silk pocket square" },
    ],
    palette: [
      { hex: "#2C3E50", name: "Navy" },
      { hex: "#ECF0F1", name: "Off-White" },
      { hex: "#784212", name: "Cognac" },
      { hex: "#C0392B", name: "Burgundy" },
      { hex: "#1A252F", name: "Midnight" },
    ],
    harmony: "Complementary",
  },
  {
    items: [
      { label: "Top", color: "#D5C4A1", colorName: "Sand", description: "Cashmere turtleneck" },
      { label: "Bottom", color: "#1C1C1C", colorName: "Charcoal", description: "Tapered wool trousers" },
      { label: "Shoes", color: "#2D2D2D", colorName: "Black", description: "Minimalist sneakers" },
      { label: "Accessory", color: "#B8860B", colorName: "Gold", description: "Thin chain necklace" },
    ],
    palette: [
      { hex: "#D5C4A1", name: "Sand" },
      { hex: "#1C1C1C", name: "Charcoal" },
      { hex: "#2D2D2D", name: "Black" },
      { hex: "#B8860B", name: "Gold" },
      { hex: "#8B7D6B", name: "Taupe" },
    ],
    harmony: "Monochromatic",
  },
];

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<typeof MOCK_OUTFITS[0] | null>(null);
  const [outfitIndex, setOutfitIndex] = useState(0);

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
    // Simulate AI generation
    setTimeout(() => {
      const idx = outfitIndex % MOCK_OUTFITS.length;
      setCurrentOutfit(MOCK_OUTFITS[idx]);
      setOutfitIndex((prev) => prev + 1);
      setIsGenerating(false);
    }, 2000);
  }, [outfitIndex]);

  const handleSwapItem = useCallback(
    (itemIndex: number) => {
      if (!currentOutfit) return;
      // Simulate swapping a single item
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
            Upload any clothing piece and we'll generate a complete, color-coordinated outfit using color theory principles.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Upload + Mannequin */}
          <div className="space-y-6">
            <UploadZone
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClearImage}
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
                    We analyze its color and style to build a full outfit
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-display font-bold">03</span>
                    Swap individual pieces or regenerate the entire look
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
