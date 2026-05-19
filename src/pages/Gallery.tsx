import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Loader2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSavedOutfits } from "@/hooks/useSavedOutfits";
import SavedOutfitCard from "@/components/SavedOutfitCard";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 12;

const Gallery = () => {
  const { savedOutfits, isLoading, deleteOutfit } = useSavedOutfits();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return savedOutfits;
    return savedOutfits.filter((o) => {
      if (o.style.toLowerCase().includes(q)) return true;
      if (o.harmony.toLowerCase().includes(q)) return true;
      if (o.gender.toLowerCase().includes(q)) return true;
      if (o.items.some((it) => it.description.toLowerCase().includes(q) || it.label.toLowerCase().includes(q) || it.colorName.toLowerCase().includes(q))) return true;
      if (o.palette.some((c) => c.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [savedOutfits, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    const ok = await deleteOutfit(pendingDeleteId);
    setIsDeleting(false);
    setPendingDeleteId(null);
    if (ok) toast.success("Outfit removed from gallery");
    else toast.error("Failed to remove outfit");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Saved Outfits Gallery | Fitted Fashion"
        description="Your gallery of saved AI-generated outfits. Compare palettes, revisit styles, and find inspiration from your past looks."
        path="/gallery"
      />
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            to="/"
            aria-label="Back to outfit builder"
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

        {/* Search */}
        {savedOutfits.length > 0 && (
          <div className="mb-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by style, color, item, harmony…"
              aria-label="Search saved outfits"
              className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border bg-card text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

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
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-sm text-muted-foreground">
              No outfits match “{search}”.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {pageItems.map((outfit, i) => (
                  <SavedOutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    index={i}
                    onDelete={(id) => setPendingDeleteId(id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="p-2 rounded-md border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-display text-xs uppercase tracking-wider text-muted-foreground px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="p-2 rounded-md border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && !isDeleting && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the saved outfit from your gallery. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Gallery;
