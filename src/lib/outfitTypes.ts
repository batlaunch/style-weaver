export interface OutfitItem {
  label: string;
  color: string;
  colorName: string;
  description: string;
  altColors?: { hex: string; name: string }[];
}

export interface OutfitPaletteColor {
  hex: string;
  name: string;
}

export interface Outfit {
  items: OutfitItem[];
  palette: OutfitPaletteColor[];
  harmony: string;
  rationale?: string;
}

export interface SavedOutfit extends Outfit {
  id: string;
  style: string;
  gender: string;
  outfitImageUrl?: string | null;
  createdAt: string;
}
