import { motion } from "framer-motion";
import { Check, Minus, Sparkles } from "lucide-react";
import type { Outfit, OutfitItem } from "@/lib/outfitTypes";

interface Props {
  outfit: Outfit;
  occasion: string;
}

type Status = "pass" | "neutral";

interface CheckRow {
  status: Status;
  title: string;
  detail: string;
}

const ACCESSORY_KEYWORDS = [
  "belt", "bag", "purse", "clutch", "tote", "handbag", "backpack",
  "shoe", "boot", "sneaker", "loafer", "heel", "pump", "sandal", "mule",
  "necklace", "earring", "bracelet", "ring", "watch", "jewelry",
  "scarf", "hat", "cap", "beanie", "sunglasses", "tie", "pocket square",
];

const METALS = ["gold", "silver", "brass", "bronze", "gunmetal", "rose gold", "platinum"];
const WARM_LEATHERS = ["brown", "tan", "cognac", "camel", "caramel", "chestnut", "oxblood", "burgundy"];
const COOL_LEATHERS = ["black", "white", "grey", "gray", "charcoal"];

const FORMAL_SHOES = ["heel", "pump", "oxford", "derby", "loafer", "mule"];
const CASUAL_SHOES = ["sneaker", "trainer", "boot", "sandal", "slide"];
const FORMAL_BAGS = ["clutch", "minaudière", "evening bag", "structured"];
const CASUAL_BAGS = ["tote", "backpack", "crossbody", "bucket", "hobo"];

const OCCASION_TIPS: Record<string, string> = {
  work: "Tailored leather goods in one undertone; minimal, polished jewelry.",
  "date-night": "One hero accessory (statement earring or heel) — let it lead.",
  weekend: "Soft leathers and woven textures; mix-and-match metals are fine.",
  event: "Refined metals, slim straps, and a compact bag elevate the look.",
  travel: "Durable leathers; one bag that pairs with both shoe options.",
  any: "Keep accessories cohesive — one dominant metal and a unified leather story.",
};

const matches = (text: string, words: string[]) =>
  words.find((w) => text.toLowerCase().includes(w));

const findItems = (items: OutfitItem[], keywords: string[]) =>
  items.filter((i) => {
    const t = `${i.label} ${i.description}`.toLowerCase();
    return keywords.some((k) => t.includes(k));
  });

