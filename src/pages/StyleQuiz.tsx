import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, Shirt } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; emoji: string; description: string }[];
}

const questions: QuizQuestion[] = [
  {
    id: "weekend",
    question: "What does your ideal weekend outfit look like?",
    options: [
      { label: "Tailored chinos & a crisp shirt", value: "classic", emoji: "👔", description: "Polished even on days off" },
      { label: "Oversized hoodie & sneakers", value: "streetwear", emoji: "🧢", description: "Comfort meets cool" },
      { label: "Linen pants & earth tones", value: "bohemian", emoji: "🌿", description: "Relaxed and natural" },
      { label: "All black everything", value: "minimalist", emoji: "🖤", description: "Clean and effortless" },
    ],
  },
  {
    id: "color",
    question: "Which color palette speaks to you most?",
    options: [
      { label: "Navy, white & burgundy", value: "classic", emoji: "🔵", description: "Timeless and refined" },
      { label: "Bold primaries & neons", value: "streetwear", emoji: "🟡", description: "Eye-catching and energetic" },
      { label: "Rust, sage & cream", value: "bohemian", emoji: "🟤", description: "Warm and organic" },
      { label: "Black, grey & white", value: "minimalist", emoji: "⚪", description: "Monochrome mastery" },
    ],
  },
  {
    id: "shopping",
    question: "When shopping, you gravitate toward…",
    options: [
      { label: "Quality fabrics & perfect fit", value: "classic", emoji: "✂️", description: "Investment pieces that last" },
      { label: "Limited drops & collabs", value: "streetwear", emoji: "🔥", description: "Exclusive and hyped" },
      { label: "Vintage & thrift finds", value: "bohemian", emoji: "🏺", description: "One-of-a-kind treasures" },
      { label: "Capsule wardrobe essentials", value: "minimalist", emoji: "📦", description: "Less is more" },
    ],
  },
  {
    id: "accessory",
    question: "Your go-to accessory?",
    options: [
      { label: "A classic watch", value: "classic", emoji: "⌚", description: "Understated elegance" },
      { label: "Statement sneakers", value: "streetwear", emoji: "👟", description: "The outfit starts from the feet" },
      { label: "Layered jewelry or scarves", value: "bohemian", emoji: "📿", description: "Textured and personal" },
      { label: "A structured bag", value: "minimalist", emoji: "👜", description: "Functional and sleek" },
    ],
  },
  {
    id: "icon",
    question: "Which style icon resonates with you?",
    options: [
      { label: "David Beckham", value: "classic", emoji: "🎩", description: "Sharp and sophisticated" },
      { label: "Rihanna", value: "streetwear", emoji: "💎", description: "Bold and boundary-pushing" },
      { label: "Harry Styles", value: "bohemian", emoji: "🌸", description: "Eclectic and free-spirited" },
      { label: "Zendaya", value: "minimalist", emoji: "✨", description: "Modern and refined" },
    ],
  },
  {
    id: "event",
    question: "Dressing for a special event, you'd choose…",
    options: [
      { label: "A well-fitted suit or blazer", value: "classic", emoji: "🤵", description: "Always appropriate" },
      { label: "Something unexpected & edgy", value: "streetwear", emoji: "⚡", description: "Turn heads on arrival" },
      { label: "Flowy fabrics with texture", value: "bohemian", emoji: "🦋", description: "Effortlessly artistic" },
      { label: "A sleek monochrome look", value: "minimalist", emoji: "🪞", description: "Quietly powerful" },
    ],
  },
];

interface StyleResult {
  name: string;
  tagline: string;
  description: string;
  tips: string[];
  colors: string[];
  colorNames: string[];
}

