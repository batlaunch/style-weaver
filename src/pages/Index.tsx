import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Shirt, Heart, ImageIcon, Menu, X, LogIn, LogOut, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compressImage";
import UploadZone from "@/components/UploadZone";
import MannequinDisplay from "@/components/MannequinDisplay";
import OutfitCard from "@/components/OutfitCard";
import ColorPalette from "@/components/ColorPalette";
import HarmonyExplanation from "@/components/HarmonyExplanation";
import StylePreferences, { type StyleType, type GenderType, type SkinTone, type SeasonType } from "@/components/StylePreferences";
import { useSavedOutfits } from "@/hooks/useSavedOutfits";
import { useAuth } from "@/hooks/useAuth";
import { incrementStyleUsage } from "@/lib/styleUsage";
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
  const [itemDescription, setItemDescription] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>("spring");
  const { saveOutfit } = useSavedOutfits();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = useCallback((_file: File, preview: string) => {
    setUploadedImage(preview);
    setCurrentOutfit(null);
    setOutfitImageUrl(null);
    setItemDescription("");
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
    setCurrentOutfit(null);
    setOutfitImageUrl(null);
    setItemDescription("");
  }, []);

  const generateOutfit = useCallback(async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setOutfitImageUrl(null);

    try {
      const style = selectedStyle === "any" ? "any" : selectedStyle;
      const compressed = await compressImage(uploadedImage);

      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: {
          imageBase64: compressed,
          style,
          gender: selectedGender,
          skinTone: selectedSkinTone,
          season: selectedSeason,
          itemDescription: itemDescription.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setIsGenerating(false);
        return;
      }

      setResolvedStyle(style === "any" ? "mixed" : style);
      if (style !== "any") incrementStyleUsage(style);
      setCurrentOutfit({
        items: data.items,
        palette: data.palette,
        harmony: data.harmony,
        rationale: data.rationale,
      });
    } catch (e) {
      console.error("Outfit generation failed:", e);
      toast.error("Failed to generate outfit. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImage, selectedStyle, selectedGender, selectedSkinTone, itemDescription]);

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [isAddingPiece, setIsAddingPiece] = useState(false);
  const [addPieceRequest, setAddPieceRequest] = useState("");

  const regenerateSingleItem = useCallback(async (index: number) => {
    if (!uploadedImage || !currentOutfit) return;
    setRegeneratingIndex(index);
    try {
      const compressed = await compressImage(uploadedImage);
      const keptItems = currentOutfit.items.filter((_, i) => i !== index);

      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: {
          imageBase64: compressed,
          style: selectedStyle === "any" ? "any" : selectedStyle,
          gender: selectedGender,
          skinTone: selectedSkinTone,
          season: selectedSeason,
          itemDescription: itemDescription.trim() || undefined,
          lockedItems: keptItems,
          regenerateSlot: currentOutfit.items[index].label,
        },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      // Find the regenerated item (the one matching the slot label)
      const newItem = data.items.find((it: any) => it.label === currentOutfit.items[index].label);
      if (newItem) {
        setCurrentOutfit((prev) => {
          if (!prev) return prev;
          const newItems = [...prev.items];
          newItems[index] = newItem;
          return { ...prev, items: newItems, palette: data.palette || prev.palette, harmony: data.harmony || prev.harmony, rationale: data.rationale ?? prev.rationale };
        });
      }
    } catch (e) {
      console.error("Single item regeneration failed:", e);
      toast.error("Failed to regenerate item");
    } finally {
      setRegeneratingIndex(null);
    }
  }, [uploadedImage, currentOutfit, selectedStyle, selectedGender, selectedSkinTone, selectedSeason, itemDescription]);

  const addAnotherPiece = useCallback(async () => {
    if (!uploadedImage || !currentOutfit) return;
    setIsAddingPiece(true);
    try {
      const compressed = await compressImage(uploadedImage);
      const existingLabels = new Set(currentOutfit.items.map((it) => it.label));

      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: {
          imageBase64: compressed,
          style: selectedStyle === "any" ? "any" : selectedStyle,
          gender: selectedGender,
          skinTone: selectedSkinTone,
          season: selectedSeason,
          itemDescription: itemDescription.trim() || undefined,
          lockedItems: currentOutfit.items,
          addPiece: true,
          addPieceRequest: addPieceRequest.trim() || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      // Find the new item (the one whose label is not in the existing set)
      const newItem = data.items?.find((it: any) => !existingLabels.has(it.label));
      if (newItem) {
        setCurrentOutfit((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: [...prev.items, newItem],
            palette: data.palette || prev.palette,
            harmony: data.harmony || prev.harmony,
            rationale: data.rationale ?? prev.rationale,
          };
        });
        toast.success(`Added ${newItem.label.toLowerCase()} to your outfit`);
        setAddPieceRequest("");
      } else {
        toast.error("Couldn't find a new piece to add");
      }
    } catch (e) {
      console.error("Add piece failed:", e);
      toast.error("Failed to add another piece");
    } finally {
      setIsAddingPiece(false);
    }
  }, [uploadedImage, currentOutfit, selectedStyle, selectedGender, selectedSkinTone, selectedSeason, itemDescription, addPieceRequest]);

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

  const removeItem = useCallback((index: number) => {
    setCurrentOutfit((prev) => {
      if (!prev) return prev;
      if (prev.items.length <= 4) {
        toast.error("An outfit needs at least 4 pieces");
        return prev;
      }
      const removed = prev.items[index];
      toast.success(`Removed ${removed.label.toLowerCase()}`);
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/style-quiz", label: "Style Quiz" },
    { to: "/gallery", label: "Gallery" },
    { to: "/color-theory", label: "Color Theory" },
    { to: "/fashion-guide", label: "Fashion Guide" },
    { to: "/seasonal-guide", label: "Seasons" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border relative">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shirt className="w-5 h-5 text-accent" />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              FITTED FASHION
            </h1>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { signOut(); toast.success("Signed out"); }}
                className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-accent hover:text-foreground transition-colors">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <div className="container max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); toast.success("Signed out"); }}
                    className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-1 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-accent hover:text-foreground transition-colors py-1"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
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
            Upload any clothing piece, pick your style, and AI will build a complete color-coordinated outfit around your item.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Upload + Preferences + Mannequin */}
          <div className="space-y-6">
            <UploadZone
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClearImage}
              itemDescription={itemDescription}
              onItemDescriptionChange={setItemDescription}
            />

            <StylePreferences
              style={selectedStyle}
              gender={selectedGender}
              skinTone={selectedSkinTone}
              season={selectedSeason}
              onStyleChange={setSelectedStyle}
              onGenderChange={setSelectedGender}
              onSkinToneChange={setSelectedSkinTone}
              onSeasonChange={setSelectedSeason}
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
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {currentOutfit ? "New Outfit" : "Generate Outfit"}
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
                  <HarmonyExplanation harmonyType={currentOutfit.harmony} rationale={currentOutfit.rationale} />
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
                  <div>
                    <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Outfit Breakdown
                    </h3>
                  </div>
                  {currentOutfit.items.map((item, i) => (
                    <OutfitCard
                      key={`${item.label}-${item.colorName}-${i}`}
                      label={item.label}
                      color={item.color}
                      colorName={item.colorName}
                      description={item.description}
                      index={i}
                      isLocked={false}
                      isRegenerating={regeneratingIndex === i}
                      canRemove={currentOutfit.items.length > 4}
                      altColors={item.altColors}
                      colorRole={item.colorRole}
                      onRegenerate={() => regenerateSingleItem(i)}
                      onRemove={() => removeItem(i)}
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
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={addPieceRequest}
                        onChange={(e) => setAddPieceRequest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isAddingPiece) {
                            e.preventDefault();
                            addAnotherPiece();
                          }
                        }}
                        maxLength={200}
                        placeholder="e.g. a brown leather belt, gold chain, beanie…"
                        disabled={isAddingPiece}
                        className="flex-1 px-3 py-3 rounded-lg border border-dashed border-accent/40 bg-accent/5 text-foreground placeholder:text-muted-foreground/70 font-body text-sm focus:outline-none focus:border-accent/70 focus:bg-accent/10 transition-colors disabled:opacity-50"
                      />
                      <button
                        onClick={addAnotherPiece}
                        disabled={isAddingPiece}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-accent/40 bg-accent/5 text-accent font-display text-xs uppercase tracking-wider hover:bg-accent/10 hover:border-accent/60 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isAddingPiece ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                            Adding…
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            {addPieceRequest.trim() ? "Add this" : "Add piece"}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-body text-center">
                      Describe a piece to add, or leave blank to let the stylist pick. Hover an item to regenerate ↻ or remove ✕.
                    </p>
                  </div>
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