const buildChecks = (outfit: Outfit, occasion: string): CheckRow[] => {
  const items = outfit.items;
  const accessories = items.filter((i) => {
    const t = `${i.label} ${i.description}`.toLowerCase();
    return ACCESSORY_KEYWORDS.some((k) => t.includes(k));
  });

  const rows: CheckRow[] = [];

  // 1. Metal tone cohesion
  const metalHits = new Set<string>();
  accessories.forEach((a) => {
    const m = matches(`${a.label} ${a.description}`, METALS);
    if (m) metalHits.add(m === "rose gold" ? "rose gold" : m);
  });
  if (metalHits.size === 1) {
    rows.push({
      status: "pass",
      title: "Single metal tone",
      detail: `All hardware and jewelry stays in ${[...metalHits][0]} — no clashing finishes.`,
    });
  } else if (metalHits.size > 1) {
    rows.push({
      status: "neutral",
      title: "Mixed metals (intentional)",
      detail: `Pairs ${[...metalHits].join(" + ")} — keep one dominant and use the other sparingly.`,
    });
  } else {
    rows.push({
      status: "neutral",
      title: "Metal tone is open",
      detail: "No specific metal called out — default to one finish across watch, jewelry, and buckles.",
    });
  }

  // 2. Leather triangle (shoes / belt / bag)
  const shoes = findItems(items, ["shoe", "boot", "sneaker", "loafer", "heel", "pump", "sandal", "mule"]);
  const belts = findItems(items, ["belt"]);
  const bags = findItems(items, ["bag", "tote", "clutch", "purse", "backpack", "handbag", "crossbody"]);
  const leatherPieces = [...shoes, ...belts, ...bags];

  if (leatherPieces.length >= 2) {
    const undertones = new Set<"warm" | "cool">();
    leatherPieces.forEach((p) => {
      const text = `${p.colorName} ${p.description}`.toLowerCase();
      if (matches(text, WARM_LEATHERS)) undertones.add("warm");
      if (matches(text, COOL_LEATHERS)) undertones.add("cool");
    });
    if (undertones.size <= 1) {
      rows.push({
        status: "pass",
        title: "Leather triangle aligned",
        detail: `Shoes, belt, and bag share a ${[...undertones][0] ?? "consistent"} undertone — the leathers read as a set.`,
      });
    } else {
      rows.push({
        status: "neutral",
        title: "Leather undertones vary",
        detail: "Warm and cool leathers mix — anchor with the bag and let shoes/belt echo it.",
      });
    }
  }

  // 3. Bag ↔ Shoe formality
  if (shoes.length && bags.length) {
    const shoeText = shoes.map((s) => s.description.toLowerCase()).join(" ");
    const bagText = bags.map((b) => b.description.toLowerCase()).join(" ");
    const shoeFormal = FORMAL_SHOES.some((w) => shoeText.includes(w));
    const shoeCasual = CASUAL_SHOES.some((w) => shoeText.includes(w));
    const bagFormal = FORMAL_BAGS.some((w) => bagText.includes(w));
    const bagCasual = CASUAL_BAGS.some((w) => bagText.includes(w));
    const aligned =
      (shoeFormal && bagFormal) ||
      (shoeCasual && bagCasual) ||
      (!shoeFormal && !shoeCasual) ||
      (!bagFormal && !bagCasual);
    rows.push({
      status: aligned ? "pass" : "neutral",
      title: "Bag matches shoe formality",
      detail: aligned
        ? "Shoe and bag sit at the same dress level — the silhouette reads intentional."
        : "Shoe and bag drift in formality — swap one to tighten the pairing.",
    });
  }

  // 4. Accessory color role
  const accentItems = items.filter((i) => i.colorRole === "Accent");
  const accessoryAccent = accentItems.find((i) => accessories.includes(i));
  if (accessoryAccent) {
    rows.push({
      status: "pass",
      title: "Accessory plays the 10% accent",
      detail: `${accessoryAccent.label} (${accessoryAccent.colorName}) carries the pop — the rest stays in the base/secondary palette.`,
    });
  } else if (accessories.length) {
    rows.push({
      status: "neutral",
      title: "Accessories stay tonal",
      detail: "Accessories echo the base palette rather than pop — quieter, more cohesive read.",
    });
  }

  // 5. Occasion tuning
  rows.push({
    status: "pass",
    title: `Tuned for ${occasion === "any" ? "any setting" : occasion.replace("-", " ")}`,
    detail: OCCASION_TIPS[occasion] ?? OCCASION_TIPS.any,
  });

  return rows;
};

const AccessoryCohesionChecklist = ({ outfit, occasion }: Props) => {
  const rows = buildChecks(outfit, occasion);
  if (!rows.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <h4 className="font-display text-xs uppercase tracking-[0.2em] text-accent font-semibold">
          Accessory cohesion check
        </h4>
      </div>
      <ul className="space-y-2.5">
        {rows.map((r, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              className={`mt-0.5 flex w-4 h-4 items-center justify-center rounded-full border ${
                r.status === "pass"
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-muted border-border text-muted-foreground"
              }`}
              aria-hidden
            >
              {r.status === "pass" ? <Check className="w-3 h-3" /> : <Minus className="w-2.5 h-2.5" />}
            </span>
            <div className="flex-1">
              <p className="font-display text-[11px] uppercase tracking-wider text-foreground">
                {r.title}
              </p>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                {r.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AccessoryCohesionChecklist;