const styleResults: Record<string, StyleResult> = {
  classic: {
    name: "Classic Elegance",
    tagline: "Timeless sophistication is your superpower",
    description:
      "You appreciate quality, craftsmanship, and pieces that stand the test of time. Your wardrobe is built on strong foundations — tailored fits, rich fabrics, and a palette that never goes out of style.",
    tips: [
      "Invest in a perfectly tailored blazer",
      "Build around navy, white, camel & burgundy",
      "Choose leather accessories with patina",
      "Master the art of smart-casual layering",
    ],
    colors: ["hsl(220, 50%, 30%)", "hsl(0, 0%, 100%)", "hsl(35, 50%, 55%)", "hsl(345, 45%, 35%)"],
    colorNames: ["Navy", "White", "Camel", "Burgundy"],
  },
  streetwear: {
    name: "Street Culture",
    tagline: "Fashion-forward with an edge",
    description:
      "You're plugged into what's next. Your style blends high and low, mixing statement sneakers with designer pieces. You see clothing as self-expression and aren't afraid to make a bold choice.",
    tips: [
      "Mix luxury pieces with accessible brands",
      "Let sneakers be the hero of your outfit",
      "Experiment with oversized silhouettes",
      "Don't shy away from graphic prints and color",
    ],
    colors: ["hsl(0, 0%, 10%)", "hsl(50, 100%, 50%)", "hsl(0, 75%, 50%)", "hsl(210, 100%, 55%)"],
    colorNames: ["Black", "Yellow", "Red", "Electric Blue"],
  },
  bohemian: {
    name: "Bohemian Spirit",
    tagline: "Free-spirited and artfully composed",
    description:
      "Your style tells a story. You gravitate toward texture, pattern mixing, and pieces with character. Vintage finds and artisan craftsmanship make your wardrobe feel uniquely personal.",
    tips: [
      "Layer textures: linen, suede, knit",
      "Embrace earthy tones with pops of mustard or teal",
      "Thrift shops are your best friend",
      "Accessories are essential — rings, scarves, hats",
    ],
    colors: ["hsl(20, 55%, 45%)", "hsl(90, 30%, 50%)", "hsl(40, 60%, 70%)", "hsl(180, 35%, 40%)"],
    colorNames: ["Rust", "Sage", "Sand", "Teal"],
  },
  minimalist: {
    name: "Modern Minimalist",
    tagline: "Less is more — and more is too much",
    description:
      "You believe in the power of restraint. Clean lines, neutral palettes, and impeccable fit define your approach. Every piece in your wardrobe earns its place through versatility and quality.",
    tips: [
      "Build a capsule wardrobe of 30 key pieces",
      "Master monochromatic outfit construction",
      "Prioritize fabric quality over quantity",
      "Let silhouette and proportion do the talking",
    ],
    colors: ["hsl(0, 0%, 10%)", "hsl(0, 0%, 45%)", "hsl(0, 0%, 92%)", "hsl(30, 10%, 60%)"],
    colorNames: ["Black", "Charcoal", "Off-White", "Taupe"],
  },
};

const StyleQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const progress = showResult ? 100 : (currentStep / questions.length) * 100;
  const currentQ = questions[currentStep];

  const handleSelect = (value: string) => {
    const updated = { ...answers, [currentQ.id]: value };
    setAnswers(updated);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const goBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const restart = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResult(false);
  };

  const getResult = (): StyleResult => {
    const tally: Record<string, number> = {};
    Object.values(answers).forEach((v) => {
      tally[v] = (tally[v] || 0) + 1;
    });
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || "classic";
    return styleResults[winner];
  };

  const result = showResult ? getResult() : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shirt className="w-5 h-5 text-accent" />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
              FITTED FASHION
            </h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/gallery" className="font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Gallery
            </Link>
          </nav>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {showResult ? "Your Result" : `Question ${currentStep + 1} of ${questions.length}`}
            </span>
            {(currentStep > 0 || showResult) && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            )}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <AnimatePresence mode="wait">
          {!showResult && currentQ ? (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-8">
                {currentQ.question}
              </h2>

              <div className="grid gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left p-5 rounded-lg border transition-all ${
                        isSelected
                          ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                          : "border-border bg-card hover:border-accent/40 hover:bg-accent/5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <p className="font-display font-medium text-foreground">{opt.label}</p>
                          <p className="text-sm text-muted-foreground font-body mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 ml-auto mt-1 transition-opacity ${
                            isSelected ? "opacity-100 text-accent" : "opacity-0"
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Result Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
                </motion.div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {result.name}
                </h2>
                <p className="font-body text-muted-foreground mt-2 text-lg">{result.tagline}</p>
              </div>

              {/* Description */}
              <div className="bg-card rounded-lg border border-border p-6">
                <p className="font-body text-foreground/80 leading-relaxed">{result.description}</p>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Your Signature Palette
                </h3>
                <div className="flex gap-3">
                  {result.colors.map((color, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div
                        className="w-full aspect-square rounded-lg border border-border mb-2"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-display text-muted-foreground">
                        {result.colorNames[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Tips */}
              <div>
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Style Tips for You
                </h3>
                <div className="grid gap-3">
                  {result.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex gap-3 items-start bg-card rounded-lg border border-border p-4"
                    >
                      <span className="text-accent font-display font-bold text-sm">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-body text-sm text-foreground/80">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={restart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border bg-card text-foreground font-display text-sm uppercase tracking-wider hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-foreground text-primary-foreground font-display text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4" />
                  Build an Outfit
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StyleQuiz;
