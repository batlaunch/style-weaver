import type { Outfit } from "./outfitTypes";

// Style + gender aware mock outfits
export const MOCK_OUTFITS: Record<string, Outfit[]> = {
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
