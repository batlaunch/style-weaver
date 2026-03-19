import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { useSavedOutfits } from "@/hooks/useSavedOutfits";
import SavedOutfitCard from "@/components/SavedOutfitCard";
import { toast } from "sonner";

const Gallery = () => {
  const { savedOutfits, isLoading, deleteOutfit } = useSavedOutfits();

  const handleDelete = async (id: string) => {
    const ok = await deleteOutfit(id);
    if (ok) toast.success("Outfit removed from gallery");
    else toast.error("Failed to remove outfit");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-md hover:bg-secondary transition-colors text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Saved Outfits
          </h1>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Your outfit gallery
          </h2>
          <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto">
            All your saved looks in one place. Compare palettes, revisit styles, and find inspiration.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : savedOutfits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-10 h-10 text-accent/30 mx-auto mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground">
              No saved outfits yet
            </h3>
            <p className="font-body text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Generate an outfit on the home page and tap the heart icon to save it here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-foreground text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Build an outfit
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {savedOutfits.map((outfit, i) => (
                <SavedOutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  index={i}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
