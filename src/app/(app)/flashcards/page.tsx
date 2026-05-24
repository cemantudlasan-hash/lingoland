'use client';

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type FirestoreError,
} from "firebase/firestore";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Loader2,
  Download,
  Trash2,
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Search,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConstellationCanvas } from "@/components/ui/constellation-canvas";
import { generateFlashcardContent } from "@/ai/flows/generate-flashcard-content";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  word: string;
  definition: string;
  translation: string;
  exampleSentence?: string;
  hint?: string;
  context?: string;
  createdAt: string;
  nextReviewDate: string;
  intervalDays: number;
  box: number;
}

export default function FlashcardsPage() {
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("review");

  // Create Form State
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [hint, setHint] = useState("");
  const [context, setContext] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Review State
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Firestore Sync
  useEffect(() => {
    if (!firestore || !user || isGuest) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(firestore, `users/${user.uid}/flashcards`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Flashcard[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Flashcard);
        });
        setCards(list);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Firestore loading error:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, user, isGuest]);

  // Restrict guests
  if (!user || isGuest) {
    return (
      <div className="relative min-h-[80vh] w-full flex items-center justify-center p-4">
        <ConstellationCanvas />
        <Card className="max-w-md w-full bg-slate-950/70 border border-slate-900 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <BookMarked className="h-8 w-8 animate-bounce" />
          </div>
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-black text-white font-sans bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              Registered Feature Only
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-sm leading-relaxed">
              Spaced-repetition reviews, highlighting new vocabulary, and AI auto-definitions are exclusive benefits for logged-in accounts.
            </CardDescription>
          </CardHeader>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20"
          >
            <a href="/auth">Sign In or Create Account</a>
          </Button>
        </Card>
      </div>
    );
  }

  // AI Autofill Trigger
  const handleAIFill = async () => {
    if (!word.trim()) {
      toast({
        variant: "destructive",
        title: "No Word Provided",
        description: "Please type a word first to generate definition.",
      });
      return;
    }

    setIsLoadingAI(true);
    try {
      const res = await generateFlashcardContent({ word, context });
      if (res.card) {
        setDefinition(res.card.definition);
        setTranslation(res.card.translation);
        setExample(res.card.exampleSentence);
        setHint(res.card.hint);
        // @ts-ignore
        if (res.card.emoji) setEmoji(res.card.emoji);
        toast({
          title: "AI Analysis Complete",
          description: `Auto-filled details for "${word}"`,
        });
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      toast({
        variant: "destructive",
        title: "AI Helper Offline",
        description: "Could not auto-generate details. Please enter manually.",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Create Card
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim() || !translation.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in Word, Definition, and Translation.",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newCard = {
        word: word.trim(),
        definition: definition.trim(),
        translation: translation.trim(),
        exampleSentence: example.trim(),
        hint: hint.trim(),
        context: context.trim(),
        emoji: emoji.trim(),
        createdAt: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        box: 1,
      };

      await addDoc(collection(firestore, `users/${user.uid}/flashcards`), newCard);

      toast({
        title: "Card Created!",
        description: `"${word}" has been added to your collection.`,
      });

      // Reset
      setWord("");
      setDefinition("");
      setTranslation("");
      setExample("");
      setHint("");
      setContext("");
      setEmoji("");
      setActiveTab("collection");
    } catch (err: any) {
      console.error("Failed to create card:", err);
      toast({
        variant: "destructive",
        title: "Create Failed",
        description: `Could not save card to database: ${err?.message || err}`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Spaced Repetition Leitner Logic
  const handleRateCard = async (card: Flashcard, success: boolean, easy = false) => {
    let nextBox = card.box;
    let nextInterval = card.intervalDays;

    if (success) {
      // Correct: advance box
      nextBox = Math.min(5, card.box + 1);
      // Interval mapping: Box 1=1d, 2=2d, 3=4d, 4=7d, 5=14d
      const boxIntervals = [1, 2, 4, 7, 14];
      nextInterval = boxIntervals[nextBox - 1];
      if (easy) {
        nextInterval = Math.round(nextInterval * 1.5);
      }
    } else {
      // Incorrect: reset to box 1
      nextBox = 1;
      nextInterval = 1;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    try {
      await updateDoc(doc(firestore, `users/${user.uid}/flashcards`, card.id), {
        box: nextBox,
        intervalDays: nextInterval,
        nextReviewDate: nextReview.toISOString(),
      });

      setIsFlipped(false);
      // Wait for flip transition to end before updating index
      setTimeout(() => {
        setReviewIndex((prev) => prev + 1);
      }, 300);
    } catch (err) {
      console.error("Failed to update card:", err);
    }
  };

  // Delete Card
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/flashcards`, id));
      toast({
        title: "Card Deleted",
        description: "Flashcard removed successfully.",
      });
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  // Export to JPG Action – builds a temporary offscreen element with inline
  // styles so html2canvas can render every text element reliably.
  const handleExportJpg = async (card: Flashcard) => {
    // Build an offscreen container
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:420px;padding:32px;border-radius:24px;" +
      "background:#0f172a;border:1px solid rgba(99,102,241,0.25);font-family:system-ui,sans-serif;";

    // Box badge
    const badge = document.createElement("div");
    badge.style.cssText =
      "font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;" +
      "color:#818cf8;background:rgba(99,102,241,0.08);display:inline-block;padding:3px 10px;" +
      "border-radius:6px;border:1px solid rgba(99,102,241,0.15);margin-bottom:8px;";
    badge.textContent = `Box ${card.box}`;
    container.appendChild(badge);

    // Next review date (right-aligned)
    const dateRow = document.createElement("div");
    dateRow.style.cssText =
      "font-size:10px;font-weight:700;color:#64748b;text-align:right;margin-top:-22px;margin-bottom:16px;";
    dateRow.textContent = new Date(card.nextReviewDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    container.appendChild(dateRow);

    // Word and Emoji Row
    const wordRow = document.createElement("div");
    wordRow.style.cssText = "display:flex;align-items:center;gap:12px;margin:0 0 12px 0;";

    // @ts-ignore
    if (card.emoji) {
      const emojiEl = document.createElement("span");
      emojiEl.style.cssText = "font-size:36px;user-select:none;";
      // @ts-ignore
      emojiEl.textContent = card.emoji;
      wordRow.appendChild(emojiEl);
    }

    const wordEl = document.createElement("h3");
    wordEl.style.cssText =
      "font-size:30px;font-weight:900;color:#f59e0b;margin:0;letter-spacing:0.02em;text-transform:capitalize;";
    wordEl.textContent = card.word;
    wordRow.appendChild(wordEl);

    container.appendChild(wordRow);

    // Definition
    const defEl = document.createElement("p");
    defEl.style.cssText =
      "font-size:13px;font-weight:600;color:#cbd5e1;line-height:1.6;margin:0 0 10px 0;";
    defEl.textContent = card.definition;
    container.appendChild(defEl);

    // Translation
    const transEl = document.createElement("p");
    transEl.style.cssText =
      "font-size:13px;font-weight:500;font-style:italic;color:#94a3b8;margin:0 0 12px 0;";
    transEl.textContent = card.translation;
    container.appendChild(transEl);

    // Example sentence (if any)
    if (card.exampleSentence) {
      const exEl = document.createElement("p");
      exEl.style.cssText =
        "font-size:12px;font-style:italic;color:#a78bfa;line-height:1.5;margin:0 0 10px 0;" +
        "padding:8px 12px;background:rgba(139,92,246,0.08);border-radius:10px;" +
        "border:1px solid rgba(139,92,246,0.12);";
      exEl.textContent = `"${card.exampleSentence}"`;
      container.appendChild(exEl);
    }

    // Hint (if any)
    if (card.hint) {
      const hintEl = document.createElement("p");
      hintEl.style.cssText =
        "font-size:12px;color:#c4b5fd;margin:0;" +
        "padding:8px 12px;background:rgba(139,92,246,0.06);border-radius:10px;" +
        "border:1px solid rgba(139,92,246,0.1);";
      hintEl.textContent = `💡 ${card.hint}`;
      container.appendChild(hintEl);
    }

    // Branding footer
    const footer = document.createElement("div");
    footer.style.cssText =
      "margin-top:18px;padding-top:12px;border-top:1px solid rgba(100,116,139,0.15);" +
      "font-size:10px;font-weight:700;color:#475569;text-align:right;letter-spacing:0.05em;";
    footer.textContent = "LingoLandVerse · Flashcard";
    container.appendChild(footer);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: "#030712",
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${card.word.toLowerCase().replace(/\s+/g, "-")}-flashcard.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      toast({
        title: "Export Success!",
        description: `Flashcard image downloaded for "${card.word}"`,
      });
    } catch (err) {
      console.error("Export failed:", err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not render JPG image.",
      });
    } finally {
      document.body.removeChild(container);
    }
  };

  // Filter Due Cards for Review
  const dueCards = cards.filter((card) => {
    const nextReview = new Date(card.nextReviewDate);
    return nextReview <= new Date();
  });

  // Filter for Collection
  const filteredCards = cards.filter((card) =>
    card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3D Flip Card Style Configuration
  const cardStyle: React.CSSProperties = {
    perspective: "1000px",
    width: "100%",
    maxWidth: "380px",
    height: "280px",
    position: "relative",
    cursor: "pointer",
  };

  const innerStyle = (flipped: boolean): React.CSSProperties => ({
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  });

  const faceStyleFront: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px",
    borderRadius: "24px",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 15px 30px -10px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.08)",
  };

  const faceStyleBack: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px",
    borderRadius: "24px",
    border: "1px solid rgba(168, 85, 247, 0.2)",
    background: "rgba(9, 15, 30, 0.85)",
    backdropFilter: "blur(12px)",
    transform: "rotateY(180deg)",
    boxShadow: "0 15px 30px -10px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.08)",
  };

  return (
    <div className="relative min-h-[85vh] w-full py-4 px-2 md:px-6">
      <ConstellationCanvas />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <header className="text-center space-y-2 select-none">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Dynamic Flashcard Generator
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            AI-assisted spaced-repetition reviewer to memorize vocabulary, highlight translations, and study custom cards.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-950/80 border border-slate-900 rounded-2xl p-1.5 h-14 backdrop-blur-md shadow-2xl">
            <TabsTrigger
              value="review"
              className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30"
            >
              Study Room ({dueCards.length})
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30"
            >
              Create Card
            </TabsTrigger>
            <TabsTrigger
              value="collection"
              className="rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 text-slate-400 hover:text-slate-200 data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 data-[state=active]:border data-[state=active]:border-indigo-500/30"
            >
              Collection ({cards.length})
            </TabsTrigger>
          </TabsList>

          {/* STUDY ROOM / REVIEW TAB */}
          <TabsContent value="review" className="pt-6">
            <Card className="bg-slate-900/40 border border-slate-850/85 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center justify-center space-y-8">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <p className="text-slate-400 font-bold text-sm">Synchronizing reviews...</p>
                </div>
              ) : dueCards.length === 0 || reviewIndex >= dueCards.length ? (
                <div className="text-center py-16 max-w-sm space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Review Complete!</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      You've cleared all scheduled cards for today. Read more articles in the Reader to highlight and generate new words, or review your collection.
                    </p>
                  </div>
                  {reviewIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReviewIndex(0);
                        setIsFlipped(false);
                      }}
                      className="bg-slate-950 border-slate-850 text-slate-300"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-8">
                  {/* Progress Indicators */}
                  <div className="w-full max-w-xs flex justify-between items-center text-xs font-bold text-slate-500 select-none">
                    <span>PROGRESS</span>
                    <span>
                      {reviewIndex + 1} / {dueCards.length}
                    </span>
                  </div>

                  {/* 3D Flashcard flip container */}
                  <div style={cardStyle} onClick={() => setIsFlipped(!isFlipped)}>
                    <div style={innerStyle(isFlipped)}>
                      {/* FRONT FACE */}
                      <div style={faceStyleFront}>
                        <div className="text-xs font-bold text-indigo-400 tracking-widest uppercase flex items-center gap-1 select-none">
                          <Layers className="h-3.5 w-3.5" /> Box {dueCards[reviewIndex].box}
                        </div>
                        <h2 className="text-4xl font-black leading-tight tracking-wide px-2 select-text flex flex-col items-center gap-3">
                          {/* @ts-ignore */}
                          {dueCards[reviewIndex].emoji && <span className="text-5xl select-none animate-bounce">{dueCards[reviewIndex].emoji}</span>}
                          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent capitalize text-center">
                            {dueCards[reviewIndex].word}
                          </span>
                        </h2>
                        <div className="text-xs font-bold text-slate-500 animate-pulse select-none">
                          Click card to flip
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div style={faceStyleBack}>
                        <div className="w-full space-y-4 text-center overflow-y-auto max-h-[190px] px-2 select-text">
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-purple-400 tracking-wider uppercase">Definition</h4>
                            <p className="text-slate-200 text-sm leading-relaxed font-semibold">
                              {dueCards[reviewIndex].definition}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-indigo-400 tracking-wider uppercase">Translation</h4>
                            <p className="text-slate-300 text-sm font-semibold">
                              {dueCards[reviewIndex].translation}
                            </p>
                          </div>
                          {dueCards[reviewIndex].exampleSentence && (
                            <div className="space-y-1">
                              <h4 className="text-xs font-extrabold text-pink-400 tracking-wider uppercase">Example</h4>
                              <p className="text-slate-400 text-xs italic leading-relaxed">
                                "{dueCards[reviewIndex].exampleSentence}"
                              </p>
                            </div>
                          )}
                          {dueCards[reviewIndex].hint && (
                            <div className="text-xs bg-purple-950/20 border border-purple-500/10 p-2 rounded-xl text-purple-300">
                              💡 {dueCards[reviewIndex].hint}
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-500 select-none pt-2">
                          Click card to flip back
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leitner Box Rating Controls */}
                  {isFlipped && (
                    <div className="flex flex-wrap gap-3 justify-center w-full max-w-sm pt-2 select-none">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateCard(dueCards[reviewIndex], false);
                        }}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold px-4 rounded-xl flex-grow h-11"
                      >
                        Again (Forgot)
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateCard(dueCards[reviewIndex], true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 rounded-xl flex-grow h-11"
                      >
                        Good (Next)
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRateCard(dueCards[reviewIndex], true, true);
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-4 rounded-xl flex-grow h-11"
                      >
                        Easy (Jump)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* CREATE CARD TAB */}
          <TabsContent value="create" className="pt-6">
            <Card className="bg-slate-900/40 border border-slate-850/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
              <form onSubmit={handleCreateCard} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column inputs */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3 space-y-2">
                        <Label className="text-xs font-bold text-slate-400 flex justify-between items-center">
                          <span>Word or Phrase</span>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleAIFill}
                            disabled={isLoadingAI || !word.trim()}
                            className="h-7 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 px-2.5 rounded-lg flex items-center gap-1 border border-indigo-500/10"
                          >
                            {isLoadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            AI Auto-fill
                          </Button>
                        </Label>
                        <Input
                          placeholder="e.g. ephemeral"
                          value={word}
                          onChange={(e) => setWord(e.target.value)}
                          className="bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <Label className="text-xs font-bold text-slate-400">Emoji</Label>
                        <Input
                          placeholder="✨"
                          value={emoji}
                          onChange={(e) => setEmoji(e.target.value)}
                          className="bg-slate-950 border-slate-850 text-white rounded-xl h-11 text-center text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400">Definition (English)</Label>
                      <Textarea
                        placeholder="Simple description of its meaning..."
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        rows={3}
                        className="bg-slate-950 border-slate-850 text-white rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400">Translation / Synonym</Label>
                      <Input
                        placeholder="e.g. ชั่วคราว / temporary"
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                        className="bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                      />
                    </div>
                  </div>

                  {/* Right Column context clues */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400">Context sentence (Optional)</Label>
                      <Textarea
                        placeholder="Sentence where the word was found..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={2}
                        className="bg-slate-950 border-slate-850 text-white rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400">Example Sentence (Optional)</Label>
                      <Textarea
                        placeholder="Generate or type a custom example..."
                        value={example}
                        onChange={(e) => setExample(e.target.value)}
                        rows={2}
                        className="bg-slate-950 border-slate-850 text-white rounded-xl resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400">Memory Aid / Mnemonic Hint</Label>
                      <Input
                        placeholder="Mnemonic to remember the word..."
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        className="bg-slate-950 border-slate-850 text-white rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 rounded-xl transition-all duration-300 shadow-md shadow-indigo-600/10"
                >
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Flashcard
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* COLLECTION LIST TAB */}
          <TabsContent value="collection" className="pt-6 space-y-6">
            {/* Search filter bar */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border-slate-850 pl-10 h-11 rounded-xl text-white"
              />
            </div>

            {filteredCards.length === 0 ? (
              <div className="text-center text-slate-500 py-16 bg-slate-900/10 border border-slate-850 rounded-2xl">
                <Search className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-semibold">No flashcards found.</p>
                <p className="text-xs text-slate-600 mt-1">Start adding them manually or highlighting in Reader!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                {filteredCards.map((card) => (
                  <div key={card.id} className="space-y-4">
                    {/* Visual Card component */}
                    <Card
                      id={`export-card-${card.id}`}
                      className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:border-slate-700/80 relative"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-indigo-400/90 tracking-widest uppercase bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                          Box {card.box}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(card.nextReviewDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="my-4 space-y-3">
                        <h3 className="text-2xl font-black text-white tracking-wide truncate flex items-center gap-2">
                          {/* @ts-ignore */}
                          {card.emoji && <span className="text-2xl shrink-0 select-none">{card.emoji}</span>}
                          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent capitalize">{card.word}</span>
                        </h3>
                        <p className="text-slate-350 text-xs font-semibold leading-relaxed line-clamp-2">
                          {card.definition}
                        </p>
                        <p className="text-slate-400 text-xs italic font-medium truncate">
                          {card.translation}
                        </p>
                      </div>

                      <div className="flex gap-2 border-t border-slate-850/80 pt-3.5 mt-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleExportJpg(card)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          title="Export as JPG"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCard(card.id)}
                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg"
                          title="Delete card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
