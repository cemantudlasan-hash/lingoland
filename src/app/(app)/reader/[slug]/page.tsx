"use client";

import { useState, useEffect } from "react";
import { getArticleBySlug } from "@/lib/articles";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArticleViewTracker } from './article-view-tracker';
import { ConstellationCanvas } from "@/components/ui/constellation-canvas";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { generateFlashcardContent } from "@/ai/flows/generate-flashcard-content";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedWord, setSelectedWord] = useState("");
  const [contextSentence, setContextSentence] = useState("");
  const [floatingCoords, setFloatingCoords] = useState<{ x: number; y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [definition, setDefinition] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [hint, setHint] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Close selection tooltip when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === "") {
          setFloatingCoords(null);
        }
      }, 80);
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const handleTextSelection = () => {
    // Only registered logged-in users can use flashcard creation
    if (!user || isGuest) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length > 0 && text.length < 100 && text.split(/\s+/).length <= 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedWord(text);

      const parentNode = range.startContainer.parentNode;
      const fullText = parentNode ? parentNode.textContent || "" : "";
      setContextSentence(fullText.slice(0, 300));

      setFloatingCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 12,
      });
    } else {
      setFloatingCoords(null);
    }
  };

  useEffect(() => {
    if (isModalOpen && selectedWord) {
      setDefinition("");
      setTranslation("");
      setExample("");
      setHint("");

      const fetchAIContent = async () => {
        setIsLoadingAI(true);
        try {
          const res = await generateFlashcardContent({
            word: selectedWord,
            context: contextSentence,
          });
          if (res.card) {
            setDefinition(res.card.definition);
            setTranslation(res.card.translation);
            setExample(res.card.exampleSentence);
            setHint(res.card.hint);
          }
        } catch (err) {
          console.error("AI Flashcard helper failed:", err);
          toast({
            variant: "destructive",
            title: "AI Helper Offline",
            description: "Could not auto-generate definitions. You can write them manually!",
          });
        } finally {
          setIsLoadingAI(false);
        }
      };

      fetchAIContent();
    }
  }, [isModalOpen, selectedWord, contextSentence, toast]);

  const handleSaveFlashcard = async () => {
    if (!user || isGuest) return;
    if (!definition || !translation) {
      toast({
        variant: "destructive",
        title: "Incomplete Fields",
        description: "Please provide at least a definition and translation.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newCard = {
        word: selectedWord,
        definition,
        translation,
        exampleSentence: example,
        hint,
        context: contextSentence,
        createdAt: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        intervalDays: 1,
        box: 1,
      };

      await addDoc(collection(firestore, `users/${user.uid}/flashcards`), newCard);

      toast({
        title: "Flashcard Created!",
        description: `Successfully added "${selectedWord}" to your review deck.`,
      });
      setIsModalOpen(false);
      setFloatingCoords(null);
    } catch (err) {
      console.error("Failed to save flashcard:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save card. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (!article) {
    notFound();
  }

  // Calculate estimated reading time (approx 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="relative min-h-[85vh] w-full py-4 px-2 md:px-6">
      <ConstellationCanvas />
      
      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <Button asChild variant="outline" className="bg-slate-900/60 border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300 shadow-md">
            <Link href="/reader" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Reader
            </Link>
          </Button>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 bg-slate-900/50 border border-slate-850 px-3 py-1.5 rounded-xl backdrop-blur-sm select-none">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-pink-400" />
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Article content block */}
        <article className="bg-slate-900/40 border border-slate-850/80 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 overflow-hidden">
          <ArticleViewTracker article={article} />

          <header className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight font-sans bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              {article.title}
            </h1>
            <p className="text-base md:text-lg text-slate-350 font-medium leading-relaxed border-l-2 border-indigo-500/50 pl-4 text-slate-350">
              {article.description}
            </p>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-[240px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 group">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              data-ai-hint={article.imageHint}
              priority
            />
            {/* Ambient vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          </div>
          
          {/* Prose Content */}
          <div 
            className="bg-slate-950/30 border border-slate-900/80 rounded-2xl p-6 md:p-8 cursor-text"
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            <div className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-medium antialiased space-y-4 selection:bg-indigo-500/30 selection:text-white">
              {article.content}
            </div>
          </div>
        </article>
      </div>

      {/* Floating Sparkles create card tooltip */}
      {floatingCoords && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center gap-2 hover:from-purple-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none border border-indigo-400/20"
          style={{
            left: `${floatingCoords.x}px`,
            top: `${floatingCoords.y}px`,
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Create Flashcard</span>
        </div>
      )}

      {/* Creation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Create AI Flashcard
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Convert the word "{selectedWord}" into a spaced-repetition study card.
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Word or Phrase</Label>
              <Input
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            
            <div className="space-y-1 relative">
              <Label className="text-xs font-bold text-slate-400 flex justify-between">
                <span>Definition</span>
                {isLoadingAI && <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />}
              </Label>
              <Textarea
                placeholder={isLoadingAI ? "AI is translating and defining..." : "Enter simple English definition"}
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={2}
                className="bg-slate-950 border-slate-800 text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Translation / Synonym</Label>
              <Input
                placeholder={isLoadingAI ? "Analyzing translation..." : "e.g. คำอธิบาย / synonym"}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Example Sentence</Label>
              <Textarea
                placeholder="Example showing how it is used..."
                value={example}
                onChange={(e) => setExample(e.target.value)}
                rows={2}
                className="bg-slate-950 border-slate-800 text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-400">Mnemonic / Memory Hint</Label>
              <Input
                placeholder="A creative memory aid..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFlashcard}
              disabled={isSaving || isLoadingAI}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Saving..." : "Save Flashcard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}