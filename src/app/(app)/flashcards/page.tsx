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
  Volume2,
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
  pronunciation?: string;
  exampleSentence?: string;
  hint?: string;
  context?: string;
  createdAt: string;
  nextReviewDate: string;
  intervalDays: number;
  box: number;
  emoji?: string;
  imageUrl?: string;
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
  const [pronunciation, setPronunciation] = useState("");
  const [example, setExample] = useState("");
  const [hint, setHint] = useState("");
  const [context, setContext] = useState("");
  const [emoji, setEmoji] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchSource, setImageSearchSource] = useState<"google" | "bing" | "pinterest" | "unsplash">("unsplash");
  const [searchedImages, setSearchedImages] = useState<any[]>([]);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Review State
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Speech Pronunciation Handler
  const speakWord = (text: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast({
        title: "Audio Unavailable",
        description: "Speech synthesis is not supported on this browser.",
      });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Clean word from punctuation / brackets for clean speech
      const cleanWord = text.replace(/[/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Jenny") || v.name.includes("Guy"))) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis failed:", err);
      setIsSpeaking(false);
    }
  };

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
        if (res.card.pronunciation) setPronunciation(res.card.pronunciation);
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
        pronunciation: pronunciation.trim() || undefined,
        exampleSentence: example.trim(),
        hint: hint.trim(),
        context: context.trim(),
        emoji: emoji.trim(),
        imageUrl: imageUrl.trim(),
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
      setPronunciation("");
      setExample("");
      setHint("");
      setContext("");
      setEmoji("");
      setImageUrl("");
      setImageSearchQuery("");
      setSearchedImages([]);
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

  // Sync search input query with vocabulary word when it changes
  useEffect(() => {
    if (word) {
      setImageSearchQuery(word);
    }
  }, [word]);

  // Dynamic web image search handler
  const handleWebImageSearch = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsSearchingImages(true);
    try {
      const response = await fetch(`/api/image-picker?query=${encodeURIComponent(imageSearchQuery.trim())}&source=${imageSearchSource}&tab=IMAGES&count=12`);
      const data = await response.json();
      if (data.success && data.images) {
        setSearchedImages(data.images);
        if (data.images.length === 0) {
          toast({
            variant: "destructive",
            title: "No Images Found",
            description: `Could not find any images for "${imageSearchQuery}" on ${imageSearchSource}.`,
          });
        }
      } else {
        setSearchedImages([]);
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: data.error || `Failed to search images on ${imageSearchSource}.`,
        });
      }
    } catch (err) {
      console.error("Image search error:", err);
      setSearchedImages([]);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "An error occurred while connecting to the image search service.",
      });
    } finally {
      setIsSearchingImages(false);
    }
  };

  // Re-trigger search when engine source changes and query is present
  useEffect(() => {
    if (imageSearchQuery.trim()) {
      handleWebImageSearch();
    }
  }, [imageSearchSource]);

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

    if (card.imageUrl) {
      const imgEl = document.createElement("img");
      imgEl.src = card.imageUrl;
      imgEl.crossOrigin = "anonymous";
      imgEl.style.cssText = "width:44px;height:44px;object-fit:contain;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:#030712;";
      wordRow.appendChild(imgEl);
    } else if (card.emoji) {
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

  // 3D Flip Card Style Configuration (Larger size and enhanced glassmorphism)
  const cardStyle: React.CSSProperties = {
    perspective: "1200px",
    width: "100%",
    maxWidth: "580px",
    height: "380px",
    minHeight: "360px",
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
    padding: "28px 32px",
    borderRadius: "28px",
    border: "1px solid rgba(99, 102, 241, 0.28)",
    background: "linear-gradient(165deg, rgba(15, 23, 42, 0.88), rgba(10, 16, 32, 0.96))",
    backdropFilter: "blur(16px)",
    boxShadow: "0 20px 45px -12px rgba(0,0,0,0.65), 0 0 30px rgba(99,102,241,0.12)",
  };

  const faceStyleBack: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 32px",
    borderRadius: "28px",
    border: "1px solid rgba(168, 85, 247, 0.28)",
    background: "linear-gradient(165deg, rgba(16, 13, 33, 0.92), rgba(9, 14, 30, 0.97))",
    backdropFilter: "blur(16px)",
    transform: "rotateY(180deg)",
    boxShadow: "0 20px 45px -12px rgba(0,0,0,0.65), 0 0 30px rgba(168,85,247,0.12)",
  };

  return (
    <div className="relative -m-3 md:-m-4 lg:-m-5 min-h-[calc(100vh-4.25rem)] flex-1 flex flex-col py-4 px-4 md:px-8">
      <ConstellationCanvas />

      <div className="w-full max-w-5xl mx-auto relative z-10 flex-1 flex flex-col space-y-4">
        <header className="text-center space-y-1.5 select-none shrink-0">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Dynamic Flashcard Generator
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            AI-assisted spaced-repetition reviewer to memorize vocabulary, highlight translations, and study custom cards.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col space-y-3">
          <TabsList className="grid w-full grid-cols-3 bg-slate-950/80 border border-slate-900 rounded-2xl p-1.5 h-14 backdrop-blur-md shadow-2xl shrink-0">
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
          <TabsContent value="review" className="mt-0 pt-2 flex-1 flex flex-col data-[state=inactive]:hidden">
            <Card className="bg-slate-900/45 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex-1 flex flex-col items-center justify-between min-h-[580px] md:min-h-[640px] w-full mb-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 my-auto py-16">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <p className="text-slate-400 font-bold text-sm">Synchronizing reviews...</p>
                </div>
              ) : dueCards.length === 0 || reviewIndex >= dueCards.length ? (
                <div className="text-center my-auto py-16 max-w-sm space-y-6">
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
                <div className="w-full flex-1 flex flex-col items-center justify-between py-2 gap-4">
                  {/* Progress Indicators */}
                  <div className="w-full max-w-xl flex flex-col gap-2 select-none px-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-400 font-extrabold">
                        <Layers className="h-3.5 w-3.5 text-indigo-400" /> Study Room Review
                      </span>
                      <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-black">
                        Card {reviewIndex + 1} of {dueCards.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                        style={{ width: `${((reviewIndex + 1) / dueCards.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 3D Flashcard flip container */}
                  <div style={cardStyle} onClick={() => setIsFlipped(!isFlipped)}>
                    <div style={innerStyle(isFlipped)}>
                      {/* FRONT FACE */}
                      <div style={faceStyleFront}>
                        <div className="w-full flex items-center justify-between select-none">
                          <span className="text-xs font-black text-indigo-400 tracking-widest uppercase flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                            <Layers className="h-3.5 w-3.5" /> Box {dueCards[reviewIndex].box}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            Click to flip
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-3 w-full my-auto select-text">
                          {dueCards[reviewIndex].imageUrl ? (
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center shadow-xl select-none animate-in zoom-in duration-300">
                              <img
                                src={dueCards[reviewIndex].imageUrl}
                                alt={dueCards[reviewIndex].word}
                                className="object-contain max-h-full max-w-full"
                              />
                            </div>
                          ) : (
                            /* @ts-ignore */
                            dueCards[reviewIndex].emoji && (
                              <span className="text-6xl md:text-7xl select-none animate-bounce drop-shadow-md">
                                {dueCards[reviewIndex].emoji}
                              </span>
                            )
                          )}
                          <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-wide px-2 bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent capitalize text-center drop-shadow">
                            {dueCards[reviewIndex].word}
                          </h2>

                          {/* Word Pronunciation Row */}
                          <div className="flex items-center gap-2.5 mt-1 select-none flex-wrap justify-center">
                            {dueCards[reviewIndex].pronunciation && (
                              <span className="text-sm font-mono text-indigo-300/90 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-full shadow-inner">
                                {dueCards[reviewIndex].pronunciation}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => speakWord(dueCards[reviewIndex].word, e)}
                              title="Listen to word pronunciation"
                              className={cn(
                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-md",
                                isSpeaking
                                  ? "bg-amber-400 text-slate-950 font-black scale-105 ring-2 ring-amber-300 shadow-amber-400/30"
                                  : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 hover:scale-105 active:scale-95"
                              )}
                            >
                              <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />
                              <span>{isSpeaking ? "Speaking..." : "Pronounce"}</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 select-none bg-slate-950/50 border border-slate-800/80 px-3.5 py-1.5 rounded-full">
                          <RotateCcw className="h-3.5 w-3.5 text-indigo-400" /> Click card to flip & reveal details
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div style={faceStyleBack}>
                        <div className="w-full flex items-center justify-between select-none border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg font-black text-amber-300 capitalize">{dueCards[reviewIndex].word}</span>
                            {dueCards[reviewIndex].pronunciation && (
                              <span className="text-xs font-mono text-purple-300/90 bg-purple-950/50 px-2.5 py-0.5 rounded border border-purple-500/25">
                                {dueCards[reviewIndex].pronunciation}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => speakWord(dueCards[reviewIndex].word, e)}
                            className="p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-500/20 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
                            title="Listen to word pronunciation"
                          >
                            <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse text-amber-400")} />
                            <span>Listen</span>
                          </button>
                        </div>

                        <div className="w-full space-y-3.5 text-center overflow-y-auto max-h-[230px] px-2 select-text my-auto">
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-extrabold text-purple-400 tracking-wider uppercase">Definition</h4>
                            <p className="text-slate-100 text-sm md:text-base leading-relaxed font-semibold">
                              {dueCards[reviewIndex].definition}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-extrabold text-indigo-400 tracking-wider uppercase">Translation</h4>
                            <p className="text-indigo-200 text-sm md:text-base font-semibold">
                              {dueCards[reviewIndex].translation}
                            </p>
                          </div>
                          {dueCards[reviewIndex].exampleSentence && (
                            <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                              <h4 className="text-[10px] font-extrabold text-pink-400 tracking-wider uppercase">Example</h4>
                              <p className="text-slate-350 text-xs md:text-sm italic leading-relaxed">
                                "{dueCards[reviewIndex].exampleSentence}"
                              </p>
                            </div>
                          )}
                          {dueCards[reviewIndex].hint && (
                            <div className="text-xs bg-purple-950/30 border border-purple-500/20 p-2.5 rounded-xl text-purple-200">
                              💡 {dueCards[reviewIndex].hint}
                            </div>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-400 select-none pt-2 flex items-center gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5 text-purple-400" /> Click card to flip back
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leitner Box Rating Controls */}
                  <div className="w-full max-w-md pt-2 select-none">
                    {isFlipped ? (
                      <div className="flex flex-wrap gap-3 justify-center w-full animate-in fade-in zoom-in-95 duration-200">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateCard(dueCards[reviewIndex], false);
                          }}
                          className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold px-4 rounded-xl flex-1 h-12 shadow-lg hover:scale-[1.02] transition-transform"
                        >
                          Again (Forgot)
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateCard(dueCards[reviewIndex], true);
                          }}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 rounded-xl flex-1 h-12 shadow-lg hover:scale-[1.02] transition-transform"
                        >
                          Good (Next)
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateCard(dueCards[reviewIndex], true, true);
                          }}
                          className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold px-4 rounded-xl flex-1 h-12 shadow-lg hover:scale-[1.02] transition-transform"
                        >
                          Easy (Jump)
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 w-full justify-center">
                        <Button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          variant="outline"
                          className="bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-200 font-bold h-11 px-6 rounded-xl shadow-md transition-all hover:scale-105"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" /> Flip Card to Reveal
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => speakWord(dueCards[reviewIndex].word, e)}
                          variant="outline"
                          className="bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-slate-300 font-bold h-11 px-4 rounded-xl shadow-md"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className={cn("h-4 w-4 mr-2 text-indigo-400", isSpeaking && "animate-pulse")} />
                          Pronounce
                        </Button>
                      </div>
                    )}
                  </div>
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

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        <span>Word Pronunciation / IPA (Optional)</span>
                        {word.trim() && (
                          <button
                            type="button"
                            onClick={(e) => speakWord(word, e)}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <Volume2 className="h-3 w-3" /> Test Voice
                          </button>
                        )}
                      </Label>
                      <Input
                        placeholder="e.g. /ɪɡˈzɔːstɪd/ or ig-ZAW-stid"
                        value={pronunciation}
                        onChange={(e) => setPronunciation(e.target.value)}
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

                {/* Web Image Selector Section */}
                <div className="space-y-3 border-t border-slate-850/60 pt-4 text-left select-none">
                  <Label className="text-xs font-bold text-slate-400 flex justify-between items-center">
                    <span>Card Illustration Image (Web Search)</span>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[10px] text-rose-400 hover:underline hover:text-rose-300 font-extrabold uppercase tracking-wide"
                      >
                        Remove Image
                      </button>
                    )}
                  </Label>
                  
                  {imageUrl ? (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 flex items-center justify-center animate-in zoom-in duration-300">
                      <img
                        src={imageUrl}
                        alt="Selected flashcard illustration"
                        className="object-contain max-h-full max-w-full p-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Type terms to search illustration images on Google, Bing, Pinterest..."
                            value={imageSearchQuery}
                            onChange={(e) => setImageSearchQuery(e.target.value)}
                            className="bg-slate-950 border-slate-850 pl-10 h-11 rounded-xl text-white text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleWebImageSearch();
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleWebImageSearch}
                          disabled={isSearchingImages || !imageSearchQuery.trim()}
                          className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl h-11 px-5 text-xs font-bold shrink-0 flex items-center gap-1.5"
                        >
                          {isSearchingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          Search Images
                        </Button>
                      </div>
                      
                      {/* Search source tabs */}
                      <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-900 w-fit">
                        {(["unsplash", "google", "bing", "pinterest"] as const).map((source) => (
                          <button
                            key={source}
                            type="button"
                            onClick={() => setImageSearchSource(source)}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all",
                              imageSearchSource === source
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                                : "text-slate-500 hover:text-slate-355"
                            )}
                          >
                            {source}
                          </button>
                        ))}
                      </div>

                      {/* Search results thumbnail grid */}
                      {searchedImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto p-3 border border-slate-900 bg-slate-950/60 rounded-2xl animate-in fade-in duration-300">
                          {searchedImages.map((img: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setImageUrl(img.url)}
                              className="relative aspect-square rounded-xl overflow-hidden border border-slate-850 bg-slate-900 hover:border-indigo-500/70 hover:scale-[1.03] transition-all group flex items-center justify-center shadow"
                            >
                              <img
                                src={img.thumb || img.url}
                                alt={img.title || "Search result"}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                          {card.imageUrl ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 select-none">
                              <img
                                src={card.imageUrl}
                                alt={card.word}
                                className="object-contain max-h-full max-w-full"
                              />
                            </div>
                          ) : (
                            /* @ts-ignore */
                            card.emoji && <span className="text-2xl shrink-0 select-none">{card.emoji}</span>
                          )}
                          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent capitalize">{card.word}</span>
                          <button
                            type="button"
                            onClick={() => speakWord(card.word)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-full transition-colors ml-auto shrink-0"
                            title="Listen to word pronunciation"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </h3>
                        {card.pronunciation && (
                          <div className="text-xs font-mono text-indigo-300/80 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded w-fit">
                            {card.pronunciation}
                          </div>
                        )}
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
