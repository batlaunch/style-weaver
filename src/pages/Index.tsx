import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Shirt, Heart, ImageIcon, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compressImage";
import UploadZone from "@/components/UploadZone";
import MannequinDisplay from "@/components/MannequinDisplay";
import OutfitCard from "@/components/OutfitCard";
import ColorPalette from "@/components/ColorPalette";
import HarmonyExplanation from "@/components/HarmonyExplanation";
import StylePreferences, { type StyleType, type GenderType, type SkinTone } from "@/components/StylePreferences";
import { useSavedOutfits } from "@/hooks/useSavedOutfits";
import type { Outfit } from "@/lib/outfitTypes";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("any");
  const [selectedGender, setSelectedGender] = useState<GenderType>("male");
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone>("medium");
  const [resolvedStyle, setResolvedStyle] = useState<string>("classic");
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const { saveOutfit } = useSavedOutfits();

  const handleImageUpload = useCallback((_file: File, preview: string) => {
    setUploadedImage(preview);
    setCurrentOutfit(null);
    setOutfitImageUrl(null);
    setLockedIndices(new Set());
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setCurrentOutfit(null);
    setOutfitImageUrl(null);
    setLockedIndices(new Set());
  }, []);

  const generateOutfit = useCallback(async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setOutfitImageUrl(null);

    try {
      const style = selectedStyle === "any" ? "any" : selectedStyle;
      const compressed = await compressImage(uploadedImage);

      // Gather locked items to preserve
      const lockedItems = currentOutfit
        ? currentOutfit.items.filter((_, i) => lockedIndices.has(i))
        : [];

      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: {
          imageBase64: compressed,
          style,
          gender: selectedGender,
          skinTone: selectedSkinTone,
          lockedItems: lockedItems.length > 0 ? lockedItems : undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setIsGenerating(false);
        return;
      }

      setResolvedStyle(style === "any" ? "mixed" : style);
      setCurrentOutfit({
        items: data.items,
        palette: data.palette,
        harmony: data.harmony,
      });

      // Keep locked indices that still make sense
      if (lockedItems.length === 0) {
        setLockedIndices(new Set());
      }
    } catch (e) {
      console.error("Outfit generation failed:", e);
      toast.error("Failed to generate outfit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImage, selectedStyle, selectedGender, selectedSkinTone, currentOutfit, lockedIndices]);

  const generateOutfitImage = useCallback(async () => {
    if (!currentOutfit) return;
    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-outfit-image", {
        body: {
          items: currentOutfit.items,
          gender: selectedGender,
          style: resolvedStyle,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setOutfitImageUrl(data.imageUrl);
        toast.success("Outfit sketch generated!");
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      console.error("Image generation failed:", e);
      toast.error("Failed to generate outfit sketch");
    } finally {
      setIsGeneratingImage(false);
    }
  }, [currentOutfit, selectedGender, resolvedStyle]);

  const handleSaveOutfit = useCallback(async () => {
    if (!currentOutfit) return;
    const ok = await saveOutfit(currentOutfit, resolvedStyle, selectedGender, outfitImageUrl || undefined);
    if (ok) toast.success("Outfit saved to gallery!");
    else toast.error("Failed to save outfit");
  }, [currentOutfit, resolvedStyle, selectedGender, outfitImageUrl, saveOutfit]);

  const toggleLock = useCallback((index: number) => {
    setLockedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const lockedCount = lockedIndices.size;

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
            <Link to="/style-quiz" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Style Quiz
            </Link>
            <Link to="/gallery" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
            <Link to="/color-theory" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Color Theory
            </Link>
            <Link to="/fashion-guide" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Fashion Guide
            </Link>
            <Link to="/seasonal-guide" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Seasons
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
            Upload any clothing piece, pick your style and gender, and AI will build a complete color-coordinated outfit around your item.
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
              skinTone={selectedSkinTone}
              onStyleChange={setSelectedStyle}
              onGenderChange={setSelectedGender}
              onSkinToneChange={setSelectedSkinTone}
            />

            <MannequinDisplay
              isGenerating={isGenerating || isGeneratingImage}
              hasOutfit={!!currentOutfit}
              outfitImageUrl={outfitImageUrl}
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
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        {lockedCount > 0 ? "Regenerating unlocked…" : "Analyzing…"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {currentOutfit
                          ? lockedCount > 0
                            ? `Regenerate ${4 - lockedCount} unlocked`
                            : "New Outfit"
                          : "Generate Outfit"}
                      </>
                    )}
                  </button>
                  {currentOutfit && (
                    <>
                      <button
                        onClick={generateOutfit}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border border-border bg-card text-foreground font-display text-sm uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSaveOutfit}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg border border-border bg-card text-foreground font-display text-sm uppercase tracking-wider hover:bg-accent/10 hover:text-accent hover:border-accent/40 transition-colors"
                        title="Save to gallery"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visualize Button */}
            <AnimatePresence>
              {currentOutfit && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <button
                    onClick={generateOutfitImage}
                    disabled={isGeneratingImage}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-accent/30 bg-accent/5 text-accent font-display text-sm uppercase tracking-wider hover:bg-accent/10 transition-colors disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {isGeneratingImage ? "Sketching outfit…" : outfitImageUrl ? "Re-sketch Visualization" : "Sketch on Mannequin"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color Palette + Explanation */}
            <AnimatePresence>
              {currentOutfit && (
                <>
                  <ColorPalette
                    colors={currentOutfit.palette}
                    harmonyType={currentOutfit.harmony}
                  />
                  <HarmonyExplanation harmonyType={currentOutfit.harmony} />
                </>
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Outfit Breakdown
                    </h3>
                    {lockedCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-display uppercase tracking-wider text-accent">
                        <Lock className="w-3 h-3" />
                        {lockedCount} locked
                      </span>
                    )}
                  </div>
                  {currentOutfit.items.map((item, i) => (
                    <OutfitCard
                      key={`${item.label}-${item.colorName}-${i}`}
                      label={item.label}
                      color={item.color}
                      colorName={item.colorName}
                      description={item.description}
                      index={i}
                      isLocked={lockedIndices.has(i)}
                      altColors={item.altColors}
                      onSwap={() => {}}
                      onToggleLock={() => toggleLock(i)}
                      onColorPick={(hex, name) => {
                        setCurrentOutfit((prev) => {
                          if (!prev) return prev;
                          const newItems = [...prev.items];
                          newItems[i] = { ...newItems[i], color: hex, colorName: name };
                          return { ...prev, items: newItems };
                        });
                      }}
                    />
                  ))}
                  <p className="text-xs text-muted-foreground font-body text-center pt-2">
                    <Lock className="w-3 h-3 inline" /> Lock pieces you love, then regenerate to swap only the unlocked ones
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
                    AI identifies your piece and builds a full outfit around it
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-display font-bold">03</span>
                    Lock pieces you love, regenerate the rest, and save favorites
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
